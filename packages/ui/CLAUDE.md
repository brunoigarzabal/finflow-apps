# UI Package

Shared component library for the FinFlow platform, built on shadcn/ui with the `base-luma` style.

## Component structure

Each component lives in its own folder under `src/components/<name>/` and follows this structure:

```
src/components/<name>/
├── <name>.tsx          # Component implementation
├── <name>.variants.ts  # CVA variants (only if the component has variants)
└── index.ts            # Barrel export
```

### Rules

- **Always** split CVA variants into a separate `<name>.variants.ts` file — never define them inline in the component file.
- **Always** import variants from `./\<name\>.variants` inside the component file.
- **Always** create an `index.ts` barrel export that re-exports the public API.
- Use `data-slot="<component-name>"` on root elements for styling hooks.
- Use `cn()` from `@workspace/ui/lib/utils` for class merging — never string concatenation.
- Follow the naming conventions from the root `CLAUDE.md`.

### Example

```ts
// button.variants.ts
import { cva } from 'class-variance-authority'

export const buttonVariants = cva('...base classes...', {
  variants: { variant: { default: '...', destructive: '...' } },
  defaultVariants: { variant: 'default' },
})
```

```tsx
// button.tsx
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@workspace/ui/lib/utils'
import { buttonVariants } from './button.variants'

function Button({ className, variant, ...props }: ... & VariantProps<typeof buttonVariants>) {
  return <div data-slot="button" className={cn(buttonVariants({ variant }), className)} {...props} />
}

export { Button }
```

```ts
// index.ts
export { Button } from './button'
export { buttonVariants } from './button.variants'
```

## Adding a new component via shadcn CLI

```bash
cd packages/ui
npx shadcn@latest add <component>
```

The CLI generates a flat `src/components/<name>.tsx`. After running it:

1. Create the `src/components/<name>/` folder.
2. Move the generated file into it and rename to `<name>.tsx`.
3. Extract CVA variants into `<name>.variants.ts`.
4. Create `index.ts` with barrel exports.
5. Update import paths inside the component file if needed.
