"use client";

import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { APP_NAME, SETTINGS_KEYS } from "@/lib/constants";
import { formatCurrency, parseCurrencyInput } from "@/lib/currency";

export function InitialSetup() {
  const [balanceUSD, setBalanceUSD] = useState("");
  const [balanceCDF, setBalanceCDF] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const usdValue = parseCurrencyInput(balanceUSD);
    const cdfValue = parseCurrencyInput(balanceCDF);

    if (usdValue < 0 || cdfValue < 0) {
      setError("Balances cannot be negative");
      return;
    }

    setLoading(true);
    try {
      // Save initial balances to settings
      await db.transact([
        db.tx.settings[id()].update({
          key: SETTINGS_KEYS.INITIAL_BALANCE_USD,
          value: usdValue.toString(),
          updatedAt: new Date(),
        }),
        db.tx.settings[id()].update({
          key: SETTINGS_KEYS.INITIAL_BALANCE_CDF,
          value: cdfValue.toString(),
          updatedAt: new Date(),
        }),
        db.tx.settings[id()].update({
          key: SETTINGS_KEYS.SETUP_COMPLETE,
          value: "true",
          updatedAt: new Date(),
        }),
      ]);
      // The parent component will detect setup is complete and show the dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <Card variant="bordered" padding="lg" className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--success)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome to {APP_NAME}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Let&apos;s set up your opening balances to get started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="text"
              label="Opening Balance (USD)"
              placeholder="0.00"
              value={balanceUSD}
              onChange={(e) => setBalanceUSD(e.target.value)}
              leftIcon={<span className="text-[var(--text-muted)]">$</span>}
              helperText="Enter your current cash balance in US Dollars"
              inputMode="decimal"
            />

            <Input
              type="text"
              label="Opening Balance (CDF)"
              placeholder="0"
              value={balanceCDF}
              onChange={(e) => setBalanceCDF(e.target.value)}
              rightIcon={<span className="text-[var(--text-muted)]">FC</span>}
              helperText="Enter your current cash balance in Congolese Francs"
              inputMode="numeric"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--error)] text-center">{error}</p>
          )}

          {/* Preview */}
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Opening Balances:
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-primary)] font-medium">
                {formatCurrency(parseCurrencyInput(balanceUSD) || 0, "USD")}
              </span>
              <span className="text-[var(--text-primary)] font-medium">
                {formatCurrency(parseCurrencyInput(balanceCDF) || 0, "CDF")}
              </span>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Start Using {APP_NAME}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-xs text-[var(--text-muted)] text-center mt-6">
          You can start with zero balances if you prefer. Add income
          transactions to build up your cash.
        </p>
      </Card>
    </div>
  );
}
