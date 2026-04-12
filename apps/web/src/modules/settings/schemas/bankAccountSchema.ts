import { z } from 'zod'

export const bankAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  type: z.enum(['CHECKING', 'SAVINGS', 'CASH', 'OTHER']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  initialBalance: z.number().int().min(0),
})

export type BankAccountFormData = z.infer<typeof bankAccountSchema>
