import { z } from 'zod'

const isoDate = z.iso.date()

export const periodInput = {
  startDate: isoDate
    .optional()
    .describe(
      'Início do período (YYYY-MM-DD). Padrão: primeiro dia do mês atual'
    ),
  endDate: isoDate
    .optional()
    .describe('Fim do período (YYYY-MM-DD). Padrão: último dia do mês atual'),
}

export const bankAccountIdInput = z
  .uuid()
  .optional()
  .describe('Filtra por uma conta bancária (id de list_bank_accounts)')
