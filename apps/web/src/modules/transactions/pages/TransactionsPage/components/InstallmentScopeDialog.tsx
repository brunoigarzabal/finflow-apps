import { Fragment } from 'react'

import type { InstallmentScope, Transaction } from '@/api/transactions'

import { ScopeDialog } from './ScopeDialog'

type Props = {
  transaction: Transaction | null
  open: boolean
  mode: 'edit' | 'delete'
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (scope: InstallmentScope) => void
}

export const InstallmentScopeDialog = ({
  transaction,
  open,
  mode,
  isPending = false,
  onOpenChange,
  onConfirm,
}: Props) => {
  const isDelete = mode === 'delete'
  const installmentLabel =
    transaction?.installmentNumber && transaction.installmentCount
      ? ` (${transaction.installmentNumber}/${transaction.installmentCount})`
      : ''

  return (
    <ScopeDialog<InstallmentScope>
      open={open}
      title={
        isDelete
          ? 'Excluir lançamento parcelado'
          : 'Editar lançamento parcelado'
      }
      description={
        <Fragment>
          Escolha como aplicar a alteração em &quot;
          {transaction?.description}&quot;.
        </Fragment>
      }
      options={[
        { value: 'THIS', label: `Apenas esta parcela${installmentLabel}` },
        { value: 'ALL_REMAINING', label: 'Esta e as próximas parcelas' },
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
