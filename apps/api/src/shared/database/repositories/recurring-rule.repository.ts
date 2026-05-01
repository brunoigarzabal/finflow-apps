import type {
  Prisma,
  PrismaClient,
} from '../../../../generated/prisma/client.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

const recurringRuleInclude = {
  bankAccount: {
    select: { id: true, name: true, color: true, icon: true },
  },
  category: {
    select: { id: true, name: true, color: true, icon: true },
  },
} as const

export { recurringRuleInclude }

export function recurringRuleRepository(prisma: PrismaArg) {
  return {
    findMany: (where: Prisma.RecurringRuleWhereInput) =>
      prisma.recurringRule.findMany({
        where,
        include: recurringRuleInclude,
        orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
      }),

    findById: (id: string) =>
      prisma.recurringRule.findUnique({
        where: { id },
        include: recurringRuleInclude,
      }),

    create: (data: Prisma.RecurringRuleUncheckedCreateInput) =>
      prisma.recurringRule.create({ data, include: recurringRuleInclude }),

    update: (id: string, data: Prisma.RecurringRuleUncheckedUpdateInput) =>
      prisma.recurringRule.update({
        where: { id },
        data,
        include: recurringRuleInclude,
      }),
  }
}
