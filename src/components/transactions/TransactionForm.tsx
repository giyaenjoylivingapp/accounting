"use client";

import { useState, useEffect } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Tabs";
import {
  Currency,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  TransactionType,
} from "@/lib/constants";
import { getCategoriesByType } from "@/lib/categories";
import { parseCurrencyInput } from "@/lib/currency";
import { TransactionData } from "./TransactionItem";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: TransactionData | null;
  defaultType?: TransactionType;
}

export function TransactionForm({
  isOpen,
  onClose,
  editTransaction,
  defaultType = "expense",
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editTransaction;

  // Reset form when modal opens/closes or editTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setType(editTransaction.type);
        setCurrency(editTransaction.currency);
        setAmount(editTransaction.amount.toString());
        setCategory(editTransaction.category);
        setDescription(editTransaction.description);
        setDate(editTransaction.date.toISOString().split("T")[0]);
        setVendor(editTransaction.vendor || "");
        setPaymentMethod(editTransaction.paymentMethod || "");
        setNotes(editTransaction.notes || "");
      } else {
        setType(defaultType);
        setCurrency("USD");
        setAmount("");
        setCategory("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setVendor("");
        setPaymentMethod("");
        setNotes("");
      }
      setError("");
    }
  }, [isOpen, editTransaction, defaultType]);

  const categories = getCategoriesByType(type).map((c) => ({
    value: c.value,
    label: c.label,
    color: c.color,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountValue = parseCurrencyInput(amount);
    if (amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        type,
        currency,
        amount: amountValue,
        category,
        description: description.trim(),
        date: new Date(date),
        vendor: vendor.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
      };

      if (isEditing && editTransaction) {
        // Update existing transaction
        await db.transact(
          db.tx.transactions[editTransaction.id].update(transactionData)
        );
      } else {
        // Create new transaction
        await db.transact(db.tx.transactions[id()].update(transactionData));
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Transaction" : "Add Transaction"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle */}
        <Toggle
          options={[
            { value: TRANSACTION_TYPES.INCOME, label: "Income", color: "var(--income)" },
            { value: TRANSACTION_TYPES.EXPENSE, label: "Expense", color: "var(--expense)" },
          ]}
          value={type}
          onChange={(v) => {
            setType(v as TransactionType);
            setCategory(""); // Reset category when type changes
          }}
        />

        {/* Desktop: Two column layout for currency and amount */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Currency Toggle */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Currency
            </label>
            <Toggle
              options={[
                { value: CURRENCIES.USD, label: "USD ($)" },
                { value: CURRENCIES.CDF, label: "CDF (FC)" },
              ]}
              value={currency}
              onChange={(v) => setCurrency(v as Currency)}
            />
          </div>

          {/* Amount */}
          <Input
            type="text"
            label="Amount"
            placeholder={currency === "USD" ? "0.00" : "0"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={
              <span className="text-[var(--text-muted)]">
                {currency === "USD" ? "$" : ""}
              </span>
            }
            rightIcon={
              currency === "CDF" ? (
                <span className="text-[var(--text-muted)]">FC</span>
              ) : undefined
            }
            inputMode="decimal"
            required
            autoFocus
          />
        </div>

        {/* Desktop: Two column layout for category and date */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category */}
          <Select
            label="Category"
            options={categories}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Select a category"
            required
          />

          {/* Date */}
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Description - Full width */}
        <Input
          type="text"
          label="Description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Optional fields */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1">
            <span className="group-open:hidden">+ Add more details</span>
            <span className="hidden group-open:inline">- Hide details</span>
          </summary>
          <div className="space-y-4 mt-4 pt-4 border-t border-[var(--border-color)]">
            {/* Desktop: Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Vendor / Paid To"
                placeholder="Who was paid or who paid you?"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />

              <Select
                label="Payment Method"
                options={PAYMENT_METHODS.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="How was this paid?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors hover:border-[var(--border-light)] focus:border-[var(--accent)] focus:outline-none resize-none"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </details>

        {/* Error */}
        {error && (
          <p className="text-sm text-[var(--error)] text-center">{error}</p>
        )}

        {/* Actions - Desktop: aligned to right */}
        <div className="flex flex-col-reverse lg:flex-row gap-3 pt-2 lg:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} className="lg:w-auto lg:px-6">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="lg:w-auto lg:px-8">
            {isEditing ? "Save Changes" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
