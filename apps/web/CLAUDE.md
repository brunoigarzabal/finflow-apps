# FinFlow Web

React SPA for the FinFlow platform. Communicates with the API via httpOnly cookie authentication.

## Tech stack

- **Framework**: React 19 + Vite 7
- **Routing**: TanStack Router (file-based, auto code-splitting)
- **Data fetching**: TanStack React Query 5
- **Forms**: react-hook-form + Zod + @hookform/resolvers
- **State**: Zustand (persisted auth flag)
- **HTTP**: ky with credential cookies
- **Styling**: Tailwind CSS 4 + shared `@workspace/ui` component library
- **OAuth**: @react-oauth/google (Google Identity Services)

## Running

```bash
pnpm --filter web dev   # starts on http://localhost:5173
```

## Project structure

```
src/
├── main.tsx                    # Entry point — router + providers
├── config/
│   └── env.ts                  # Environment variables (VITE_*)
├── providers/
│   └── GlobalProvider/         # GoogleOAuthProvider → ThemeProvider → QueryClientProvider
├── routes/                     # File-based TanStack Router routes
│   ├── __root.tsx              # Root layout with router context
│   ├── _public.tsx             # Guard: redirects authenticated → /
│   ├── _public/sign-in.tsx
│   ├── _public/sign-up.tsx
│   ├── _authenticated.tsx      # Guard: redirects unauthenticated → /sign-in
│   └── _authenticated/index.tsx
├── api/                        # API layer (one folder per resource)
│   └── auth/
│       ├── config.ts           # Endpoint paths, query/mutation keys
│       ├── types.ts            # Request/response types
│       ├── endpoints.ts        # Raw HTTP calls via httpClient
│       ├── hooks/              # TanStack Query hooks
│       └── index.ts            # Barrel export
├── lib/
│   ├── httpClient/             # ky instances (authorized / unauthorized)
│   └── react-query/            # QueryClient + defineQuery/defineMutation helpers
├── modules/
│   └── auth/
│       ├── pages/              # SignInPage, SignUpPage (+ co-located components)
│       ├── components/         # Shared auth components (GoogleLoginButton)
│       └── schemas/            # Zod validation schemas (signIn, signUp)
├── store/
│   └── useAuthStore.ts         # Zustand: isAuthenticated flag, persisted to localStorage
├── components/
│   ├── common/RouteLoading/    # Spinner shown during route transitions
│   └── theme-provider.tsx      # Light/dark theme with localStorage persistence
└── types/
    └── router.types.ts         # Router context type (QueryClient)
```

## Authentication flow

1. **Login/Register**: form submits via mutation hook → API sets httpOnly JWT cookie → `useAuthStore.setAuthenticated(true)` → navigate to `/`
2. **Authenticated requests**: `httpClient.authorized()` sends cookies automatically (ky with `credentials: 'include'`)
3. **401 handling**: `httpClient.authorized()` has a response hook that clears auth state and redirects to `/sign-in`
4. **Route guards**: `_public.tsx` and `_authenticated.tsx` check `useAuthStore` in `beforeLoad`
5. **Logout**: mutation calls API → clears cookie server-side → `setAuthenticated(false)` → redirect to `/sign-in`
6. **Google OAuth**: `GoogleLoginButton` component renders Google's sign-in button → on success sends ID token to `POST /auth/google` → same cookie flow as email login

### Auth state

`useAuthStore` (Zustand) holds only `isAuthenticated: boolean`, persisted to localStorage as `@finflow/auth`. The actual JWT lives in an httpOnly cookie — JS never reads it.

## API layer pattern

Each resource in `src/api/<resource>/` follows:

```
config.ts    → AUTH_ENDPOINTS, AUTH_QUERY_KEYS, AUTH_MUTATION_KEYS
types.ts     → LoginBody, RegisterBody, GoogleLoginBody, TokenResponse, etc.
endpoints.ts → login(), register(), googleLogin(), getProfile(), logout()
hooks/       → useLogin, useRegister, useGoogleLogin, useProfile, useLogout
index.ts     → barrel re-export of hooks and types
```

Hooks use `defineQuery()` / `defineMutation()` from `@/lib/react-query` for consistent key/fn binding with optional overrides.

## React Query helpers

- `defineQuery({ queryKey, queryFn })` → returns a curried function that calls `useQuery` with optional overrides
- `defineMutation({ mutationKey, mutationFn })` → same pattern for `useMutation`
- `defineQueryKey()` / `defineMutationKey()` → typed identity functions for key objects

## Module pattern

```
modules/<feature>/
├── pages/<PageName>/
│   ├── <PageName>.tsx          # Page component
│   ├── components/             # Co-located page-specific components
│   └── index.ts
├── components/                 # Shared feature components
├── schemas/                    # Zod schemas for forms
└── index.ts
```

## Provider hierarchy

```
GoogleOAuthProvider → ThemeProvider → QueryClientProvider → RouterProvider
```

Configured in `GlobalProvider`. The router receives `queryClient` as context.

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:3333` | API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Yes | — | Google OAuth client ID |
| `VITE_ENVIRONMENT` | No | — | `development` or `production` |
