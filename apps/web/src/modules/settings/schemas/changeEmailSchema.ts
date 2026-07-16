import { z } from 'zod'

export const changeEmailSchema = z.object({
  email: z.email('Por favor, insira um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>
