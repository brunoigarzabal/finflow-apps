import { cn } from '@workspace/ui/lib/utils'

type Props = {
  value: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#78716c',
  '#64748b',
  '#475569',
  '#0f766e',
  '#9333ea',
  '#be123c',
  '#0f172a',
]

export const ColorPicker = ({ value, onChange }: Props) => (
  <div className="flex flex-wrap gap-2">
    {PRESET_COLORS.map((color) => (
      <button
        key={color}
        type="button"
        className={cn(
          'size-7 cursor-pointer rounded-full',
          value === color && 'ring-2 ring-foreground ring-offset-2'
        )}
        style={{ backgroundColor: color }}
        onClick={() => onChange(color)}
      />
    ))}
  </div>
)
