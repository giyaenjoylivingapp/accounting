// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),

    // Transactions (income, expenses, and transfers)
    transactions: i.entity({
      type: i.string().indexed(),       // 'income' | 'expense' | 'transfer'
      description: i.string(),
      amount: i.number(),               // Always positive (for transfers: source amount)
      currency: i.string().indexed(),   // 'USD' | 'CDF' (for transfers: source currency)
      category: i.string().indexed(),   // Category of transaction
      date: i.date().indexed(),         // Transaction date
      notes: i.string().optional(),
      vendor: i.string().optional(),    // Paid to / Received from
      paymentMethod: i.string().optional(), // Cash, Card, Transfer
      createdAt: i.date(),
      // Transfer-specific fields (optional for backward compatibility)
      toCurrency: i.string().optional(),    // Destination currency for transfers
      toAmount: i.number().optional(),      // Calculated destination amount
      exchangeRate: i.number().optional(),  // Exchange rate used for conversion
    }),

    // Daily closing balances (for historical record)
    dailyBalances: i.entity({
      date: i.string().unique().indexed(), // 'YYYY-MM-DD' format
      openingUSD: i.number(),
      openingCDF: i.number(),
      closingUSD: i.number(),
      closingCDF: i.number(),
      createdAt: i.date(),
    }),

    // App settings
    settings: i.entity({
      key: i.string().unique().indexed(), // 'initialBalanceUSD', 'initialBalanceCDF', 'setupComplete'
      value: i.string(),                  // Stored as string, parsed as needed
      updatedAt: i.date(),
    }),
  },
  links: {
    transactionCreator: {
      forward: {
        on: "transactions",
        has: "one",
        label: "creator",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "transactions",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
