# CLAUDE.md - InstantDB Best Practices & Project Guidelines

create a todo list when working on complex tasks to track progress and remain on track                                                                                               
         
## Project Overview

This is an accounting web application built with Next.js and InstantDB as the real-time database.

- **Repository**: https://github.com/giyaenjoylivingapp/accounting.git
- **Hosting**: GitHub Pages (static export via GitHub Actions)
- **Database**: InstantDB (real-time, client-side database)

---

## InstantDB CLI Best Practices

### Authentication

```bash
# Login to InstantDB (browser-based)
npx instant-cli@latest login

# Logout
npx instant-cli@latest logout

# Print auth token for CI/CD environments
npx instant-cli@latest login -p
```

### Project Initialization

```bash
# Initialize with schema and permissions files
npx instant-cli@latest init

# Create app without generating files
npx instant-cli@latest init-without-files --title "App Name"

# Create ephemeral app (auto-deletes after 24 hours) for testing
npx instant-cli@latest init-without-files --title "Test App" --temp
```

### Schema & Permissions Management

```bash
# Push schema changes to production
npx instant-cli@latest push schema

# Push permission rules to production
npx instant-cli@latest push perms

# Pull latest schema and permissions from production
npx instant-cli@latest pull
```

### Recommended Workflow

1. Run `npx instant-cli@latest init` to scaffold `instant.schema.ts` and `instant.perms.ts`
2. Define your data model in `instant.schema.ts`
3. Execute `npx instant-cli@latest push schema` to apply changes
4. Configure access rules in `instant.perms.ts`
5. Run `npx instant-cli@latest push perms` to apply permissions
6. Use `npx instant-cli@latest pull` when making schema changes via Explorer UI

---

## Environment Variables

Store your InstantDB app ID using framework-specific environment variables:

```bash
# For Next.js (recommended for this project)
NEXT_PUBLIC_INSTANT_APP_ID=your-app-id

# Generic
INSTANT_APP_ID=your-app-id

# For Vite projects
VITE_INSTANT_APP_ID=your-app-id

# For React Native/Expo
EXPO_PUBLIC_INSTANT_APP_ID=your-app-id
```

### File Location Configuration

The CLI searches `./`, `./src`, and `./app` by default. For custom paths:

```bash
INSTANT_SCHEMA_FILE_PATH=./custom/path/instant.schema.ts
INSTANT_PERMS_FILE_PATH=./custom/path/instant.perms.ts
```

### CI/CD Authentication

```bash
# Use this env var in GitHub Actions or CI pipelines
INSTANT_CLI_AUTH_TOKEN=your-auth-token
```

---

## Schema Best Practices

### Defining Entities with Type Safety

```typescript
// instant.schema.ts
import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    accounts: i.entity({
      name: i.string(),
      type: i.string(),           // 'asset', 'liability', 'equity', 'revenue', 'expense'
      balance: i.number(),
      createdAt: i.date(),
    }),
    transactions: i.entity({
      description: i.string(),
      amount: i.number(),
      date: i.date(),
      createdAt: i.date(),
    }),
  },
  links: {
    transactionDebit: {
      forward: { on: 'transactions', has: 'one', label: 'debitAccount' },
      reverse: { on: 'accounts', has: 'many', label: 'debitTransactions' },
    },
    transactionCredit: {
      forward: { on: 'transactions', has: 'one', label: 'creditAccount' },
      reverse: { on: 'accounts', has: 'many', label: 'creditTransactions' },
    },
    transactionCreator: {
      forward: { on: 'transactions', has: 'one', label: 'creator' },
      reverse: { on: '$users', has: 'many', label: 'transactions' },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
```

### Attribute Types

- `i.string()` - Text values
- `i.number()` - Numeric values
- `i.boolean()` - True/false
- `i.date()` - Date objects
- `i.json()` - Complex JSON objects
- `i.any()` - Flexible type (use sparingly)

### Attribute Modifiers

- `.unique()` - Enforce uniqueness (accelerates queries)
- `.indexed()` - Enable comparison operators (`$lt`, `$gt`, `$lte`, `$gte`) and ordering
- `.optional()` - Allow null values (attributes are required by default)

### Relationship Types

