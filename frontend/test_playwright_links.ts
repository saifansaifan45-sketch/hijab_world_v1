import { test } from 'node:test';
import assert from 'node:assert';
import { chromium } from 'playwright';

const viewports = [
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
  { name: 'Mobile (375px)', width: 375, height: 812 }
];

const views = ['overview', 'anatomy', 'packs', 'order'];

test('Verify all real links across views at 1440px and 375px', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    console.log(`\nTesting viewport: ${vp.name}`);

    for (const view of views) {
      const url = `http://localhost:3000/#${view}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // 1. Check all links on the page
      const links = await page.$$eval('a', (elements) => {
        return elements.map(a => ({
          text: (a.textContent || '').trim(),
          href: a.getAttribute('href') || '',
          target: a.getAttribute('target'),
          rel: a.getAttribute('rel'),
          ariaLabel: a.getAttribute('aria-label'),
          title: a.getAttribute('title')
        }));
      });

      console.log(`[${vp.name}] [View: ${view}] Verified ${links.length} total links.`);

      for (const link of links) {
        // Assert no link has empty href or '#'
        assert.notStrictEqual(link.href, '', `Found link with empty href: ${JSON.stringify(link)}`);
        assert.notStrictEqual(link.href, '#', `Found link with href="#": ${JSON.stringify(link)}`);

        // Check WhatsApp links
        if (link.href.includes('wa.me')) {
          assert.ok(
            link.href.startsWith('https://wa.me/918861720050'),
            `WhatsApp link ${link.href} does not start with https://wa.me/918861720050`
          );
          assert.strictEqual(link.target, '_blank', `WhatsApp link missing target="_blank": ${link.href}`);
          assert.ok(link.rel && link.rel.includes('noopener'), `WhatsApp link missing noopener: ${link.href}`);
        }

        // Check Instagram links
        if (link.href.includes('instagram.com')) {
          assert.strictEqual(
            link.href,
            'https://www.instagram.com/hijab_worl',
            `Instagram link ${link.href} does not equal https://www.instagram.com/hijab_worl`
          );
          assert.strictEqual(link.target, '_blank', `Instagram link missing target="_blank": ${link.href}`);
          assert.ok(link.rel && link.rel.includes('noopener'), `Instagram link missing noopener: ${link.href}`);
        }

        // Assert NO mailto: links on any page
        assert.ok(
          !link.href.startsWith('mailto:'),
          `Email mailto link found on page: ${link.href}`
        );

        // Assert Facebook is not present in links
        assert.ok(
          !link.href.includes('facebook.com'),
          `Facebook link found while not configured: ${link.href}`
        );

        // Assert old placeholder phone is not present in links
        assert.ok(
          !link.href.includes('9876543210') && !link.href.includes('18004452296'),
          `Placeholder phone number found in link: ${link.href}`
        );
      }

      // 2. Check body text: no old handle, has @hijab_worl, and contains NO email traces
      const bodyText = (await page.textContent('body')) || '';
      assert.ok(
        !bodyText.includes('@hijabworld.official'),
        `Old handle @hijabworld.official still present in body text`
      );
      assert.ok(
        bodyText.includes('@hijab_worl'),
        `New handle @hijab_worl not found in body text`
      );
      assert.ok(
        !bodyText.includes('rimmu1011'),
        `Email rimmu1011 found in page body text`
      );
      assert.ok(
        !bodyText.includes('@gmail.com'),
        `@gmail.com found in page body text`
      );
    }
  }

  await browser.close();
  console.log('\nAll Playwright link checks passed successfully at 1440px and 375px across all views!');
});
