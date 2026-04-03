## Development rules

### Before writing code

- **Search before implementing**: always search the codebase for existing components, hooks, utilities, variants, and constants before creating new ones. Reuse and extend what exists.
- **Read before modifying**: read the file and surrounding context before proposing changes. Understand the existing patterns in that module.

### Styling

- Always use `rem` instead of `px` for all sizing (spacing, font-size, border-radius, etc.)
- Use Tailwind design tokens and CSS variables (`brand-orange`, `surface-primary`, etc.) — never hardcode hex colors or raw values
- Check `src/styles/variants/` for existing CVA variants before writing inline conditional classes. If a variant exists for that component, use it.
- Use the `cn()` utility from `src/lib/utils` for conditional class merging — never string concatenation
- Use existing shadow utilities (`shadow-card`, `shadow-panel`, `shadow-button-glass`) and layout helpers (`.h-stack`, `.v-stack`) defined in `utilities.css`

### Components

- Always use `<Fragment>` (imported from `react`) instead of `<></>`
- Always destructure props in the function parameter — never access `props.x` inside the body
- Use named exports for components — `export const Component = () => {}`. Default exports are only for Next.js page/layout files.
- Do not use `React.FC` — use plain arrow functions with typed props
- Props types are defined as `type Props = { ... }` (or `interface Props`) above the component in the same file
- Co-locate small, single-use sub-components in the same file or a `components/` subfolder next to the parent

### Naming conventions

- **Component files and folders**: PascalCase (`MetricCard.tsx`, `MetricCard/`)
- **Hook files**: camelCase with `use` prefix (`useDisclosure.ts`)
- **Utility files**: camelCase (`formatDate.ts`)
- **Constants**: `UPPER_SNAKE_CASE` for values, PascalCase for enums
- **Types/Interfaces**: PascalCase (`CustomerData`, `ChatMessage`)
- **Folder structure mirrors component name**: `ComponentName/ComponentName.tsx` with an `index.ts` barrel export

### Imports

- Use the `@/` alias for all absolute imports — never relative paths that climb more than one level (`../../`)
- Group imports: external libs → `@/` absolute imports → relative imports, with a blank line between groups
- Use barrel exports (`index.ts`) for public module APIs

### Logic & clean code

- Prefer early returns and guard clauses over deeply nested conditionals
- Keep functions small and focused — extract helpers when logic is reused
- Use `useCallback` for handlers passed as props to child components
- Avoid `any` — type everything. Use generics when the type varies.
- Do not add comments for self-explanatory code. Only comment complex business logic.
- Do not add colors directly in the style, firts check it out if has the tailwind variant wether has use it, wether not set the variant in the correct place.

### API layer (`apps/web/src/api/<resource>/`)

Each resource module follows this structure:

- `config.ts` — endpoint paths, query keys, mutation keys
- `types.ts` — request/response types
- `endpoints.ts` — raw HTTP calls using `httpClient`
- `hooks/` — TanStack Query hooks (`useLogin`, `useProfile`, etc.)
- `index.ts` — barrel export

Use `defineQuery` / `defineMutation` from `@/lib/react-query` to create hooks with consistent key/fn patterns.

### HTTP client (`apps/web/src/lib/httpClient/`)

Uses `ky` with `credentials: 'include'` for httpOnly cookie auth:

- `httpClient.authorized()` — includes a 401 response hook that clears auth state and redirects to `/sign-in`
- `httpClient.unauthorized()` — for public endpoints (login, register)

### Auth flow

- JWT is stored as an httpOnly cookie set by the API — frontend JS never touches the token
- `useAuthStore` (Zustand) holds an `isAuthenticated` boolean flag, persisted to localStorage
- Route guards: `_public.tsx` redirects authenticated users to `/`, `_authenticated.tsx` redirects unauthenticated users to `/sign-in`
- On 401 response, the httpClient clears the auth flag and redirects

### Form patterns

- `react-hook-form` + `zod` + `@hookform/resolvers/zod` for validation
- Schemas live in `modules/<feature>/schemas/`
- Per-field errors via `FieldError` component, `aria-invalid` on inputs
- API errors displayed via `setError('root')` + `FieldError`
- Loading state via `mutation.isPending` on submit button

### Module structure (`apps/web/src/modules/<feature>/`)

- `schemas/` — Zod validation schemas
- `pages/<PageName>/` — page component + co-located `components/` subfolder
- `index.ts` — barrel export for the module

## React guidelines

- MUST: Keep components small, focused, and pure; derive UI from props/state.
- MUST: Co-locate state; lift it only when multiple components need the same source of truth.
- MUST: Keep state minimal; compute derived values during render, not in state.
- MUST: Split effects by concern; each effect should synchronize one thing.
- MUST: Clean up effects; return a cleanup function for subscriptions/timers.
- MUST: Prefer data fetching with Suspense and Error Boundaries for async flows.
- MUST: Keep effects free of non-reactive dependencies; list all reactive deps explicitly.
- MUST: Handle errors with Error Boundaries around Suspense trees.
- MUST: Use semantic HTML elements (`<p>`, `<span>`, `<h1>-<h6>`, `<label>`, etc.) instead of generic `<div>` for text content.
- MUST: Create arrays and iterate through them with `.map()` instead of repeating similar HTML structures.
- MUST: Prefer flexbox with `gap` utilities (e.g., `gap-2`, `gap-4`) over excessive margin usage for spacing between elements.
- MUST NOT: Store derived data in state; don't mirror props or keep redundant copies.
- MUST NOT: Fetch data inside effects if server components/loaders can fetch during render.
- MUST NOT: Mutate props, state, or context; always treat them as immutable.
- MUST NOT: Call hooks conditionally or inside loops/nested functions.
- MUST NOT: Put multiple responsibilities in a single effect; avoid mega-effects.
- MUST NOT: Omit reactive dependencies; don't suppress hook lint rules to "fix" warnings.
- MUST NOT: Use array indexes as keys if list order can change.
- MUST NOT: Overuse memoization; don't wrap everything in `memo`, `useMemo`, or `useCallback` without measured need.
- MUST NOT: Trigger state updates during render; avoid setting state in render paths.
- MUST NOT: Keep long-lived subscriptions without cleanup; prevent memory leaks.
- MUST NOT: Use excessive `margin` classes (e.g., `mb-*`, `mt-*`, `mr-*`, `ml-*`) when flexbox with `gap` is more appropriate.
