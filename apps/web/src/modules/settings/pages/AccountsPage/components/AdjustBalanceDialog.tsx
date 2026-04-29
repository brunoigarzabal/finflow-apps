import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Label } from '@workspace/ui/components/label'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import type { BankAccount } from '@/api/bank-accounts'
import { useCategories } from '@/api/categories'
import { useCreateTransaction } from '@/api/transactions'
import { MoneyInput } from '@/components/common/MoneyInput'

const adjustBalanceSchema = z.object({
  balance: z.number().int().min(0, 'O saldo deve ser positivo'),
})

type AdjustBalanceFormData = z.infer<typeof adjustBalanceSchema>

type Props = {
  account: BankAccount | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AdjustBalanceDialog = ({ account, open, onOpenChange }: Props) => {
  const createTransaction = useCreateTransaction()
  const { data: expenseCategories } = useCategories({ type: 'EXPENSE' })
  const { data: incomeCategories } = useCategories({ type: 'INCOME' })

  const { handleSubmit, control, reset } = useForm<AdjustBalanceFormData>({
    resolver: zodResolver(adjustBalanceSchema),
    defaultValues: { balance: 0 },
  })

  useEffect(() => {
    if (!open || !account) return
    reset({ balance: account.currentBalance })
  }, [open, account, reset])

  const onSubmit = (data: AdjustBalanceFormData) => {
    if (!account) return

    const diff = data.balance - account.currentBalance

    if (diff === 0) {
      toast.info('O saldo informado é igual ao saldo atual')
      onOpenChange(false)
      return
    }

    const isIncome = diff > 0

    const defaultCategory = isIncome
      ? (incomeCategories?.categories.find((c) => c.slug === 'other') ??
        incomeCategories?.categories.find((c) => c.isDefault))
      : (expenseCategories?.categories.find((c) => c.slug === 'other') ??
        expenseCategories?.categories.find((c) => c.isDefault))

    if (!defaultCategory) {
      toast.error('Categoria padrão não encontrada')
      return
    }

    createTransaction.mutate(
      {
        type: isIncome ? 'INCOME' : 'EXPENSE',
        amount: Math.abs(diff),
        description: 'Ajuste de saldo',
        date: new Date().toISOString().split('T')[0],
        bankAccountId: account.id,
        categoryId: defaultCategory.id,
        isPaid: true,
      },
      {
        onSuccess: () => {
          toast.success('Saldo ajustado')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : 'Erro ao ajustar saldo'
          )
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar saldo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Novo saldo</Label>
            <Controller
              name="balance"
              control={control}
              render={({ field }) => (
                <MoneyInput value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createTransaction.isPending}>
              Ajustar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
