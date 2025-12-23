"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { getCategoryByValue, EXPENSE_CATEGORIES } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";
import { Currency } from "@/lib/constants";
import { TransactionData } from "@/components/transactions/TransactionItem";

interface CategoryChartProps {
  transactions: TransactionData[];
  currency: Currency;
  title?: string;
}

export function CategoryChart({
  transactions,
  currency,
  title = "Expenses by Category",
}: CategoryChartProps) {
  // Filter for expenses in the selected currency
  const expenses = transactions.filter(
    (t) => t.type === "expense" && t.currency === currency
  );

  // Calculate totals by category
  const categoryTotals = new Map<string, number>();
  let total = 0;

  for (const expense of expenses) {
    const current = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, current + expense.amount);
    total += expense.amount;
  }

  // Sort by amount (highest first)
  const sortedCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const info = getCategoryByValue(category);
      return {
        category,
        label: info?.label || category,
        color: info?.color || "var(--cat-other)",
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    });

  // Calculate pie chart segments
  let currentAngle = 0;
  const segments = sortedCategories.map((cat) => {
    const angle = (cat.percentage / 100) * 360;
    const segment = {
      ...cat,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });

  // Generate SVG pie chart path
  const createPieSegment = (
    startAngle: number,
    endAngle: number,
    radius: number = 80
  ) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  if (expenses.length === 0) {
    return (
      <Card variant="bordered" padding="md">
        <CardHeader title={title} />
        <div className="text-center py-8 text-[var(--text-muted)]">
          No expenses to display
        </div>
      </Card>
    );
  }

  return (
    <Card variant="bordered" padding="md">
      <CardHeader title={title} subtitle={`Total: ${formatCurrency(total, currency)}`} />

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Pie Chart */}
        <div className="shrink-0">
          <svg width="160" height="160" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <path
                key={segment.category}
                d={createPieSegment(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="50" fill="var(--bg-secondary)" />
            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-xs fill-[var(--text-muted)]"
            >
              {currency}
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              className="text-sm font-bold fill-[var(--text-primary)]"
            >
              {formatCurrency(total, currency).replace(currency === "USD" ? "$" : " FC", "")}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {sortedCategories.slice(0, 6).map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-primary)] truncate">
                    {cat.label}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)] ml-2">
                    {cat.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {sortedCategories.length > 6 && (
            <p className="text-xs text-[var(--text-muted)] text-center pt-2">
              +{sortedCategories.length - 6} more categories
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
