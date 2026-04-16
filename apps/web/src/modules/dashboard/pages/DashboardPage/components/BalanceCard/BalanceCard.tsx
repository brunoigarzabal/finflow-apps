import { EyeIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Fragment } from 'react'

import { useDashboard } from '@/api/dashboard'
import { BankAccountIcon } from '@/components/common/BankAccountIcon'
import { formatCurrency } from '@/lib/formatCurrency'
import { usePrivacyStore } from '@/store'

import { HiddenValue } from '../HiddenValue'

export const BalanceCard = () => {
  const { data, isLoading } = useDashboard()
  const isHidden = usePrivacyStore((s) => s.isHidden)
  const toggleHidden = usePrivacyStore((s) => s.toggleHidden)

  const accounts = data?.bankAccounts ?? []

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-primary/8" />
      <div className="pointer-events-none absolute top-16 -right-4 size-28 rounded-full bg-primary/5" />

      <CardHeader className="relative flex flex-row items-start justify-between pb-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Saldo total
          </span>
          {isLoading ? (
            <Skeleton className="h-10 w-52" />
          ) : (
            <HiddenValue
              value={formatCurrency(data?.totalBalance ?? 0)}
              className="text-4xl font-bold tracking-tight"
            />
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={toggleHidden}>
          <HugeiconsIcon
            icon={isHidden ? ViewOffIcon : EyeIcon}
            strokeWidth={2}
            className="size-4"
          />
          <span className="sr-only">
            {isHidden ? 'Mostrar valores' : 'Ocultar valores'}
          </span>
        </Button>
      </CardHeader>

      <CardContent className="relative flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-44 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Fragment>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta cadastrada
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm"
                  >
                    <BankAccountIcon
                      icon={account.icon}
                      color={account.color}
                      className="size-9"
                      iconClassName="size-4"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {account.name}
                      </span>
                      <HiddenValue
                        value={formatCurrency(account.currentBalance)}
                        className="text-sm font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Fragment>
        )}
      </CardContent>

      <CardFooter className="relative">
        <Link
          to="/settings/accounts"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Gerenciar contas
        </Link>
      </CardFooter>
    </Card>
  )
}
