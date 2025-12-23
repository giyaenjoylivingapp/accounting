"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { TransactionItem, TransactionData, EmptyTransactions } from "./TransactionItem";
import { TransactionForm } from "./TransactionForm";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ALL_CATEGORIES } from "@/lib/categories";
import { Currency } from "@/lib/constants";

interface TransactionListProps {
  transactions: TransactionData[];
  showFilters?: boolean;
  showDeleteButton?: boolean;
  maxItems?: number;
}

export function TransactionList({
  transactions,
  showFilters = true,
  showDeleteButton = true,
  maxItems,
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currencyFilter, setCurrencyFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters
  let filteredTransactions = transactions;

  if (typeFilter) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.type === typeFilter
    );
  }

  if (categoryFilter) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.category === categoryFilter
    );
  }

  if (currencyFilter) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.currency === currencyFilter
    );
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTransactions = filteredTransactions.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.vendor?.toLowerCase().includes(query)
    );
  }

  // Sort by date (newest first)
  filteredTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply max items limit
  if (maxItems) {
    filteredTransactions = filteredTransactions.slice(0, maxItems);
  }

  const handleDeleteClick = (id: string) => {
    setDeletingTransactionId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransactionId) return;

    setIsDeleting(true);
    try {
      await db.transact(db.tx.transactions[deletingTransactionId].delete());
      setDeletingTransactionId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingTransactionId(null);
  };

  const clearFilters = () => {
    setTypeFilter("");
    setCategoryFilter("");
    setCurrencyFilter("");
    setSearchQuery("");
  };

  const hasActiveFilters =
    typeFilter || categoryFilter || currencyFilter || searchQuery;

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div className="mb-4 space-y-3">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />

          {/* Filter row */}
          <div className="flex flex-wrap gap-2">
            <Select
              options={[
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              placeholder="All types"
              className="min-w-[120px]"
            />

            <Select
              options={ALL_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="All categories"
              className="min-w-[140px]"
            />

            <Select
              options={[
                { value: "USD", label: "USD" },
                { value: "CDF", label: "CDF" },
              ]}
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              placeholder="All currencies"
              className="min-w-[130px]"
            />

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Transaction list */}
      {filteredTransactions.length === 0 ? (
        <EmptyTransactions />
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onClick={() => setEditingTransaction(transaction)}
              onDelete={
                showDeleteButton ? () => handleDeleteClick(transaction.id) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {showFilters && hasActiveFilters && (
        <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </p>
      )}

      {/* Edit modal */}
      <TransactionForm
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        editTransaction={editingTransaction}
      />

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={!!deletingTransactionId}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
