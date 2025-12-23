// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

// Only this email can access the app
const ALLOWED_EMAIL = "giyaenjoyliving.app@gmail.com";

const rules = {
  // Lock down schema modifications
  attrs: {
    allow: {
      $default: "false",
    },
  },

  // Transaction permissions - only authorized email
  transactions: {
    allow: {
      view: `auth.email == '${ALLOWED_EMAIL}'`,
      create: `auth.email == '${ALLOWED_EMAIL}'`,
      update: `auth.email == '${ALLOWED_EMAIL}'`,
      delete: `auth.email == '${ALLOWED_EMAIL}'`,
    },
  },

  // Daily balances - only authorized email
  dailyBalances: {
    allow: {
      view: `auth.email == '${ALLOWED_EMAIL}'`,
      create: `auth.email == '${ALLOWED_EMAIL}'`,
      update: `auth.email == '${ALLOWED_EMAIL}'`,
      delete: `auth.email == '${ALLOWED_EMAIL}'`,
    },
  },

  // Settings - only authorized email, no delete
  settings: {
    allow: {
      view: `auth.email == '${ALLOWED_EMAIL}'`,
      create: `auth.email == '${ALLOWED_EMAIL}'`,
      update: `auth.email == '${ALLOWED_EMAIL}'`,
      delete: "false",
    },
  },
} satisfies InstantRules;

export default rules;
