import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Field, FieldError, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { HTTPError } from 'ky'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useChangeEmail } from '@/api/auth'
import {
  changeEmailSchema,
  type ChangeEmailFormData,
} from '@/modules/settings/schemas/changeEmailSchema'

type Props = {
  currentEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ChangeEmailDialog = ({
  currentEmail,
  open,
  onOpenChange,
}: Props) => {
  const changeEmail = useChangeEmail()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
  })

  useEffect(() => {
    if (!open) return
    reset({ email: currentEmail, password: '' })
  }, [open, currentEmail, reset])

  const onSubmit = async (data: ChangeEmailFormData) => {
    try {
      await changeEmail.mutateAsync(data)
      toast.success('E-mail alterado')
      onOpenChange(false)
    } catch (error) {
      if (error instanceof HTTPError) {
        const responseBody = await error.response.json<{ message?: string }>()
        setError('root', {
          message: responseBody.message ?? 'Erro ao alterar e-mail',
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar e-mail</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="new-email">Novo e-mail</FieldLabel>
            <Input
              id="new-email"
              type="email"
              placeholder="exemplo@email.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-email-password">
              Senha atual
            </FieldLabel>
            <Input
              id="confirm-email-password"
              type="password"
              placeholder="********"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={changeEmail.isPending}>
              {changeEmail.isPending ? 'Alterando...' : 'Alterar e-mail'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
