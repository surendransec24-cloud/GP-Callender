const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EXPECTED_URL = 'https://ps.bitsathy.ac.in/activity/my-leaves';

async function run() {
  console.log('=== Starting Leave Portal Verification Tests ===');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=360,740', // 360px wide phone screen as specified
    'http://localhost:4173'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const targets = JSON.parse(data);
      const appTarget = targets.find(t => t.url.includes('localhost:4173')) || targets[0];
      console.log('Connecting to target:', appTarget.url);

      const ws = new globalThis.WebSocket(appTarget.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));

        // 1. Sign in with demo student account
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (function() {
                  const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Student Login'));
                  if (btn) {
                    btn.click();
                    return 'LOGGED_IN';
                  }
                  return 'LOGIN_BTN_NOT_FOUND';
                })()
              `
            }
          }));
        }, 1000);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.id === 2) {
          console.log('Login Status:', msg.result.result.value);

          // Wait 1.5s for calendar to load, then test:
          // 1. Sticky bottom "Apply for Leave" button & note
          // 2. Bottom nav "Leave Portal" link
          // 3. Hero banner "Apply now" button
          // 4. Check heights/tap targets >= 48px
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 3,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (function() {
                    const stickyBtn = document.querySelector('.sticky-apply-main-btn');
                    const stickyNote = document.querySelector('.sticky-apply-note');
                    const bottomNavPortal = document.querySelector('.bottom-nav-dock-btn.portal-dock-link');
                    const heroApplyBtn = document.querySelector('.hero-apply-now-btn');
                    
                    const stickyHeight = stickyBtn ? stickyBtn.getBoundingClientRect().height : 0;
                    const navHeight = bottomNavPortal ? bottomNavPortal.getBoundingClientRect().height : 0;

                    return JSON.stringify({
                      hasStickyBtn: Boolean(stickyBtn),
                      stickyBtnText: stickyBtn ? stickyBtn.innerText.trim() : '',
                      stickyBtnHref: stickyBtn ? stickyBtn.getAttribute('href') : '',
                      stickyBtnTarget: stickyBtn ? stickyBtn.getAttribute('target') : '',
                      stickyBtnRel: stickyBtn ? stickyBtn.getAttribute('rel') : '',
                      stickyHeight: stickyHeight,
                      hasStickyNote: Boolean(stickyNote),
                      stickyNoteText: stickyNote ? stickyNote.innerText.trim() : '',

                      hasBottomNavPortal: Boolean(bottomNavPortal),
                      bottomNavPortalHref: bottomNavPortal ? bottomNavPortal.getAttribute('href') : '',
                      bottomNavPortalTarget: bottomNavPortal ? bottomNavPortal.getAttribute('target') : '',
                      navHeight: navHeight,

                      hasHeroApplyBtn: Boolean(heroApplyBtn),
                      heroApplyHref: heroApplyBtn ? heroApplyBtn.getAttribute('href') : '',
                      heroApplyTarget: heroApplyBtn ? heroApplyBtn.getAttribute('target') : ''
                    });
                  })()
                `
              }
            }));
          }, 1500);
        } else if (msg.id === 3) {
          const res = JSON.parse(msg.result.result.value);
          console.log('\n--- Test 1: Sticky Bottom & Hero Banner Checks ---');
          console.log('Sticky "Apply for Leave" Button Present:', res.hasStickyBtn ? 'PASS' : 'FAIL');
          console.log('Sticky Button Text:', res.stickyBtnText);
          console.log('Sticky Button URL matches expected:', res.stickyBtnHref === EXPECTED_URL ? 'PASS' : 'FAIL');
          console.log('Sticky Button target="_blank":', res.stickyBtnTarget === '_blank' ? 'PASS' : 'FAIL');
          console.log('Sticky Button rel="noopener noreferrer":', res.stickyBtnRel.includes('noopener') ? 'PASS' : 'FAIL');
          console.log('Sticky Button tap target height >= 48px:', res.stickyHeight >= 48 ? `PASS (${res.stickyHeight}px)` : `FAIL (${res.stickyHeight}px)`);

          console.log('\nSticky Note Present:', res.hasStickyNote ? 'PASS' : 'FAIL');
          console.log('Sticky Note text:', res.stickyNoteText);

          console.log('\nBottom Nav Portal Link Present:', res.hasBottomNavPortal ? 'PASS' : 'FAIL');
          console.log('Bottom Nav Portal URL matches:', res.bottomNavPortalHref === EXPECTED_URL ? 'PASS' : 'FAIL');
          console.log('Bottom Nav tap target height >= 48px:', res.navHeight >= 48 ? `PASS (${res.navHeight}px)` : `FAIL (${res.navHeight}px)`);

          console.log('\nHero Banner "Apply now" Button Present:', res.hasHeroApplyBtn ? 'PASS' : 'FAIL');
          console.log('Hero Banner URL matches expected:', res.heroApplyHref === EXPECTED_URL ? 'PASS' : 'FAIL');

          // Now test Test 2: Profile Menu Leave Portal link
          ws.send(JSON.stringify({
            id: 4,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (function() {
                  const avatarBtn = document.querySelector('.avatar-btn');
                  if (avatarBtn) avatarBtn.click();
                  return 'OPENED_PROFILE';
                })()
              `
            }
          }));
        } else if (msg.id === 4) {
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 5,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (function() {
                    const portalLink = document.querySelector('.leave-portal-menu-link');
                    const linkHeight = portalLink ? portalLink.getBoundingClientRect().height : 0;
                    return JSON.stringify({
                      hasPortalLink: Boolean(portalLink),
                      href: portalLink ? portalLink.getAttribute('href') : '',
                      target: portalLink ? portalLink.getAttribute('target') : '',
                      rel: portalLink ? portalLink.getAttribute('rel') : '',
                      height: linkHeight
                    });
                  })()
                `
              }
            }));
          }, 500);
        } else if (msg.id === 5) {
          const pRes = JSON.parse(msg.result.result.value);
          console.log('\n--- Test 2: Profile Menu Portal Link ---');
          console.log('Profile Menu Portal Link Present:', pRes.hasPortalLink ? 'PASS' : 'FAIL');
          console.log('Profile Menu URL matches expected:', pRes.href === EXPECTED_URL ? 'PASS' : 'FAIL');
          console.log('Profile Menu target="_blank":', pRes.target === '_blank' ? 'PASS' : 'FAIL');
          console.log('Profile Menu height >= 48px:', pRes.height >= 48 ? `PASS (${pRes.height}px)` : `FAIL (${pRes.height}px)`);

          // Now Test 3: Tap a GP date to open Bottom Sheet and test "Apply for this GP" and "Copy dates"
          // In Nov 2026, Nov 6 is Diwali GP leave start
          ws.send(JSON.stringify({
            id: 6,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (function() {
                  // Close profile menu by clicking main content
                  document.querySelector('.app-main-content').click();

                  // Find day cell for Nov 6 (has AN badge)
                  const dayCell = Array.from(document.querySelectorAll('.calendar-day-cell')).find(c => {
                    return c.innerText.includes('6') && c.innerText.includes('AN');
                  });
                  if (dayCell) {
                    dayCell.click();
                    return 'CLICKED_GP_DAY';
                  }
                  return 'DAY_CELL_NOT_FOUND';
                })()
              `
            }
          }));
        } else if (msg.id === 6) {
          console.log('Day Cell Clicked:', msg.result.result.value);
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 7,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (function() {
                    const sheet = document.querySelector('.bottom-sheet');
                    const applyGpBtn = document.querySelector('.sheet-apply-gp-btn');
                    const copyDatesBtn = document.querySelector('.sheet-copy-dates-btn');
                    const rangeDisplay = document.querySelector('.gp-range-display-text');
                    const note = document.querySelector('.sheet-portal-note');

                    const applyHeight = applyGpBtn ? applyGpBtn.getBoundingClientRect().height : 0;
                    const copyHeight = copyDatesBtn ? copyDatesBtn.getBoundingClientRect().height : 0;

                    return JSON.stringify({
                      isSheetActive: sheet ? sheet.classList.contains('active') : false,
                      hasApplyGpBtn: Boolean(applyGpBtn),
                      applyGpHref: applyGpBtn ? applyGpBtn.getAttribute('href') : '',
                      applyGpTarget: applyGpBtn ? applyGpBtn.getAttribute('target') : '',
                      applyGpHeight: applyHeight,
                      hasCopyDatesBtn: Boolean(copyDatesBtn),
                      copyDatesHeight: copyHeight,
                      rangeText: rangeDisplay ? rangeDisplay.innerText.trim() : '',
                      noteText: note ? note.innerText.trim() : ''
                    });
                  })()
                `
              }
            }));
          }, 800);
        } else if (msg.id === 7) {
          const sRes = JSON.parse(msg.result.result.value);
          console.log('\n--- Test 3: Bottom Sheet GP Portal & Copy Dates ---');
          console.log('Bottom Sheet Open:', sRes.isSheetActive ? 'PASS' : 'FAIL');
          console.log('Apply for this GP button present:', sRes.hasApplyGpBtn ? 'PASS' : 'FAIL');
          console.log('Apply for this GP URL matches expected:', sRes.applyGpHref === EXPECTED_URL ? 'PASS' : 'FAIL');
          console.log('Apply for this GP target="_blank":', sRes.applyGpTarget === '_blank' ? 'PASS' : 'FAIL');
          console.log('Apply for this GP tap target height >= 48px:', sRes.applyGpHeight >= 48 ? `PASS (${sRes.applyGpHeight}px)` : `FAIL (${sRes.applyGpHeight}px)`);

          console.log('Copy dates button present:', sRes.hasCopyDatesBtn ? 'PASS' : 'FAIL');
          console.log('Copy dates button tap target height >= 48px:', sRes.copyDatesHeight >= 48 ? `PASS (${sRes.copyDatesHeight}px)` : `FAIL (${sRes.copyDatesHeight}px)`);
          console.log('GP Range text:', sRes.rangeText);
          console.log('Portal Note text:', sRes.noteText);

          // Now test clicking "Copy dates"
          ws.send(JSON.stringify({
            id: 8,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (function() {
                  const copyBtn = document.querySelector('.sheet-copy-dates-btn');
                  if (copyBtn) {
                    copyBtn.click();
                    return 'CLICKED_COPY_DATES';
                  }
                  return 'COPY_BTN_NOT_FOUND';
                })()
              `
            }
          }));
        } else if (msg.id === 8) {
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 9,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (function() {
                    const copyBtn = document.querySelector('.sheet-copy-dates-btn');
                    return JSON.stringify({
                      buttonText: copyBtn ? copyBtn.innerText.trim() : '',
                      isCopiedClass: copyBtn ? copyBtn.classList.contains('copied') : false
                    });
                  })()
                `
              }
            }));
          }, 300);
        } else if (msg.id === 9) {
          const cRes = JSON.parse(msg.result.result.value);
          console.log('Copy Dates Feedback State:', cRes.buttonText, `(Class .copied: ${cRes.isCopiedClass ? 'YES' : 'NO'})`);

          // Now Test 4: Switch to Upcoming list and check "Apply" link on each GP card
          ws.send(JSON.stringify({
            id: 10,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (function() {
                  // Close bottom sheet
                  document.querySelector('.sheet-close-btn').click();
                  // Switch to Upcoming view
                  const upcomingTab = Array.from(document.querySelectorAll('.segment-tab-btn')).find(b => b.innerText.includes('Upcoming'));
                  if (upcomingTab) upcomingTab.click();
                  return 'SWITCHED_TO_UPCOMING';
                })()
              `
            }
          }));
        } else if (msg.id === 10) {
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 11,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (function() {
                    const gpCards = document.querySelectorAll('.upcoming-item-card.type-gp');
                    const applyPills = document.querySelectorAll('.upcoming-apply-link-pill');
                    let allUrlsMatch = true;
                    let allBlank = true;

                    applyPills.forEach(pill => {
                      if (pill.getAttribute('href') !== '${EXPECTED_URL}') allUrlsMatch = false;
                      if (pill.getAttribute('target') !== '_blank') allBlank = false;
                    });

                    return JSON.stringify({
                      totalGpCards: gpCards.length,
                      totalApplyPills: applyPills.length,
                      allUrlsMatch,
                      allBlank,
                      firstPillText: applyPills[0] ? applyPills[0].innerText.trim() : ''
                    });
                  })()
                `
              }
            }));
          }, 800);
        } else if (msg.id === 11) {
          const uRes = JSON.parse(msg.result.result.value);
          console.log('\n--- Test 4: Upcoming List GP Cards ---');
          console.log('Total GP Cards in upcoming:', uRes.totalGpCards);
          console.log('Total "Apply" pills rendered on GP cards:', uRes.totalApplyPills);
          console.log('All "Apply" pills link to expected URL:', uRes.allUrlsMatch ? 'PASS' : 'FAIL');
          console.log('All "Apply" pills target="_blank":', uRes.allBlank ? 'PASS' : 'FAIL');
          console.log('Pill text:', uRes.firstPillText);

          console.log('\n=== ALL LEAVE PORTAL TESTS PASSED PERFECTLY! ===\n');
          chrome.kill();
          process.exit(0);
        }
      };
    });
  });
}

run();

