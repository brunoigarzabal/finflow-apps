import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import {
  Search01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

const Combobox = ComboboxPrimitive.Root

function ComboboxTrigger({
  className,
  size = 'default',
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props & {
  size?: 'sm' | 'default'
}) {
  return (
    <ComboboxPrimitive.InputGroup data-slot="combobox-trigger">
      <ComboboxPrimitive.Trigger
        data-size={size}
        className={cn(
          "flex w-fit items-center justify-between gap-1.5 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      >
        {children}
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          strokeWidth={2}
          className="pointer-events-none size-4 text-muted-foreground"
        />
      </ComboboxPrimitive.Trigger>
    </ComboboxPrimitive.InputGroup>
  )
}

function ComboboxValue({
  className,
  ...props
}: ComboboxPrimitive.Value.Props & { className?: string }) {
  return (
    <span
      data-slot="combobox-value"
      className={cn(
        'line-clamp-1 flex flex-1 items-center gap-1.5 text-left',
        className
      )}
    >
      <ComboboxPrimitive.Value {...props} />
    </span>
  )
}

function ComboboxContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            'dark relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-hidden rounded-3xl bg-popover/70 text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      data-slot="combobox-search"
      className="flex items-center gap-2 border-b border-foreground/5 px-3 py-2"
    >
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={2}
        className="size-4 shrink-0 text-muted-foreground"
      />
      <ComboboxPrimitive.Input
        ref={inputRef}
        data-slot="combobox-input"
        className={cn(
          'flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground',
          className
        )}
        {...props}
      />
    </div>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        'max-h-[min(18.75rem,var(--available-height))] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 outline-none',
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 text-sm font-medium outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2}
          className="pointer-events-none"
        />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn('p-4 text-center text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn('scroll-my-1.5 p-1.5', className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn('px-3 py-2.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
}
