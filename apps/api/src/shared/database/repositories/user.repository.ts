import type {
  AccountProvider,
  Prisma,
  PrismaClient,
} from '../../../../generated/prisma/client.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

export function userRepository(prisma: PrismaArg) {
  return {
    findByEmail: (email: string) =>
      prisma.user.findUnique({ where: { email } }),

    findById: (id: string) =>
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      }),

    findByIdWithAuth: (id: string) =>
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          passwordHash: true,
          accounts: { select: { provider: true } },
        },
      }),

    create: (data: {
      name: string
      email: string
      passwordHash?: string
      avatarUrl?: string | null
    }) => prisma.user.create({ data }),

    update: (
      id: string,
      data: { avatarUrl?: string | null; email?: string; passwordHash?: string }
    ) => prisma.user.update({ where: { id }, data }),

    findByProvider: (providerAccountId: string) =>
      prisma.account.findUnique({
        where: { providerAccountId },
        include: { user: true },
      }),

    createAccount: (data: {
      provider: AccountProvider
      providerAccountId: string
      userId: string
    }) => prisma.account.create({ data }),

    deleteAccountByProvider: (provider: AccountProvider, userId: string) =>
      prisma.account.delete({
        where: { provider_userId: { provider, userId } },
      }),
  }
}
