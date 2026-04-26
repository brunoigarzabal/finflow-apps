import { Fragment } from 'react'

import type { RecurringScope, Transaction } from '@/api/transactions'

import { ScopeDialog } from './ScopeDialog'

export type RecurringDeleteScope = RecurringScope | 'ALL'

type Props = {
  transaction: Transaction | null
  open: boolean
  mode: 'edit' | 'delete'
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (scope: RecurringDeleteScope) => void
}

export const RecurringScopeDialog = ({
  transaction,
  open,
  mode,
  isPending = false,
  onOpenChange,
  onConfirm,
}: Props) => {
  const isDelete = mode === 'delete'

  return (
    <ScopeDialog<RecurringDeleteScope>
      open={open}
      title={
        isDelete
          ? 'Excluir lançamento recorrente'
          : 'Editar lançamento recorrente'
      }
      description={
        <Fragment>
          Escolha como aplicar a alteração em &quot;
          {transaction?.description}&quot;.
        </Fragment>
      }
      options={[
        { value: 'THIS', label: 'Apenas este lançamento' },
        { value: 'THIS_AND_FUTURE', label: 'Este e os próximos' },
        {
          value: 'ALL',
          label: 'Todos os lançamentos',
          visible: isDelete,
        },
      ]}
      defaultScope="THIS"
      isPending={isPending}
      confirmVariant={isDelete ? 'destructive' : 'default'}
      confirmLabel={isDelete ? 'Excluir' : 'Confirmar'}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  )
}
