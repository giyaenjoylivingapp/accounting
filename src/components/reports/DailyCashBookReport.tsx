"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TransactionData } from "@/components/transactions/TransactionItem";
import { formatCurrency } from "@/lib/currency";
import { calculateDailySummary, BalanceSettings } from "@/lib/balance";
import { APP_NAME } from "@/lib/constants";
import { getCategoryLabel } from "@/lib/categories";

interface DailyCashBookReportProps {
  transactions: TransactionData[];
  settings: BalanceSettings;
}

export function DailyCashBookReport({ transactions, settings }: DailyCashBookReportProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Get transactions for selected date
  const selectedDateObj = new Date(selectedDate + "T12:00:00");
  const dayTransactions = transactions
    .filter((t) => {
      const txDate = new Date(t.date).toISOString().split("T")[0];
      return txDate === selectedDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate summary for the selected date
  const summary = calculateDailySummary(
    settings,
    transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      date: t.date,
    })),
    selectedDateObj
  );

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Controls - Hidden when printing */}
      <div className="print:hidden flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1 sm:flex-none">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Select Date
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <Button onClick={handlePrint} className="sm:w-auto">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save PDF
        </Button>
      </div>

      {/* Report Card */}
      <Card variant="bordered" padding="none" className="print:rounded-none print:border-gray-300">
        {/* Report Header */}
        <div className="bg-[var(--bg-tertiary)] p-4 lg:p-6 print:p-4 border-b border-[var(--border-color)] print:bg-white print:border-b-2 print:border-gray-400">
          <div className="text-center">
            <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)] print:text-black print:text-xl">
              {APP_NAME}
            </h1>
            <h2 className="text-base lg:text-lg font-semibold text-[var(--text-secondary)] mt-1 print:text-gray-700 print:text-base">
              Daily Cash Book Report
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 print:text-gray-600 print:text-sm print:font-medium">
              {formatDisplayDate(selectedDate)}
            </p>
          </div>
        </div>

        {/* Opening Balance */}
        <div className="p-4 print:p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] print:bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[var(--text-primary)] print:text-black print:text-sm">
              Opening Balance
            </span>
            <div className="text-right">
              <div className="font-semibold text-[var(--text-primary)] print:text-black print:text-sm">
                {formatCurrency(summary.openingUSD, "USD")}
              </div>
              <div className="text-sm text-[var(--text-secondary)] print:text-gray-600 print:text-xs">
                {formatCurrency(summary.openingCDF, "CDF")}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Transaction List - Card based layout */}
        <div className="lg:hidden print:hidden">
          {dayTransactions.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No transactions for this date
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {dayTransactions.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {tx.description}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {formatTime(tx.date)} • {getCategoryLabel(tx.category)}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <p
                        className="font-semibold"
                        style={{ color: tx.type === "income" ? "var(--income)" : "var(--expense)" }}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                    </div>
                  </div>
                  {tx.vendor && (
                    <p className="text-xs text-[var(--text-muted)]">
                      {tx.vendor}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mobile Totals */}
          <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)]">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Total Income</span>
                <div className="text-right" style={{ color: "var(--income)" }}>
                  <span className="font-medium">{formatCurrency(summary.incomeUSD, "USD")}</span>
                  <span className="text-[var(--text-muted)] ml-2">{formatCurrency(summary.incomeCDF, "CDF")}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Total Expenses</span>
                <div className="text-right" style={{ color: "var(--expense)" }}>
                  <span className="font-medium">{formatCurrency(summary.expenseUSD, "USD")}</span>
                  <span className="text-[var(--text-muted)] ml-2">{formatCurrency(summary.expenseCDF, "CDF")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop/Print Table - Hidden on mobile */}
        <div className="hidden lg:block print:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm print:text-xs">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] print:bg-gray-100">
                  <th className="px-4 py-3 print:px-2 print:py-2 text-left font-semibold text-[var(--text-secondary)] print:text-gray-700">
                    Time
                  </th>
                  <th className="px-4 py-3 print:px-2 print:py-2 text-left font-semibold text-[var(--text-secondary)] print:text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 print:px-2 print:py-2 text-left font-semibold text-[var(--text-secondary)] print:text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 print:px-2 print:py-2 text-right font-semibold text-[var(--income)] print:text-green-700">
                    In $
                  </th>
                  <th className="px-4 py-3 print:px-2 print:py-2 text-right font-semibold text-[var(--expense)] print:text-red-700">
                    Out $
                  </th>
                  <th className="px-4 py-3 print:px-2 print:py-2 text-right font-semibold text-[var(--income)] print:text-green-700">
                    In FC
                  </th>
                  <th className="px-4 py-3 print:px-2 print:py-2 text-right font-semibold text-[var(--expense)] print:text-red-700">
                    Out FC
                  </th>
                </tr>
              </thead>
              <tbody>
                {dayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)] print:text-gray-500">
                      No transactions for this date
                    </td>
                  </tr>
                ) : (
                  dayTransactions.map((tx, index) => (
                    <tr
                      key={tx.id}
                      className={`border-b border-[var(--border-color)] print:border-gray-200 ${
                        index % 2 === 0 ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-secondary)]"
                      } print:bg-white`}
                    >
                      <td className="px-4 py-3 print:px-2 print:py-1.5 text-[var(--text-secondary)] print:text-gray-600 whitespace-nowrap">
                        {formatTime(tx.date)}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-1.5 text-[var(--text-primary)] print:text-black">
                        {tx.description}
                        {tx.vendor && (
                          <span className="text-[var(--text-muted)] print:text-gray-500 ml-1">
                            ({tx.vendor})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-1.5 text-[var(--text-secondary)] print:text-gray-600 whitespace-nowrap">
                        {getCategoryLabel(tx.category)}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-1.5 text-right font-medium text-[var(--income)] print:text-green-700 whitespace-nowrap">
                        {tx.type === "income" && tx.currency === "USD"
                          ? formatCurrency(tx.amount, "USD")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-1.5 text-right font-medium text-[var(--expense)] print:text-red-700 whitespace-nowrap">
                        {tx.type === "expense" && tx.currency === "USD"
                          ? formatCurrency(tx.amount, "USD")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-1.5 text-right font-medium text-[var(--income)] print:text-green-700 whitespace-nowrap">
                        {tx.type === "income" && tx.currency === "CDF"
                          ? formatCurrency(tx.amount, "CDF")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-1.5 text-right font-medium text-[var(--expense)] print:text-red-700 whitespace-nowrap">
                        {tx.type === "expense" && tx.currency === "CDF"
                          ? formatCurrency(tx.amount, "CDF")
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--bg-tertiary)] border-t-2 border-[var(--border-color)] font-semibold print:bg-gray-100">
                  <td colSpan={3} className="px-4 py-3 print:px-2 print:py-2 text-[var(--text-primary)] print:text-black">
                    Day Totals
                  </td>
                  <td className="px-4 py-3 print:px-2 print:py-2 text-right text-[var(--income)] print:text-green-700 whitespace-nowrap">
                    {formatCurrency(summary.incomeUSD, "USD")}
                  </td>
                  <td className="px-4 py-3 print:px-2 print:py-2 text-right text-[var(--expense)] print:text-red-700 whitespace-nowrap">
                    {formatCurrency(summary.expenseUSD, "USD")}
                  </td>
                  <td className="px-4 py-3 print:px-2 print:py-2 text-right text-[var(--income)] print:text-green-700 whitespace-nowrap">
                    {formatCurrency(summary.incomeCDF, "CDF")}
                  </td>
                  <td className="px-4 py-3 print:px-2 print:py-2 text-right text-[var(--expense)] print:text-red-700 whitespace-nowrap">
                    {formatCurrency(summary.expenseCDF, "CDF")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Closing Balance */}
        <div className="p-4 print:p-3 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] print:bg-gray-100 print:border-t-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-base lg:text-lg text-[var(--text-primary)] print:text-black print:text-sm">
              Closing Balance
            </span>
            <div className="text-right">
              <div className="font-bold text-base lg:text-lg text-[var(--text-primary)] print:text-black print:text-sm">
                {formatCurrency(summary.closingUSD, "USD")}
              </div>
              <div className="font-semibold text-sm text-[var(--text-secondary)] print:text-gray-700 print:text-xs">
                {formatCurrency(summary.closingCDF, "CDF")}
              </div>
            </div>
          </div>
        </div>

        {/* Net Change Summary */}
        <div className="p-4 print:p-3 border-t border-[var(--border-color)] print:border-gray-300">
          <div className="grid grid-cols-2 gap-4 text-sm print:text-xs">
            <div>
              <p className="text-[var(--text-secondary)] print:text-gray-600 mb-1">Net Change (USD)</p>
              <p className={`font-semibold ${
                summary.incomeUSD - summary.expenseUSD >= 0
                  ? "text-[var(--income)] print:text-green-700"
                  : "text-[var(--expense)] print:text-red-700"
              }`}>
                {summary.incomeUSD - summary.expenseUSD >= 0 ? "+" : ""}
                {formatCurrency(summary.incomeUSD - summary.expenseUSD, "USD")}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] print:text-gray-600 mb-1">Net Change (CDF)</p>
              <p className={`font-semibold ${
                summary.incomeCDF - summary.expenseCDF >= 0
                  ? "text-[var(--income)] print:text-green-700"
                  : "text-[var(--expense)] print:text-red-700"
              }`}>
                {summary.incomeCDF - summary.expenseCDF >= 0 ? "+" : ""}
                {formatCurrency(summary.incomeCDF - summary.expenseCDF, "CDF")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Print only */}
        <div className="hidden print:block p-3 border-t border-gray-200">
          <p className="text-[10px] text-gray-400 text-right">
            {new Date().toLocaleString()}
          </p>
        </div>
      </Card>
    </div>
  );
}
