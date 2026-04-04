import { z } from 'zod'

export const signUpSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z.email('Por favor, insira um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Por favor, confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>
