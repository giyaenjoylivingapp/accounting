"use client";

import { useState } from "react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransferForm } from "@/components/transactions/TransferForm";
import { TransactionType } from "@/lib/constants";

export function QuickActions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>("expense");

  const openForm = (type: TransactionType) => {
    setFormType(type);
    setIsFormOpen(true);
  };

  const openTransferForm = () => {
    setIsTransferFormOpen(true);
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
        <button
          onClick={openTransferForm}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
          style={{ color: "var(--accent)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Transfer
        </button>
      </div>

      {/* Mobile FAB - Single button that opens a choice, positioned above bottom nav */}
      <div className="sm:hidden fixed bottom-20 right-4 z-50">
        <MobileFAB
          onAddIncome={() => openForm("income")}
          onAddExpense={() => openForm("expense")}
          onAddTransfer={openTransferForm}
        />
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        defaultType={formType}
      />

      {/* Transfer Form Modal */}
      <TransferForm
        isOpen={isTransferFormOpen}
        onClose={() => setIsTransferFormOpen(false)}
      />
    </>
  );
}

// Mobile FAB with expandable options
function MobileFAB({
  onAddIncome,
  onAddExpense,
  onAddTransfer,
}: {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddTransfer: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col items-end gap-3">
      {/* Expanded options - slide up vertically */}
      <div
        className={`
          flex flex-col items-end gap-2 overflow-hidden
          transition-all duration-300 ease-out origin-bottom
          ${isExpanded ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <button
          onClick={() => {
            setIsExpanded(false);
            onAddTransfer();
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 active:scale-95 whitespace-nowrap shadow-lg"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Transfer
        </button>
        <button
          onClick={() => {
            setIsExpanded(false);
            onAddExpense();
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 active:scale-95 whitespace-nowrap shadow-lg"
          style={{ backgroundColor: "var(--expense)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m-8 8l8 8 8-8" />
          </svg>
          Expense
        </button>
        <button
          onClick={() => {
            setIsExpanded(false);
            onAddIncome();
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 active:scale-95 whitespace-nowrap shadow-lg"
          style={{ backgroundColor: "var(--income)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
          </svg>
          Income
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg ${
          isExpanded ? "rotate-45 bg-[var(--bg-tertiary)]" : "bg-[var(--accent)]"
        }`}
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
