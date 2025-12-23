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
    <div className="flex items-center gap-3">
      {/* Expanded options - slide in from right */}
      <div
        className={`
          flex items-center gap-2 overflow-hidden
          transition-all duration-300 ease-out
          ${isExpanded ? "max-w-[280px] opacity-100" : "max-w-0 opacity-0"}
        `}
      >
        <button
          onClick={() => {
            setIsExpanded(false);
            onAddIncome();
          }}
          className="flex items-center justify-center gap-2 w-[120px] py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 active:scale-95 active:translate-y-0.5"
          style={{
            backgroundColor: "var(--income)",
            boxShadow: "0 4px 14px -2px rgba(34, 197, 94, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
          }}
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
          className="flex items-center justify-center gap-2 w-[120px] py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 active:scale-95 active:translate-y-0.5"
          style={{
            backgroundColor: "var(--expense)",
            boxShadow: "0 4px 14px -2px rgba(239, 68, 68, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m-8 8l8 8 8-8" />
          </svg>
          Expense
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
          isExpanded ? "rotate-45" : ""
        }`}
        style={{
          backgroundColor: isExpanded ? "var(--bg-tertiary)" : "var(--accent)",
          boxShadow: isExpanded
            ? "0 2px 8px rgba(0, 0, 0, 0.15)"
            : "0 6px 20px -4px rgba(99, 102, 241, 0.6), 0 3px 6px -2px rgba(0, 0, 0, 0.2)",
        }}
        aria-label={isExpanded ? "Close" : "Add transaction"}
      >
        <svg
          className={`w-6 h-6 transition-colors duration-200 ${isExpanded ? "text-[var(--text-primary)]" : "text-white"}`}
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
