# FinFlow API

Fastify 5 REST API with PostgreSQL, JWT authentication, and Google OAuth.

## Tech stack

- **Runtime**: Node.js 20+, TypeScript, ESM
- **Framework**: Fastify 5 with Zod type provider
- **Database**: PostgreSQL 17 via Prisma 7 (`@prisma/adapter-pg`)
- **Auth**: `@fastify/jwt` + `@fastify/cookie` (httpOnly JWT cookies), Argon2 for password hashing, `google-auth-library` for OAuth
- **Docs**: Swagger UI at `/docs`

## Running

```bash
docker compose -f apps/api/docker-compose.yml up -d   # PostgreSQL
pnpm --filter @finflow/api db:migrate                  # run migrations
pnpm --filter @finflow/api dev                         # start dev server (port 3333)
```

## Project structure

```
src/
├── server.ts              # Entry point — calls buildApp() and listens
├── app.ts                 # Fastify initialization, plugin registration order
│
├── shared/                # FOLDER BY TYPE — cross-cutting infrastructure
│   ├── config/
│   │   └── env.ts         # Zod-validated environment variables
│   ├── database/
│   │   ├── prisma.ts      # Prisma plugin — decorates app.prisma
│   │   ├── repositories/  # Data access layer
│   │   │   ├── user.repository.ts
│   │   │   ├── bank-account.repository.ts
│   │   │   ├── category.repository.ts
│   │   │   ├── transaction.repository.ts
│   │   │   ├── recurring-rule.repository.ts
│   │   │   ├── recurring-override.repository.ts
│   │   │   ├── installment-group.repository.ts
│   │   │   └── personal-access-token.repository.ts
│   │   └── index.ts
│   ├── helpers/
│   │   └── date.ts        # Date utilities (resolveDateRange, formatDateLocal)
│   └── infra/http/
│       ├── middlewares/
│       │   ├── auth.ts    # Decorates request.getCurrentUserId() via JWT
│       │   └── error-handler.ts  # Global error handler
│       ├── errors/        # HttpError base class + BadRequest, Unauthorized, NotFound, Conflict
│       └── index.ts
│
└── modules/               # FOLDER BY FEATURE — each module has use-case subfolders
    ├── auth/
    │   ├── register/          # handler + schema
    │   ├── login/
    │   ├── google-login/
    │   ├── logout/
    │   ├── get-profile/
    │   ├── helpers/           # issueAuthToken, oauth.service, seedCategories
    │   ├── routes.ts          # registers all use-case handlers
    │   └── index.ts
    ├── bank-account/
    │   ├── create-bank-account/
    │   ├── get-bank-account/
    │   ├── list-bank-accounts/
    │   ├── update-bank-account/
    │   ├── archive-bank-account/
    │   ├── restore-bank-account/
    │   ├── schemas.ts         # shared schemas (bankAccountIdParam, bankAccountResponse)
    │   ├── routes.ts
    │   └── index.ts
    ├── category/              # same pattern as bank-account
    ├── transaction/
    │   ├── create-transaction/
    │   ├── get-transaction/
    │   ├── list-transactions/
    │   ├── update-transaction/
    │   ├── delete-transaction/
    │   ├── get-summary/
    │   ├── get-summary-by-category/
    │   ├── get-summary-by-period/
    │   ├── get-balance-over-time/
    │   ├── helpers/           # recalculateBalance, recurring occurrences, installments, validations
    │   ├── schemas.ts
    │   ├── routes.ts
    │   └── index.ts
    ├── recurring-rule/
    │   ├── list-recurring-rules/
    │   ├── update-recurring-rule/
    │   ├── delete-recurring-occurrence/
    │   ├── delete-recurring-rule/
    │   ├── schemas.ts
    │   ├── routes.ts
    │   └── index.ts
    ├── dashboard/
    │   ├── get-dashboard/
    │   ├── routes.ts
    │   └── index.ts
    ├── personal-access-token/
    │   ├── create-personal-access-token/
    │   ├── list-personal-access-tokens/
    │   ├── revoke-personal-access-token/
    │   ├── helpers/           # token generation/hashing, authenticatePersonalAccessToken
    │   ├── schemas.ts
    │   ├── routes.ts
    │   └── index.ts
    ├── mcp/
    │   ├── helpers/           # createMcpServer, tool context, shared tool input schemas
    │   ├── tools/             # one file per read-only MCP tool
    │   ├── routes.ts          # POST /mcp (Streamable HTTP, stateless)
    │   └── index.ts
    └── health/
        ├── check-health/
        ├── routes.ts
        └── index.ts
```

