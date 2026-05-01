import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
import { cn } from '@workspace/ui/lib/utils'
import { HTTPError } from 'ky'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useCreateCategory, useUpdateCategory } from '@/api/categories'
import type { Category, CategoryType } from '@/api/categories'
import { CATEGORY_ICON_NAMES, getIconByName } from '@/lib/icons'

import { ColorPicker, IconPicker } from '../../../components'
import {
  categorySchema,
  type CategoryFormData,
} from '../../../schemas/categorySchema'

type Props = {
  category?: Category | null
  type: CategoryType
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_COLOR = '#6366f1'
const DEFAULT_ICON = 'shopping-bag-01'

const buildDefaultValues = (type: CategoryType): CategoryFormData => ({
  name: '',
  type,
  color: DEFAULT_COLOR,
  icon: DEFAULT_ICON,
})

const categoryToFormData = (category: Category): CategoryFormData => ({
  name: category.name,
  type: category.type,
  color: category.color,
  icon: category.icon,
})

type SectionProps = {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

const CollapsibleSection = ({
  title,
  open,
  onToggle,
  children,
}: SectionProps) => (
  <div className="flex flex-col gap-3">
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between text-sm font-medium"
    >
      <span>{title}</span>
      <HugeiconsIcon
        icon={open ? ArrowUp01Icon : ArrowDown01Icon}
        strokeWidth={2}
        className="size-4"
      />
    </button>
    {open && <div>{children}</div>}
  </div>
)

export const CategoryFormDialog = ({
  category,
  type,
  open,
  onOpenChange,
}: Props) => {
  const isEditing = !!category
  const create = useCreateCategory()
  const update = useUpdateCategory()

  const [iconOpen, setIconOpen] = useState(true)
  const [colorOpen, setColorOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: buildDefaultValues(type),
  })

  const currentColor = watch('color')
  const currentIcon = watch('icon')

  useEffect(() => {
    if (open) {
      reset(category ? categoryToFormData(category) : buildDefaultValues(type))
      setIconOpen(true)
      setColorOpen(false)
    }
  }, [open, category, type, reset])

  const isPending = create.isPending || update.isPending

  const handleError = async (error: unknown, fallback: string) => {
    if (error instanceof HTTPError && error.response.status === 409) {
      setError('name', {
        message: 'Já existe uma categoria com este nome',
      })
      return
    }
    toast.error(error instanceof Error ? error.message : fallback)
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        await update.mutateAsync({ id: category.id, body: data })
        toast.success('Categoria atualizada')
      } else {
        await create.mutateAsync(data)
        toast.success('Categoria criada')
      }
      onOpenChange(false)
    } catch (error) {
      await handleError(
        error,
        isEditing ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria'
      )
    }
  }

  const getTitle = () => {
    if (isEditing) return 'Editando categoria'
    if (type === 'EXPENSE') return 'Criando categoria de despesa'
    return 'Criando categoria de receita'
  }

  const title = getTitle()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: currentColor }}
            >
              <HugeiconsIcon
                icon={getIconByName(currentIcon)}
                strokeWidth={1.5}
                className="size-6 text-white"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Alimentação"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
            </div>
          </div>
          {errors.name && (
            <p className={cn('-mt-2 text-xs text-destructive')}>
              {errors.name.message}
            </p>
          )}

          <CollapsibleSection
            title="Escolha um ícone"
            open={iconOpen}
            onToggle={() => setIconOpen((prev) => !prev)}
          >
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <IconPicker
                  value={field.value}
                  onChange={field.onChange}
                  icons={CATEGORY_ICON_NAMES}
                />
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Escolha uma cor"
            open={colorOpen}
            onToggle={() => setColorOpen((prev) => !prev)}
          >
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <ColorPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </CollapsibleSection>

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
