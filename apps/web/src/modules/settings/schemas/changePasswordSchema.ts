import { z } from 'zod'

const baseChangePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Por favor, confirme sua senha'),
})

export const createChangePasswordSchema = (hasPassword: boolean) =>
  baseChangePasswordSchema
    .refine((data) => !hasPassword || Boolean(data.currentPassword), {
      message: 'A senha atual é obrigatória',
      path: ['currentPassword'],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    })

export type ChangePasswordFormData = z.infer<typeof baseChangePasswordSchema>
