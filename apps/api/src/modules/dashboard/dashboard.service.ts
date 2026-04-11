import type { PrismaClient } from '../../../generated/prisma/client.js'

import { formatDateLocal, resolveDateRange } from '../../lib/date.js'
import { getSummary } from '../transaction/transaction.service.js'

interface DashboardInput {
  bankAccountId?: string
}

export async function getDashboard(
  prisma: PrismaClient,
  userId: string,
  input: DashboardInput,
) {
  const { startDate, endDate } = resolveDateRange()

  const accountWhere = {
    userId,
    archived: false,
    ...(input.bankAccountId ? { id: input.bankAccountId } : {}),
  }

  const transactionWhere = {
    userId,
    ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
  }

  const [bankAccounts, summaryResult, recentTransactions] = await Promise.all([
    prisma.bankAccount.findMany({
      where: accountWhere,
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        currentBalance: true,
      },
      orderBy: { name: 'asc' },
    }),

    getSummary(prisma, userId, {
      startDate: formatDateLocal(startDate),
      endDate: formatDateLocal(endDate),
      bankAccountId: input.bankAccountId,
    }),

    prisma.transaction.findMany({
      where: transactionWhere,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
        isPaid: true,
        bankAccount: {
          select: { id: true, name: true, color: true, icon: true },
        },
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 5,
    }),
  ])

  const totalBalance = bankAccounts.reduce(
    (sum, a) => sum + a.currentBalance,
    0,
  )

  return {
    bankAccounts,
    totalBalance,
    summary: summaryResult.summary,
    recentTransactions,
  }
}
