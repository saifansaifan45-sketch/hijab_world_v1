import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:4000/api/v1';

test.describe('API Contract & Integration Suite', () => {

  test('GET /products adheres strictly to schema contract', async ({ request }) => {
    const res = await request.get(`${API_BASE}/products`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('count');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    for (const item of body.data) {
      expect(item).toHaveProperty('id');
      expect(typeof item.id).toBe('string');
      expect(item).toHaveProperty('title');
      expect(typeof item.title).toBe('string');
      expect(item).toHaveProperty('slug');
      expect(typeof item.slug).toBe('string');
      expect(item).toHaveProperty('isAvailable', true);
      expect(item).toHaveProperty('category');
      expect(item.category).toHaveProperty('name');
      expect(item.category).toHaveProperty('slug');
      // Verify no price or currency leaked
      expect(item.price).toBeUndefined();
      expect(item.currency).toBeUndefined();
    }
  });

  test('GET /products/:id with invalid UUID returns 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/products/00000000-0000-0000-0000-000000000000`);
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toMatch(/not found/i);
  });

  test('GET /settings provides public metadata without sensitive email leakage', async ({ request }) => {
    const res = await request.get(`${API_BASE}/settings`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.whatsappNumber).toBe('918861720050');
    expect(body.data.instagramUrl).toBe('https://www.instagram.com/hijab_worl');
    // Ensure emailAddress is stripped from public output
    expect(body.data.emailAddress).toBeUndefined();
  });

  test('Disallowed HTTP methods on public endpoints return 404 or 405', async ({ request }) => {
    const postRes = await request.post(`${API_BASE}/products`, {
      data: { title: 'Unauthorized Creation Attempt' }
    });
    // POST is not exposed on products controller
    expect([404, 405]).toContain(postRes.status());

    const deleteRes = await request.delete(`${API_BASE}/products/1`);
    expect([404, 405]).toContain(deleteRes.status());
  });

  test('Slow and failing API simulation: frontend graceful fallback', async ({ page }) => {
    // Intercept backend requests and simulate a 500 failure
    await page.route('**/api/settings', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('http://localhost:3000/#overview');
    await page.waitForLoadState('domcontentloaded');

    // Page must remain responsive and show fallback WhatsApp button
    const waBtn = page.locator('a[href*="wa.me/918861720050"], button[onclick*="openWhatsApp"]');
    await expect(waBtn.first()).toBeVisible();

    // Verify no unhandled error overlay or blank screen
    const heading = page.locator('h1');
    await expect(heading.first()).toBeVisible();
  });
});
