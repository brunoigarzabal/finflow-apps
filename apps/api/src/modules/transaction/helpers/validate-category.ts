import type { Prisma, PrismaClient } from '../../../../generated/prisma/client.js'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

export async function validateCategory(
  prisma: PrismaArg,
  userId: string,
  categoryId: string,
) {
  const repo = categoryRepository(prisma)
  const category = await repo.findById(categoryId)

  if (!category || category.userId !== userId) {
    throw new NotFound('Categoria não encontrada')
  }

  if (category.archived) {
    throw new BadRequest('Categoria está arquivada')
  }

  return category
}