```typescript
// One-to-One
forward: { on: 'profiles', has: 'one', label: '$user' }
reverse: { on: '$users', has: 'one', label: 'profile' }

// One-to-Many
forward: { on: 'posts', has: 'one', label: 'author' }
reverse: { on: 'profiles', has: 'many', label: 'posts' }

// Many-to-Many
forward: { on: 'posts', has: 'many', label: 'tags' }
reverse: { on: 'tags', has: 'many', label: 'posts' }
```

---

## Permissions Best Practices

### Lock Down Schema in Production

```typescript
// instant.perms.ts
import type { InstantRules } from '@instantdb/react';

const rules = {
  // Prevent client-side schema modifications
  attrs: {
    allow: {
      $default: 'false',
    },
  },
} satisfies InstantRules;

export default rules;
```

### Entity-Level Permissions

```typescript
import type { InstantRules } from '@instantdb/react';

const rules = {
  attrs: {
    allow: {
      $default: 'false',
    },
  },
  accounts: {
    allow: {
      view: 'auth.id != null',                    // Authenticated users can view
      create: 'auth.id != null',                  // Authenticated users can create
      update: "data.id in auth.ref('$user.accounts.id')", // Owner can update
      delete: "data.id in auth.ref('$user.accounts.id')", // Owner can delete
    },
  },
  transactions: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: "auth.id in data.ref('creator.id')",
      delete: "auth.id in data.ref('creator.id')",
    },
  },
} satisfies InstantRules;

export default rules;
```

### Field-Level Permissions

```typescript
{
  "$users": {
    "allow": {
      "view": "true"
    },
    "fields": {
      "email": "auth.id == data.id"  // Only show email to the user themselves
    }
  }
}
```

### Using `bind` for Reusable Logic

```typescript
{
  "accounts": {
    "allow": {
      "view": "isOwner",
      "update": "isOwner",
      "delete": "isOwner"
    },
    "bind": ["isOwner", "auth.id in data.ref('creator.id')"]
  }
}
```

### Storage Permissions

```typescript
{
  "$files": {
    "allow": {
      "view": "isLoggedIn",
      "create": "isLoggedIn",
      "update": "isOwner",
      "delete": "isOwner"
    },
    "bind": [
      ["isLoggedIn", "auth.id != null"],
      ["isOwner", "data.path.startsWith(auth.id + '/')"]
    ]
  }
}
```

---

## Client Initialization

### Recommended Pattern (Single Connection)

```typescript
// lib/db.ts
import { init } from '@instantdb/react';
import schema from '../instant.schema';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

export const db = init({
  appId: APP_ID,
  schema,
  devtool: process.env.NODE_ENV === 'development' ? {
    position: 'bottom-right',
  } : false,
});
```

### Full Configuration Options

```typescript
const db = init({
  appId: 'YOUR_APP_ID',           // Required
  schema: schema,                  // Required for type safety
  websocketURI: 'wss://api.instantdb.com/runtime/session', // Optional
  apiURI: 'https://api.instantdb.com',  // Optional
  devtool: true,                   // Enable dev tools (development only)
  verbose: false,                  // Console logging
  queryCacheLimit: 10,             // Offline cache limit
  useDateObjects: false,           // Return Date objects for date columns
});
```

---

## Authentication Patterns

### Using `useAuth` Hook

```typescript
function App() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (user) return <Dashboard user={user} />;
  return <LoginPage />;
}
```

### Auth Guard Pattern

```typescript
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <LoginPage />;

  return <>{children}</>;
}
```

### Sign Out

```typescript
<button onClick={() => db.auth.signOut()}>Sign Out</button>
```

---

## Query & Transaction Patterns

### Basic Query

```typescript
const { isLoading, error, data } = db.useQuery({
  accounts: {},
  transactions: {
    debitAccount: {},
    creditAccount: {},
  },
});
```

### Filtered Query

```typescript
const { data } = db.useQuery({
  transactions: {
    $: {
      where: {
        date: { $gte: startOfMonth },
      },
      order: { serverCreatedAt: 'desc' },
      limit: 50,
    },
    debitAccount: {},
    creditAccount: {},
  },
});
```

### Create Transaction

```typescript
import { id } from '@instantdb/react';

function createTransaction(data: TransactionInput) {
  db.transact([
    db.tx.transactions[id()].update({
      description: data.description,
      amount: data.amount,
      date: data.date,
      createdAt: Date.now(),
    }).link({
      debitAccount: data.debitAccountId,
      creditAccount: data.creditAccountId,
      creator: userId,
    }),
  ]);
}
```

