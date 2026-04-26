import type { Prisma, PrismaClient } from '../../../../generated/prisma/client.js'

import { transactionInclude } from './transaction.repository.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

export function recurringOverrideRepository(prisma: PrismaArg) {
  return {
    findMany: (where: Prisma.RecurringOverrideWhereInput) =>
      prisma.recurringOverride.findMany({
        where,
        include: {
          transaction: {
            include: transactionInclude,
          },
        },
      }),

    create: (data: Prisma.RecurringOverrideUncheckedCreateInput) =>
      prisma.recurringOverride.create({ data }),

    upsert: (
      recurringRuleId: string,
      occurrenceDate: Date,
      data: Omit<Prisma.RecurringOverrideUncheckedCreateInput, 'recurringRuleId' | 'occurrenceDate'>,
    ) =>
      prisma.recurringOverride.upsert({
        where: {
          recurringRuleId_occurrenceDate: {
            recurringRuleId,
            occurrenceDate,
          },
        },
        create: {
          recurringRuleId,
          occurrenceDate,
          ...data,
        },
        update: data,
      }),

    updateMany: (
      where: Prisma.RecurringOverrideWhereInput,
      data: Prisma.RecurringOverrideUncheckedUpdateManyInput,
    ) => prisma.recurringOverride.updateMany({ where, data }),

    deleteMany: (where: Prisma.RecurringOverrideWhereInput) =>
      prisma.recurringOverride.deleteMany({ where }),
  }
}
