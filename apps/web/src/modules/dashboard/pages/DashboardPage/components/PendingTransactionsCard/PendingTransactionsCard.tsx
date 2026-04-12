import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Fragment } from 'react'

import type { TransactionType } from '@/api/transactions'
import { useTransactions } from '@/api/transactions'
import { today } from '@/lib/dates'
import { formatCurrency } from '@/lib/formatCurrency'
import { getIconByName } from '@/lib/icons'

import { HiddenValue } from '../HiddenValue'

type Props = {
  type: Extract<TransactionType, 'EXPENSE' | 'INCOME'>
}

const TITLE: Record<Props['type'], string> = {
  EXPENSE: 'Contas a pagar',
  INCOME: 'Contas a receber',
}

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export const PendingTransactionsCard = ({ type }: Props) => {
  const startDate = today()
  const { data, isLoading } = useTransactions({
    type,
    isPaid: false,
    startDate,
    perPage: 5,
  })

  const transactions = data?.transactions ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{TITLE[type]}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col">
        {isLoading ? (
          <Fragment>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </Fragment>
        ) : transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma conta pendente
          </p>
        ) : (
          transactions.map((transaction) => {
            const icon = getIconByName(transaction.categoryIcon ?? '')
            const color = transaction.categoryColor ?? '#94a3b8'
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: color }}
                  >
                    <HugeiconsIcon
                      icon={icon}
                      strokeWidth={1.5}
                      className="size-4 text-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {transaction.description}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(transaction.date)}
                    </span>
                  </div>
                </div>
                <HiddenValue
                  value={formatCurrency(transaction.amount)}
                  className="text-sm font-medium"
                />
              </div>
            )
          })
        )}
      </CardContent>

      <CardFooter>
        <Link
          to="/transactions"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ver mais
        </Link>
      </CardFooter>
    </Card>
  )
}
