import { OAuth2Client } from 'google-auth-library'
import type {
  AccountProvider,
  PrismaClient,
} from '../../../generated/prisma/client.js'

import { BadRequest } from '../../errors/index.js'

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
  const account = await prisma.account.findUnique({
    where: { providerAccountId: profile.providerAccountId },
    include: { user: true },
  })

  if (account) {
    return account.user
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
  })

  if (existingUser) {
    return await prisma.$transaction(async (tx) => {
      await tx.account.create({
        data: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
          userId: existingUser.id,
        },
      })

      if (!existingUser.avatarUrl && profile.avatarUrl) {
        return await tx.user.update({
          where: { id: existingUser.id },
          data: { avatarUrl: profile.avatarUrl },
        })
      }

      return existingUser
    })
  }

  return await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      },
    })

    await tx.account.create({
      data: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        userId: created.id,
      },
    })

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
