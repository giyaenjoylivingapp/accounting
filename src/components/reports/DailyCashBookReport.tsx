"use client";

import { useState, useRef } from "react";
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
  const printRef = useRef<HTMLDivElement>(null);

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
    <div className="space-y-6">
      {/* Controls - Hidden when printing */}
      <div className="print:hidden flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Select Date
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
        <Button onClick={handlePrint} className="w-full sm:w-auto">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save PDF
        </Button>
      </div>

      {/* Printable Report */}
      <div ref={printRef} className="print-container">
        <Card variant="bordered" padding="none" className="overflow-hidden print:border-0 print:shadow-none">
          {/* Report Header */}
          <div className="bg-[var(--bg-tertiary)] p-6 border-b border-[var(--border-color)] print:bg-white print:border-b-2 print:border-black">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] print:text-black">
                {APP_NAME}
              </h1>
              <h2 className="text-lg font-semibold text-[var(--text-secondary)] mt-1 print:text-gray-700">
                Daily Cash Book Report
              </h2>
              <p className="text-[var(--text-secondary)] mt-2 print:text-gray-600">
                {formatDisplayDate(selectedDate)}
              </p>
            </div>
          </div>

          {/* Opening Balance */}
          <div className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] print:bg-gray-50 print:border-gray-300">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--text-primary)] print:text-black">
                Opening Balance
              </span>
              <div className="text-right">
                <div className="font-semibold text-[var(--text-primary)] print:text-black">
                  {formatCurrency(summary.openingUSD, "USD")}
                </div>
                <div className="text-sm text-[var(--text-secondary)] print:text-gray-600">
                  {formatCurrency(summary.openingCDF, "CDF")}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] print:bg-gray-100 print:border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] print:text-gray-700">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] print:text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] print:text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right font-semibold print:text-gray-700" style={{ color: "var(--income)" }}>
                    Income (USD)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold print:text-gray-700" style={{ color: "var(--expense)" }}>
                    Expense (USD)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold print:text-gray-700" style={{ color: "var(--income)" }}>
                    Income (CDF)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold print:text-gray-700" style={{ color: "var(--expense)" }}>
                    Expense (CDF)
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
                      <td className="px-4 py-3 text-[var(--text-secondary)] print:text-gray-600 whitespace-nowrap">
                        {formatTime(tx.date)}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-primary)] print:text-black">
                        {tx.description}
                        {tx.vendor && (
                          <span className="text-[var(--text-muted)] print:text-gray-500 ml-1">
                            ({tx.vendor})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] print:text-gray-600">
                        {getCategoryLabel(tx.category)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium print:text-black" style={{ color: "var(--income)" }}>
                        {tx.type === "income" && tx.currency === "USD"
                          ? formatCurrency(tx.amount, "USD")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium print:text-black" style={{ color: "var(--expense)" }}>
                        {tx.type === "expense" && tx.currency === "USD"
                          ? formatCurrency(tx.amount, "USD")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium print:text-black" style={{ color: "var(--income)" }}>
                        {tx.type === "income" && tx.currency === "CDF"
                          ? formatCurrency(tx.amount, "CDF")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium print:text-black" style={{ color: "var(--expense)" }}>
                        {tx.type === "expense" && tx.currency === "CDF"
                          ? formatCurrency(tx.amount, "CDF")
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Totals Row */}
              <tfoot>
                <tr className="bg-[var(--bg-tertiary)] border-t-2 border-[var(--border-color)] font-semibold print:bg-gray-100 print:border-gray-400">
                  <td colSpan={3} className="px-4 py-3 text-[var(--text-primary)] print:text-black">
                    Day Totals
                  </td>
                  <td className="px-4 py-3 text-right print:text-black" style={{ color: "var(--income)" }}>
                    {formatCurrency(summary.incomeUSD, "USD")}
                  </td>
                  <td className="px-4 py-3 text-right print:text-black" style={{ color: "var(--expense)" }}>
                    {formatCurrency(summary.expenseUSD, "USD")}
                  </td>
                  <td className="px-4 py-3 text-right print:text-black" style={{ color: "var(--income)" }}>
                    {formatCurrency(summary.incomeCDF, "CDF")}
                  </td>
                  <td className="px-4 py-3 text-right print:text-black" style={{ color: "var(--expense)" }}>
                    {formatCurrency(summary.expenseCDF, "CDF")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Closing Balance */}
          <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] print:bg-gray-100 print:border-t-2 print:border-gray-400">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-[var(--text-primary)] print:text-black">
                Closing Balance
              </span>
              <div className="text-right">
                <div className="font-bold text-lg text-[var(--text-primary)] print:text-black">
                  {formatCurrency(summary.closingUSD, "USD")}
                </div>
                <div className="font-semibold text-[var(--text-secondary)] print:text-gray-700">
                  {formatCurrency(summary.closingCDF, "CDF")}
                </div>
              </div>
            </div>
          </div>

          {/* Net Change Summary */}
          <div className="p-4 border-t border-[var(--border-color)] print:border-gray-300">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)] print:text-gray-600 mb-1">Net Change (USD)</p>
                <p className={`font-semibold ${
                  summary.incomeUSD - summary.expenseUSD >= 0
                    ? "text-[var(--income)]"
                    : "text-[var(--expense)]"
                } print:text-black`}>
                  {summary.incomeUSD - summary.expenseUSD >= 0 ? "+" : ""}
                  {formatCurrency(summary.incomeUSD - summary.expenseUSD, "USD")}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] print:text-gray-600 mb-1">Net Change (CDF)</p>
                <p className={`font-semibold ${
                  summary.incomeCDF - summary.expenseCDF >= 0
                    ? "text-[var(--income)]"
                    : "text-[var(--expense)]"
                } print:text-black`}>
                  {summary.incomeCDF - summary.expenseCDF >= 0 ? "+" : ""}
                  {formatCurrency(summary.incomeCDF - summary.expenseCDF, "CDF")}
                </p>
              </div>
            </div>
          </div>

          {/* Footer - Print timestamp */}
          <div className="hidden print:block p-4 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>Generated on {new Date().toLocaleString()}</p>
            <p className="mt-1">{APP_NAME} - Daily Cash Book Report</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
