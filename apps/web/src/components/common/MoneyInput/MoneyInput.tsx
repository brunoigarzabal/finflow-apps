import { Input } from '@workspace/ui/components/input'
import { forwardRef, useState } from 'react'

import { formatCurrency } from '@/lib/formatCurrency'

type Props = {
  value: number
  onChange: (cents: number) => void
  allowNegative?: boolean
} & Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>

const formatDisplay = (absCents: number, negative: boolean): string =>
  negative ? `-${formatCurrency(absCents)}` : formatCurrency(absCents)

export const MoneyInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, allowNegative = false, onKeyDown, ...props }, ref) => {
    const [isNegative, setIsNegative] = useState(allowNegative && value < 0)
    const [prevValue, setPrevValue] = useState(value)

    if (prevValue !== value) {
      setPrevValue(value)
      setIsNegative(allowNegative && value < 0)
    }

    const absCents = Math.abs(value)
    const display = formatDisplay(absCents, isNegative)

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      const raw = e.currentTarget.value
      const digits = raw.replace(/\D/g, '')
      const parsed = digits === '' ? 0 : parseInt(digits, 10)
      const signed = isNegative && allowNegative ? -parsed : parsed
      onChange(signed)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (allowNegative && (e.key === '-' || e.key === 'Subtract')) {
        e.preventDefault()
        const newNeg = !isNegative
        setIsNegative(newNeg)
        onChange(newNeg ? -absCents : absCents)
      }
      onKeyDown?.(e)
    }

    return (
      <Input
        {...props}
        ref={ref}
        inputMode="numeric"
        placeholder={isNegative ? '-R$ 0,00' : 'R$ 0,00'}
        value={display}
        onInput={handleInput}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
      />
    )
  }
)

MoneyInput.displayName = 'MoneyInput'
