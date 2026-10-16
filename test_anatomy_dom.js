const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1880, height: 950 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000/#anatomy ...');
  await page.goto('http://localhost:3000/#anatomy', { waitUntil: 'networkidle' });

  // Wait a moment for app.init
  await page.waitForTimeout(1000);

  // Inspect DOM state
  const report = await page.evaluate(() => {
    const views = ['overview', 'anatomy', 'packs', 'order', 'admin'];
    const viewStats = {};
    for (const v of views) {
      const el = document.getElementById('view-' + v);
      if (el) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        viewStats[v] = {
          display: style.display,
          opacity: style.opacity,
          visibility: style.visibility,
          classList: Array.from(el.classList),
          rect: { top: rect.top, y: rect.y, height: rect.height, width: rect.width },
          offsetTop: el.offsetTop,
          scrollTop: el.scrollTop
        };
      } else {
        viewStats[v] = null;
      }
    }

    const appContainer = document.getElementById('app-container');
    const appContainerRect = appContainer ? appContainer.getBoundingClientRect() : null;

    // Check headings and images
    const activeView = document.querySelector('.page-view.active');
    let firstHeading = null;
    let firstImg = null;
    if (activeView) {
      const h = activeView.querySelector('h1, h2, h3');
      if (h) {
        const r = h.getBoundingClientRect();
        firstHeading = { tag: h.tagName, text: h.innerText.slice(0, 40), top: r.top, y: r.y };
      }
      const img = activeView.querySelector('img');
      if (img) {
        const r = img.getBoundingClientRect();
        firstImg = { src: img.src, top: r.top, y: r.y, height: r.height };
      }
    }

    // Check Next.js dev error badge or overlay
    const nextOverlay = document.querySelector('nextjs-portal') || document.querySelector('[data-nextjs-toast]');
    const errorText = nextOverlay ? nextOverlay.innerText : null;

    return {
      windowScrollY: window.scrollY,
      viewStats,
      activeViewId: activeView ? activeView.id : null,
      appContainerRect,
      firstHeading,
      firstImg,
      errorText
    };
  });

  console.log('DOM Report:', JSON.stringify(report, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
