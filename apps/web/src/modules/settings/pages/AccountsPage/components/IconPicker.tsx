import { cn } from '@workspace/ui/lib/utils'
import {
  Wallet02Icon,
  BankIcon,
  CreditCardIcon,
  MoneyBag01Icon,
  PiggyBankIcon,
  Cash01Icon,
  Coins01Icon,
  ChartBarLineIcon,
  Home01Icon,
  ShoppingBag01Icon,
  Car01Icon,
  Airplane01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { HugeiconsIconProps } from '@hugeicons/react'

type HugeIcon = HugeiconsIconProps['icon']

const ICONS: Record<string, HugeIcon> = {
  'wallet-02': Wallet02Icon,
  bank: BankIcon,
  'credit-card': CreditCardIcon,
  'money-bag-01': MoneyBag01Icon,
  'piggy-bank': PiggyBankIcon,
  'cash-01': Cash01Icon,
  coin: Coins01Icon,
  'chart-bar-01': ChartBarLineIcon,
  'home-01': Home01Icon,
  'shopping-bag-01': ShoppingBag01Icon,
  'car-01': Car01Icon,
  'airplane-01': Airplane01Icon,
}

const ICON_NAMES = Object.keys(ICONS)

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
          icon={ICONS[name]}
          strokeWidth={1.5}
          className="size-5"
        />
      </button>
    ))}
  </div>
)

export const getIconByName = (name: string): HugeIcon =>
  ICONS[name] ?? Wallet02Icon
