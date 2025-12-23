"use client";

import { useState, useEffect, useMemo } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Tabs";
import { Currency, CURRENCIES, TRANSACTION_TYPES } from "@/lib/constants";
import { parseCurrencyInput, formatCurrency } from "@/lib/currency";
import { TransactionData } from "./TransactionItem";

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: TransactionData | null;
}

export function TransferForm({
  isOpen,
  onClose,
  editTransaction,
}: TransferFormProps) {
  const [fromCurrency, setFromCurrency] = useState<Currency>("CDF");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editTransaction;

  // Destination currency is the opposite of source
  const toCurrency: Currency = fromCurrency === "USD" ? "CDF" : "USD";

  // Calculate destination amount dynamically
  // Rate is always "1 USD = X CDF" (e.g., 2300)
  // CDF to USD: divide by rate
  // USD to CDF: multiply by rate
  const toAmount = useMemo(() => {
    const sourceAmount = parseCurrencyInput(amount);
    const rate = parseFloat(exchangeRate);
    if (isNaN(sourceAmount) || isNaN(rate) || sourceAmount <= 0 || rate <= 0) {
      return 0;
    }
    if (fromCurrency === "CDF") {
      // Converting CDF to USD: divide by rate
      return sourceAmount / rate;
    } else {
      // Converting USD to CDF: multiply by rate
      return sourceAmount * rate;
    }
  }, [amount, exchangeRate, fromCurrency]);

  // Reset form when modal opens/closes or editTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (editTransaction && editTransaction.type === "transfer") {
        setFromCurrency(editTransaction.currency);
        setAmount(editTransaction.amount.toString());
        setExchangeRate(editTransaction.exchangeRate?.toString() || "");
        setDescription(editTransaction.description);
        setDate(editTransaction.date.toISOString().split("T")[0]);
        setNotes(editTransaction.notes || "");
      } else {
        setFromCurrency("CDF");
        setAmount("");
        setExchangeRate("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setNotes("");
      }
      setError("");
    }
  }, [isOpen, editTransaction]);

  // Handle Enter key to submit form (except in textarea)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target instanceof HTMLElement) {
      if (e.target.tagName === "TEXTAREA") {
        return;
      }
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

    const rateValue = parseFloat(exchangeRate);
    if (isNaN(rateValue) || rateValue <= 0) {
      setError("Please enter a valid exchange rate");
      return;
    }

    // Calculate destination amount based on direction
    // Rate is always "1 USD = X CDF"
    const calculatedToAmount = fromCurrency === "CDF"
      ? amountValue / rateValue  // CDF to USD: divide
      : amountValue * rateValue; // USD to CDF: multiply

    if (calculatedToAmount <= 0 || !isFinite(calculatedToAmount)) {
      setError("Calculated amount is invalid");
      return;
    }

    setLoading(true);
    try {
      // Parse date as local time
      const [year, month, day] = date.split("-").map(Number);
      const now = new Date();
      const transactionDate = new Date(year, month - 1, day);

      const todayStr = now.toISOString().split("T")[0];
      if (date === todayStr) {
        transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      } else {
        transactionDate.setHours(12, 0, 0);
      }

      const transactionData = {
        type: TRANSACTION_TYPES.TRANSFER,
        currency: fromCurrency,
        amount: amountValue,
        toCurrency: toCurrency,
        toAmount: calculatedToAmount,
        exchangeRate: rateValue,
        category: "currency_exchange",
        description: description.trim() || `Currency Exchange: ${fromCurrency} to ${toCurrency}`,
        date: transactionDate,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
      };

      if (isEditing && editTransaction) {
        await db.transact(
          db.tx.transactions[editTransaction.id].update(transactionData)
        );
      } else {
        await db.transact(db.tx.transactions[id()].update(transactionData));
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transfer");
    } finally {
      setLoading(false);
    }
  };

  // Rate hint - always in terms of 1 USD = X CDF
  const rateHint = "1 USD = ? CDF";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Transfer" : "Currency Transfer"}
      size="lg"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
        {/* Direction indicator */}
        <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-lg bg-[var(--bg-tertiary)]">
          <span className="font-medium text-[var(--text-primary)]">
            {fromCurrency === "USD" ? "US Dollar" : "Congolese Franc"}
          </span>
          <svg
            className="w-5 h-5 text-[var(--accent)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          <span className="font-medium text-[var(--text-primary)]">
            {toCurrency === "USD" ? "US Dollar" : "Congolese Franc"}
          </span>
        </div>

        {/* From Currency Toggle */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Converting from:
          </label>
          <div className="lg:hidden">
            <Toggle
              options={[
                { value: CURRENCIES.CDF, label: "FC" },
                { value: CURRENCIES.USD, label: "$" },
              ]}
              value={fromCurrency}
              onChange={(v) => setFromCurrency(v as Currency)}
            />
          </div>
          <div className="hidden lg:block">
            <Toggle
              options={[
                { value: CURRENCIES.CDF, label: "CDF (FC)" },
                { value: CURRENCIES.USD, label: "USD ($)" },
              ]}
              value={fromCurrency}
              onChange={(v) => setFromCurrency(v as Currency)}
            />
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Amount to convert"
          type="text"
          placeholder={fromCurrency === "USD" ? "0.00" : "0"}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leftIcon={
            <span className="text-[var(--text-muted)]">
              {fromCurrency === "USD" ? "$" : "FC"}
            </span>
          }
          inputMode="decimal"
          required
          autoFocus
        />

        {/* Exchange Rate - always expressed as 1 USD = X CDF */}
        <Input
          label={`Exchange Rate (${rateHint})`}
          type="text"
          placeholder="e.g. 2850"
          value={exchangeRate}
          onChange={(e) => setExchangeRate(e.target.value)}
          leftIcon={
            <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
              1 $ =
            </span>
          }
          rightIcon={
            <span className="text-[var(--text-muted)]">
              FC
            </span>
          }
          inputMode="decimal"
          required
          className="!pl-14"
        />

        {/* Calculated Result */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)] mb-1">You will receive:</p>
          <p className="text-2xl font-semibold text-[var(--income)]">
            {toAmount > 0 ? formatCurrency(toAmount, toCurrency) : "—"}
          </p>
        </div>

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Description (optional) */}
        <Input
          label="Description (optional)"
          type="text"
          placeholder="e.g. Exchange for supplier payment"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Notes (optional) */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1">
            <span className="group-open:hidden">+ Add notes</span>
            <span className="hidden group-open:inline">- Hide notes</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
            <textarea
              className="w-full px-3 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors hover:border-[var(--border-light)] focus:border-[var(--accent)] focus:outline-none resize-none"
              placeholder="Additional notes..."
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

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEditing ? "Save" : "Transfer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
