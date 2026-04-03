import { hash, verify } from 'argon2'
import type { PrismaClient } from '../../../generated/prisma/client.js'

import { BadRequest, Conflict, Unauthorized } from '../../errors/index.js'

interface CreateUserInput {
  name: string
  email: string
  password: string
}

export async function createUser(prisma: PrismaClient, input: CreateUserInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existing) {
    throw new Conflict('Email already in use')
  }

  const passwordHash = await hash(input.password)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
  })

  return user
}

interface AuthenticateInput {
  email: string
  password: string
}

export async function authenticateUser(
  prisma: PrismaClient,
  input: AuthenticateInput,
) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (!user) {
    throw new BadRequest('Invalid credentials')
  }

  const validPassword = await verify(user.passwordHash, input.password)

  if (!validPassword) {
    throw new BadRequest('Invalid credentials')
  }

  return user
}

export async function getUserById(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  })

  if (!user) {
    throw new Unauthorized('User not found')
  }

  return user
}
