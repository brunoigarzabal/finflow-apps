import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email('Por favor, insira um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export type SignInFormData = z.infer<typeof signInSchema>
