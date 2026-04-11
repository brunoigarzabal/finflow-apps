import type { PrismaClient } from '../../../generated/prisma/client.js'
import type { CategoryType } from '../../../generated/prisma/enums.js'

import { BadRequest, Conflict, NotFound } from '../../errors/index.js'

interface CreateCategoryInput {
  name: string
  type: CategoryType
  color: string
  icon: string
}

type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, 'type'>>

export async function listCategories(
  prisma: PrismaClient,
  userId: string,
  type: CategoryType | undefined,
  includeArchived: boolean,
) {
  return prisma.category.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
      ...(includeArchived ? {} : { archived: false }),
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })
}

export async function getCategory(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const category = await prisma.category.findUnique({ where: { id } })

  if (!category || category.userId !== userId) {
    throw new NotFound('Categoria não encontrada')
  }

  return category
}

export async function createCategory(
  prisma: PrismaClient,
  userId: string,
  data: CreateCategoryInput,
) {
  try {
    return await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        isDefault: false,
        userId,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      throw new Conflict('Categoria com mesmo nome e tipo já existe')
    }
    throw error
  }
}

export async function updateCategory(
  prisma: PrismaClient,
  userId: string,
  id: string,
  data: UpdateCategoryInput,
) {
  await getCategory(prisma, userId, id)

  try {
    return await prisma.category.update({
      where: { id },
      data,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      throw new Conflict('Categoria com mesmo nome e tipo já existe')
    }
    throw error
  }
}

export async function archiveCategory(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const { count } = await prisma.category.updateMany({
    where: { id, userId, archived: false },
    data: { archived: true },
  })

  if (count === 0) {
    throw new NotFound('Categoria não encontrada')
  }
}

export async function restoreCategory(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const category = await getCategory(prisma, userId, id)

  if (!category.archived) {
    throw new BadRequest('Categoria já está ativa')
  }

  return prisma.category.update({
    where: { id },
    data: { archived: false },
  })
}
