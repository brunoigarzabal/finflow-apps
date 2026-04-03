import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { env } from '../../env.js'
import {
  registerBody,
  loginBody,
  tokenResponse,
  profileResponse,
} from './auth.schemas.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
}
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

      reply.setCookie('token', token, COOKIE_OPTIONS)
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

      reply.setCookie('token', token, COOKIE_OPTIONS)
      return reply.send({ token })
    },
  )

  typedApp.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Clear authentication cookie',
      },
    },
    async (_request, reply) => {
      reply.clearCookie('token', { path: '/' })
      return reply.send({ success: true })
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
