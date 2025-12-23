"use client";

import { db } from "@/lib/db";
import { LoginForm, AccessDenied } from "@/components/auth/LoginForm";
import { InitialSetup } from "@/components/setup/InitialSetup";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ALLOWED_EMAIL, SETTINGS_KEYS, Currency } from "@/lib/constants";
import { TransactionData } from "@/components/transactions/TransactionItem";
import { BalanceSettings } from "@/lib/balance";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--error-bg)] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--error)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--text-secondary)]">{message}</p>
      </div>
    </div>
  );
}

function App() {
  // Check authentication
  const { isLoading: authLoading, user, error: authError } = db.useAuth();

  // Fetch data (transactions and settings)
  const { isLoading: dataLoading, error: dataError, data } = db.useQuery({
    transactions: {},
    settings: {},
  });

  // Handle loading states
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Handle auth errors
  if (authError) {
    return <ErrorScreen message={authError.message} />;
  }

  // Not logged in - show login form
  if (!user) {
    return <LoginForm />;
  }

  // Check if user is authorized
  const userEmail = user.email;
  if (!userEmail || userEmail.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    return <AccessDenied email={userEmail || "Unknown"} />;
  }

  // Handle data loading
  if (dataLoading) {
    return <LoadingScreen />;
  }

  // Handle data errors
  if (dataError) {
    return <ErrorScreen message={dataError.message} />;
  }

  // Extract data
  const { transactions: rawTransactions, settings: rawSettings } = data;

  // Parse settings
  const settingsMap = new Map(rawSettings.map((s) => [s.key, s.value]));
  const isSetupComplete = settingsMap.get(SETTINGS_KEYS.SETUP_COMPLETE) === "true";

  // If setup is not complete, show initial setup
  if (!isSetupComplete) {
    return <InitialSetup />;
  }

  // Parse initial balances
  const balanceSettings: BalanceSettings = {
    initialBalanceUSD: parseFloat(
      settingsMap.get(SETTINGS_KEYS.INITIAL_BALANCE_USD) || "0"
    ),
    initialBalanceCDF: parseFloat(
      settingsMap.get(SETTINGS_KEYS.INITIAL_BALANCE_CDF) || "0"
    ),
  };

  // Transform transactions to the expected format
  const transactions: TransactionData[] = rawTransactions.map((t) => ({
    id: t.id,
    type: t.type as "income" | "expense",
    description: t.description,
    amount: t.amount,
    currency: t.currency as Currency,
    category: t.category,
    date: new Date(t.date),
    vendor: t.vendor || undefined,
    paymentMethod: t.paymentMethod || undefined,
    notes: t.notes || undefined,
  }));

  // Show dashboard
  return (
    <Dashboard
      transactions={transactions}
      settings={balanceSettings}
      userEmail={userEmail}
    />
  );
}

export default App;
