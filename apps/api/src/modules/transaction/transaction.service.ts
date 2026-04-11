import type {
  Prisma,
  PrismaClient,
} from '../../../generated/prisma/client.js'
import type { TransactionType } from '../../../generated/prisma/enums.js'

import { BadRequest, NotFound } from '../../errors/index.js'

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

async function recalculateBalance(
  prisma: PrismaArg,
  bankAccountId: string,
): Promise<void> {
  const account = await prisma.bankAccount.findUniqueOrThrow({
    where: { id: bankAccountId },
    select: { initialBalance: true },
  })

  const aggregations = await prisma.transaction.groupBy({
    by: ['type', 'isTransferOut'],
    where: { bankAccountId, isPaid: true },
    _sum: { amount: true },
  })

  let net = 0
  for (const agg of aggregations) {
    const sum = agg._sum.amount ?? 0
    if (agg.type === 'INCOME') {
      net += sum
    } else if (agg.type === 'EXPENSE') {
      net -= sum
    } else if (agg.type === 'TRANSFER') {
      net += agg.isTransferOut ? -sum : sum
    }
  }

  await prisma.bankAccount.update({
    where: { id: bankAccountId },
    data: { currentBalance: account.initialBalance + net },
  })
}

async function validateBankAccount(
  prisma: PrismaArg,
  userId: string,
  bankAccountId: string,
  label = 'Conta bancária',
) {
  const account = await prisma.bankAccount.findUnique({
    where: { id: bankAccountId },
  })

  if (!account || account.userId !== userId) {
    throw new NotFound(`${label} não encontrada`)
  }

  if (account.archived) {
    throw new BadRequest(`${label} está arquivada`)
  }

  return account
}

async function validateCategory(
  prisma: PrismaArg,
  userId: string,
  categoryId: string,
) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  })

  if (!category || category.userId !== userId) {
    throw new NotFound('Categoria não encontrada')
  }

  if (category.archived) {
    throw new BadRequest('Categoria está arquivada')
  }

  return category
}

interface ListTransactionsInput {
  bankAccountId?: string
  categoryId?: string
  type?: TransactionType
  startDate?: string
  endDate?: string
  isPaid?: boolean
  page: number
  perPage: number
}

export async function listTransactions(
  prisma: PrismaClient,
  userId: string,
  input: ListTransactionsInput,
) {
  const now = new Date()
  const startDate = input.startDate
    ? new Date(input.startDate)
    : new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = input.endDate
    ? new Date(input.endDate)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const where = {
    userId,
    date: { gte: startDate, lte: endDate },
    ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: transactionInclude,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      skip: (input.page - 1) * input.perPage,
      take: input.perPage,
    }),
    prisma.transaction.count({ where }),
  ])

  return {
    transactions,
    pagination: {
      page: input.page,
      perPage: input.perPage,
      total,
      totalPages: Math.ceil(total / input.perPage),
    },
  }
}

export async function getTransaction(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: transactionInclude,
  })

  if (!transaction || transaction.userId !== userId) {
    throw new NotFound('Transação não encontrada')
  }

  let relatedTransaction = null

  if (transaction.type === 'TRANSFER' && transaction.transferId) {
    relatedTransaction = await prisma.transaction.findFirst({
      where: {
        transferId: transaction.transferId,
        id: { not: transaction.id },
      },
      select: {
        id: true,
        amount: true,
        type: true,
        bankAccount: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    })
  }

  return { ...transaction, relatedTransaction }
}

interface CreateTransactionInput {
  type: TransactionType
  amount: number
  description: string
  date: string
  bankAccountId: string
  categoryId: string
  isPaid: boolean
  notes?: string | null
  destinationBankAccountId?: string
}

export async function createTransaction(
  prisma: PrismaClient,
  userId: string,
  input: CreateTransactionInput,
) {
  if (input.type === 'TRANSFER' && !input.destinationBankAccountId) {
    throw new BadRequest(
      'Conta de destino é obrigatória para transferências',
    )
  }

  if (input.type !== 'TRANSFER' && input.destinationBankAccountId) {
    throw new BadRequest(
      'Conta de destino só é permitida para transferências',
    )
  }

  if (
    input.type === 'TRANSFER' &&
    input.bankAccountId === input.destinationBankAccountId
  ) {
    throw new BadRequest('Conta de origem e destino devem ser diferentes')
  }

  return prisma.$transaction(async (tx) => {
    await validateBankAccount(tx, userId, input.bankAccountId)
    await validateCategory(tx, userId, input.categoryId)

    const dateValue = new Date(input.date)

    if (input.type === 'TRANSFER') {
      await validateBankAccount(
        tx,
        userId,
        input.destinationBankAccountId!,
        'Conta de destino',
      )

      const transferId = crypto.randomUUID()

      const outgoing = await tx.transaction.create({
        data: {
          type: 'TRANSFER',
          amount: input.amount,
          description: input.description,
          date: dateValue,
          isPaid: input.isPaid,
          notes: input.notes ?? null,
          transferId,
          isTransferOut: true,
          userId,
          bankAccountId: input.bankAccountId,
          categoryId: input.categoryId,
        },
        include: transactionInclude,
      })

      const incoming = await tx.transaction.create({
        data: {
          type: 'TRANSFER',
          amount: input.amount,
          description: input.description,
          date: dateValue,
          isPaid: input.isPaid,
          notes: input.notes ?? null,
          transferId,
          isTransferOut: false,
          userId,
          bankAccountId: input.destinationBankAccountId!,
          categoryId: input.categoryId,
        },
        include: transactionInclude,
      })

      if (input.isPaid) {
        await recalculateBalance(tx, input.bankAccountId)
        await recalculateBalance(tx, input.destinationBankAccountId!)
      }

      return {
        ...outgoing,
        relatedTransaction: {
          id: incoming.id,
          amount: incoming.amount,
          type: incoming.type,
          bankAccount: incoming.bankAccount,
        },
      }
    }

    const transaction = await tx.transaction.create({
      data: {
        type: input.type,
        amount: input.amount,
        description: input.description,
        date: dateValue,
        isPaid: input.isPaid,
        notes: input.notes ?? null,
        userId,
        bankAccountId: input.bankAccountId,
        categoryId: input.categoryId,
      },
      include: transactionInclude,
    })

    if (input.isPaid) {
      await recalculateBalance(tx, input.bankAccountId)
    }

    return { ...transaction, relatedTransaction: null }
  })
}