## Architecture patterns

### Use-case pattern (handler + schema)

Each use-case lives in its own subfolder under the module:

```
modules/<feature>/<use-case>/
├── <use-case>.ts           # Fastify route handler (exports async function)
└── <use-case>.schema.ts    # Zod schemas (body, params, query, response)
```

Handlers are registered as Fastify plugins via `app.register()` in the module's `routes.ts`.

### Repository pattern

Repositories in `shared/database/repositories/` encapsulate Prisma queries. Each is a factory function receiving a Prisma client:

```ts
const repo = bankAccountRepository(app.prisma)
const account = await repo.findById(id)
```

Repositories accept both `PrismaClient` and `Prisma.TransactionClient` for use inside `$transaction()` blocks.

### Module exports

Each module exports its routes function via `index.ts` barrel:

```ts
export { authRoutes } from './routes.js'
```

Shared schemas within a module live in a `schemas.ts` at the module root.

## Plugin registration order (app.ts)

1. `@fastify/cors` — credentials: true, origin from frontend URL
2. `@fastify/cookie`
3. `@fastify/swagger` + `@fastify/swagger-ui`
4. `@fastify/jwt` — reads token from httpOnly cookie named `token`
5. `prismaPlugin` — decorates `app.prisma`
6. `errorHandler` — global error handler
7. `authPlugin` — decorates `request.getCurrentUserId()`
8. Route modules registered with prefixes (`/auth`, `/health`, `/bank-accounts`, `/categories`, `/transactions`, `/recurring-rules`, `/dashboard`, `/personal-access-tokens`, `/mcp`)

## Authentication system

### JWT cookies

- Token contains `{ sub: userId }` with 90-day expiry
- Stored as httpOnly cookie (`secure` in production, `sameSite: lax`)
- `issueAuthToken(reply, userId)` helper handles sign + cookie for all auth routes

### Endpoints

