// App constants

// Authorized email - only this user can access the app
export const ALLOWED_EMAIL = "giyaenjoyliving.app@gmail.com";

// App metadata
export const APP_NAME = "Giya Cash Book";
export const APP_DESCRIPTION = "Dual-currency cash book for furniture showroom";

// Currency codes
export const CURRENCIES = {
  USD: "USD",
  CDF: "CDF",
} as const;

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];

// Payment methods
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "transfer", label: "Bank Transfer" },
  { value: "mobile", label: "Mobile Money" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
  TRANSFER: "transfer",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

// Settings keys
export const SETTINGS_KEYS = {
  INITIAL_BALANCE_USD: "initialBalanceUSD",
  INITIAL_BALANCE_CDF: "initialBalanceCDF",
  SETUP_COMPLETE: "setupComplete",
  EXCHANGE_RATE: "exchangeRate",
} as const;
