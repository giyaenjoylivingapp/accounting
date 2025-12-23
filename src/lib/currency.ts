// Currency formatting utilities

import { Currency, CURRENCIES } from "./constants";

// Currency symbols
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  CDF: "FC",
};

// Currency display names
const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar",
  CDF: "Congolese Franc",
};

// Format amount with currency symbol
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(Math.abs(amount));

  if (currency === "USD") {
    return `${amount < 0 ? "-" : ""}${symbol}${formatted}`;
  }
  // CDF: amount followed by FC
  return `${amount < 0 ? "-" : ""}${formatted} ${symbol}`;
}

// Format amount without symbol (just the number)
export function formatAmount(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(amount);
}

// Get currency symbol
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

// Get currency display name
export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency];
}

// Parse currency string to number
export function parseCurrencyInput(value: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Validate currency amount
export function isValidAmount(value: string): boolean {
  const parsed = parseCurrencyInput(value);
  return !isNaN(parsed) && parsed >= 0;
}

// Format for input display (while typing)
export function formatInputValue(value: string, currency: Currency): string {
  const num = parseCurrencyInput(value);
  if (isNaN(num)) return "";
  return formatAmount(num, currency);
}

// Get both currencies for display
export function getCurrencies(): { value: Currency; label: string; symbol: string }[] {
  return [
    { value: CURRENCIES.USD, label: CURRENCY_NAMES.USD, symbol: CURRENCY_SYMBOLS.USD },
    { value: CURRENCIES.CDF, label: CURRENCY_NAMES.CDF, symbol: CURRENCY_SYMBOLS.CDF },
  ];
}
