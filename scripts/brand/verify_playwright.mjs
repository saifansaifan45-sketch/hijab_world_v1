import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

const VIEWPORTS = [1920, 1440, 1280, 1024, 768, 375];
const VIEWS = ['overview', 'anatomy', 'packs', 'order'];
const SCREENSHOTS_DIR = 'docs/brand/screenshots';

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function verifySite() {
  console.log('Launching Playwright verification on http://localhost:3000...');
  const browser = await chromium.launch();
  const results = [];

  for (const width of VIEWPORTS) {
    const height = width >= 1024 ? 900 : 812;
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(500);

    for (const view of VIEWS) {
      if (view !== 'overview') {
        await page.evaluate((v) => window.App && window.App.navigate(v), view);
        await page.waitForTimeout(400);
      }

      const metrics = await page.evaluate((viewName) => {
        const header = document.querySelector('.app-header');
        const headerRect = header ? header.getBoundingClientRect() : null;
        const headerLogo = document.querySelector('.header-brand-logo');
        const footerLogo = document.querySelector('.site-brand-logo-footer-full');
        const quickInquiry = document.querySelector('.quick-inquiry-fixed-btn');
        const footer = document.querySelector('.site-footer');
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;

        return {
          view: viewName,
          headerHeight: headerRect ? Math.round(headerRect.height) : 0,
          scrollWidth: scrollW,
          clientWidth: clientW,
          noHorizontalScroll: scrollW <= clientW,
          headerLogoLoaded: headerLogo ? (headerLogo.naturalWidth > 0) : false,
          headerLogoWidth: headerLogo ? Math.round(headerLogo.getBoundingClientRect().width) : 0,
          headerLogoHeight: headerLogo ? Math.round(headerLogo.getBoundingClientRect().height) : 0,
          footerLogoLoaded: footerLogo ? (footerLogo.naturalWidth > 0) : false,
          quickInquiryVisible: quickInquiry ? (
            quickInquiry.getBoundingClientRect().width > 0 &&
            quickInquiry.getBoundingClientRect().height > 0 &&
            window.getComputedStyle(quickInquiry).display !== 'none' &&
            window.getComputedStyle(quickInquiry).visibility !== 'hidden'
          ) : false,
          footerPresent: !!footer,
        };
      }, view);

      results.push({ width, ...metrics });
    }

    // Save screenshots at 1440 and 375
    if (width === 1440 || width === 375) {
      const headerElem = await page.$('.app-header');
      if (headerElem) {
        await headerElem.screenshot({ path: path.join(SCREENSHOTS_DIR, `header-${width}px.png`) });
      }
      const footerElem = await page.$('.site-footer');
      if (footerElem) {
        await footerElem.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await footerElem.screenshot({ path: path.join(SCREENSHOTS_DIR, `footer-${width}px.png`) });
      }
    }

    await page.close();
  }

  const metaPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await metaPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  const headData = await metaPage.evaluate(() => {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    const icons = Array.from(document.querySelectorAll('link[rel*="icon"]')).map(l => l.getAttribute('href'));
    return { ogTitle, ogImage, twitterImage, icons };
  });

  await browser.close();

  console.log('\n--- PLAYWRIGHT VERIFICATION RESULTS ---');
  console.table(results.map(r => ({
    Width: r.width,
    View: r.view,
    'Header H (px)': r.headerHeight,
    'No Horiz Scroll': r.noHorizontalScroll,
    'Hdr Logo (W x H)': `${r.headerLogoWidth}x${r.headerLogoHeight}`,
    'Hdr Loaded': r.headerLogoLoaded,
    'Ftr Loaded': r.footerLogoLoaded,
    'Quick Inquiry': r.quickInquiryVisible
  })));

  console.log('\nHead Metadata Check:');
  console.log('OG Title:', headData.ogTitle);
  console.log('OG Image:', headData.ogImage);
  console.log('Twitter Image:', headData.twitterImage);
  console.log('Icons found in DOM:', headData.icons);
}

verifySite().catch(console.error);