interface UpdateTransactionInput {
  amount?: number
  description?: string
  date?: string
  bankAccountId?: string
  categoryId?: string
  isPaid?: boolean
  notes?: string | null
}

export async function updateTransaction(
  prisma: PrismaClient,
  userId: string,
  id: string,
  input: UpdateTransactionInput,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({ where: { id } })

    if (!existing || existing.userId !== userId) {
      throw new NotFound('Transação não encontrada')
    }

    if (existing.type === 'TRANSFER' && input.bankAccountId) {
      throw new BadRequest(
        'Não é possível alterar a conta de uma transferência',
      )
    }

    if (input.bankAccountId) {
      await validateBankAccount(tx, userId, input.bankAccountId)
    }

    if (input.categoryId) {
      await validateCategory(tx, userId, input.categoryId)
    }

    const updateData = {
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    }

    if (existing.type === 'TRANSFER' && existing.transferId) {
      const pairedUpdateData = {
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      }

      const updated = await tx.transaction.update({
        where: { id },
        data: updateData,
        include: transactionInclude,
      })

      if (Object.keys(pairedUpdateData).length > 0) {
        await tx.transaction.updateMany({
          where: {
            transferId: existing.transferId,
            id: { not: id },
          },
          data: pairedUpdateData,
        })
      }

      const paired = await tx.transaction.findFirst({
        where: {
          transferId: existing.transferId,
          id: { not: id },
        },
        select: { bankAccountId: true },
      })

      await recalculateBalance(tx, existing.bankAccountId)
      if (paired) {
        await recalculateBalance(tx, paired.bankAccountId)
      }

      return updated
    }

    const updated = await tx.transaction.update({
      where: { id },
      data: updateData,
      include: transactionInclude,
    })

    const affectedAccountIds = new Set([existing.bankAccountId])
    if (input.bankAccountId && input.bankAccountId !== existing.bankAccountId) {
      affectedAccountIds.add(input.bankAccountId)
    }

    for (const accountId of affectedAccountIds) {
      await recalculateBalance(tx, accountId)
    }

    return updated
  })
}

export async function deleteTransaction(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({ where: { id } })

    if (!existing || existing.userId !== userId) {
      throw new NotFound('Transação não encontrada')
    }

    const affectedAccountIds = new Set([existing.bankAccountId])

    if (existing.type === 'TRANSFER' && existing.transferId) {
      const paired = await tx.transaction.findFirst({
        where: {
          transferId: existing.transferId,
          id: { not: id },
        },
        select: { bankAccountId: true },
      })

      if (paired) {
        affectedAccountIds.add(paired.bankAccountId)
      }

      await tx.transaction.deleteMany({
        where: { transferId: existing.transferId },
      })
    } else {
      await tx.transaction.delete({ where: { id } })
    }

    for (const accountId of affectedAccountIds) {
      await recalculateBalance(tx, accountId)
    }
  })
}

interface SummaryInput {
  startDate?: string
  endDate?: string
  bankAccountId?: string
}

export async function getSummary(
  prisma: PrismaClient,
  userId: string,
  input: SummaryInput,
) {
  const now = new Date()
  const startDate = input.startDate
    ? new Date(input.startDate)
    : new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = input.endDate
    ? new Date(input.endDate)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const where = {
    userId,
    isPaid: true,
    date: { gte: startDate, lte: endDate },
    ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
  }

  const aggregations = await prisma.transaction.groupBy({
    by: ['type', 'isTransferOut'],
    where,
    _sum: { amount: true },
  })

  let totalIncome = 0
  let totalExpense = 0

  for (const agg of aggregations) {
    const sum = agg._sum.amount ?? 0
    if (agg.type === 'INCOME') {
      totalIncome += sum
    } else if (agg.type === 'EXPENSE') {
      totalExpense += sum
    } else if (agg.type === 'TRANSFER') {
      if (agg.isTransferOut) {
        totalExpense += sum
      } else {
        totalIncome += sum
      }
    }
  }

  return {
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    },
  }
}
