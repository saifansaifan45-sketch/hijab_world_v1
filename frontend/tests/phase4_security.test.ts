import { test } from 'node:test';
import assert from 'node:assert';
import { chromium } from 'playwright';

const API_BASE = 'http://localhost:4000/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

test('Security Phase 4 - A: Input Validation & Injection Fuzzing', async () => {
  const fuzzPayloads = [
    "' OR '1'='1' --",
    "'; DROP TABLE products; --",
    "<script>alert(1)</script>",
    "../../../../etc/passwd",
    "%00nullbyte",
    "A".repeat(2000), // very long string
    JSON.stringify({ $gt: "" }), // NoSQL-style trick
  ];

  for (const payload of fuzzPayloads) {
    // 1. Fuzz Products search query
    const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(payload)}`);
    assert.ok(res.status < 500, `Search query crashed with 500 on payload: ${payload}`);

    // 2. Fuzz Parameterized route
    const idRes = await fetch(`${API_BASE}/products/${encodeURIComponent(payload)}`);
    assert.ok([400, 404].includes(idRes.status), `Product ID parameter failed to sanitize payload: ${payload}`);
  }
});

test('Security Phase 4 - B: XSS & HTML Injection Resilience', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${FRONTEND_BASE}/#overview`, { waitUntil: 'domcontentloaded' });

  // Verify no unescaped active script tags injected in body
  const scriptsInjected = await page.$$eval('body script:not([src])', (scripts) => {
    return scripts.some((s) => s.textContent?.includes('alert('));
  });
  assert.strictEqual(scriptsInjected, false, 'Unsanitized script execution found in DOM');

  await browser.close();
});

test('Security Phase 4 - C: Rate Limiting & Abuse Prevention', async () => {
  // Fire rapid burst of 120 requests to test Throttler
  let throttled = false;
  for (let i = 0; i < 110; i++) {
    const res = await fetch(`${API_BASE}/health`);
    if (res.status === 429) {
      throttled = true;
      break;
    }
  }
  assert.ok(throttled, 'Rate limiter did not throttle burst traffic after 100 requests');
});

test('Security Phase 4 - D: Security Headers Verification', async () => {
  // Check Frontend Headers
  const feRes = await fetch(`${FRONTEND_BASE}`);
  assert.strictEqual(feRes.headers.get('x-content-type-options'), 'nosniff');
  assert.strictEqual(feRes.headers.get('x-frame-options'), 'DENY');
  assert.strictEqual(feRes.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');

  // Check Backend Headers (Helmet)
  const beRes = await fetch(`${API_BASE}/health`);
  assert.strictEqual(beRes.headers.get('x-content-type-options'), 'nosniff');
  assert.strictEqual(beRes.headers.get('x-frame-options'), 'SAMEORIGIN');
});

test('Security Phase 4 - E: Zero Secret Leakage in Client Bundles & Source', async () => {
  const feRes = await fetch(`${FRONTEND_BASE}`);
  const html = await feRes.text();

  assert.ok(!html.includes('DATABASE_URL'), 'DATABASE_URL leaked in markup');
  assert.ok(!html.includes('POSTGRES_PASSWORD'), 'POSTGRES_PASSWORD leaked in markup');
  assert.ok(!html.includes('hijab_secret_password'), 'Secret password leaked in markup');
  assert.ok(!html.includes('CLOUDINARY_API_SECRET'), 'Cloudinary secret leaked in markup');
});
