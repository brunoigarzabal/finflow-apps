import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'

import type {
  Prisma,
  PrismaClient,
} from '../../../../generated/prisma/client.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

export async function validateBankAccount(
  prisma: PrismaArg,
  userId: string,
  bankAccountId: string,
  label = 'Conta bancária'
) {
  const repo = bankAccountRepository(prisma)
  const account = await repo.findById(bankAccountId)

  if (!account || account.userId !== userId) {
    throw new NotFound(`${label} não encontrada`)
  }

  if (account.archived) {
    throw new BadRequest(`${label} está arquivada`)
  }

  return account
}
