"use client";

import { useState, useEffect } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { DatePicker } from "@/components/ui/DatePicker";
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

  // Handle Enter key to submit form (except in textarea)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target instanceof HTMLElement) {
      // Don't submit if in textarea (allow newlines)
      if (e.target.tagName === "TEXTAREA") {
        return;
      }
      // Don't submit if in select (allow selection)
      if (e.target.tagName === "SELECT") {
        return;
      }
      // Submit the form
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  };

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
      // Parse date as local time (not UTC) and add current time for today's transactions
      const [year, month, day] = date.split("-").map(Number);
      const now = new Date();
      const transactionDate = new Date(year, month - 1, day);

      // If the date is today, use the current time; otherwise use noon
      const todayStr = now.toISOString().split("T")[0];
      if (date === todayStr) {
        transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      } else {
        transactionDate.setHours(12, 0, 0); // Use noon for past/future dates
      }

      const transactionData = {
        type,
        currency,
        amount: amountValue,
        category,
        description: description.trim(),
        date: transactionDate,
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
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
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

        {/* Currency and Amount row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Currency Toggle - Short labels on mobile, full on desktop */}
          <div className="lg:hidden">
            <Toggle
              options={[
                { value: CURRENCIES.USD, label: "$" },
                { value: CURRENCIES.CDF, label: "FC" },
              ]}
              value={currency}
              onChange={(v) => setCurrency(v as Currency)}
            />
          </div>
          <div className="hidden lg:block">
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
            placeholder={currency === "USD" ? "Amount" : "Amount"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={
              <span className="text-[var(--text-muted)]">
                {currency === "USD" ? "$" : "FC"}
              </span>
            }
            inputMode="decimal"
            required
            autoFocus
          />
        </div>

        {/* Category and Date row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Category */}
          <Dropdown
            options={categories}
            value={category}
            onChange={setCategory}
            placeholder="Category"
            required
          />

          {/* Date */}
          <DatePicker
            value={date}
            onChange={setDate}
          />
        </div>

        {/* Description - Full width */}
        <Input
          type="text"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Optional fields */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1">
            <span className="group-open:hidden">+ More details</span>
            <span className="hidden group-open:inline">- Hide details</span>
          </summary>
          <div className="space-y-3 mt-3 pt-3 border-t border-[var(--border-color)]">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="Vendor / Paid to"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />

              <Dropdown
                options={PAYMENT_METHODS.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Payment method"
              />
            </div>

            <textarea
              className="w-full px-3 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors hover:border-[var(--border-light)] focus:border-[var(--accent)] focus:outline-none resize-none"
              placeholder="Notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </details>

        {/* Error */}
        {error && (
          <p className="text-sm text-[var(--error)] text-center">{error}</p>
        )}

        {/* Actions - Same row on all screens */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEditing ? "Save" : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
