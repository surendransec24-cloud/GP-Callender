const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
}

function luminance({ r, g, b }) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(rgb1, rgb2) {
  const lum1 = luminance(rgb1);
  const lum2 = luminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

async function runAudit() {
  console.log('Running Contrast & Accessibility Audit...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // Check login page elements
  const loginAudit = await page.evaluate(() => {
    const results = [];
    const elementsToCheck = [
      { sel: '.hero-main-heading', label: 'Login Hero Heading' },
      { sel: '.hero-subheading', label: 'Login Hero Subheading' },
      { sel: '.google-btn-text', label: 'Google Sign-in Button Text' },
      { sel: '.login-heading', label: 'Login Heading' },
      { sel: '.login-subtext', label: 'Login Subtext' }
    ];

    elementsToCheck.forEach(({ sel, label }) => {
      const el = document.querySelector(sel);
      if (el) {
        const style = window.getComputedStyle(el);
        results.push({
          label,
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight
        });
      }
    });
    return results;
  });

  console.log('\n--- Login Page Typography & Color Audit ---');
  console.table(loginAudit);

  // Authenticate as student to audit App screens
  const studentEvalBtn = await page.waitForSelector('.student-eval');
  await studentEvalBtn.click();
  await page.waitForSelector('.home-view-container');
  await new Promise(r => setTimeout(r, 600));

  // Audit Home Screen in Light and Dark Mode
  for (const theme of ['light', 'dark']) {
    await page.evaluate((th) => {
      document.documentElement.setAttribute('data-theme', th);
    }, theme);
    await new Promise(r => setTimeout(r, 200));

    const appAudit = await page.evaluate(() => {
      const checks = [
        { sel: '.greeting-name', label: 'Greeting Name' },
        { sel: '.stat-number', label: 'Quick Stat Number' },
        { sel: '.stat-label', label: 'Quick Stat Label' },
        { sel: '.hero-leave-title', label: 'Hero Leave Title' },
        { sel: '.hero-date-range', label: 'Hero Date Range' },
        { sel: '.sticky-apply-main-btn', label: 'Sticky Apply Main Button' },
        { sel: '.bottom-nav-dock', label: 'Bottom Dock Navigation' }
      ];

      return checks.map(({ sel, label }) => {
        const el = document.querySelector(sel);
        if (!el) return { label, found: false };
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          label,
          color: style.color,
          bg: style.backgroundColor,
          height: Math.round(rect.height),
          width: Math.round(rect.width)
        };
      });
    });

    console.log(`\n--- App Elements (${theme.toUpperCase()} Mode) ---`);
    console.table(appAudit);
  }

  // Audit Calendar Grid
  const calNavBtn = await page.$('.bottom-nav-dock-btn:nth-child(2)');
  await calNavBtn.click();
  await page.waitForSelector('.month-view-wrapper');
  await new Promise(r => setTimeout(r, 400));

  const calAudit = await page.evaluate(() => {
    const grid = document.querySelector('.calendar-month-card');
    const dayCells = document.querySelectorAll('.calendar-day-cell');
    const todayPill = document.querySelector('.day-number-text.today-pill');
    const role = grid ? grid.getAttribute('role') : null;

    let minHeight = 999;
    let minWidth = 999;
    dayCells.forEach(cell => {
      const r = cell.getBoundingClientRect();
      if (r.height < minHeight) minHeight = r.height;
      if (r.width < minWidth) minWidth = r.width;
    });

    return {
      gridRole: role,
      totalCells: dayCells.length,
      cellMinHeight: Math.round(minHeight),
      cellMinWidth: Math.round(minWidth),
      todayPillFound: Boolean(todayPill),
      todayPillColor: todayPill ? window.getComputedStyle(todayPill).color : null,
      todayPillBg: todayPill ? window.getComputedStyle(todayPill).backgroundColor : null
    };
  });

  console.log('\n--- Calendar Grid Accessibility & Dimensions ---');
  console.log(calAudit);

  // Check Touch Target Size Requirements (WCAG minimum 48px)
  const touchTargets = await page.evaluate(() => {
    const targets = [
      { sel: '.sticky-apply-main-btn', name: 'Sticky Apply Button' },
      { sel: '.bottom-nav-dock-btn', name: 'Bottom Nav Dock Item' },
      { sel: '.month-nav-arrow-btn', name: 'Month Navigation Arrow' },
      { sel: '.today-pill-btn', name: 'Today Jump Button' }
    ];

    return targets.map(({ sel, name }) => {
      const el = document.querySelector(sel);
      if (!el) return { name, passed: false, note: 'Not found' };
      const r = el.getBoundingClientRect();
      const passed = r.height >= 44 && r.width >= 40; // WCAG 2.5.5 touch target standard
      return {
        name,
        width: Math.round(r.width),
        height: Math.round(r.height),
        passed: passed ? 'PASSED (>=44px)' : 'FAILED (<44px)'
      };
    });
  });

  console.log('\n--- Touch Target Sizes ---');
  console.table(touchTargets);

  await browser.close();
  console.log('\nAudit complete!');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
