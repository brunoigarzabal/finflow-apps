import { personalAccessTokenRepository } from '@/shared/database/repositories/personal-access-token.repository.js'
import { Unauthorized } from '@/shared/infra/http/errors/index.js'

import type { PrismaClient } from '../../../../generated/prisma/client.js'

import { hashPersonalAccessToken, isPersonalAccessToken } from './token.js'

const LAST_USED_THROTTLE_MS = 60_000

function extractBearerToken(authorization?: string) {
  const [scheme, value] = authorization?.split(' ') ?? []
  if (scheme?.toLowerCase() !== 'bearer' || !value) return null
  return value
}

export async function authenticatePersonalAccessToken(
  prisma: PrismaClient,
  authorization?: string
) {
  const repo = personalAccessTokenRepository(prisma)
  const token = extractBearerToken(authorization)
  const record =
    token && isPersonalAccessToken(token)
      ? await repo.findActiveByHash(hashPersonalAccessToken(token))
      : null

  if (!record) {
    throw new Unauthorized('Token de acesso pessoal ausente ou inválido')
  }

  const lastUsed = record.lastUsedAt?.getTime() ?? 0
  if (Date.now() - lastUsed > LAST_USED_THROTTLE_MS) {
    await repo.touchLastUsed(record.id)
  }

  return { userId: record.userId, tokenId: record.id }
}
