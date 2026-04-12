import { forwardRef, useEffect, useState } from 'react'

import { Input } from '@workspace/ui/components/input'

import { formatCurrency } from '@/lib/formatCurrency'

type Props = {
  value: number
  onChange: (cents: number) => void
} & Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>

export const MoneyInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, ...props }, ref) => {
    const [display, setDisplay] = useState(() => formatCurrency(value))

    useEffect(() => {
      setDisplay(formatCurrency(value))
    }, [value])

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      const raw = e.currentTarget.value.replace(/\D/g, '')
      const cents = raw === '' ? 0 : parseInt(raw, 10)
      onChange(cents)
      setDisplay(formatCurrency(cents))
    }

    return (
      <Input
        {...props}
        ref={ref}
        inputMode="numeric"
        placeholder="R$ 0,00"
        value={display}
        onInput={handleInput}
        onChange={() => {}}
      />
    )
  }
)

MoneyInput.displayName = 'MoneyInput'
