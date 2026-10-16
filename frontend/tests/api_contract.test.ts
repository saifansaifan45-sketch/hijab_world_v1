import { test } from 'node:test';
import assert from 'node:assert';
import { chromium } from 'playwright';

const API_BASE = 'http://localhost:4000/api/v1';

test('API Contract: GET /products adheres strictly to schema contract', async () => {
  const res = await fetch(`${API_BASE}/products`);
  assert.strictEqual(res.status, 200, `Expected 200 from /products, got ${res.status}`);

  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(typeof body.count === 'number');
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length > 0);

  for (const item of body.data) {
    assert.ok(typeof item.id === 'string', 'Item missing id');
    assert.ok(typeof item.title === 'string', 'Item missing title');
    assert.ok(typeof item.slug === 'string', 'Item missing slug');
    assert.strictEqual(item.isAvailable, true);
    assert.ok(item.category && typeof item.category.name === 'string');
    // Ensure no price or currency leaked
    assert.strictEqual(item.price, undefined, 'Price leaked in product data');
    assert.strictEqual(item.currency, undefined, 'Currency leaked in product data');
  }
});

test('API Contract: GET /products/:id with nonexistent ID returns 404', async () => {
  const res = await fetch(`${API_BASE}/products/00000000-0000-0000-0000-000000000000`);
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.ok(body.message.toLowerCase().includes('not found'));
});

test('API Contract: GET /settings provides public metadata without sensitive email leakage', async () => {
  const res = await fetch(`${API_BASE}/settings`);
  assert.strictEqual(res.status, 200);

  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(body.data);
  assert.strictEqual(body.data.whatsappNumber, '918861720050');
  assert.strictEqual(body.data.instagramUrl, 'https://www.instagram.com/hijab_worl');
  // Ensure emailAddress is stripped from public output
  assert.strictEqual(body.data.emailAddress, undefined, 'emailAddress leaked in settings response');
});

test('API Contract: Disallowed HTTP methods on public endpoints return 404 or 405', async () => {
  const postRes = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Unauthorized Creation Attempt' }),
  });
  assert.ok([404, 405].includes(postRes.status), `Expected 404/405 for POST, got ${postRes.status}`);

  const deleteRes = await fetch(`${API_BASE}/products/1`, { method: 'DELETE' });
  assert.ok([404, 405].includes(deleteRes.status), `Expected 404/405 for DELETE, got ${deleteRes.status}`);
});

test('API Resilience: Slow/failing API simulation with friendly fallback', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Simulate 500 error on settings API
  await page.route('**/api/settings', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });

  await page.goto('http://localhost:3000/#overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Check fallback WhatsApp button is visible and active
  const waBtnVisible = await page.isVisible('button[onclick*="openWhatsApp"], a[href*="wa.me/918861720050"]');
  assert.ok(waBtnVisible, 'WhatsApp fallback button not visible during backend degradation');

  const heading = await page.textContent('h1');
  assert.ok(heading && heading.length > 0, 'Header not visible during API failure');

  await browser.close();
});
