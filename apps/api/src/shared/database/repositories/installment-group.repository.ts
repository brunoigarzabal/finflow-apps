import type { Prisma, PrismaClient } from '../../../../generated/prisma/client.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

export function installmentGroupRepository(prisma: PrismaArg) {
  return {
    create: (data: Prisma.InstallmentGroupUncheckedCreateInput) =>
      prisma.installmentGroup.create({ data }),
  }
}
