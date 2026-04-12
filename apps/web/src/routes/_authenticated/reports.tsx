import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'

export const Route = createFileRoute('/_authenticated/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  return (
    <Fragment>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
      </div>
    </Fragment>
  )
}
