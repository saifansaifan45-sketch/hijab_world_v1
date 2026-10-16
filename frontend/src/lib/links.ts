import { siteConfig } from '../config/site';

/**
 * Format a phone number into digits only.
 * Strips spaces, plus signs, dashes, and leading zeros.
 * If number has 10 digits, prefix 91.
 */
export function normalizeWhatsAppNumber(rawNumber: string): string {
  if (!rawNumber) return '';
  // Strip spaces, plus signs, dashes, parentheses
  let digits = rawNumber.replace(/[\s+\-()]/g, '');
  // Strip leading zeros
  digits = digits.replace(/^0+/, '');
  // If 10 digits, prefix with 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Generates WhatsApp URL
 * whatsappUrl(number, message?) -> "https://wa.me/" + digits only + "?text=" + encodeURIComponent(message)
 */
export function whatsappUrl(number: string = siteConfig.whatsappNumber, message?: string): string {
  const cleanNumber = normalizeWhatsAppNumber(number || siteConfig.whatsappNumber);
  const text = message !== undefined ? message : siteConfig.whatsappDefaultMessage;
  if (!text) {
    return `https://wa.me/${cleanNumber}`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}


/**
 * Generates WhatsApp product inquiry message
 * e.g., "Hi Hijab World, I'm interested in <product name> (<page link>)."
 */
export function productWhatsAppUrl(
  productName: string,
  pageUrl?: string,
  number: string = siteConfig.whatsappNumber
): string {
  const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const message = currentUrl
    ? `Hi Hijab World, I'm interested in ${productName} (${currentUrl}).`
    : `Hi Hijab World, I'm interested in ${productName}.`;
  return whatsappUrl(number, message);
}
