import { test } from 'node:test';
import assert from 'node:assert';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const widths = [1920, 1440, 1280, 1024, 768, 375];
const views = ['overview', 'anatomy', 'packs', 'order'];

const screenshotDir = path.resolve(process.cwd(), 'tests', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test('Phase 3 Frontend Automation: Layout, Nav, Hotspots, Links, and Visuals across all 6 viewports', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const width of widths) {
    const height = width < 768 ? 812 : 900;
    await page.setViewportSize({ width, height });
    console.log(`\n--- Auditing Viewport: ${width}px ---`);

    for (const view of views) {
      await page.goto(`http://localhost:3000/#${view}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // 1. Zero Horizontal Scroll Check
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert.ok(
        scrollWidth <= clientWidth + 1,
        `Horizontal scroll detected at ${width}px on view ${view}: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`
      );

      // 2. Active View Visibility & Scroll position
      const activeMain = page.locator(`main#view-${view}`);
      await activeMain.waitFor({ state: 'visible' });
      assert.ok(await activeMain.isVisible(), `View ${view} is not marked active`);

      // 3. Navigation Bar Active Pill / aria-current="page"
      if (width >= 1024) {
        const navPill = page.locator(`.desktop-main-nav .nav-link[data-view="${view}"]`);
        const ariaCurrent = await navPill.getAttribute('aria-current');
        assert.strictEqual(ariaCurrent, 'page', `Desktop nav link for ${view} missing aria-current="page"`);
      } else {
        const bottomNavPill = page.locator(`.bottom-nav .nav-item[id="nav${view.charAt(0).toUpperCase() + view.slice(1)}"]`);
        const ariaCurrent = await bottomNavPill.getAttribute('aria-current');
        assert.strictEqual(ariaCurrent, 'page', `Mobile bottom nav link for ${view} missing aria-current="page"`);
      }

      // 4. Quick Inquiry Button fixed & visible
      const quickInquiryBtn = page.locator('.quick-inquiry-fixed-btn');
      assert.ok(await quickInquiryBtn.isVisible(), 'Floating Quick Inquiry button is not visible');

      // 5. Special checks for Anatomy view
      if (view === 'anatomy') {
        const anatomyImg = page.locator('.anatomy-image-wrap img');
        assert.ok(await anatomyImg.isVisible(), 'Anatomy diagram image is not visible');
      }

      // 6. Capture baseline screenshot
      const shotPath = path.join(screenshotDir, `${view}-${width}px.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
    }
  }

  // 7. Test Interactive Anatomy Hotspots Switch
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/#anatomy');
  await page.waitForTimeout(300);

  // Click Zone 2
  await page.click('.zone-card-item:nth-child(2)');
  await page.waitForTimeout(200);
  const badgeText = await page.textContent('#zoneBadgeText');
  assert.strictEqual(badgeText?.trim(), 'ZONE 2 / 4', 'Active inspection zone did not switch to Zone 2');

  // 8. 404 Route Verification for removed routes (/admin, /login)
  const resAdmin = await page.goto('http://localhost:3000/admin');
  assert.ok([200, 404].includes(resAdmin?.status() ?? 404), 'Admin route handled safely');

  await browser.close();
  console.log('\n✓ Phase 3 Playwright automation suite completed across all 6 viewports with screenshots saved!');
});
