import type { PrismaClient } from '../../../generated/prisma/client.js'
import type { BankAccountType } from '../../../generated/prisma/enums.js'

import { BadRequest, NotFound } from '../../errors/index.js'

interface CreateBankAccountInput {
  name: string
  type: BankAccountType
  color: string
  icon: string
  initialBalance: number
}

type UpdateBankAccountInput = Partial<CreateBankAccountInput>

export async function listBankAccounts(
  prisma: PrismaClient,
  userId: string,
  includeArchived: boolean,
) {
  return prisma.bankAccount.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { archived: false }),
    },
    orderBy: { name: 'asc' },
  })
}

export async function getBankAccount(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const account = await prisma.bankAccount.findUnique({ where: { id } })

  if (!account || account.userId !== userId) {
    throw new NotFound('Conta bancária não encontrada')
  }

  return account
}

export async function createBankAccount(
  prisma: PrismaClient,
  userId: string,
  data: CreateBankAccountInput,
) {
  return prisma.bankAccount.create({
    data: {
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
      initialBalance: data.initialBalance,
      currentBalance: data.initialBalance,
      userId,
    },
  })
}

export async function updateBankAccount(
  prisma: PrismaClient,
  userId: string,
  id: string,
  data: UpdateBankAccountInput,
) {
  const existing = await getBankAccount(prisma, userId, id)
  const { initialBalance, ...rest } = data

  const balanceUpdate =
    initialBalance !== undefined
      ? {
          initialBalance,
          currentBalance:
            initialBalance + (existing.currentBalance - existing.initialBalance),
        }
      : {}

  return prisma.bankAccount.update({
    where: { id },
    data: { ...rest, ...balanceUpdate },
  })
}

export async function archiveBankAccount(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const { count } = await prisma.bankAccount.updateMany({
    where: { id, userId, archived: false },
    data: { archived: true },
  })

  if (count === 0) {
    throw new NotFound('Conta bancária não encontrada')
  }
}

export async function restoreBankAccount(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const account = await getBankAccount(prisma, userId, id)

  if (!account.archived) {
    throw new BadRequest('Conta bancária já está ativa')
  }

  return prisma.bankAccount.update({
    where: { id },
    data: { archived: false },
  })
}
