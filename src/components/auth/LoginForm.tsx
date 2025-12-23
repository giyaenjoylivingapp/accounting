"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { APP_NAME, ALLOWED_EMAIL } from "@/lib/constants";

type LoginStep = "email" | "code" | "error";

export function LoginForm() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if email matches allowed email
    if (email.toLowerCase().trim() !== ALLOWED_EMAIL.toLowerCase()) {
      setError("This email is not authorized to access this application.");
      return;
    }

    setLoading(true);
    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await db.auth.signInWithMagicCode({
        email: email.trim(),
        code: code.trim(),
      });
      // Auth state will update automatically via useAuth hook
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setCode("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <Card variant="bordered" padding="lg" className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {APP_NAME}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {step === "email" && "Sign in with your email"}
            {step === "code" && "Enter the verification code"}
          </p>
        </div>

        {/* Email Form */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <Input
              type="email"
              label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
              autoFocus
              autoComplete="email"
            />
            <Button type="submit" fullWidth loading={loading}>
              Continue
            </Button>
          </form>
        )}

        {/* Code Form */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
              We sent a code to{" "}
              <span className="text-[var(--text-primary)] font-medium">
                {email}
              </span>
            </p>
            <Input
              type="text"
              label="Verification code"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={error}
              required
              autoFocus
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleBack}
            >
              Use a different email
            </Button>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-[var(--text-muted)] text-center mt-6">
          Only authorized users can access this application.
        </p>
      </Card>
    </div>
  );
}

// Access Denied component for unauthorized users
export function AccessDenied({ email }: { email: string }) {
  const handleSignOut = async () => {
    await db.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <Card variant="bordered" padding="lg" className="w-full max-w-sm text-center">
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
          Access Denied
        </h2>
        <p className="text-[var(--text-secondary)] mb-2">
          The email <span className="font-medium">{email}</span> is not
          authorized to access this application.
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Please sign in with an authorized account.
        </p>
        <Button onClick={handleSignOut} variant="secondary" fullWidth>
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
