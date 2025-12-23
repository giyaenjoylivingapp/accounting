// Balance calculation utilities

import { Currency, TRANSACTION_TYPES } from "./constants";

// Transaction type for balance calculations
export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  currency: Currency;
  date: Date;
}

// Settings type for initial balances
export interface BalanceSettings {
  initialBalanceUSD: number;
  initialBalanceCDF: number;
}

// Balance result type
export interface BalanceResult {
  USD: number;
  CDF: number;
}

// Daily balance summary
export interface DailySummary {
  date: string; // YYYY-MM-DD
  openingUSD: number;
  openingCDF: number;
  incomeUSD: number;
  incomeCDF: number;
  expenseUSD: number;
  expenseCDF: number;
  closingUSD: number;
  closingCDF: number;
}

// Format date to YYYY-MM-DD string
export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Get start of day
export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get end of day
export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Calculate current balance from initial balance and all transactions
export function calculateCurrentBalance(
  initialBalance: BalanceSettings,
  transactions: Transaction[]
): BalanceResult {
  let balanceUSD = initialBalance.initialBalanceUSD;
  let balanceCDF = initialBalance.initialBalanceCDF;

  for (const tx of transactions) {
    const amount = tx.type === TRANSACTION_TYPES.INCOME ? tx.amount : -tx.amount;
    if (tx.currency === "USD") {
      balanceUSD += amount;
    } else {
      balanceCDF += amount;
    }
  }

  return { USD: balanceUSD, CDF: balanceCDF };
}

// Calculate opening balance for a specific date
export function calculateOpeningBalance(
  initialBalance: BalanceSettings,
  transactions: Transaction[],
  date: Date
): BalanceResult {
  const startOfDay = getStartOfDay(date);

  // Filter transactions before this date
  const priorTransactions = transactions.filter(
    (tx) => new Date(tx.date) < startOfDay
  );

  return calculateCurrentBalance(initialBalance, priorTransactions);
}

// Calculate daily summary for a specific date
export function calculateDailySummary(
  initialBalance: BalanceSettings,
  transactions: Transaction[],
  date: Date
): DailySummary {
  const dateKey = formatDateKey(date);
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);

  // Get opening balance (all transactions before this day)
  const opening = calculateOpeningBalance(initialBalance, transactions, date);

  // Filter today's transactions
  const todayTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= startOfDay && txDate <= endOfDay;
  });

  // Calculate today's income and expenses by currency
  let incomeUSD = 0;
  let incomeCDF = 0;
  let expenseUSD = 0;
  let expenseCDF = 0;

  for (const tx of todayTransactions) {
    if (tx.type === TRANSACTION_TYPES.INCOME) {
      if (tx.currency === "USD") incomeUSD += tx.amount;
      else incomeCDF += tx.amount;
    } else {
      if (tx.currency === "USD") expenseUSD += tx.amount;
      else expenseCDF += tx.amount;
    }
  }

  // Calculate closing balance
  const closingUSD = opening.USD + incomeUSD - expenseUSD;
  const closingCDF = opening.CDF + incomeCDF - expenseCDF;

  return {
    date: dateKey,
    openingUSD: opening.USD,
    openingCDF: opening.CDF,
    incomeUSD,
    incomeCDF,
    expenseUSD,
    expenseCDF,
    closingUSD,
    closingCDF,
  };
}

// Get transactions for a specific date
export function getTransactionsForDate(
  transactions: Transaction[],
  date: Date
): Transaction[] {
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= startOfDay && txDate <= endOfDay;
  });
}

// Get transactions for a date range
export function getTransactionsForDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  const start = getStartOfDay(startDate);
  const end = getEndOfDay(endDate);

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= start && txDate <= end;
  });
}

// Calculate totals by category for a list of transactions
export function calculateCategoryTotals(
  transactions: Transaction[]
): Map<string, { USD: number; CDF: number }> {
  const totals = new Map<string, { USD: number; CDF: number }>();

  for (const tx of transactions) {
    // Note: This function expects transactions with a category property
    // which isn't in the base Transaction type
    const txWithCategory = tx as Transaction & { category: string };
    const category = txWithCategory.category || "other";

    if (!totals.has(category)) {
      totals.set(category, { USD: 0, CDF: 0 });
    }

    const current = totals.get(category)!;
    if (tx.currency === "USD") {
      current.USD += tx.amount;
    } else {
      current.CDF += tx.amount;
    }
  }

  return totals;
}
