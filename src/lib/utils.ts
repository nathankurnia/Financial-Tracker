import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Currency } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_FACTORS: Record<Currency, number> = {
  EUR: 100,
  IDR: 1,
};

// Locale used for formatting per currency
const CURRENCY_LOCALES: Record<Currency, string> = {
  EUR: "de-DE", // German format: 1.234,56 €
  IDR: "id-ID", // Indonesian format: Rp 1.234
};

// Decimal places shown per currency
const CURRENCY_DECIMALS: Record<Currency, number> = {
  EUR: 2,
  IDR: 0,
};

/**
 * Format amount stored in smallest unit (e.g. cents) to display string.
 *
 * @example
 *   formatCurrency(5099, "EUR") // "50,99 €"
 *   formatCurrency(50000, "IDR") // "Rp 50.000"
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const displayAmount = amount / CURRENCY_FACTORS[currency];
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency: currency,
    minimumFractionDigits: CURRENCY_DECIMALS[currency],
    maximumFractionDigits: CURRENCY_DECIMALS[currency],
  }).format(displayAmount);
}

/**
 * Convert user input string to smallest unit integer for storage.
 *
 * @example
 *   parseCurrencyInput("50.99", "EUR") // 5099
 *   parseCurrencyInput("50000", "IDR") // 50000
 *   parseCurrencyInput("1,234.56", "EUR") // 123456
 */
export function parseCurrencyInput(value: string, currency: Currency): number {
  // Remove all non-digit, non-decimal characters
  // Accept both . and , as decimal separator
  const cleaned = value.replace(/[^\d.,]/g, "");

  // Normalize: replace , with . for parseFloat
  // If there are multiple . or ,, only the last one is decimal
  let normalized = cleaned;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma > lastDot) {
    // Comma is decimal separator (European format)
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    // Dot is decimal separator
    normalized = cleaned.replace(/,/g, "");
  } else {
    // No separators, just digits
    normalized = cleaned.replace(/[.,]/g, "");
  }

  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return 0;

  return Math.round(parsed * CURRENCY_FACTORS[currency]);
}

/**
 * Get currency symbol only (without amount).
 */
export function getCurrencySymbol(currency: Currency): string {
  const formatted = new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency: currency,
  }).format(0);
  // Extract non-numeric, non-comma, non-dot characters
  return formatted.replace(/[\d.,\s]/g, "");
}

/**
 * Get all supported currencies as array.
 */
export const SUPPORTED_CURRENCIES: Currency[] = ["EUR", "IDR"];

/**
 * Display label for a currency.
 */
export const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: "Euro (€)",
  IDR: "Indonesian Rupiah (Rp)",
};
