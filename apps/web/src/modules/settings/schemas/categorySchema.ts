import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Máximo 50 caracteres'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  icon: z.string().min(1, 'Selecione um ícone'),
})

export type CategoryFormData = z.infer<typeof categorySchema>
