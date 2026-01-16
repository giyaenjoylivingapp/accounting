"use client";

import { formatCurrency } from "@/lib/currency";
import { getCategoryByValue } from "@/lib/categories";
import { TransactionData } from "./TransactionItem";

interface TransactionTableProps {
  transactions: TransactionData[];
  onRowClick?: (transaction: TransactionData) => void;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

export function TransactionTable({
  transactions,
  onRowClick,
  onDelete,
  showDeleteButton = true,
}: TransactionTableProps) {
  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  };

  const formatTime = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Date
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Description
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Category
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Vendor
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Type
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Amount
            </th>
            {showDeleteButton && (
              <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider w-16">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "income";
            const isTransfer = transaction.type === "transfer";
            const categoryInfo = getCategoryByValue(transaction.category);

            return (
              <tr
                key={transaction.id}
                onClick={() => onRowClick?.(transaction)}
                className={`
                  hover:bg-[var(--bg-tertiary)] transition-colors
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {/* Date */}
                <td className="py-3 px-4">
                  <div className="text-sm text-[var(--text-primary)]">
                    {formatDate(transaction.date)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {formatTime(transaction.date)}
                  </div>
                </td>

                {/* Description */}
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-[var(--text-primary)] max-w-xs truncate">
                    {transaction.description}
                  </div>
                  {transaction.notes && (
                    <div className="text-xs text-[var(--text-muted)] truncate max-w-xs">
                      {transaction.notes}
                    </div>
                  )}
                </td>

                {/* Category */}
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: isTransfer
                        ? "rgba(45, 212, 191, 0.1)"
                        : categoryInfo?.color
                        ? `${categoryInfo.color}15`
                        : "var(--bg-tertiary)",
                      color: isTransfer
                        ? "var(--accent)"
                        : categoryInfo?.color || "var(--text-secondary)",
                    }}
                  >
                    {isTransfer ? "Transfer" : categoryInfo?.label || transaction.category}
                  </span>
                </td>

                {/* Vendor */}
                <td className="py-3 px-4">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {transaction.vendor || "—"}
                  </span>
                </td>

                {/* Type */}
                <td className="py-3 px-4">
                  <span
                    className={`
                      inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                      ${
                        isTransfer
                          ? "bg-[rgba(45,212,191,0.1)] text-[var(--accent)]"
                          : isIncome
                          ? "bg-[var(--income-bg)] text-[var(--income)]"
                          : "bg-[var(--expense-bg)] text-[var(--expense)]"
                      }
                    `}
                  >
                    {isTransfer ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    ) : isIncome ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {isTransfer ? "Transfer" : isIncome ? "Income" : "Expense"}
                  </span>
                </td>

                {/* Amount */}
                <td className="py-3 px-4 text-right">
                  {isTransfer && transaction.toCurrency && transaction.toAmount ? (
                    <div>
                      <div className="text-sm" style={{ color: "var(--expense)" }}>
                        -{formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <div className="text-sm font-semibold" style={{ color: "var(--income)" }}>
                        +{formatCurrency(transaction.toAmount, transaction.toCurrency)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{
                          color: isIncome ? "var(--income)" : "var(--expense)",
                        }}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {transaction.currency}
                      </div>
                    </div>
                  )}
                </td>

                {/* Actions */}
                {showDeleteButton && (
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(transaction.id);
                      }}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded-lg transition-colors"
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
    </div>
  );
}
