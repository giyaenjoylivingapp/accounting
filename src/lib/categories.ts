// Category definitions with colors and icons

export interface Category {
  value: string;
  label: string;
  color: string;
  type: "income" | "expense";
}

// Expense categories
export const EXPENSE_CATEGORIES: Category[] = [
  { value: "utilities", label: "Utilities", color: "var(--cat-utilities)", type: "expense" },
  { value: "rent", label: "Rent/Lease", color: "var(--cat-rent)", type: "expense" },
  { value: "salaries", label: "Salaries", color: "var(--cat-salaries)", type: "expense" },
  { value: "inventory", label: "Inventory", color: "var(--cat-inventory)", type: "expense" },
  { value: "marketing", label: "Marketing", color: "var(--cat-marketing)", type: "expense" },
  { value: "maintenance", label: "Maintenance", color: "var(--cat-maintenance)", type: "expense" },
  { value: "supplies", label: "Supplies", color: "var(--cat-supplies)", type: "expense" },
  { value: "transport", label: "Transport", color: "var(--cat-transport)", type: "expense" },
  { value: "taxes", label: "Taxes/Fees", color: "var(--cat-taxes)", type: "expense" },
  { value: "other_expense", label: "Other", color: "var(--cat-other)", type: "expense" },
];

// Income categories
export const INCOME_CATEGORIES: Category[] = [
  { value: "sales", label: "Sales", color: "var(--cat-sales)", type: "income" },
  { value: "services", label: "Services", color: "var(--cat-services)", type: "income" },
  { value: "refund", label: "Refund", color: "var(--cat-refund)", type: "income" },
  { value: "other_income", label: "Other", color: "var(--cat-other)", type: "income" },
];

// All categories combined
export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

// Get category by value
export function getCategoryByValue(value: string): Category | undefined {
  return ALL_CATEGORIES.find((cat) => cat.value === value);
}

// Get categories by type
export function getCategoriesByType(type: "income" | "expense"): Category[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

// Get category color (with fallback)
export function getCategoryColor(value: string): string {
  const category = getCategoryByValue(value);
  return category?.color || "var(--cat-other)";
}

// Get category label (with fallback)
export function getCategoryLabel(value: string): string {
  const category = getCategoryByValue(value);
  return category?.label || value;
}
