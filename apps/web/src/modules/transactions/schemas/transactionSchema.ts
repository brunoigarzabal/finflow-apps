import { z } from 'zod'

const baseFields = {
  amount: z.number().int().min(1, 'Valor é obrigatório'),
  description: z
    .string()
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(255, 'Descrição muito longa'),
  date: z.string().min(1, 'Data é obrigatória'),
  bankAccountId: z.uuid('Conta é obrigatória'),
  isPaid: z.boolean(),
  notes: z.string().max(500, 'Notas muito longas').optional(),
  destinationBankAccountId: z.string().optional(),
}

export const transactionSchema = z.object({
  ...baseFields,
  categoryId: z.uuid('Categoria é obrigatória'),
})

export const transferSchema = z
  .object({
    ...baseFields,
    categoryId: z.string().optional(),
    destinationBankAccountId: z.string().uuid('Conta de destino é obrigatória'),
  })
  .refine((data) => data.bankAccountId !== data.destinationBankAccountId, {
    message: 'A conta de destino deve ser diferente da conta de origem',
    path: ['destinationBankAccountId'],
  })

export type TransactionFormData = z.infer<typeof transactionSchema>
export type TransferFormData = z.infer<typeof transferSchema>
