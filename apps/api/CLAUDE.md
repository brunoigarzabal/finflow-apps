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
├── env.ts                 # Zod-validated environment variables
├── errors/                # HttpError base class + BadRequest, Unauthorized, NotFound, Conflict
├── lib/
│   └── prisma.ts          # Prisma plugin — decorates app.prisma
├── plugins/
│   ├── auth.ts            # Decorates request.getCurrentUserId() via JWT
│   └── error-handler.ts   # Global error handler (HttpError, ZodError, Fastify errors)
└── modules/
    ├── auth/              # Authentication module
    │   ├── auth.routes.ts
    │   ├── auth.schemas.ts
    │   ├── auth.service.ts
    │   ├── oauth.service.ts
    │   └── seed-categories.ts  # Default categories seeded on user creation
    └── health/            # Health check endpoint
```

## Plugin registration order (app.ts)

1. `@fastify/cors` — credentials: true, origin from frontend URL
2. `@fastify/cookie`
3. `@fastify/swagger` + `@fastify/swagger-ui`
4. `@fastify/jwt` — reads token from httpOnly cookie named `token`
5. `prismaPlugin` — decorates `app.prisma`
6. `errorHandler` — global error handler
7. `authPlugin` — decorates `request.getCurrentUserId()`
8. Route modules registered with prefixes (`/auth`, `/health`)

## Authentication system

### JWT cookies

- Token contains `{ sub: userId }` with 7-day expiry
- Stored as httpOnly cookie (`secure` in production, `sameSite: lax`)
- `issueAuthToken(reply, userId)` helper handles sign + cookie for all auth routes

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create account (email/password) |
| POST | `/auth/login` | No | Login with email/password |
| POST | `/auth/google` | No | Login/register with Google ID token |
| POST | `/auth/logout` | No | Clear token cookie |
| GET | `/auth/profile` | Yes | Get current user profile |
| GET | `/health` | No | Health check |

### Email/password flow

1. `createUser()` hashes password with Argon2, checks email uniqueness
2. `authenticateUser()` verifies password hash, rejects OAuth-only users (null passwordHash)

### Google OAuth flow

1. Frontend sends Google ID token to `POST /auth/google`
2. `verifyGoogleToken()` validates token with Google's public keys, checks email is verified
3. `findOrCreateOAuthUser()` handles three cases:
   - Account exists (by `providerAccountId`) → return user
   - User exists (by email) → link account in a transaction
   - Neither → create user + account + seed default categories in a transaction

### Default categories

`seedCategories(prisma, userId)` in `seed-categories.ts` creates 16 default categories (12 expense + 4 income) for a new user. Called inside the registration transaction for both email/password and Google OAuth flows. Idempotent via `createMany({ skipDuplicates: true })`.

### Database models

```
User:        id, name, email, passwordHash?, avatarUrl?, accounts[], bankAccounts[], categories[], transactions[]
Account:     id, provider (enum: GOOGLE), providerAccountId, userId
BankAccount: id, name, type (enum: CHECKING|SAVINGS|CASH|OTHER), color, icon, initialBalance, currentBalance, archived, userId
Category:    id, name, type (enum: INCOME|EXPENSE), color, icon, isDefault, userId — unique(userId, name, type)
Transaction: id, type (enum: INCOME|EXPENSE|TRANSFER), amount (Int, centavos), description, date, isPaid, notes?, transferId?, userId, bankAccountId, categoryId
```

**Monetary values are stored as `Int` in centavos** (e.g. R$10,50 = `1050`). Never use floats for money.

`passwordHash` is nullable — OAuth-only users have no password. The `Account` table allows multiple providers per user. Adding a new provider: add enum value, add verification function, add route.

Deleting a `Category` that has `Transaction` records is blocked (`onDelete: Restrict`) — reassign or delete transactions first.

## Module pattern

Each module exports an async route registration function:

```
modules/<feature>/
├── index.ts               # Barrel export
├── <feature>.routes.ts    # Route handlers
├── <feature>.schemas.ts   # Zod request/response schemas
└── <feature>.service.ts   # Business logic (receives prisma as argument)
```

## Error handling

All errors extend `HttpError(statusCode, message)`. The global error handler catches:
- `HttpError` → responds with statusCode + message
- `ZodError` → 400 + validation issues
- Unknown → 500

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs |
| `GOOGLE_CLIENT_ID` | Yes | — | Google OAuth client ID |
| `PORT` | No | 3333 | Server port |
| `NODE_ENV` | No | development | `development`, `production`, or `test` |
