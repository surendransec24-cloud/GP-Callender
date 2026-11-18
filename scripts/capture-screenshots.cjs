const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '360px',  width: 360,  height: 780,  isDesktop: false },
  { name: '414px',  width: 414,  height: 896,  isDesktop: false },
  { name: '768px',  width: 768,  height: 1024, isDesktop: false },
  { name: '1024px', width: 1024, height: 768,  isDesktop: true  },
  { name: '1440px', width: 1440, height: 900,  isDesktop: true  }
];

const THEMES = ['light', 'dark'];

/** Click a nav tab by index — on desktop the dock is CSS-hidden but still clickable via JS */
async function clickNavTab(page, tabIndex) {
  await page.evaluate((idx) => {
    const btns = document.querySelectorAll('.bottom-nav-dock-btn');
    if (btns[idx]) btns[idx].click();
  }, tabIndex);
}

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(10000);

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`\n=== Capturing for ${vp.name} [${theme}] ===`);
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });

      // Navigate to app
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 600));

      // 1. CAPTURE LOGIN SCREEN
      await page.evaluate((th) => {
        localStorage.removeItem('bit_calendar_demo_user');
        localStorage.setItem('bit_theme', th);
        document.documentElement.setAttribute('data-theme', th);
      }, theme);
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.login-split-page');
      await new Promise(r => setTimeout(r, 400));

      const loginFile = path.join(OUTPUT_DIR, `login_${vp.name}_${theme}.png`);
      await page.screenshot({ path: loginFile });
      console.log('  Saved:', path.basename(loginFile));

      // 2. SIGN IN AS STUDENT (demo mode button)
      const studentEvalBtn = await page.$('.student-eval');
      if (studentEvalBtn) {
        await studentEvalBtn.click();
        await page.waitForSelector('.home-view-container', { timeout: 8000 });
        await new Promise(r => setTimeout(r, 600));
      }

      // Apply theme
      await page.evaluate((th) => {
        document.documentElement.setAttribute('data-theme', th);
      }, theme);
      await new Promise(r => setTimeout(r, 200));

      // 3. CAPTURE HOME
      const homeFile = path.join(OUTPUT_DIR, `home_${vp.name}_${theme}.png`);
      await page.screenshot({ path: homeFile });
      console.log('  Saved:', path.basename(homeFile));

      // 4. CAPTURE MONTH CALENDAR
      await clickNavTab(page, 1);
      try {
        await page.waitForSelector('.month-view-wrapper', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 400));
        const calFile = path.join(OUTPUT_DIR, `calendar_${vp.name}_${theme}.png`);
        await page.screenshot({ path: calFile });
        console.log('  Saved:', path.basename(calFile));

        // 5. DATE BOTTOM SHEET (click first GP cell)
        const gpCell = await page.$('.calendar-day-cell.has-gp');
        if (gpCell) {
          await gpCell.click();
          await page.waitForSelector('.bottom-sheet-container', { timeout: 4000 });
          await new Promise(r => setTimeout(r, 400));
          const sheetFile = path.join(OUTPUT_DIR, `bottom_sheet_${vp.name}_${theme}.png`);
          await page.screenshot({ path: sheetFile });
          console.log('  Saved:', path.basename(sheetFile));
          const closeBtn = await page.$('.sheet-close-btn');
          if (closeBtn) { await closeBtn.click(); await new Promise(r => setTimeout(r, 300)); }
        }
      } catch (e) {
        console.log('  Calendar selector timeout, skipping.');
      }

      // 6. CAPTURE UPCOMING
      await clickNavTab(page, 2);
      try {
        await page.waitForSelector('.upcoming-timeline-container', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 400));
        const upcomingFile = path.join(OUTPUT_DIR, `upcoming_${vp.name}_${theme}.png`);
        await page.screenshot({ path: upcomingFile });
        console.log('  Saved:', path.basename(upcomingFile));
      } catch (e) {
        console.log('  Upcoming selector timeout, skipping.');
      }

      // 7. PROFILE SHEET
      await clickNavTab(page, 3);
      try {
        await page.waitForSelector('.profile-sheet-card', { timeout: 4000 });
        await new Promise(r => setTimeout(r, 300));
        const profileFile = path.join(OUTPUT_DIR, `profile_${vp.name}_${theme}.png`);
        await page.screenshot({ path: profileFile });
        console.log('  Saved:', path.basename(profileFile));
        const closeProfileBtn = await page.$('.profile-sheet-card .sheet-close-btn');
        if (closeProfileBtn) { await closeProfileBtn.click(); await new Promise(r => setTimeout(r, 200)); }
      } catch (e) {
        console.log('  Profile sheet selector timeout, skipping.');
      }

      // Reset to home for next iteration
      await clickNavTab(page, 0);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully in:', OUTPUT_DIR);
}

run().catch(err => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