| Method | Path                                | Auth | Description                                                                          |
| ------ | ----------------------------------- | ---- | ------------------------------------------------------------------------------------ |
| POST   | `/auth/register`                    | No   | Create account (email/password)                                                      |
| POST   | `/auth/login`                       | No   | Login with email/password                                                            |
| POST   | `/auth/google`                      | No   | Login/register with Google ID token                                                  |
| POST   | `/auth/logout`                      | No   | Clear token cookie                                                                   |
| GET    | `/auth/profile`                     | Yes  | Get current user profile                                                             |
| PATCH  | `/auth/password`                    | Yes  | Change password (or set one for OAuth-only users)                                    |
| PATCH  | `/auth/email`                       | Yes  | Change email (requires current password)                                             |
| DELETE | `/auth/accounts/google`             | Yes  | Unlink Google account (requires a password set)                                      |
| GET    | `/health`                           | No   | Health check                                                                         |
| GET    | `/bank-accounts`                    | Yes  | List bank accounts                                                                   |
| GET    | `/bank-accounts/:id`                | Yes  | Get bank account by ID                                                               |
| POST   | `/bank-accounts`                    | Yes  | Create bank account                                                                  |
| PATCH  | `/bank-accounts/:id`                | Yes  | Update bank account                                                                  |
| DELETE | `/bank-accounts/:id`                | Yes  | Archive bank account                                                                 |
| PATCH  | `/bank-accounts/:id/restore`        | Yes  | Restore archived bank account                                                        |
| PATCH  | `/bank-accounts/:id/default`        | Yes  | Set bank account as default                                                          |
| GET    | `/categories`                       | Yes  | List categories                                                                      |
| GET    | `/categories/:id`                   | Yes  | Get category by ID                                                                   |
| POST   | `/categories`                       | Yes  | Create category                                                                      |
| PATCH  | `/categories/:id`                   | Yes  | Update category                                                                      |
| DELETE | `/categories/:id`                   | Yes  | Archive category                                                                     |
| PATCH  | `/categories/:id/restore`           | Yes  | Restore archived category                                                            |
| GET    | `/transactions`                     | Yes  | List transactions for a period, including virtual recurring occurrences              |
| GET    | `/transactions/:id`                 | Yes  | Get transaction by ID                                                                |
| POST   | `/transactions`                     | Yes  | Create normal, installment, or recurring transaction                                 |
| PATCH  | `/transactions/:id`                 | Yes  | Update transaction; installment transactions support `THIS` or `ALL_REMAINING` scope |
| DELETE | `/transactions/:id`                 | Yes  | Delete transaction; installment transactions support `THIS` or `ALL_REMAINING` scope |
| GET    | `/transactions/summary`             | Yes  | Get income/expense summary for period                                                |
| GET    | `/transactions/summary-by-category` | Yes  | Get summary grouped by category                                                      |
| GET    | `/transactions/summary-by-period`   | Yes  | Get monthly summary over N months                                                    |
| GET    | `/transactions/balance-over-time`   | Yes  | Get daily balance evolution                                                          |
| GET    | `/recurring-rules`                  | Yes  | List active recurring rules                                                          |
| PATCH  | `/recurring-rules/:id`              | Yes  | Update one occurrence or this and future occurrences                                 |
| DELETE | `/recurring-rules/:id/occurrence`   | Yes  | Cancel one occurrence or this and future occurrences                                 |
| DELETE | `/recurring-rules/:id`              | Yes  | End a recurring rule from a given date                                               |
| GET    | `/dashboard`                        | Yes  | Get consolidated dashboard data                                                      |
| GET    | `/personal-access-tokens`           | Yes  | List active personal access tokens                                                   |
| POST   | `/personal-access-tokens`           | Yes  | Create a personal access token (plaintext returned only once)                        |
| DELETE | `/personal-access-tokens/:id`       | Yes  | Revoke a personal access token                                                       |
| POST   | `/mcp`                              | PAT  | MCP server (Streamable HTTP, stateless, read-only tools)                             |

### Personal access tokens and MCP

- Personal access tokens (`ffpat_…`) exist only for machine clients of `/mcp`. They are stored as SHA-256 hashes, revocable, max 10 active per user, and `lastUsedAt` is throttled to one write per minute.
- `/mcp` authenticates with `Authorization: Bearer ffpat_…` via `authenticatePersonalAccessToken()`. The REST API keeps using `request.getCurrentUserId()` (JWT only), so a PAT can't reach REST routes or create other tokens, and a session JWT can't reach `/mcp`.
- `/mcp` must not send `WWW-Authenticate` on 401: MCP clients such as agentes.chat would start OAuth discovery.
- Each request builds a fresh `McpServer` scoped to the token's user (stateless, `enableJsonResponse`), so it works across restarts and replicas. Each tool callback is wrapped in `toolHandler()`, which serializes the result as JSON and logs `tool`, `userId`, `tokenId`, `durationMs` (and the error on failure).
- Tools reuse use-case functions (`getSummary`, `getSummaryByCategory`, `getSummaryByPeriod`, `listTransactions`) and repositories; never duplicate query logic in a tool. Mark read tools with `READ_ONLY_ANNOTATIONS`, reuse module enums (`categoryType`, `transactionType`), and register new tools in `MCP_TOOLS` (`tools/index.ts`). Amounts stay in centavos and the server instructions tell the agent so.

