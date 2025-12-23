"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BalanceCards } from "./BalanceCards";
import { DailySummary } from "./DailySummary";
import { QuickActions } from "./QuickActions";
import { CategoryChart } from "./CategoryChart";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionData } from "@/components/transactions/TransactionItem";
import { APP_NAME } from "@/lib/constants";
import {
  calculateCurrentBalance,
  calculateDailySummary,
  BalanceSettings,
} from "@/lib/balance";

interface DashboardProps {
  transactions: TransactionData[];
  settings: BalanceSettings;
  userEmail: string;
}

type TabId = "dashboard" | "transactions" | "reports";

export function Dashboard({ transactions, settings, userEmail }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // Calculate current balances
  const currentBalance = calculateCurrentBalance(
    settings,
    transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      date: t.date,
    }))
  );

  // Calculate today's summary
  const today = new Date();
  const todaySummary = calculateDailySummary(
    settings,
    transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      date: t.date,
    })),
    today
  );

  // Get today's transactions
  const todayTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date).toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];
    return txDate === todayStr;
  });

  const handleSignOut = async () => {
    await db.auth.signOut();
  };

  const navItems = [
    { id: "dashboard" as TabId, label: "Dashboard", icon: DashboardIcon },
    { id: "transactions" as TabId, label: "Transactions", icon: ListIcon },
    { id: "reports" as TabId, label: "Reports", icon: ChartIcon },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">{APP_NAME}</h1>
              <p className="text-xs text-[var(--text-muted)]">Cash Book</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200 text-left
                    ${
                      activeTab === item.id
                        ? "bg-[var(--bg-tertiary)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    }
                  `}
                >
                  <item.icon />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <span className="text-[var(--text-secondary)] font-medium">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {userEmail.split("@")[0]}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">{userEmail}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" fullWidth onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header - Simple top bar with logo and sign out */}
        <header className="lg:hidden sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-color)]">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[var(--accent)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-base font-semibold text-[var(--text-primary)]">
                  {APP_NAME}
                </h1>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "transactions" && "Transactions"}
                  {activeTab === "reports" && "Reports"}
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">
                  {activeTab === "dashboard" && "Overview of your cash flow"}
                  {activeTab === "transactions" && "Manage your income and expenses"}
                  {activeTab === "reports" && "Analyze your spending patterns"}
                </p>
              </div>
              <QuickActions />
            </div>
          </div>
        </header>

        {/* Page Content - pb-24 on mobile for bottom nav clearance */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          {activeTab === "dashboard" && (
            <DashboardContent
              currentBalance={currentBalance}
              todaySummary={todaySummary}
              todayTransactions={todayTransactions}
              transactions={transactions}
            />
          )}
          {activeTab === "transactions" && (
            <TransactionsContent transactions={transactions} />
          )}
          {activeTab === "reports" && (
            <ReportsContent transactions={transactions} />
          )}
        </main>

        {/* Mobile Bottom Navigation - iOS style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)]/95 backdrop-blur-sm border-t border-[var(--border-color)] safe-area-pb">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all
                  ${
                    activeTab === item.id
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)]"
                  }
                `}
              >
                <item.icon />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile FAB - positioned above bottom nav */}
        <div className="lg:hidden">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

// Dashboard Content
function DashboardContent({
  currentBalance,
  todaySummary,
  todayTransactions,
  transactions,
}: {
  currentBalance: { USD: number; CDF: number };
  todaySummary: ReturnType<typeof calculateDailySummary>;
  todayTransactions: TransactionData[];
  transactions: TransactionData[];
}) {
  return (
    <div className="p-4 lg:p-8">
      {/* Balance Cards - Full width on mobile, side by side on desktop */}
      <div className="mb-6">
        <BalanceCards
          balanceUSD={currentBalance.USD}
          balanceCDF={currentBalance.CDF}
        />
      </div>

      {/* Desktop: Two column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Daily Summary & Today's Transactions */}
        <div className="xl:col-span-2 space-y-6">
          <DailySummary summary={todaySummary} />

          <Card variant="bordered" padding="md">
            <CardHeader
              title="Today's Transactions"
              subtitle={`${todayTransactions.length} transaction${
                todayTransactions.length !== 1 ? "s" : ""
              }`}
            />
            <TransactionList
              transactions={todayTransactions}
              showFilters={false}
              showDeleteButton={true}
              showPagination={false}
            />
          </Card>
        </div>

        {/* Right column - Quick Charts */}
        <div className="space-y-6">
          <CategoryChart
            transactions={transactions}
            currency="USD"
            title="Expenses (USD)"
          />
          <CategoryChart
            transactions={transactions}
            currency="CDF"
            title="Expenses (CDF)"
          />
        </div>
      </div>
    </div>
  );
}

// Transactions Content
function TransactionsContent({ transactions }: { transactions: TransactionData[] }) {
  return (
    <div className="p-4 lg:p-8">
      <Card variant="bordered" padding="md" className="lg:p-6">
        <CardHeader
          title="All Transactions"
          subtitle={`${transactions.length} total transactions`}
        />
        <TransactionList
          transactions={transactions}
          showFilters={true}
          showDeleteButton={true}
        />
      </Card>
    </div>
  );
}

// Reports Content
function ReportsContent({ transactions }: { transactions: TransactionData[] }) {
  return (
    <div className="p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart
          transactions={transactions}
          currency="USD"
          title="Expense Breakdown (USD)"
        />
        <CategoryChart
          transactions={transactions}
          currency="CDF"
          title="Expense Breakdown (CDF)"
        />
      </div>
    </div>
  );
}

// Icons
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}
