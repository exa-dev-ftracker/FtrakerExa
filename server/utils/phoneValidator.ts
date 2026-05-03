/**
 * Validates and normalizes WhatsApp phone numbers
 */

/**
 * Normalizes a phone number to the format expected by WhatsApp (e.g., 628123456789)
 * Removes spaces, dashes, + symbol, and country code indicators
 *
 * @param phoneNumber - Raw phone number input
 * @returns Normalized phone number or null if invalid
 */
export function normalizePhoneNumber(phoneNumber: string): string | null {
  try {
    // Remove all non-numeric characters except leading +
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If it starts with 62 (Indonesia country code), keep it
    if (cleaned.startsWith('62')) {
      return cleaned;
    }

    // If it starts with 0, replace with 62
    if (cleaned.startsWith('0')) {
      return '62' + cleaned.slice(1);
    }

    // If it doesn't start with country code, assume Indonesia
    if (!cleaned.startsWith('62')) {
      return '62' + cleaned;
    }

    return cleaned;
  } catch (error) {
    return null;
  }
}

/**
 * Validates a normalized phone number
 * Must:
 * - Be numeric only
 * - Start with country code 62
 * - Be reasonable length (10-15 digits)
 *
 * @param phoneNumber - Normalized phone number
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Check if numeric only
  if (!/^\d+$/.test(phoneNumber)) {
    return false;
  }

  // Check if starts with 62
  if (!phoneNumber.startsWith('62')) {
    return false;
  }

  // Check reasonable length
  if (phoneNumber.length < 10 || phoneNumber.length > 15) {
    return false;
  }

  return true;
}

/**
 * Extracts and normalizes phone number from WhatsApp Baileys format
 * Baileys returns numbers like: 628123456789@s.whatsapp.net
 *
 * @param baileysSender - Sender ID from Baileys (e.g., 628123456789@s.whatsapp.net)
 * @returns Normalized phone number or null if invalid
 */
export function extractPhoneFromBaileys(baileysSender: string): string | null {
  try {
    // Remove @s.whatsapp.net suffix
    const phoneNumber = baileysSender.replace('@s.whatsapp.net', '');

    if (isValidPhoneNumber(phoneNumber)) {
      return phoneNumber;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Formats a normalized phone number for display
 * Example: 628123456789 → +62 812-3456-789
 *
 * @param phoneNumber - Normalized phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!isValidPhoneNumber(phoneNumber)) {
    return phoneNumber;
  }

  // +62 812-3456-789 format
  const countryCode = phoneNumber.slice(0, 2);
  const areaCode = phoneNumber.slice(2, 5);
  const firstPart = phoneNumber.slice(5, 9);
  const secondPart = phoneNumber.slice(9);

  return `+${countryCode} ${areaCode}-${firstPart}-${secondPart}`;
}

