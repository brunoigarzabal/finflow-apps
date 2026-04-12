import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'

export const Route = createFileRoute('/_authenticated/settings/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  return (
    <Fragment>
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
      </div>
    </Fragment>
  )
}
