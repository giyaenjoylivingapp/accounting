"use client";

import { useState, useMemo } from "react";
import { db } from "@/lib/db";
import { TransactionItem, TransactionData, EmptyTransactions } from "./TransactionItem";
import { TransactionForm } from "./TransactionForm";
import { TransferForm } from "./TransferForm";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ALL_CATEGORIES } from "@/lib/categories";

type TimeFilter = "all" | "this-week" | "this-month" | "last-month" | "custom";

interface TransactionListProps {
  transactions: TransactionData[];
  showFilters?: boolean;
  showDeleteButton?: boolean;
  maxItems?: number;
  showPagination?: boolean;
}

// Helper functions for date filtering
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function TransactionList({
  transactions,
  showFilters = true,
  showDeleteButton = true,
  maxItems,
  showPagination = true,
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currencyFilter, setCurrencyFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Type filter
    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Currency filter
    if (currencyFilter) {
      result = result.filter((t) => t.currency === currencyFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.vendor?.toLowerCase().includes(query)
      );
    }

    // Time filter
    const now = new Date();
    if (timeFilter === "this-week") {
      const startOfWeek = getStartOfWeek(now);
      result = result.filter((t) => new Date(t.date) >= startOfWeek);
    } else if (timeFilter === "this-month") {
      const startOfMonth = getStartOfMonth(now);
      result = result.filter((t) => new Date(t.date) >= startOfMonth);
    } else if (timeFilter === "last-month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfLastMonth = getStartOfMonth(lastMonth);
      const endOfLastMonth = getEndOfMonth(lastMonth);
      result = result.filter((t) => {
        const txDate = new Date(t.date);
        return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
      });
    } else if (timeFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => {
        const txDate = new Date(t.date);
        return txDate >= start && txDate <= end;
      });
    }

    // Sort by date (newest first)
    result = [...result].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return result;
  }, [transactions, typeFilter, categoryFilter, currencyFilter, searchQuery, timeFilter, customStartDate, customEndDate]);

  // Apply max items limit (used for dashboard widget)
  const limitedTransactions = maxItems
    ? filteredTransactions.slice(0, maxItems)
    : filteredTransactions;

  // Pagination calculations
  const totalPages = Math.ceil(limitedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = showPagination && !maxItems
    ? limitedTransactions.slice(startIndex, endIndex)
    : limitedTransactions;

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1);

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
    setTimeFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    resetPagination();
  };

  const hasActiveFilters =
    typeFilter || categoryFilter || currencyFilter || searchQuery || timeFilter !== "all";

  const timeFilterOptions = [
    { value: "all", label: "All time" },
    { value: "this-week", label: "This week" },
    { value: "this-month", label: "This month" },
    { value: "last-month", label: "Last month" },
    { value: "custom", label: "Custom range" },
  ];

  const itemsPerPageOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div className="mb-4 space-y-3">
          {/* Search - full width */}
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPagination();
            }}
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

          {/* Filter row - responsive grid */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 lg:gap-3">
            <Dropdown
              options={timeFilterOptions}
              value={timeFilter}
              onChange={(val) => {
                setTimeFilter(val as TimeFilter);
                resetPagination();
              }}
              placeholder="All time"
            />

            <Dropdown
              options={[
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
                { value: "transfer", label: "Transfer" },
              ]}
              value={typeFilter}
              onChange={(val) => {
                setTypeFilter(val);
                resetPagination();
              }}
              placeholder="All types"
            />

            <Dropdown
              options={ALL_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                resetPagination();
              }}
              placeholder="All categories"
            />

            <Dropdown
              options={[
                { value: "USD", label: "USD" },
                { value: "CDF", label: "CDF" },
              ]}
              value={currencyFilter}
              onChange={(val) => {
                setCurrencyFilter(val);
                resetPagination();
              }}
              placeholder="All currencies"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="col-span-2 lg:col-span-1"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Custom date range inputs */}
          {timeFilter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  From
                </label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    resetPagination();
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  To
                </label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    resetPagination();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction list */}
      {paginatedTransactions.length === 0 ? (
        <EmptyTransactions />
      ) : (
        <div className="space-y-2">
          {paginatedTransactions.map((transaction) => (
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

      {/* Pagination */}
      {showFilters && showPagination && !maxItems && limitedTransactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3">
          {/* Pagination controls - centered on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Items per page selector - hidden on mobile */}
            <div className="hidden sm:block w-[140px]">
              <Dropdown
                options={itemsPerPageOptions}
                value={itemsPerPage.toString()}
                onChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

              <span className="px-3 py-1 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                {currentPage} / {totalPages || 1}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Results info */}
          <p className="text-sm text-[var(--text-muted)] text-center sm:text-left">
            Showing {startIndex + 1}-{Math.min(endIndex, limitedTransactions.length)} of{" "}
            {limitedTransactions.length} transactions
            {hasActiveFilters && ` (filtered from ${transactions.length})`}
          </p>
        </div>
      )}

      {/* Results count for filtered without pagination */}
      {showFilters && !showPagination && hasActiveFilters && (
        <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </p>
      )}

      {/* Edit modal - use appropriate form based on transaction type */}
      {editingTransaction?.type === "transfer" ? (
        <TransferForm
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          editTransaction={editingTransaction}
        />
      ) : (
        <TransactionForm
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          editTransaction={editingTransaction}
        />
      )}

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
