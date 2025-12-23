"use client";

import { formatCurrency } from "@/lib/currency";
import { Currency } from "@/lib/constants";
import { getCategoryByValue } from "@/lib/categories";
import { CategoryBadge } from "./CategoryBadge";

export interface TransactionData {
  id: string;
  type: "income" | "expense" | "transfer";
  description: string;
  amount: number;
  currency: Currency;
  category: string;
  date: Date;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
  // Transfer-specific fields
  toCurrency?: Currency;
  toAmount?: number;
  exchangeRate?: number;
}

interface TransactionItemProps {
  transaction: TransactionData;
  onClick?: () => void;
  onDelete?: () => void;
}

export function TransactionItem({
  transaction,
  onClick,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const isTransfer = transaction.type === "transfer";
  const amountColor = isTransfer ? "var(--accent)" : isIncome ? "var(--income)" : "var(--expense)";
  const prefix = isTransfer ? "" : isIncome ? "+" : "-";

  // Get category info for watermark
  const categoryInfo = getCategoryByValue(transaction.category);
  const categoryLabel = categoryInfo?.label || transaction.category;
  const categoryColor = isTransfer ? "var(--accent)" : categoryInfo?.color || "var(--text-muted)";

  const formatDate = (date: Date) => {
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
  };

  return (
    <div
      className={`
        relative overflow-hidden
        flex items-center gap-3 p-3 rounded-lg
        bg-[var(--bg-secondary)] border border-[var(--border-color)]
        hover:bg-[var(--bg-tertiary)] transition-colors
        ${onClick ? "cursor-pointer" : ""}
      `}
      onClick={onClick}
    >
      {/* Category Watermark - visible on large screens only */}
      <div
        className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="text-[3rem] font-black uppercase tracking-wider"
          style={{
            color: categoryColor,
            opacity: 0.08,
            whiteSpace: "nowrap",
          }}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10"
        style={{
          backgroundColor: isTransfer
            ? "rgba(45, 212, 191, 0.1)"
            : isIncome
            ? "var(--income-bg)"
            : "var(--expense-bg)",
        }}
      >
        {isTransfer ? (
          <svg
            className="w-5 h-5"
            style={{ color: "var(--accent)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        ) : isIncome ? (
          <svg
            className="w-5 h-5"
            style={{ color: "var(--income)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8l-8-8-8 8"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            style={{ color: "var(--expense)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 20V4m-8 8l8 8 8-8"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-[var(--text-primary)] truncate">
            {transaction.description}
          </p>
          {/* Category Badge - visible on mobile only */}
          <span className="lg:hidden">
            <CategoryBadge category={transaction.category} />
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>{formatDate(transaction.date)}</span>
          {transaction.vendor && (
            <>
              <span>•</span>
              <span className="truncate">{transaction.vendor}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0 relative z-10">
        {isTransfer && transaction.toCurrency && transaction.toAmount ? (
          <>
            <p className="text-sm" style={{ color: "var(--expense)" }}>
              -{formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <p className="font-semibold" style={{ color: "var(--income)" }}>
              +{formatCurrency(transaction.toAmount, transaction.toCurrency)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Rate: {transaction.exchangeRate?.toLocaleString()}
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold" style={{ color: amountColor }}>
              {prefix}
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {transaction.currency}
            </p>
          </>
        )}
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors relative z-10"
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
      )}
    </div>
  );
}

// Empty state component
export function EmptyTransactions() {
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
