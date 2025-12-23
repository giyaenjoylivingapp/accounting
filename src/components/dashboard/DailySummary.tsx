"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";
import { DailySummary as DailySummaryType } from "@/lib/balance";

interface DailySummaryProps {
  summary: DailySummaryType;
}

export function DailySummary({ summary }: DailySummaryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const isToday = summary.date === new Date().toISOString().split("T")[0];

  return (
    <Card variant="bordered" padding="none">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">
              {isToday ? "Today's Summary" : "Daily Summary"}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {formatDate(summary.date)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] bg-opacity-20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[var(--accent)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content - Responsive Grid */}
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Opening Balance */}
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
            <p className="text-sm text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Opening Balance
            </p>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {formatCurrency(summary.openingUSD, "USD")}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {formatCurrency(summary.openingCDF, "CDF")}
              </p>
            </div>
          </div>

          {/* Income */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--income-bg)" }}>
            <p className="text-sm mb-3 flex items-center gap-2" style={{ color: "var(--income)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
              </svg>
              Income
            </p>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                +{formatCurrency(summary.incomeUSD, "USD")}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                +{formatCurrency(summary.incomeCDF, "CDF")}
              </p>
            </div>
          </div>

          {/* Expenses */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--expense-bg)" }}>
            <p className="text-sm mb-3 flex items-center gap-2" style={{ color: "var(--expense)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m-8 8l8 8 8-8" />
              </svg>
              Expenses
            </p>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                -{formatCurrency(summary.expenseUSD, "USD")}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                -{formatCurrency(summary.expenseCDF, "CDF")}
              </p>
            </div>
          </div>

          {/* Closing Balance */}
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl border-2 border-[var(--border-light)]">
            <p className="text-sm text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isToday ? "Current" : "Closing"}
            </p>
            <div className="space-y-1">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {formatCurrency(summary.closingUSD, "USD")}
              </p>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {formatCurrency(summary.closingCDF, "CDF")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
