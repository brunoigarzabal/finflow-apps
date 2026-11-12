import type {
  Prisma,
  PrismaClient,
} from '../../../../generated/prisma/client.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

const personalAccessTokenSelect = {
  id: true,
  name: true,
  tokenPrefix: true,
  lastUsedAt: true,
  createdAt: true,
} as const

export function personalAccessTokenRepository(prisma: PrismaArg) {
  return {
    findActiveByUser: (userId: string) =>
      prisma.personalAccessToken.findMany({
        where: { userId, revokedAt: null },
        select: personalAccessTokenSelect,
        orderBy: { createdAt: 'desc' },
      }),

    findActiveByHash: (tokenHash: string) =>
      prisma.personalAccessToken.findFirst({
        where: { tokenHash, revokedAt: null },
        select: { id: true, userId: true, lastUsedAt: true },
      }),

    create: (data: {
      name: string
      tokenHash: string
      tokenPrefix: string
      userId: string
    }) =>
      prisma.personalAccessToken.create({
        data,
        select: personalAccessTokenSelect,
      }),

    revoke: (id: string, userId: string) =>
      prisma.personalAccessToken.updateMany({
        where: { id, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),

    touchLastUsed: (id: string) =>
      prisma.personalAccessToken.update({
        where: { id },
        data: { lastUsedAt: new Date() },
        select: { id: true },
      }),
  }
}
