import { EyeIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Fragment } from 'react'

import { useDashboard } from '@/api/dashboard'
import { formatCurrency } from '@/lib/formatCurrency'
import { getIconByName } from '@/lib/icons'
import { usePrivacyStore } from '@/store'

import { HiddenValue } from '../HiddenValue'

export const BalanceCard = () => {
  const { data, isLoading } = useDashboard()
  const isHidden = usePrivacyStore((s) => s.isHidden)
  const toggleHidden = usePrivacyStore((s) => s.toggleHidden)

  const accounts = data?.bankAccounts ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Saldo total</CardTitle>
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

      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Fragment>
            <Skeleton className="h-8 w-36" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <HiddenValue
              value={formatCurrency(data?.totalBalance ?? 0)}
              className="text-3xl font-bold"
            />

            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta cadastrada
              </p>
            ) : (
              <div className="flex flex-col">
                {accounts.map((account) => {
                  const icon = getIconByName(account.icon)
                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: account.color }}
                        >
                          <HugeiconsIcon
                            icon={icon}
                            strokeWidth={1.5}
                            className="size-4 text-white"
                          />
                        </div>
                        <span className="text-sm">{account.name}</span>
                      </div>
                      <HiddenValue
                        value={formatCurrency(account.currentBalance)}
                        className="text-sm font-medium"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </Fragment>
        )}
      </CardContent>

      <CardFooter>
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
