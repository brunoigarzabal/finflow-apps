import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  registerBody,
  loginBody,
  tokenResponse,
  profileResponse,
} from './auth.schemas.js'
import {
  createUser,
  authenticateUser,
  getUserById,
} from './auth.service.js'

export async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.post(
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
      const user = await createUser(app.prisma, request.body)

      const token = await reply.jwtSign(
        { sub: user.id },
        { expiresIn: '7d' },
      )

      return reply.status(201).send({ token })
    },
  )

  typedApp.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with email and password',
        body: loginBody,
        response: { 200: tokenResponse },
      },
    },
    async (request, reply) => {
      const user = await authenticateUser(app.prisma, request.body)

      const token = await reply.jwtSign(
        { sub: user.id },
        { expiresIn: '7d' },
      )

      return reply.send({ token })
    },
  )

  typedApp.get(
    '/profile',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Get authenticated user profile',
        security: [{ bearer: [] }],
        response: { 200: profileResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const user = await getUserById(app.prisma, userId)

      return { user }
    },
  )
}
