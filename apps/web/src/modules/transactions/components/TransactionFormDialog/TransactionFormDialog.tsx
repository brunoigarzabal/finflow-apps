import { zodResolver } from '@hookform/resolvers/zod'
import {
  Calendar01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Fragment, useEffect, useMemo, useState } from 'react'
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

const buildDefaultValues = (type: TransactionType): TransactionFormData => ({
  amount: 0,
  description: type === 'TRANSFER' ? 'Transferência' : '',
  date: format(new Date(), 'yyyy-MM-dd'),
  bankAccountId: '',
  categoryId: '',
  isPaid: true,
  notes: '',
})

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

  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const filteredCategories = useMemo(
    () => (isTransfer ? [] : categories.filter((c) => c.type === type)),
    [categories, type, isTransfer]
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
    defaultValues: buildDefaultValues(type),
  })

  const selectedBankAccountId = watch('bankAccountId')

  const destinationAccounts = useMemo(
    () => bankAccounts.filter((a) => a.id !== selectedBankAccountId),
    [bankAccounts, selectedBankAccountId]
  )

  useEffect(() => {
    if (open) {
      if (transaction) {
        const isEditingTransfer = transaction.type === 'TRANSFER'
        const originId =
          isEditingTransfer && transaction.isTransferOut === false
            ? (transaction.relatedBankAccount?.id ?? transaction.bankAccount.id)
            : transaction.bankAccount.id
        const destinationId =
          isEditingTransfer && transaction.isTransferOut === false
            ? transaction.bankAccount.id
            : transaction.relatedBankAccount?.id

        reset({
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date.slice(0, 10),
          bankAccountId: originId,
          categoryId: transaction.category?.id ?? '',
          isPaid: transaction.isPaid,
          notes: '',
          ...(isEditingTransfer && destinationId
            ? { destinationBankAccountId: destinationId }
            : {}),
        })
      } else {
        reset(buildDefaultValues(type))
      }
    }
  }, [open, transaction, type, reset])

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
            ...(isTransfer ? {} : { categoryId: data.categoryId }),
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
          ...(isTransfer ? {} : { categoryId: data.categoryId }),
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

            <div className="flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
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

              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="date">Data</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => {
                    const selectedDate = field.value
                      ? parse(field.value, 'yyyy-MM-dd', new Date())
                      : undefined
                    return (
                      <Popover
                        open={datePickerOpen}
                        onOpenChange={setDatePickerOpen}
                      >
                        <PopoverTrigger
                          id="date"
                          type="button"
                          aria-invalid={!!errors.date}
                          className="flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                        >
                          <span
                            className={cn(
                              !selectedDate && 'text-muted-foreground'
                            )}
                          >
                            {selectedDate
                              ? format(selectedDate, 'dd/MM/yyyy')
                              : 'Selecione a data'}
                          </span>
                          <HugeiconsIcon
                            icon={Calendar01Icon}
                            strokeWidth={2}
                            className="size-4 text-muted-foreground"
                          />
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            locale={ptBR}
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, 'yyyy-MM-dd'))
                                setDatePickerOpen(false)
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    )
                  }}
                />
                {errors.date && (
                  <p className="text-xs text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {!isTransfer && (
                <Controller
                  name="isPaid"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      title={field.value ? 'Pago' : 'Pendente'}
                      className="flex h-9 shrink-0 cursor-pointer items-center justify-center px-1"
                    >
                      <HugeiconsIcon
                        icon={field.value ? ThumbsUpIcon : ThumbsDownIcon}
                        strokeWidth={2}
                        className={cn(
                          'size-5',
                          field.value
                            ? 'text-emerald-500'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  )}
                />
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>{isTransfer ? 'Saiu da conta' : 'Conta'}</Label>
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

              {isTransfer ? (
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Entrou na conta</Label>
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
              ) : (
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Categoria</Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
              )}
            </div>

            {!isTransfer && (
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
            )}

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
