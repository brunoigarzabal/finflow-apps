import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@workspace/ui/lib/utils'

import { getIconByName } from '@/lib/icons'

type Props = {
  value: string
  onChange: (icon: string) => void
  icons: string[]
}

export const IconPicker = ({ value, onChange, icons }: Props) => (
  <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
    {icons.map((name) => (
      <button
        key={name}
        type="button"
        className={cn(
          'flex size-9 cursor-pointer items-center justify-center rounded-md border',
          value === name
            ? 'border-primary bg-accent'
            : 'border-transparent hover:bg-muted'
        )}
        onClick={() => onChange(name)}
        title={name}
      >
        <HugeiconsIcon
          icon={getIconByName(name)}
          strokeWidth={1.5}
          className="size-5"
        />
      </button>
    ))}
  </div>
)
