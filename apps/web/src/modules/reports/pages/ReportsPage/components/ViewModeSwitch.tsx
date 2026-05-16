import { cn } from '@workspace/ui/lib/utils'
import { useCallback } from 'react'

import {
  ALL_VIEW_MODES,
  VALID_VIEW_MODES,
  VIEW_MODE_LABELS,
  type ReportPeriod,
  type ViewMode,
} from '../constants'

type Props = {
  period: ReportPeriod
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export const ViewModeSwitch = ({ period, value, onChange }: Props) => {
  const validModes = VALID_VIEW_MODES[period]

  const handleClick = useCallback(
    (mode: ViewMode) => {
      if (validModes.includes(mode)) {
        onChange(mode)
      }
    },
    [validModes, onChange]
  )

  return (
    <div className="flex items-center gap-4 text-sm">
      {ALL_VIEW_MODES.map((mode) => {
        const isEnabled = validModes.includes(mode)
        const isActive = mode === value

        return (
          <button
            key={mode}
            type="button"
            disabled={!isEnabled}
            onClick={() => handleClick(mode)}
            className={cn(
              'relative pb-1 transition-colors',
              isActive && 'font-medium text-chart-1',
              !isActive &&
                isEnabled &&
                'cursor-pointer text-muted-foreground hover:text-foreground',
              !isEnabled && 'cursor-default text-muted-foreground/40'
            )}
          >
            {VIEW_MODE_LABELS[mode]}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-chart-1" />
            )}
          </button>
        )
      })}
    </div>
  )
}
