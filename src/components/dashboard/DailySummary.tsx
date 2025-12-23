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

  // Check if there are any transfers
  const hasTransfers =
    (summary.transferOutUSD || 0) > 0 ||
    (summary.transferInUSD || 0) > 0 ||
    (summary.transferOutCDF || 0) > 0 ||
    (summary.transferInCDF || 0) > 0;

  return (
    <Card variant="bordered" padding="none">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-[var(--border-color)]">
        <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">
          {isToday ? "Today's Summary" : "Daily Summary"}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {formatDate(summary.date)}
        </p>
      </div>

      {/* Content - Responsive Grid */}
      <div className="p-4 lg:p-6">
        <div className={`grid grid-cols-1 gap-4 lg:gap-6 ${hasTransfers ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
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

          {/* Transfers - Only shown if there are transfers */}
          {hasTransfers && (
            <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(45, 212, 191, 0.1)" }}>
              <p className="text-sm mb-3 flex items-center gap-2" style={{ color: "var(--accent)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfers
              </p>
              <div className="space-y-1 text-sm">
                {((summary.transferOutUSD || 0) > 0 || (summary.transferInUSD || 0) > 0) && (
                  <p className="text-[var(--text-primary)]">
                    <span style={{ color: "var(--expense)" }}>-{formatCurrency(summary.transferOutUSD || 0, "USD")}</span>
                    {" / "}
                    <span style={{ color: "var(--income)" }}>+{formatCurrency(summary.transferInUSD || 0, "USD")}</span>
                  </p>
                )}
                {((summary.transferOutCDF || 0) > 0 || (summary.transferInCDF || 0) > 0) && (
                  <p className="text-[var(--text-secondary)]">
                    <span style={{ color: "var(--expense)" }}>-{formatCurrency(summary.transferOutCDF || 0, "CDF")}</span>
                    {" / "}
                    <span style={{ color: "var(--income)" }}>+{formatCurrency(summary.transferInCDF || 0, "CDF")}</span>
                  </p>
                )}
              </div>
            </div>
          )}

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
