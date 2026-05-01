import { hash } from 'argon2'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { userRepository } from '@/shared/database/repositories/user.repository.js'
import { Conflict } from '@/shared/infra/http/errors/index.js'

import { issueAuthToken } from '../helpers/issue-auth-token.js'
import { seedCategories } from '../helpers/seed-categories.js'

import { registerBody, tokenResponse } from './register.schema.js'

export async function registerHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: registerBody,
        response: { 201: tokenResponse },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body
      const repo = userRepository(app.prisma)

      const existing = await repo.findByEmail(email)
      if (existing) {
        throw new Conflict('E-mail já está em uso')
      }

      const passwordHash = await hash(password)

      const user = await app.prisma.$transaction(async (tx) => {
        const txRepo = userRepository(tx)
        const created = await txRepo.create({ name, email, passwordHash })
        await seedCategories(tx, created.id)
        return created
      })

      return reply.status(201).send(await issueAuthToken(reply, user.id))
    }
  )
}
