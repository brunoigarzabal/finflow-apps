import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowUpDownIcon,
  Calendar01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@workspace/ui/components/combobox'
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
import { cn } from '@workspace/ui/lib/utils'
import { endOfMonth, format, parse, startOfDay, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { BankAccount } from '@/api/bank-accounts'
import type { Category } from '@/api/categories'
import { useUpdateRecurringRule } from '@/api/recurring-rules'
import { useCreateTransaction, useUpdateTransaction } from '@/api/transactions'
import type {
  CreateTransactionBody,
  InstallmentScope,
  RecurringScope,
  Transaction,
  TransactionType,
  UpdateTransactionBody,
} from '@/api/transactions'
import { BankAccountIcon } from '@/components/common/BankAccountIcon'
import { MoneyInput } from '@/components/common/MoneyInput'
import { today } from '@/lib/dates'
import { getIconByName } from '@/lib/icons'
import {
  transactionSchema,
  transferSchema,
  type TransactionFormData,
} from '@/modules/transactions/schemas/transactionSchema'

import { RepeatSection } from './RepeatSection'

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

function isTransactionDateStrictlyFuture(ymd: string): boolean {
  const d = startOfDay(parse(ymd, 'yyyy-MM-dd', new Date()))
  if (Number.isNaN(d.getTime())) return false
  return d > startOfDay(new Date())
}

function defaultDateYmdForViewedMonth(viewedMonth?: Date): string {
  if (!viewedMonth) return today()
  const now = startOfDay(new Date())
  const monthStart = startOfDay(startOfMonth(viewedMonth))
  const monthEnd = startOfDay(endOfMonth(viewedMonth))
  if (now >= monthStart && now <= monthEnd) {
    return today()
  }
  return format(monthStart, 'yyyy-MM-dd')
}

const buildDefaultValues = (
  type: TransactionType,
  viewedMonth?: Date,
  firstBankAccountId?: string
): TransactionFormData => {
  const date = defaultDateYmdForViewedMonth(viewedMonth)
  return {
    amount: 0,
    description: type === 'TRANSFER' ? 'Transferência' : '',
    date,
    bankAccountId: firstBankAccountId ?? '',
    categoryId: '',
    isPaid: !isTransactionDateStrictlyFuture(date),
    notes: '',
  }
}

const buildTransactionValues = (
  transaction: Transaction
): TransactionFormData => {
  const isEditingTransfer = transaction.type === 'TRANSFER'
  let originId = transaction.bankAccount.id
  let destinationId = transaction.relatedBankAccount?.id

  if (isEditingTransfer && transaction.isTransferOut === false) {
    originId = transaction.relatedBankAccount?.id ?? transaction.bankAccount.id
    destinationId = transaction.bankAccount.id
  }

  return {
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date.slice(0, 10),
    bankAccountId: originId,
    categoryId: transaction.category?.id ?? '',
    isPaid: transaction.isPaid,
    notes: transaction.notes ?? '',
    ...(isEditingTransfer && destinationId
      ? { destinationBankAccountId: destinationId }
      : {}),
  }
}

const buildBaseSubmitBody = (
  data: TransactionFormData,
  isTransfer: boolean
): UpdateTransactionBody => {
  const body: UpdateTransactionBody = {
    amount: data.amount,
    description: data.description,
    date: data.date,
    bankAccountId: data.bankAccountId,
    isPaid: data.isPaid,
    notes: data.notes || null,
  }

  if (!isTransfer) {
    body.categoryId = data.categoryId
  }

  if (data.repeat?.type === 'recurring') {
    body.recurring = {
      frequency: data.repeat.frequency,
      ...(data.repeat.endDate ? { endDate: data.repeat.endDate } : {}),
    }
  }

  return body
}

const buildCreateBody = (
  data: TransactionFormData,
  type: TransactionType,
  isTransfer: boolean
): CreateTransactionBody => {
  const body: CreateTransactionBody = {
    type,
    amount: data.amount,
    description: data.description,
    date: data.date,
    bankAccountId: data.bankAccountId,
    isPaid: data.isPaid,
    notes: data.notes || undefined,
  }

  if (!isTransfer) {
    body.categoryId = data.categoryId
  }

  if (data.destinationBankAccountId) {
    body.destinationBankAccountId = data.destinationBankAccountId
  }

  if (data.repeat?.type === 'recurring') {
    body.recurring = {
      frequency: data.repeat.frequency,
      ...(data.repeat.endDate ? { endDate: data.repeat.endDate } : {}),
    }
  }

  if (data.repeat?.type === 'installment') {
    body.installment = {
      count: data.repeat.count,
      frequency: data.repeat.frequency,
    }
  }

  return body
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: TransactionType
  transaction?: Transaction | null
  defaultCalendarMonth?: Date
  bankAccounts: BankAccount[]
  categories: Category[]
  onDelete?: (transaction: Transaction) => void
  onRecurringSubmit?: (
    transaction: Transaction,
    body: UpdateTransactionBody
  ) => void
  onInstallmentSubmit?: (
    transaction: Transaction,
    body: UpdateTransactionBody
  ) => void
  recurringScope?: RecurringScope | null
  installmentScope?: InstallmentScope | null
}

type FooterActionButtonProps = {
  label: string
  active: boolean
  onClick: () => void
  icon: typeof ArrowUpDownIcon
}

const FooterActionButton = ({
  label,
  active,
  onClick,
  icon,
}: FooterActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex cursor-pointer flex-col items-center gap-1 text-xs text-muted-foreground"
  >
    <span
      className={cn(
        'flex size-12 items-center justify-center rounded-full border bg-background transition-colors',
        active && 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
    </span>
    {label}
  </button>
)

export const TransactionFormDialog = ({
  open,
  onOpenChange,
  type,
  transaction,
  defaultCalendarMonth,
  bankAccounts,
  categories,
  onDelete,
  onRecurringSubmit,
  onInstallmentSubmit,
  recurringScope,
  installmentScope,
}: Props) => {
  const isEditing = !!transaction
  const isTransfer = type === 'TRANSFER'
  const canConfigureRepeat = !isTransfer && !transaction?.recurringRuleId
  const config = TYPE_CONFIG[type]

  const create = useCreateTransaction()
  const update = useUpdateTransaction()
  const updateRecurringRule = useUpdateRecurringRule()

  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date())
  const [repeatOpen, setRepeatOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

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
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(isTransfer ? transferSchema : transactionSchema),
    defaultValues: buildDefaultValues(
      type,
      defaultCalendarMonth,
      bankAccounts[0]?.id
    ),
  })

  const selectedBankAccountId = watch('bankAccountId')

  const destinationAccounts = useMemo(
    () => bankAccounts.filter((a) => a.id !== selectedBankAccountId),
    [bankAccounts, selectedBankAccountId]
  )

  const accountItems = useMemo(
    () =>
      bankAccounts.map((a) => ({
        value: a.id,
        label: a.name,
        icon: a.icon,
        color: a.color,
      })),
    [bankAccounts]
  )

  const destinationAccountItems = useMemo(
    () =>
      destinationAccounts.map((a) => ({
        value: a.id,
        label: a.name,
        icon: a.icon,
        color: a.color,
      })),
    [destinationAccounts]
  )

  const categoryItems = useMemo(
    () =>
      filteredCategories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
        color: c.color,
      })),
    [filteredCategories]
  )

  useEffect(() => {
    if (!open) return

    if (transaction) {
      reset(buildTransactionValues(transaction))
      setNotesOpen(Boolean(transaction.notes))
      setRepeatOpen(false)
      return
    }

    reset(buildDefaultValues(type, defaultCalendarMonth, bankAccounts[0]?.id))
    setNotesOpen(false)
    setRepeatOpen(false)
  }, [open, transaction, type, reset, defaultCalendarMonth, bankAccounts])

  const amount = watch('amount')
  const repeat = watch('repeat')

  const isPending =
    create.isPending || update.isPending || updateRecurringRule.isPending

  const onSubmit = (rawData: TransactionFormData) => {
    const data = { ...rawData }
    if (!data.description && !isTransfer) {
      const category = filteredCategories.find((c) => c.id === data.categoryId)
      if (category) data.description = category.name
    }

    if (!isEditing || !transaction) {
      create.mutate(buildCreateBody(data, type, isTransfer), {
        onSuccess: () => {
          toast.success('Lançamento criado')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : 'Erro ao criar lançamento'
          )
        },
      })
      return
    }

    const commonBody = buildBaseSubmitBody(data, isTransfer)

    if (transaction.recurringRuleId && !recurringScope) {
      onRecurringSubmit?.(transaction, commonBody)
      return
    }

    if (transaction.recurringRuleId && recurringScope) {
      updateRecurringRule.mutate(
        {
          id: transaction.recurringRuleId,
          body: {
            ...commonBody,
            scope: recurringScope,
            occurrenceDate: transaction.date.slice(0, 10),
          },
        },
        {
          onSuccess: () => {
            toast.success('Lançamento recorrente atualizado')
            onOpenChange(false)
          },
          onError: (err) => {
            toast.error(
              err instanceof Error
                ? err.message
                : 'Erro ao atualizar lançamento recorrente'
            )
          },
        }
      )
      return
    }

    if (transaction.installmentGroupId && !installmentScope) {
      onInstallmentSubmit?.(transaction, commonBody)
      return
    }

    update.mutate(
      {
        id: transaction.id,
        body: {
          ...commonBody,
          ...(installmentScope ? { scope: installmentScope } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success('Lançamento atualizado')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : 'Erro ao atualizar lançamento'
          )
        },
      }
    )
  }

  return (
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex w-full flex-col gap-1.5 sm:flex-1">
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

            <div className="flex w-full flex-col gap-1.5 sm:flex-1">
              <Label htmlFor="date">Data</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => {
                  const selectedDate = (() => {
                    if (!field.value) return undefined
                    const d = parse(field.value, 'yyyy-MM-dd', new Date())
                    return Number.isNaN(d.getTime()) ? undefined : d
                  })()
                  return (
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={(nextOpen) => {
                        setDatePickerOpen(nextOpen)
                        if (nextOpen) {
                          const base =
                            selectedDate ??
                            startOfMonth(defaultCalendarMonth ?? new Date())
                          setCalendarMonth(startOfMonth(base))
                        }
                      }}
                    >
                      <PopoverTrigger
                        id="date"
                        type="button"
                        aria-invalid={!!errors.date}
                        className="flex h-9 w-full cursor-pointer items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
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
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              const ymd = format(date, 'yyyy-MM-dd')
                              field.onChange(ymd)
                              setCalendarMonth(startOfMonth(date))
                              if (isTransactionDateStrictlyFuture(ymd)) {
                                setValue('isPaid', false)
                              }
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
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>{isTransfer ? 'Saiu da conta' : 'Conta'}</Label>
              <Controller
                name="bankAccountId"
                control={control}
                render={({ field }) => {
                  const selectedItem =
                    accountItems.find((i) => i.value === field.value) ?? null
                  return (
                    <Combobox
                      value={selectedItem}
                      onValueChange={(item) =>
                        field.onChange(
                          (item as { value: string } | null)?.value ?? ''
                        )
                      }
                      items={accountItems}
                    >
                      <ComboboxTrigger className="w-full">
                        {selectedItem && (
                          <BankAccountIcon
                            icon={selectedItem.icon}
                            color={selectedItem.color}
                            className="size-4"
                            iconClassName="size-2.5"
                          />
                        )}
                        <ComboboxValue placeholder="Selecione a conta" />
                      </ComboboxTrigger>
                      <ComboboxContent className="min-w-64">
                        <ComboboxInput placeholder="Buscar conta..." />
                        <ComboboxEmpty>Nenhuma conta encontrada.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => {
                            const acct = item as {
                              value: string
                              label: string
                              icon: string
                              color: string
                            }
                            return (
                              <ComboboxItem key={acct.value} value={acct}>
                                <BankAccountIcon
                                  icon={acct.icon}
                                  color={acct.color}
                                  className="size-4"
                                  iconClassName="size-2.5"
                                />
                                <span className="min-w-0 truncate">
                                  {acct.label}
                                </span>
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )
                }}
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
                  render={({ field }) => {
                    const selectedItem =
                      destinationAccountItems.find(
                        (i) => i.value === field.value
                      ) ?? null
                    return (
                      <Combobox
                        value={selectedItem}
                        onValueChange={(item) =>
                          field.onChange(
                            (item as { value: string } | null)?.value ?? ''
                          )
                        }
                        items={destinationAccountItems}
                      >
                        <ComboboxTrigger className="w-full">
                          {selectedItem && (
                            <BankAccountIcon
                              icon={selectedItem.icon}
                              color={selectedItem.color}
                              className="size-4"
                              iconClassName="size-2.5"
                            />
                          )}
                          <ComboboxValue placeholder="Selecione a conta de destino" />
                        </ComboboxTrigger>
                        <ComboboxContent className="min-w-64">
                          <ComboboxInput placeholder="Buscar conta..." />
                          <ComboboxEmpty>
                            Nenhuma conta encontrada.
                          </ComboboxEmpty>
                          <ComboboxList>
                            {(item) => {
                              const acct = item as {
                                value: string
                                label: string
                                icon: string
                                color: string
                              }
                              return (
                                <ComboboxItem key={acct.value} value={acct}>
                                  <BankAccountIcon
                                    icon={acct.icon}
                                    color={acct.color}
                                    className="size-4"
                                    iconClassName="size-2.5"
                                  />
                                  <span className="min-w-0 truncate">
                                    {acct.label}
                                  </span>
                                </ComboboxItem>
                              )
                            }}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    )
                  }}
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
                  render={({ field }) => {
                    const selectedItem =
                      categoryItems.find((i) => i.value === field.value) ?? null
                    return (
                      <Combobox
                        value={selectedItem}
                        onValueChange={(item) =>
                          field.onChange(
                            (item as { value: string } | null)?.value ?? ''
                          )
                        }
                        items={categoryItems}
                      >
                        <ComboboxTrigger className="w-full">
                          {selectedItem && (
                            <span
                              className="flex size-4.5 shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: selectedItem.color }}
                            >
                              <HugeiconsIcon
                                icon={getIconByName(selectedItem.icon)}
                                strokeWidth={1.5}
                                className="size-2.5 text-white"
                              />
                            </span>
                          )}
                          <ComboboxValue placeholder="Selecione a categoria" />
                        </ComboboxTrigger>
                        <ComboboxContent className="min-w-64">
                          <ComboboxInput placeholder="Buscar categoria..." />
                          <ComboboxEmpty>
                            Nenhuma categoria encontrada.
                          </ComboboxEmpty>
                          <ComboboxList>
                            {(item) => {
                              const cat = item as {
                                value: string
                                label: string
                                icon: string
                                color: string
                              }
                              return (
                                <ComboboxItem key={cat.value} value={cat}>
                                  <span
                                    className="flex size-4.5 shrink-0 items-center justify-center rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  >
                                    <HugeiconsIcon
                                      icon={getIconByName(cat.icon)}
                                      strokeWidth={1.5}
                                      className="size-2.5 text-white"
                                    />
                                  </span>
                                  <span className="min-w-0 truncate">
                                    {cat.label}
                                  </span>
                                </ComboboxItem>
                              )
                            }}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    )
                  }}
                />
                {errors.categoryId && (
                  <p className="text-xs text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {canConfigureRepeat && repeatOpen && (
            <RepeatSection
              control={control}
              amount={amount}
              repeat={repeat}
              setValue={setValue}
              allowInstallment={!isEditing}
            />
          )}

          {!isTransfer && notesOpen && (
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

          {!isTransfer && (
            <div className="flex justify-center gap-6 py-2">
              {canConfigureRepeat && (
                <FooterActionButton
                  label="Repetir"
                  active={repeatOpen}
                  onClick={() => setRepeatOpen((current) => !current)}
                  icon={ArrowUpDownIcon}
                />
              )}
              <FooterActionButton
                label="Observação"
                active={notesOpen}
                onClick={() => setNotesOpen((current) => !current)}
                icon={Calendar01Icon}
              />
              <Controller
                name="isPaid"
                control={control}
                render={({ field }) => (
                  <FooterActionButton
                    label={field.value ? 'Pago' : 'Pagar'}
                    active={field.value}
                    onClick={() => field.onChange(!field.value)}
                    icon={field.value ? ThumbsUpIcon : ThumbsDownIcon}
                  />
                )}
              />
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
  )
}
