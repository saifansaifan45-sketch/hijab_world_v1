import assert from 'node:assert';
import { test, describe } from 'node:test';
import { normalizeWhatsAppNumber, whatsappUrl, productWhatsAppUrl } from './links';

describe('Contact Links Helpers', () => {
  test('whatsappUrl("918861720050") starts with "https://wa.me/918861720050"', () => {
    const url = whatsappUrl('918861720050');
    assert.ok(url.startsWith('https://wa.me/918861720050'), `Expected ${url} to start with https://wa.me/918861720050`);
  });

  test('whatsappUrl("+91 88617 20050", "Hi there & welcome") -> "https://wa.me/918861720050?text=Hi%20there%20%26%20welcome"', () => {
    const url = whatsappUrl('+91 88617 20050', 'Hi there & welcome');
    assert.strictEqual(url, 'https://wa.me/918861720050?text=Hi%20there%20%26%20welcome');
  });

  test('whatsappUrl("8861720050") also gives the 91 prefix', () => {
    const url = whatsappUrl('8861720050');
    assert.ok(url.startsWith('https://wa.me/918861720050'), `Expected ${url} to start with https://wa.me/918861720050`);
  });

  test('normalizeWhatsAppNumber handles 10-digit, dashes, spaces, and leading zero correctly', () => {
    assert.strictEqual(normalizeWhatsAppNumber('8861720050'), '918861720050');
    assert.strictEqual(normalizeWhatsAppNumber('08861720050'), '918861720050');
    assert.strictEqual(normalizeWhatsAppNumber('+91-88617-20050'), '918861720050');
    assert.strictEqual(normalizeWhatsAppNumber('+91 88617 20050'), '918861720050');
    assert.strictEqual(normalizeWhatsAppNumber('918861720050'), '918861720050');
  });

  test('productWhatsAppUrl formats message with product name and page url', () => {
    const url = productWhatsAppUrl('Onyx Black', 'http://localhost:3000/#packs');
    const expectedMsg = "Hi Hijab World, I'm interested in Onyx Black (http://localhost:3000/#packs).";
    assert.strictEqual(url, `https://wa.me/918861720050?text=${encodeURIComponent(expectedMsg)}`);
  });
});