### Email/password flow

1. `register` handler hashes password with Argon2, checks email uniqueness
2. `login` handler verifies password hash, rejects OAuth-only users (null passwordHash)

### Google OAuth flow

1. Frontend sends Google ID token to `POST /auth/google`
2. `verifyGoogleToken()` validates token with Google's public keys, checks email is verified
3. `findOrCreateOAuthUser()` handles three cases:
   - Account exists (by `providerAccountId`) → return user
   - User exists (by email) → link account in a transaction
   - Neither → create user + account + seed default categories in a transaction

### Default categories

`seedCategories(prisma, userId)` in `modules/auth/helpers/seed-categories.ts` creates 16 default categories (12 expense + 4 income) for a new user. Called inside the registration transaction for both email/password and Google OAuth flows. Idempotent via `createMany({ skipDuplicates: true })`.

### Database models

```
User:        id, name, email, passwordHash?, avatarUrl?, accounts[], bankAccounts[], categories[], transactions[], recurringRules[], installmentGroups[]
Account:     id, provider (enum: GOOGLE), providerAccountId, userId
BankAccount: id, name, type (enum: CHECKING|SAVINGS|CASH|OTHER), color, icon, initialBalance, currentBalance, archived, userId
Category:    id, name, type (enum: INCOME|EXPENSE), color, icon, isDefault, archived, userId — unique(userId, name, type)
Transaction: id, type (enum: INCOME|EXPENSE|TRANSFER), amount (Int, centavos), description, date, isPaid, notes?, transferId?, installmentGroupId?, installmentNumber?, userId, bankAccountId, categoryId
RecurringRule: id, type (INCOME|EXPENSE), amount, description, frequency, startDate, endDate?, isPaid, notes?, userId, bankAccountId, categoryId
RecurringOverride: id, recurringRuleId, occurrenceDate, isCancelled, transactionId?
InstallmentGroup: id, totalAmount, count, userId, transactions[]
PersonalAccessToken: id, name, tokenHash (unique), tokenPrefix, lastUsedAt?, revokedAt?, userId
```

**Monetary values are stored as `Int` in centavos** (e.g. R$10,50 = `1050`). Never use floats for money.

Recurring rules are not expanded into persisted transactions automatically. `getRecurringOccurrences()` generates virtual transactions for bounded periods and uses deterministic IDs in the format `recurring:<ruleId>:<YYYY-MM-DD>`. Keep date calculations for recurrence/installments in UTC helpers to avoid timezone drift for `@db.Date` fields.

`BankAccount.currentBalance` is recalculated from persisted paid transactions only. Virtual recurring occurrences are included in period list/summary endpoints, but they do not update the materialized account balance.

`passwordHash` is nullable — OAuth-only users have no password. The `Account` table allows multiple providers per user. Adding a new provider: add enum value, add verification function, add route.

Deleting a `Category` that has `Transaction` records is blocked (`onDelete: Restrict`) — reassign or delete transactions first.

## Error handling

All errors extend `HttpError(statusCode, message)`. The global error handler catches:

- `HttpError` → responds with statusCode + message
- `ZodError` → 400 + validation issues
- Unknown → 500

## Environment variables

| Variable           | Required | Default     | Description                            |
| ------------------ | -------- | ----------- | -------------------------------------- |
| `DATABASE_URL`     | Yes      | —           | PostgreSQL connection string           |
| `JWT_SECRET`       | Yes      | —           | Secret for signing JWTs                |
| `GOOGLE_CLIENT_ID` | Yes      | —           | Google OAuth client ID                 |
| `PORT`             | No       | 3333        | Server port                            |
| `NODE_ENV`         | No       | development | `development`, `production`, or `test` |
