import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Fragment, useEffect, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { useCreateBankAccount, useUpdateBankAccount } from '@/api/bank-accounts'
import type { BankAccount } from '@/api/bank-accounts'
import { MoneyInput } from '@/components/common/MoneyInput'
import {
  getInstitutionFromIcon,
  parseInstitutionIcon,
  toInstitutionIcon,
  type FinancialInstitution,
} from '@/config/financialInstitutions'
import { ACCOUNT_ICON_NAMES } from '@/lib/icons'

import {
  ColorPicker,
  FinancialInstitutionPicker,
  IconPicker,
} from '../../../components'
import {
  bankAccountSchema,
  type BankAccountFormData,
} from '../../../schemas/bankAccountSchema'

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'CHECKING', label: 'Conta corrente' },
  { value: 'SAVINGS', label: 'Poupança' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'OTHER', label: 'Outro' },
]

type IconTab = 'institution' | 'generic'

const ICON_TABS: { value: IconTab; label: string }[] = [
  { value: 'institution', label: 'Instituições financeiras' },
  { value: 'generic', label: 'Ícones genéricos' },
]

function accountToFormData(account: BankAccount): BankAccountFormData {
  return {
    name: account.name,
    type: account.type,
    color: account.color,
    icon: account.icon,
    initialBalance: account.initialBalance,
  }
}

const DEFAULT_VALUES: BankAccountFormData = {
  name: '',
  type: 'CHECKING',
  color: '#6366f1',
  icon: 'wallet-02',
  initialBalance: 0,
}

const resolveInitialTab = (icon: string): IconTab =>
  parseInstitutionIcon(icon) ? 'institution' : 'generic'

type Props = {
  account?: BankAccount | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AccountFormDialog = ({ account, open, onOpenChange }: Props) => {
  const isEditing = !!account
  const create = useCreateBankAccount()
  const update = useUpdateBankAccount()
  const [activeTab, setActiveTab] = useState<IconTab>('generic')

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const currentIcon = useWatch({ control, name: 'icon' })
  const currentName = useWatch({ control, name: 'name' })

  useEffect(() => {
    if (!open) return
    const initial = account ? accountToFormData(account) : DEFAULT_VALUES
    reset(initial)
    setActiveTab(resolveInitialTab(initial.icon))
  }, [open, account, reset])

  const isPending = create.isPending || update.isPending

  const handleTabChange = (next: IconTab) => {
    if (next === activeTab) return
    setActiveTab(next)
    if (next === 'generic' && parseInstitutionIcon(currentIcon)) {
      setValue('icon', DEFAULT_VALUES.icon, { shouldValidate: true })
    }
  }

  const handleInstitutionSelect = (institution: FinancialInstitution) => {
    const previousInstitution = getInstitutionFromIcon(currentIcon)
    setValue('icon', toInstitutionIcon(institution.id), {
      shouldValidate: true,
    })
    setValue('color', institution.color, { shouldValidate: true })
    if (!currentName || currentName === previousInstitution?.name) {
      setValue('name', institution.name, { shouldValidate: true })
    }
  }

  const onSubmit = (data: BankAccountFormData) => {
    if (isEditing && account) {
      update.mutate(
        { id: account.id, body: data },
        {
          onSuccess: () => {
            toast.success('Conta atualizada')
            onOpenChange(false)
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : 'Erro ao atualizar conta'
            )
          },
        }
      )
    } else {
      create.mutate(data, {
        onSuccess: () => {
          toast.success('Conta criada')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : 'Erro ao criar conta'
          )
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar conta' : 'Nova conta'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex gap-2 rounded-full bg-muted p-1">
            {ICON_TABS.map((tab) => {
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    'flex-1 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'institution' && (
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <FinancialInstitutionPicker
                  value={field.value}
                  onChange={handleInstitutionSelect}
                />
              )}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {!isEditing && (
            <Fragment>
              <div className="flex flex-col gap-1.5">
                <Label>Tipo</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo">
                          {(value: string) =>
                            ACCOUNT_TYPE_OPTIONS.find(
                              (opt) => opt.value === value
                            )?.label ?? value
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Saldo inicial</Label>
                <Controller
                  name="initialBalance"
                  control={control}
                  render={({ field }) => (
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!errors.initialBalance}
                    />
                  )}
                />
              </div>
            </Fragment>
          )}

          {activeTab === 'generic' && (
            <Fragment>
              <div className="flex flex-col gap-1.5">
                <Label>Cor</Label>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Ícone</Label>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <IconPicker
                      value={field.value}
                      onChange={field.onChange}
                      icons={ACCOUNT_ICON_NAMES}
                    />
                  )}
                />
              </div>
            </Fragment>
          )}

          <DialogFooter>
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
