import type { FastifyInstance, FastifyReply } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { env } from '../../env.js'
import {
  registerBody,
  loginBody,
  googleLoginBody,
  tokenResponse,
  profileResponse,
} from './auth.schemas.js'
import {
  createUser,
  authenticateUser,
  getUserById,
} from './auth.service.js'
import {
  verifyGoogleToken,
  findOrCreateOAuthUser,
} from './oauth.service.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
}

async function issueAuthToken(reply: FastifyReply, userId: string) {
  const token = await reply.jwtSign({ sub: userId }, { expiresIn: '7d' })
  reply.setCookie('token', token, COOKIE_OPTIONS)
  return { token }
}

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
      return reply.status(201).send(await issueAuthToken(reply, user.id))
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
      return reply.send(await issueAuthToken(reply, user.id))
    },
  )

  typedApp.post(
    '/google',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with Google',
        body: googleLoginBody,
        response: { 200: tokenResponse },
      },
    },
    async (request, reply) => {
      const profile = await verifyGoogleToken(
        request.body.idToken,
        env.GOOGLE_CLIENT_ID,
      )

      const user = await findOrCreateOAuthUser(app.prisma, {
        provider: 'GOOGLE',
        ...profile,
      })

      return reply.send(await issueAuthToken(reply, user.id))
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
