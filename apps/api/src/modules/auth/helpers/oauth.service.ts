import { OAuth2Client } from 'google-auth-library'
import type {
  AccountProvider,
  PrismaClient,
} from '../../../../generated/prisma/client.js'

import { userRepository } from '@/shared/database/repositories/user.repository.js'
import { BadRequest } from '@/shared/infra/http/errors/index.js'
import { seedCategories } from './seed-categories.js'

const googleClient = new OAuth2Client()

interface OAuthProfile {
  provider: AccountProvider
  providerAccountId: string
  email: string
  name: string
  avatarUrl: string | null
}

export async function findOrCreateOAuthUser(
  prisma: PrismaClient,
  profile: OAuthProfile,
) {
  const repo = userRepository(prisma)
  const account = await repo.findByProvider(profile.providerAccountId)

  if (account) {
    return account.user
  }

  const existingUser = await repo.findByEmail(profile.email)

  if (existingUser) {
    return await prisma.$transaction(async (tx) => {
      const txRepo = userRepository(tx)

      await txRepo.createAccount({
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        userId: existingUser.id,
      })

      if (!existingUser.avatarUrl && profile.avatarUrl) {
        return await txRepo.update(existingUser.id, { avatarUrl: profile.avatarUrl })
      }

      return existingUser
    })
  }

  return await prisma.$transaction(async (tx) => {
    const txRepo = userRepository(tx)

    const created = await txRepo.create({
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
    })

    await txRepo.createAccount({
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      userId: created.id,
    })

    await seedCategories(tx, created.id)

    return created
  })
}

export async function verifyGoogleToken(idToken: string, clientId: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: clientId,
  })

  const payload = ticket.getPayload()

  if (!payload || !payload.email || !payload.email_verified) {
    throw new BadRequest('Token do Google inválido ou e-mail não verificado')
  }

  return {
    providerAccountId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    avatarUrl: payload.picture ?? null,
  }
}
