import { hash, verify } from 'argon2'
import type { PrismaClient } from '../../../generated/prisma/client.js'

import { BadRequest, Conflict, Unauthorized } from '../../errors/index.js'
import { seedCategories } from './seed-categories.js'

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
    throw new Conflict('E-mail já está em uso')
  }

  const passwordHash = await hash(input.password)

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    })

    await seedCategories(tx, created.id)

    return created
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

  if (!user || !user.passwordHash) {
    throw new BadRequest('Credenciais inválidas')
  }

  const validPassword = await verify(user.passwordHash, input.password)

  if (!validPassword) {
    throw new BadRequest('Credenciais inválidas')
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
    throw new Unauthorized('Usuário não encontrado')
  }

  return user
}
