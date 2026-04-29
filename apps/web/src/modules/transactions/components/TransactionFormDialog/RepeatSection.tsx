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
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Radio, RadioGroup } from '@workspace/ui/components/radio-group'
import { cn } from '@workspace/ui/lib/utils'
import { format, parse, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, UseFormSetValue } from 'react-hook-form'

import {
  FREQUENCY_LABELS,
  type InstallmentFrequency,
  type RecurringFrequency,
} from '@/api/transactions'
import { formatCurrency } from '@/lib/formatCurrency'
import type { TransactionFormData } from '@/modules/transactions/schemas/transactionSchema'

const RECURRING_FREQUENCIES: RecurringFrequency[] = [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
  'SEMIANNUAL',
  'ANNUAL',
]

const INSTALLMENT_FREQUENCIES: InstallmentFrequency[] = [
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
]

type FrequencyOption = { value: string; label: string }

const RECURRING_FREQUENCY_OPTIONS: FrequencyOption[] =
  RECURRING_FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABELS[f] }))

const INSTALLMENT_FREQUENCY_OPTIONS: FrequencyOption[] =
  INSTALLMENT_FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABELS[f] }))

type Props = {
  control: Control<TransactionFormData>
  amount: number
  repeat: TransactionFormData['repeat']
  setValue: UseFormSetValue<TransactionFormData>
  allowInstallment?: boolean
}

export const RepeatSection = ({
  control,
  amount,
  repeat,
  setValue,
  allowInstallment = true,
}: Props) => {
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())

  const installmentCount = repeat?.type === 'installment' ? repeat.count : 2
  const installmentAmount = Math.floor(amount / installmentCount)
  const hasRemainder = amount % installmentCount !== 0

  const selectRecurring = () => {
    setValue('repeat', {
      type: 'recurring',
      frequency: 'MONTHLY',
      endDate: undefined,
    })
  }

  const selectInstallment = () => {
    setValue('repeat', {
      type: 'installment',
      count: 2,
      frequency: 'MONTHLY',
    })
  }

  return (
    <section className="flex flex-col gap-3 border-t pt-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-muted-foreground">Repetir</p>
        <RadioGroup
          value={repeat?.type}
          onValueChange={(value) => {
            if (value === 'recurring') {
              selectRecurring()
              return
            }

            if (value === 'installment') {
              selectInstallment()
            }
          }}
          className="w-fit"
        >
          <div className="flex items-center gap-2 text-sm">
            <Radio id="repeat-type-recurring" value="recurring" />
            <Label htmlFor="repeat-type-recurring" className="cursor-pointer">
              É um lançamento fixo
            </Label>
          </div>
          {allowInstallment && (
            <div className="flex items-center gap-2 text-sm">
              <Radio id="repeat-type-installment" value="installment" />
              <Label
                htmlFor="repeat-type-installment"
                className="cursor-pointer"
              >
                É um lançamento parcelado em
              </Label>
            </div>
          )}
        </RadioGroup>
      </div>

      {repeat?.type === 'recurring' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Frequência</Label>
              <Controller
                name="repeat.frequency"
                control={control}
                render={({ field }) => {
                  const selectedItem =
                    RECURRING_FREQUENCY_OPTIONS.find(
                      (o) => o.value === field.value
                    ) ?? null
                  return (
                    <Combobox
                      value={selectedItem}
                      onValueChange={(item) =>
                        field.onChange(
                          (item as FrequencyOption | null)?.value ?? 'MONTHLY'
                        )
                      }
                      items={RECURRING_FREQUENCY_OPTIONS}
                    >
                      <ComboboxTrigger className="w-full">
                        <ComboboxValue placeholder="Mensal" />
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput placeholder="Buscar..." />
                        <ComboboxEmpty>Nenhuma opção encontrada.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => {
                            const opt = item as FrequencyOption
                            return (
                              <ComboboxItem key={opt.value} value={opt}>
                                {opt.label}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setValue('repeat', undefined)}
            >
              Limpar
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Até quando?</Label>
            <Controller
              name="repeat.endDate"
              control={control}
              render={({ field }) => {
                const selectedDate = field.value
                  ? parse(field.value, 'yyyy-MM-dd', new Date())
                  : undefined
                const hasValidDate =
                  selectedDate && !Number.isNaN(selectedDate.getTime())

                return (
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger
                      type="button"
                      className={cn(
                        'flex h-9 w-full cursor-pointer items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                        !hasValidDate && 'text-muted-foreground'
                      )}
                    >
                      {hasValidDate
                        ? format(selectedDate, 'dd/MM/yyyy')
                        : 'Sem data final'}
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        selected={hasValidDate ? selectedDate : undefined}
                        onSelect={(date) => {
                          if (!date) return
                          field.onChange(format(date, 'yyyy-MM-dd'))
                          setCalendarMonth(startOfMonth(date))
                          setEndDateOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )
              }}
            />
          </div>
        </div>
      )}

      {repeat?.type === 'installment' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="installment-count">Parcelas</Label>
              <Controller
                name="repeat.count"
                control={control}
                render={({ field }) => (
                  <Input
                    id="installment-count"
                    type="number"
                    min={2}
                    max={72}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(Number(event.currentTarget.value))
                    }
                  />
                )}
              />
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Intervalo</Label>
              <Controller
                name="repeat.frequency"
                control={control}
                render={({ field }) => {
                  const selectedItem =
                    INSTALLMENT_FREQUENCY_OPTIONS.find(
                      (o) => o.value === field.value
                    ) ?? null
                  return (
                    <Combobox
                      value={selectedItem}
                      onValueChange={(item) =>
                        field.onChange(
                          (item as FrequencyOption | null)?.value ?? 'MONTHLY'
                        )
                      }
                      items={INSTALLMENT_FREQUENCY_OPTIONS}
                    >
                      <ComboboxTrigger className="w-full">
                        <ComboboxValue placeholder="Meses" />
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput placeholder="Buscar..." />
                        <ComboboxEmpty>Nenhuma opção encontrada.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => {
                            const opt = item as FrequencyOption
                            return (
                              <ComboboxItem key={opt.value} value={opt}>
                                {opt.label}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )
                }}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setValue('repeat', undefined)}
            >
              Limpar
            </Button>
          </div>

          <div className="flex flex-col gap-0.5 text-sm">
            <p>
              Serão lançadas {installmentCount} parcelas de{' '}
              <span className="font-semibold text-emerald-500">
                {formatCurrency(installmentAmount)}
              </span>
            </p>
            {hasRemainder && (
              <p className="text-muted-foreground">
                Em caso de divisão não exata, a sobra será somada à primeira
                parcela.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
