import { cn } from '@workspace/ui/lib/utils'

type Props = {
  value: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#64748b',
]

export const ColorPicker = ({ value, onChange }: Props) => (
  <div className="flex flex-wrap gap-2">
    {PRESET_COLORS.map((color) => (
      <button
        key={color}
        type="button"
        className={cn('size-7 rounded-full cursor-pointer', value === color && 'ring-2 ring-offset-2 ring-foreground')}
        style={{ backgroundColor: color }}
        onClick={() => onChange(color)}
      />
    ))}
  </div>
)
