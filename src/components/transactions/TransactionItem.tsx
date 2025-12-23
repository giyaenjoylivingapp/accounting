"use client";

import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency } from "@/lib/currency";
import { Currency } from "@/lib/constants";

export interface TransactionData {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  currency: Currency;
  category: string;
  date: Date;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
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
  const amountColor = isIncome ? "var(--income)" : "var(--expense)";
  const prefix = isIncome ? "+" : "-";

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg
        bg-[var(--bg-secondary)] border border-[var(--border-color)]
        hover:bg-[var(--bg-tertiary)] transition-colors
        ${onClick ? "cursor-pointer" : ""}
      `}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: isIncome ? "var(--income-bg)" : "var(--expense-bg)",
        }}
      >
        {isIncome ? (
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-[var(--text-primary)] truncate">
            {transaction.description}
          </p>
          <CategoryBadge category={transaction.category} />
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
      <div className="text-right shrink-0">
        <p className="font-semibold" style={{ color: amountColor }}>
          {prefix}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {transaction.currency}
        </p>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
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
