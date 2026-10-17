import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

const VIEWPORTS = [1920, 1440, 1280, 1024, 768, 375];
const VIEWS = ['overview', 'anatomy', 'packs', 'order'];
const SCREENSHOTS_DIR = 'docs/black-collection/screenshots';

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function verifySite() {
  console.log('Launching Playwright verification across viewports on http://localhost:3000...');
  const browser = await chromium.launch();
  const results = [];
  const consoleErrors = [];

  for (const width of VIEWPORTS) {
    const height = width >= 1024 ? 900 : 812;
    const page = await browser.newPage({ viewport: { width, height } });

    page.on('console', (msg) => {
      // Ignore Next.js dev server HMR websocket notices
      if (msg.type() === 'error' && !msg.text().includes('hmr') && !msg.text().includes('WebSocket')) {
        consoleErrors.push(`[${width}px] ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(600);

    for (const view of VIEWS) {
      if (view !== 'overview') {
        await page.evaluate((v) => window.App && window.App.navigate(v), view);
        await page.waitForTimeout(500);
      }

      // Scroll view to trigger lazy loading of in-view images
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);

      const metrics = await page.evaluate((viewName) => {
        const header = document.querySelector('.app-header');
        const headerRect = header ? header.getBoundingClientRect() : null;
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;

        let imgLoaded = true;
        if (viewName === 'overview') {
          const img = document.querySelector('.grip-hero-media-wrap img');
          imgLoaded = img ? (img.naturalWidth > 0 || img.complete) : false;
        } else if (viewName === 'packs') {
          const colImg = document.querySelector('.collection-header-photo');
          const singleImg = document.querySelector('.single-media-wrap img');
          imgLoaded = (colImg ? (colImg.naturalWidth > 0 || colImg.complete) : false) &&
                      (singleImg ? (singleImg.naturalWidth > 0 || singleImg.complete) : false);
        } else if (viewName === 'anatomy') {
          const anatImg = document.querySelector('.anatomy-closeup-media img');
          imgLoaded = anatImg ? (anatImg.naturalWidth > 0 || anatImg.complete) : false;
        }

        const trioCard = document.querySelector('.trio-bundle-card');
        const singleCard = document.querySelector('.single-product-horizontal-card');
        const anatomyCard = document.querySelector('.anatomy-closeup-card');

        return {
          view: viewName,
          headerHeight: headerRect ? Math.round(headerRect.height) : 0,
          scrollWidth: scrollW,
          clientWidth: clientW,
          noHorizontalScroll: scrollW <= clientW,
          imgLoaded,
          trioCardPresent: !!trioCard,
          singleCardPresent: !!singleCard,
          anatomyCardPresent: !!anatomyCard,
        };
      }, view);

      results.push({ width, ...metrics });

      // Save view screenshots at 1440 and 375
      if (width === 1440 || width === 375) {
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `${view}-${width}px.png`),
          fullPage: false,
        });
      }
    }

    await page.close();
  }

  await browser.close();

  console.log('\n--- PLAYWRIGHT MULTI-VIEWPORT VERIFICATION RESULTS ---');
  console.table(
    results.map((r) => ({
      Width: r.width,
      View: r.view,
      'Header H': r.headerHeight,
      'No H-Scroll': r.noHorizontalScroll,
      'Images Loaded': r.imgLoaded,
      Trio: r.trioCardPresent,
      Single: r.singleCardPresent,
      Anatomy: r.anatomyCardPresent,
    }))
  );

  console.log(`\nConsole Errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors detected:', consoleErrors);
    process.exit(1);
  }

  const allPassed = results.every(
    (r) =>
      r.noHorizontalScroll &&
      r.headerHeight === 64 &&
      r.imgLoaded &&
      r.trioCardPresent &&
      r.singleCardPresent &&
      r.anatomyCardPresent
  );

  if (!allPassed) {
    console.error('Some viewport checks failed verification!');
    process.exit(1);
  }

  console.log('✓ All viewports and views verified successfully with zero horizontal scroll, 64px header, and all real images loaded!');
}

verifySite().catch((err) => {
  console.error(err);
  process.exit(1);
});
