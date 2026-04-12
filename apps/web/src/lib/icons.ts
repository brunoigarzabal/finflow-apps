import {
  Airplane01Icon,
  BankIcon,
  Car01Icon,
  Cash01Icon,
  ChartBarLineIcon,
  Coins01Icon,
  CreditCardIcon,
  Home01Icon,
  MoneyBag01Icon,
  PiggyBankIcon,
  ShoppingBag01Icon,
  Wallet02Icon,
} from '@hugeicons/core-free-icons'
import type { HugeiconsIconProps } from '@hugeicons/react'

type HugeIcon = HugeiconsIconProps['icon']

export const ICON_MAP: Record<string, HugeIcon> = {
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

export const getIconByName = (name: string): HugeIcon =>
  ICON_MAP[name] ?? Wallet02Icon
