// src/app/shared/utils/phone.util.ts
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

// Sécurise le code pays reçu (string -> CountryCode | undefined)
function asCountryCode(code?: string): CountryCode | undefined {
  if (!code) return undefined;
  return code.toUpperCase() as CountryCode; // OK si tu contrôles la liste (FR, GN, BE, ...)
}

export function formatPhoneOnType(input: string, country?: string): string {
  if (!input) return '';
  const cc = asCountryCode(country);
  return new AsYouType(cc).input(input);
}

export function toE164(input: string, country?: string): string | null {
  if (!input) return null;
  const cc = asCountryCode(country);
  const phone = parsePhoneNumberFromString(input, cc);
  return phone?.isValid() ? phone.number : null; // E.164
}

export function isValidE164(input: string, country?: string): boolean {
  if (!input) return false;
  const cc = asCountryCode(country);
  const phone = parsePhoneNumberFromString(input, cc);
  return !!phone && phone.isValid();
}