### Update Transaction

```typescript
db.transact(
  db.tx.transactions[transactionId].update({
    description: newDescription,
    amount: newAmount,
  })
);
```

### Delete Transaction

```typescript
db.transact(db.tx.transactions[transactionId].delete());
```

### Batch Operations

```typescript
const txs = transactions.map(t => db.tx.transactions[t.id].delete());
db.transact(txs);
```

---

## Real-Time & Connection Handling

### Monitor Connection Status

```typescript
// React hook
const status = db.useConnectionStatus();
// Returns: 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

// Vanilla JS
db.subscribeConnectionStatus((status) => {
  console.log('Connection status:', status);
});
```

### Presence (Real-Time Collaboration)

```typescript
const room = db.room('accounting', 'shared-workspace');

function App() {
  const { peers } = db.rooms.usePresence(room);
  const numUsers = 1 + Object.keys(peers).length;

  return <div>Users online: {numUsers}</div>;
}
```

---

## Performance Guidelines

### Timeout Limits

- **Client SDK**: 5 seconds maximum per query/transaction
- **Admin SDK/Sandbox**: 30 seconds maximum

### Optimization Tips

1. **Use indexes** on frequently filtered/sorted attributes
2. **Paginate large datasets** using `limit` and `offset`
3. **Simplify permission rules** to avoid deep data traversals
4. **Use `.unique()` constraints** for faster lookups

### Find Unlinked Entities

```typescript
// Find transactions without a debit account
const { data } = db.useQuery({
  transactions: {
    $: {
      where: {
        debitAccount: { $isNull: true },
      },
    },
  },
});
```

---

## GitHub Pages Deployment

### Important Considerations

Since this app is hosted on GitHub Pages (static hosting):

1. **Static Export Required**: Next.js must be configured for static export
2. **Client-Side Only**: All InstantDB operations run in the browser
3. **No Server-Side Code**: Cannot use Next.js API routes or server components with InstantDB Admin SDK
4. **Base Path**: Configure for GitHub Pages subdirectory if not using custom domain

### Next.js Configuration for GitHub Pages

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',

  // If deploying to https://<username>.github.io/<repo-name>/
  basePath: '/accounting',
  assetPrefix: '/accounting/',

  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_INSTANT_APP_ID: ${{ secrets.NEXT_PUBLIC_INSTANT_APP_ID }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Required GitHub Settings

1. Go to Repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Add `NEXT_PUBLIC_INSTANT_APP_ID` to Repository Secrets

### Environment Separation

Maintain separate InstantDB apps for development and production:

```bash
# .env.local (development - not committed)
NEXT_PUBLIC_INSTANT_APP_ID=dev-app-id

# GitHub Secrets (production)
NEXT_PUBLIC_INSTANT_APP_ID=prod-app-id
```

---

## Security Checklist for Production

- [ ] Lock down schema with `attrs.allow.$default: 'false'`
- [ ] Define explicit permissions for all entities
- [ ] Use field-level permissions for sensitive data
- [ ] Never expose Admin SDK tokens in client code
- [ ] Separate development and production InstantDB apps
- [ ] Configure storage permissions if using file uploads
- [ ] Test permissions in Sandbox before deploying
- [ ] Enable authentication before accessing sensitive data

---

## Debugging Tips

### Use the Sandbox

The InstantDB Sandbox provides:
- Query/transaction testing
- Permission rule validation
- Performance metrics
- Real-time debugging

### Permission Debugging

Break complex permission rules into smaller parts to isolate issues:

```typescript
// Instead of one complex rule
"update": "auth.id != null && data.id in auth.ref('$user.accounts.id') && !data.isLocked"

// Test each part separately
"update": "auth.id != null"  // Test auth first
"update": "data.id in auth.ref('$user.accounts.id')"  // Then ownership
```

### Check Advisory Notices

Regularly check for security and performance advisories in the InstantDB dashboard.

---

## Resources

- [InstantDB Documentation](https://www.instantdb.com/docs)
- [CLI Reference](https://www.instantdb.com/docs/cli)
- [Patterns & Best Practices](https://www.instantdb.com/docs/patterns)
- [Permissions Guide](https://www.instantdb.com/docs/permissions)
- [Data Modeling](https://www.instantdb.com/docs/modeling-data)
- [GitHub Repository](https://github.com/instantdb/instant)
