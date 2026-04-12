import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'

export const Route = createFileRoute('/_authenticated/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <Fragment>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Lançamentos</h1>
      </div>
    </Fragment>
  )
}
