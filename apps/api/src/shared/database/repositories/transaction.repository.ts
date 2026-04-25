import { Prisma, type PrismaClient } from '../../../../generated/prisma/client.js'
import type { TransactionType } from '../../../../generated/prisma/enums.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

const transactionInclude = {
  bankAccount: {
    select: { id: true, name: true, color: true, icon: true },
  },
  category: {
    select: { id: true, name: true, color: true, icon: true },
  },
} as const

export { transactionInclude }

export function transactionRepository(prisma: PrismaArg) {
  return {
    findMany: (
      where: Prisma.TransactionWhereInput,
      options?: { skip?: number; take?: number },
    ) =>
      prisma.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
        ...(options?.skip !== undefined ? { skip: options.skip } : {}),
        ...(options?.take !== undefined ? { take: options.take } : {}),
      }),

    findById: (id: string) =>
      prisma.transaction.findUnique({
        where: { id },
        include: transactionInclude,
      }),

    findByIdRaw: (id: string) =>
      prisma.transaction.findUnique({ where: { id } }),

    findRelated: (transferId: string, excludeId: string) =>
      prisma.transaction.findFirst({
        where: { transferId, id: { not: excludeId } },
        select: {
          id: true,
          amount: true,
          type: true,
          bankAccountId: true,
          bankAccount: transactionInclude.bankAccount,
        },
      }),

    findRelatedMany: (transferIds: string[]) =>
      prisma.transaction.findMany({
        where: { transferId: { in: transferIds } },
        include: { bankAccount: transactionInclude.bankAccount },
      }),

    count: (where: Prisma.TransactionWhereInput) =>
      prisma.transaction.count({ where }),

    create: (data: Prisma.TransactionUncheckedCreateInput) =>
      prisma.transaction.create({ data, include: transactionInclude }),

    update: (id: string, data: Prisma.TransactionUncheckedUpdateInput) =>
      prisma.transaction.update({ where: { id }, data, include: transactionInclude }),

    updateMany: (where: Prisma.TransactionWhereInput, data: Prisma.TransactionUncheckedUpdateManyInput) =>
      prisma.transaction.updateMany({ where, data }),

    delete: (id: string) =>
      prisma.transaction.delete({ where: { id } }),

    deleteMany: (where: Prisma.TransactionWhereInput) =>
      prisma.transaction.deleteMany({ where }),

    groupBy: (
      where: Prisma.TransactionWhereInput,
    ) =>
      prisma.transaction.groupBy({
        by: ['type', 'isTransferOut'],
        where,
        _sum: { amount: true },
      }),

    groupByCategory: (where: Prisma.TransactionWhereInput) =>
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...where, categoryId: { not: null } },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),

  }
}

export function bankAccountSqlFilter(bankAccountId?: string) {
  return bankAccountId
    ? Prisma.sql`AND bank_account_id = ${bankAccountId}`
    : Prisma.empty
}
