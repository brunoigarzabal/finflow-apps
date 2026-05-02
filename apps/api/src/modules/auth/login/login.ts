import { verify } from 'argon2'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { userRepository } from '@/shared/database/repositories/user.repository.js'
import { BadRequest } from '@/shared/infra/http/errors/index.js'

import { issueAuthToken } from '../helpers/issue-auth-token.js'

import { loginBody, tokenResponse } from './login.schema.js'

export async function loginHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with email and password',
        body: loginBody,
        response: { 200: tokenResponse },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body
      const repo = userRepository(app.prisma)

      const user = await repo.findByEmail(email)
      if (!user || !user.passwordHash) {
        throw new BadRequest('Credenciais inválidas')
      }

      const validPassword = await verify(user.passwordHash, password)
      if (!validPassword) {
        throw new BadRequest('Credenciais inválidas')
      }

      return reply.send(await issueAuthToken(reply, user.id))
    }
  )
}
