"use client";

import { useState } from "react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionType } from "@/lib/constants";

export function QuickActions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>("expense");

  const openForm = (type: TransactionType) => {
    setFormType(type);
    setIsFormOpen(true);
  };

  return (
    <>
      {/* Desktop buttons - Subtle with soft hover */}
      <div className="hidden sm:flex items-center gap-3">
        <button
          onClick={() => openForm("income")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
          style={{ color: "var(--income)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Income
        </button>
        <button
          onClick={() => openForm("expense")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
          style={{ color: "var(--expense)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Expense
        </button>
      </div>

      {/* Mobile FAB - Single button that opens a choice, positioned above bottom nav */}
      <div className="sm:hidden fixed bottom-20 right-4 z-50">
        <MobileFAB onAddIncome={() => openForm("income")} onAddExpense={() => openForm("expense")} />
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        defaultType={formType}
      />
    </>
  );
}

// Mobile FAB with expandable options
function MobileFAB({
  onAddIncome,
  onAddExpense,
}: {
  onAddIncome: () => void;
  onAddExpense: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col-reverse items-end gap-3">
      {/* Expanded options */}
      {isExpanded && (
        <>
          <button
            onClick={() => {
              setIsExpanded(false);
              onAddIncome();
            }}
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg text-sm font-medium text-white transition-transform"
            style={{ backgroundColor: "var(--income)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
            </svg>
            Income
          </button>
          <button
            onClick={() => {
              setIsExpanded(false);
              onAddExpense();
            }}
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg text-sm font-medium text-white transition-transform"
            style={{ backgroundColor: "var(--expense)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m-8 8l8 8 8-8" />
            </svg>
            Expense
          </button>
        </>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isExpanded ? "rotate-45 bg-[var(--bg-tertiary)]" : "bg-[var(--accent)]"
        }`}
        aria-label={isExpanded ? "Close" : "Add transaction"}
      >
        <svg
          className={`w-5 h-5 ${isExpanded ? "text-[var(--text-primary)]" : "text-white"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
