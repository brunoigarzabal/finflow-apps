import type { Prisma, PrismaClient } from '../../../../generated/prisma/client.js'
import type { CategoryType } from '../../../../generated/prisma/enums.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

export function categoryRepository(prisma: PrismaArg) {
  return {
    findMany: (
      userId: string,
      filters: { type?: CategoryType; archived?: boolean },
    ) =>
      prisma.category.findMany({
        where: {
          userId,
          ...(filters.type ? { type: filters.type } : {}),
          ...(filters.archived !== undefined ? { archived: filters.archived } : {}),
        },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),

    findById: (id: string) =>
      prisma.category.findUnique({ where: { id } }),

    findManyByIds: (ids: string[]) =>
      prisma.category.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, color: true, icon: true },
      }),

    create: (data: {
      name: string
      type: CategoryType
      color: string
      icon: string
      isDefault: boolean
      userId: string
    }) => prisma.category.create({ data }),

    createMany: (
      data: {
        name: string
        type: CategoryType
        color: string
        icon: string
        isDefault: boolean
        userId: string
      }[],
    ) => prisma.category.createMany({ data, skipDuplicates: true }),

    update: (id: string, data: Partial<{ name: string; color: string; icon: string; archived: boolean }>) =>
      prisma.category.update({ where: { id }, data }),

    archiveMany: (id: string, userId: string) =>
      prisma.category.updateMany({
        where: { id, userId, archived: false },
        data: { archived: true },
      }),

    restoreMany: (id: string, userId: string) =>
      prisma.category.updateMany({
        where: { id, userId, archived: true },
        data: { archived: false },
      }),
  }
}
