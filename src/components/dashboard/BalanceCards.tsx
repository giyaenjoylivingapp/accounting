"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";

interface BalanceCardsProps {
  balanceUSD: number;
  balanceCDF: number;
}

export function BalanceCards({ balanceUSD, balanceCDF }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      {/* USD Balance */}
      <Card variant="bordered" padding="none" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 -mr-12 -mt-12 lg:-mr-16 lg:-mt-16 rounded-full bg-blue-500 opacity-5" />
        <div className="relative p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold text-lg lg:text-xl">$</span>
              </div>
              <div>
                <span className="text-sm lg:text-base text-[var(--text-secondary)]">
                  US Dollar
                </span>
                <p className="text-xs text-[var(--text-muted)]">USD</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs lg:text-sm text-[var(--text-muted)] mb-1">
              Current Balance
            </p>
            <p className="text-2xl lg:text-4xl font-bold text-[var(--text-primary)]">
              {formatCurrency(balanceUSD, "USD")}
            </p>
          </div>
        </div>
      </Card>

      {/* CDF Balance */}
      <Card variant="bordered" padding="none" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 -mr-12 -mt-12 lg:-mr-16 lg:-mt-16 rounded-full bg-orange-500 opacity-5" />
        <div className="relative p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400 font-bold text-sm lg:text-base">FC</span>
              </div>
              <div>
                <span className="text-sm lg:text-base text-[var(--text-secondary)]">
                  Congolese Franc
                </span>
                <p className="text-xs text-[var(--text-muted)]">CDF</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs lg:text-sm text-[var(--text-muted)] mb-1">
              Current Balance
            </p>
            <p className="text-2xl lg:text-4xl font-bold text-[var(--text-primary)]">
              {formatCurrency(balanceCDF, "CDF")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
