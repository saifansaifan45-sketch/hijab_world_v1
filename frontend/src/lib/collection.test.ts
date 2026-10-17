import assert from 'node:assert';
import { test, describe } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig, OFFER_CONSTANT, fallbackProducts } from '../config/site';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

describe('Black Grip Collection & Guardrails', () => {
  test('OFFER_CONSTANT exists and contains offer wording with no hardcoded numerical price or percentage', () => {
    assert.ok(OFFER_CONSTANT, 'OFFER_CONSTANT should be defined');
    assert.strictEqual(typeof OFFER_CONSTANT, 'string');
    assert.ok(OFFER_CONSTANT.length > 5, 'OFFER_CONSTANT should be non-empty');
    assert.doesNotMatch(OFFER_CONSTANT, /[$₹€£]\d+/, 'OFFER_CONSTANT must not contain numerical prices');
    assert.doesNotMatch(OFFER_CONSTANT, /\b\d+%\b/, 'OFFER_CONSTANT must not invent a percentage discount');
  });

  test('fallbackProducts has exactly 2 products and no non-black items', () => {
    const products = fallbackProducts;
    assert.strictEqual(products.length, 2, 'Must have exactly 2 products (Single and Trio)');

    const titles = products.map((p) => p.title);
    assert.ok(titles.includes('HIJAB GRIP Black'), 'Must include HIJAB GRIP Black');
    assert.ok(titles.includes('Trio Pack: 3 Black Grips'), 'Must include Trio Pack: 3 Black Grips');

    for (const p of products) {
      assert.deepStrictEqual(p.colors, ['Black'], 'Product color must be Black only');
      assert.strictEqual((p as any).price, undefined, 'Products must not have numerical price properties');
    }
  });

  test('zero forbidden colour words in siteConfig and fallbackProducts', () => {
    const configStr = JSON.stringify({ siteConfig, fallbackProducts }).toLowerCase();
    const forbidden = ['onyx', 'caramel', 'nude', 'ivory', '3-color', 'color bundle', 'foundation'];
    for (const word of forbidden) {
      assert.strictEqual(configStr.includes(word), false, `siteConfig should not contain "${word}"`);
    }
  });

  test('zero forbidden colour words in page.tsx HTML markup', () => {
    const pagePath = path.join(rootDir, 'frontend/src/app/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8').toLowerCase();
    const forbidden = [
      'deep onyx',
      'warm caramel',
      'warm nude',
      'pure ivory',
      '3-color',
      'color bundle',
      'curated tones',
      'foundation color',
      'foundation shade',
      'shade swatch',
      'swatch dot',
    ];
    for (const word of forbidden) {
      assert.strictEqual(pageContent.includes(word), false, `page.tsx should not contain forbidden phrase "${word}"`);
    }
  });

  test('real client photos are properly referenced in page.tsx', () => {
    const pagePath = path.join(rootDir, 'frontend/src/app/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    assert.ok(pageContent.includes('model-olive-hijab-1200.webp'), 'Model photo 1200 webp referenced');
    assert.ok(pageContent.includes('model-olive-hijab-800.webp'), 'Model photo 800 webp referenced');
    assert.ok(pageContent.includes('grip-closeup-800.webp'), 'Close-up photo 800 webp referenced');
  });

  test('official contact links remain intact', () => {
    const pagePath = path.join(rootDir, 'frontend/src/app/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    assert.ok(pageContent.includes('https://wa.me/918861720050'), 'WhatsApp link present and intact');
    assert.ok(pageContent.includes('https://www.instagram.com/hijab_worl'), 'Instagram link present and intact');
    assert.strictEqual(pageContent.includes('mailto:'), false, 'No mailto links on the page');
  });

  test('testimonials section is completely removed', () => {
    const pagePath = path.join(rootDir, 'frontend/src/app/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    assert.strictEqual(pageContent.includes('Mariam K.'), false, 'Mariam K. review removed');
    assert.strictEqual(pageContent.includes('Amina Z.'), false, 'Amina Z. review removed');
    assert.strictEqual(pageContent.includes('Pure Ivory Single'), false, 'Pure Ivory Single review removed');
  });
});
