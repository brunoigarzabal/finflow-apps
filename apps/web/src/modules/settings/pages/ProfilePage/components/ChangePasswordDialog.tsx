import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { HTTPError } from 'ky'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useChangePassword } from '@/api/auth'
import {
  createChangePasswordSchema,
  type ChangePasswordFormData,
} from '@/modules/settings/schemas/changePasswordSchema'

type Props = {
  hasPassword: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ChangePasswordDialog = ({
  hasPassword,
  open,
  onOpenChange,
}: Props) => {
  const changePassword = useChangePassword()
  const [showNewPassword, setShowNewPassword] = useState(false)

  const schema = createChangePasswordSchema(hasPassword)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }, [open, reset])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowNewPassword(false)
    }
    onOpenChange(nextOpen)
  }

  const submitLabel = hasPassword ? 'Alterar senha' : 'Definir senha'

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: hasPassword ? data.currentPassword : undefined,
        newPassword: data.newPassword,
      })
      toast.success(hasPassword ? 'Senha alterada' : 'Senha definida')
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof HTTPError) {
        const responseBody = await error.response.json<{ message?: string }>()
        setError('root', {
          message: responseBody.message ?? 'Erro ao salvar senha',
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{submitLabel}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          {hasPassword && (
            <Field>
              <FieldLabel htmlFor="current-password">Senha atual</FieldLabel>
              <Input
                id="current-password"
                type="password"
                placeholder="********"
                aria-invalid={!!errors.currentPassword}
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <FieldError>{errors.currentPassword.message}</FieldError>
              )}
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                className="pr-10"
                placeholder="********"
                aria-invalid={!!errors.newPassword}
                {...register('newPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-haspopup="true"
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground active:bg-transparent active:not-aria-[haspopup]:translate-y-0"
                onClick={() => setShowNewPassword((current) => !current)}
              >
                <HugeiconsIcon
                  icon={showNewPassword ? ViewOffIcon : EyeIcon}
                  className="size-4"
                />
                <span className="sr-only">
                  {showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                </span>
              </Button>
            </div>
            {errors.newPassword && (
              <FieldError>{errors.newPassword.message}</FieldError>
            )}
            <FieldDescription>
              Deve ter pelo menos 6 caracteres.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-new-password">
              Confirmar nova senha
            </FieldLabel>
            <Input
              id="confirm-new-password"
              type="password"
              placeholder="********"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <FieldError>{errors.confirmPassword.message}</FieldError>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Salvando...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
