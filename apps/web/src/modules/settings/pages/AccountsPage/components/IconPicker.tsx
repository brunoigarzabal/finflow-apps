import { cn } from '@workspace/ui/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'

import { ICON_MAP, getIconByName } from '@/lib/icons'

const ICON_NAMES = Object.keys(ICON_MAP)

type Props = {
  value: string
  onChange: (icon: string) => void
}

export const IconPicker = ({ value, onChange }: Props) => (
  <div className="grid grid-cols-6 gap-2">
    {ICON_NAMES.map((name) => (
      <button
        key={name}
        type="button"
        className={cn(
          'flex size-9 cursor-pointer items-center justify-center rounded-md border',
          value === name ? 'border-primary bg-accent' : 'border-transparent hover:bg-muted'
        )}
        onClick={() => onChange(name)}
        title={name}
      >
        <HugeiconsIcon
          icon={ICON_MAP[name]}
          strokeWidth={1.5}
          className="size-5"
        />
      </button>
    ))}
  </div>
)

export { getIconByName }
