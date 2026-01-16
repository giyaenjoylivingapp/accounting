"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { TransactionData } from "./TransactionItem";
import { Currency } from "@/lib/constants";

interface TransactionLedgerProps {
  transactions: TransactionData[];
  onRowClick?: (transaction: TransactionData) => void;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
  initialBalanceUSD?: number;
  initialBalanceCDF?: number;
}

interface LedgerEntry extends TransactionData {
  runningBalanceUSD: number;
  runningBalanceCDF: number;
}

export function TransactionLedger({
  transactions,
  onRowClick,
  onDelete,
  showDeleteButton = true,
  initialBalanceUSD = 0,
  initialBalanceCDF = 0,
}: TransactionLedgerProps) {
  // Calculate running balances
  const ledgerEntries = useMemo(() => {
    // Sort by date ascending for running balance calculation
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningUSD = initialBalanceUSD;
    let runningCDF = initialBalanceCDF;

    const entries: LedgerEntry[] = sorted.map((t) => {
      if (t.type === "transfer") {
        // Handle transfers between currencies
        if (t.currency === "USD" && t.toCurrency === "CDF") {
          runningUSD -= t.amount;
          runningCDF += t.toAmount || 0;
        } else if (t.currency === "CDF" && t.toCurrency === "USD") {
          runningCDF -= t.amount;
          runningUSD += t.toAmount || 0;
        }
      } else if (t.type === "income") {
        if (t.currency === "USD") {
          runningUSD += t.amount;
        } else {
          runningCDF += t.amount;
        }
      } else {
        // expense
        if (t.currency === "USD") {
          runningUSD -= t.amount;
        } else {
          runningCDF -= t.amount;
        }
      }

      return {
        ...t,
        runningBalanceUSD: runningUSD,
        runningBalanceCDF: runningCDF,
      };
    });

    // Reverse to show newest first
    return entries.reverse();
  }, [transactions, initialBalanceUSD, initialBalanceCDF]);

  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(dateObj);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
          No transactions yet
        </h3>
        <p className="text-[var(--text-secondary)]">
          Add your first income or expense to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr className="bg-[var(--bg-tertiary)]">
            <th className="border border-[var(--border-color)] py-2 px-3 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider text-left">
              Date
            </th>
            <th className="border border-[var(--border-color)] py-2 px-3 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider text-left">
              Particulars
            </th>
            <th
              colSpan={2}
              className="border border-[var(--border-color)] py-2 px-3 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider text-center"
            >
              USD
            </th>
            <th
              colSpan={2}
              className="border border-[var(--border-color)] py-2 px-3 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider text-center"
            >
              CDF
            </th>
            <th
              colSpan={2}
              className="border border-[var(--border-color)] py-2 px-3 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider text-center"
            >
              Balance
            </th>
            {showDeleteButton && (
              <th className="border border-[var(--border-color)] py-2 px-3 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider text-center w-12">

              </th>
            )}
          </tr>
          <tr className="bg-[var(--bg-secondary)]">
            <th className="border border-[var(--border-color)] py-1.5 px-3"></th>
            <th className="border border-[var(--border-color)] py-1.5 px-3"></th>
            <th className="border border-[var(--border-color)] py-1.5 px-3 text-xs font-semibold text-[var(--income)] text-right">
              Debit
            </th>
            <th className="border border-[var(--border-color)] py-1.5 px-3 text-xs font-semibold text-[var(--expense)] text-right">
              Credit
            </th>
            <th className="border border-[var(--border-color)] py-1.5 px-3 text-xs font-semibold text-[var(--income)] text-right">
              Debit
            </th>
            <th className="border border-[var(--border-color)] py-1.5 px-3 text-xs font-semibold text-[var(--expense)] text-right">
              Credit
            </th>
            <th className="border border-[var(--border-color)] py-1.5 px-3 text-xs font-semibold text-[var(--text-secondary)] text-right">
              USD
            </th>
            <th className="border border-[var(--border-color)] py-1.5 px-3 text-xs font-semibold text-[var(--text-secondary)] text-right">
              CDF
            </th>
            {showDeleteButton && (
              <th className="border border-[var(--border-color)] py-1.5 px-3"></th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {ledgerEntries.map((entry) => {
            const isIncome = entry.type === "income";
            const isTransfer = entry.type === "transfer";

            // Calculate debit/credit values for each currency
            let usdDebit = 0;
            let usdCredit = 0;
            let cdfDebit = 0;
            let cdfCredit = 0;

            if (isTransfer) {
              if (entry.currency === "USD") {
                usdCredit = entry.amount;
                cdfDebit = entry.toAmount || 0;
              } else {
                cdfCredit = entry.amount;
                usdDebit = entry.toAmount || 0;
              }
            } else if (isIncome) {
              if (entry.currency === "USD") {
                usdDebit = entry.amount;
              } else {
                cdfDebit = entry.amount;
              }
            } else {
              // expense
              if (entry.currency === "USD") {
                usdCredit = entry.amount;
              } else {
                cdfCredit = entry.amount;
              }
            }

            return (
              <tr
                key={entry.id}
                onClick={() => onRowClick?.(entry)}
                className={`
                  hover:bg-[var(--bg-tertiary)] transition-colors
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {/* Date */}
                <td className="border border-[var(--border-color)] py-2 px-3 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                  {formatDate(entry.date)}
                </td>

                {/* Particulars */}
                <td className="border border-[var(--border-color)] py-2 px-3">
                  <div className="text-sm text-[var(--text-primary)] font-medium">
                    {entry.description}
                  </div>
                  {entry.vendor && (
                    <div className="text-xs text-[var(--text-muted)]">
                      {entry.vendor}
                    </div>
                  )}
                  {isTransfer && (
                    <div className="text-xs text-[var(--accent)] mt-0.5">
                      Currency Transfer (Rate: {entry.exchangeRate?.toLocaleString()})
                    </div>
                  )}
                </td>

                {/* USD Debit */}
                <td className="border border-[var(--border-color)] py-2 px-3 text-right font-mono text-sm">
                  {usdDebit > 0 && (
                    <span className="text-[var(--income)]">
                      {formatCurrency(usdDebit, "USD")}
                    </span>
                  )}
                </td>

                {/* USD Credit */}
                <td className="border border-[var(--border-color)] py-2 px-3 text-right font-mono text-sm">
                  {usdCredit > 0 && (
                    <span className="text-[var(--expense)]">
                      {formatCurrency(usdCredit, "USD")}
                    </span>
                  )}
                </td>

                {/* CDF Debit */}
                <td className="border border-[var(--border-color)] py-2 px-3 text-right font-mono text-sm">
                  {cdfDebit > 0 && (
                    <span className="text-[var(--income)]">
                      {formatCurrency(cdfDebit, "CDF")}
                    </span>
                  )}
                </td>

                {/* CDF Credit */}
                <td className="border border-[var(--border-color)] py-2 px-3 text-right font-mono text-sm">
                  {cdfCredit > 0 && (
                    <span className="text-[var(--expense)]">
                      {formatCurrency(cdfCredit, "CDF")}
                    </span>
                  )}
                </td>

                {/* Running Balance USD */}
                <td className="border border-[var(--border-color)] py-2 px-3 text-right font-mono text-sm bg-[var(--bg-secondary)]">
                  <span
                    className={
                      entry.runningBalanceUSD >= 0
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--error)]"
                    }
                  >
                    {formatCurrency(Math.abs(entry.runningBalanceUSD), "USD")}
                    {entry.runningBalanceUSD < 0 && " DR"}
                  </span>
                </td>

                {/* Running Balance CDF */}
                <td className="border border-[var(--border-color)] py-2 px-3 text-right font-mono text-sm bg-[var(--bg-secondary)]">
                  <span
                    className={
                      entry.runningBalanceCDF >= 0
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--error)]"
                    }
                  >
                    {formatCurrency(Math.abs(entry.runningBalanceCDF), "CDF")}
                    {entry.runningBalanceCDF < 0 && " DR"}
                  </span>
                </td>

                {/* Delete */}
                {showDeleteButton && (
                  <td className="border border-[var(--border-color)] py-2 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(entry.id);
                      }}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded transition-colors"
                      aria-label="Delete transaction"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--income)]"></span>
          <span>Debit = Money In (Income)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--expense)]"></span>
          <span>Credit = Money Out (Expense)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>DR = Deficit (Negative Balance)</span>
        </div>
      </div>
    </div>
  );
}
