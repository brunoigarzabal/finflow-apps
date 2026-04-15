import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { Fragment, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { BankAccount } from '@/api/bank-accounts'
import type { Category } from '@/api/categories'
import { useCreateTransaction, useUpdateTransaction } from '@/api/transactions'
import type { Transaction, TransactionType } from '@/api/transactions'
import { MoneyInput } from '@/components/common/MoneyInput'
import {
  transactionSchema,
  transferSchema,
  type TransactionFormData,
} from '@/modules/transactions/schemas/transactionSchema'

const TYPE_CONFIG: Record<
  TransactionType,
  {
    label: string
    editLabel: string
    shortLabel: string
    color: string
    bgColor: string
  }
> = {
  EXPENSE: {
    label: 'Nova despesa',
    editLabel: 'Editar despesa',
    shortLabel: 'Despesa',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  INCOME: {
    label: 'Nova receita',
    editLabel: 'Editar receita',
    shortLabel: 'Receita',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  TRANSFER: {
    label: 'Nova transferência',
    editLabel: 'Editar transferência',
    shortLabel: 'Transferência',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
}

const DEFAULT_VALUES: TransactionFormData = {
  amount: 0,
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  bankAccountId: '',
  categoryId: '',
  isPaid: true,
  notes: '',
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: TransactionType
  transaction?: Transaction | null
  bankAccounts: BankAccount[]
  categories: Category[]
  onDelete?: (transaction: Transaction) => void
}

export const TransactionFormDialog = ({
  open,
  onOpenChange,
  type,
  transaction,
  bankAccounts,
  categories,
  onDelete,
}: Props) => {
  const isEditing = !!transaction
  const isTransfer = type === 'TRANSFER'
  const config = TYPE_CONFIG[type]

  const create = useCreateTransaction()
  const update = useUpdateTransaction()

  const categoryType = type === 'TRANSFER' ? 'EXPENSE' : type
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === categoryType),
    [categories, categoryType]
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(isTransfer ? transferSchema : transactionSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const selectedBankAccountId = watch('bankAccountId')

  const destinationAccounts = useMemo(
    () => bankAccounts.filter((a) => a.id !== selectedBankAccountId),
    [bankAccounts, selectedBankAccountId]
  )

  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date.slice(0, 10),
          bankAccountId: transaction.bankAccount.id,
          categoryId: transaction.category.id,
          isPaid: transaction.isPaid,
          notes: '',
        })
      } else {
        reset(DEFAULT_VALUES)
      }
    }
  }, [open, transaction, reset])

  const isPending = create.isPending || update.isPending

  const onSubmit = (data: TransactionFormData) => {
    if (isEditing && transaction) {
      update.mutate(
        {
          id: transaction.id,
          body: {
            amount: data.amount,
            description: data.description,
            date: data.date,
            bankAccountId: data.bankAccountId,
            categoryId: data.categoryId,
            isPaid: data.isPaid,
            notes: data.notes || null,
          },
        },
        {
          onSuccess: () => {
            toast.success('Lançamento atualizado')
            onOpenChange(false)
          },
          onError: (err) => {
            toast.error(
              err instanceof Error
                ? err.message
                : 'Erro ao atualizar lançamento'
            )
          },
        }
      )
    } else {
      create.mutate(
        {
          type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          bankAccountId: data.bankAccountId,
          categoryId: data.categoryId,
          isPaid: data.isPaid,
          notes: data.notes || undefined,
          ...(data.destinationBankAccountId
            ? { destinationBankAccountId: data.destinationBankAccountId }
            : {}),
        },
        {
          onSuccess: () => {
            toast.success('Lançamento criado')
            onOpenChange(false)
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : 'Erro ao criar lançamento'
            )
          },
        }
      )
    }
  }

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium',
                  config.bgColor,
                  config.color
                )}
              >
                {config.shortLabel}
              </span>
              {isEditing ? config.editLabel : config.label}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <MoneyInput
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.amount}
                  />
                )}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Mercado"
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                aria-invalid={!!errors.date}
                {...register('date')}
              />
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Conta</Label>
              <Controller
                name="bankAccountId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a conta">
                        {(value) =>
                          bankAccounts.find((a) => a.id === value)?.name ??
                          'Selecione a conta'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bankAccountId && (
                <p className="text-xs text-destructive">
                  {errors.bankAccountId.message}
                </p>
              )}
            </div>

            {isTransfer && (
              <div className="flex flex-col gap-1.5">
                <Label>Conta de destino</Label>
                <Controller
                  name="destinationBankAccountId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a conta de destino">
                          {(value) =>
                            bankAccounts.find((a) => a.id === value)?.name ??
                            'Selecione a conta de destino'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {destinationAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.destinationBankAccountId && (
                  <p className="text-xs text-destructive">
                    {errors.destinationBankAccountId.message}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Categoria</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a categoria">
                        {(value) =>
                          filteredCategories.find((c) => c.id === value)
                            ?.name ?? 'Selecione a categoria'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-xs text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="isPaid"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      'flex size-5 items-center justify-center rounded border transition-colors',
                      field.value
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-input'
                    )}
                  >
                    {field.value && (
                      <span className="text-xs font-bold">✓</span>
                    )}
                  </button>
                )}
              />
              <Label className="cursor-pointer">Pago</Label>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                placeholder="Observações opcionais"
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-xs text-destructive">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <DialogFooter>
              {isEditing && transaction && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(transaction)}
                  className="mr-auto"
                >
                  Excluir
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
