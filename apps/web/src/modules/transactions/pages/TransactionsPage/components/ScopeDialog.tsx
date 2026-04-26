import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import type { ReactNode } from 'react'
import { useState } from 'react'

type ScopeOption<T extends string> = {
  value: T
  label: string
  visible?: boolean
}

type Props<T extends string> = {
  open: boolean
  title: string
  description: ReactNode
  options: ScopeOption<T>[]
  defaultScope: T
  isPending?: boolean
  confirmVariant?: 'default' | 'destructive'
  confirmLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: (scope: T) => void
}

export const ScopeDialog = <T extends string>({
  open,
  title,
  description,
  options,
  defaultScope,
  isPending = false,
  confirmVariant = 'default',
  confirmLabel,
  onOpenChange,
  onConfirm,
}: Props<T>) => {
  const [scope, setScope] = useState<T>(defaultScope)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 text-sm">
          {options
            .filter((opt) => opt.visible !== false)
            .map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  checked={scope === option.value}
                  onChange={() => setScope(option.value)}
                  className="size-4 accent-emerald-500"
                />
                {option.label}
              </label>
            ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant}
            disabled={isPending}
            onClick={() => onConfirm(scope)}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
