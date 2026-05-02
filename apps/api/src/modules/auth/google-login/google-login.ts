import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { env } from '@/shared/config/env.js'

import { issueAuthToken } from '../helpers/issue-auth-token.js'
import {
  verifyGoogleToken,
  findOrCreateOAuthUser,
} from '../helpers/oauth.service.js'

import { googleLoginBody, tokenResponse } from './google-login.schema.js'

export async function googleLoginHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/google',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
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
        env.GOOGLE_CLIENT_ID
      )

      const user = await findOrCreateOAuthUser(app.prisma, {
        provider: 'GOOGLE',
        ...profile,
      })

      return reply.send(await issueAuthToken(reply, user.id))
    }
  )
}
