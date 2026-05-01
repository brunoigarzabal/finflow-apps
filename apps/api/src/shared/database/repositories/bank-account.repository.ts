import type {
  Prisma,
  PrismaClient,
} from '../../../../generated/prisma/client.js'
import type { BankAccountType } from '../../../../generated/prisma/enums.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

export function bankAccountRepository(prisma: PrismaArg) {
  return {
    findMany: (userId: string, archived: boolean) =>
      prisma.bankAccount.findMany({
        where: { userId, archived },
        orderBy: { name: 'asc' },
      }),

    findById: (id: string) => prisma.bankAccount.findUnique({ where: { id } }),

    findByIdOrThrow: (id: string) =>
      prisma.bankAccount.findUniqueOrThrow({
        where: { id },
        select: { initialBalance: true },
      }),

    create: (data: {
      name: string
      type: BankAccountType
      color: string
      icon: string
      initialBalance: number
      currentBalance: number
      userId: string
    }) => prisma.bankAccount.create({ data }),

    update: (
      id: string,
      data: Partial<{
        name: string
        type: BankAccountType
        color: string
        icon: string
        initialBalance: number
        currentBalance: number
        archived: boolean
      }>
    ) => prisma.bankAccount.update({ where: { id }, data }),

    archiveMany: (id: string, userId: string) =>
      prisma.bankAccount.updateMany({
        where: { id, userId, archived: false },
        data: { archived: true },
      }),

    restoreMany: (id: string, userId: string) =>
      prisma.bankAccount.updateMany({
        where: { id, userId, archived: true },
        data: { archived: false },
      }),

    aggregate: (where: { userId: string; archived?: boolean; id?: string }) =>
      prisma.bankAccount.aggregate({
        where,
        _sum: { initialBalance: true },
      }),
  }
}
