"use client";

import { getCategoryByValue } from "@/lib/categories";

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const categoryInfo = getCategoryByValue(category);
  const label = categoryInfo?.label || category;
  const color = categoryInfo?.color || "var(--cat-other)";

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
        color: color,
      }}
    >
      {label}
    </span>
  );
}

// Type indicator badge (Income/Expense)
interface TypeBadgeProps {
  type: "income" | "expense";
  size?: "sm" | "md";
}

export function TypeBadge({ type, size = "sm" }: TypeBadgeProps) {
  const isIncome = type === "income";
  const label = isIncome ? "Income" : "Expense";
  const color = isIncome ? "var(--income)" : "var(--expense)";
  const bgColor = isIncome ? "var(--income-bg)" : "var(--expense-bg)";

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: bgColor,
        color: color,
      }}
    >
      {isIncome ? "+" : "-"} {label}
    </span>
  );
}

// Currency badge
interface CurrencyBadgeProps {
  currency: "USD" | "CDF";
  size?: "sm" | "md";
}

export function CurrencyBadge({ currency, size = "sm" }: CurrencyBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] ${sizeClasses}`}
    >
      {currency}
    </span>
  );
}
