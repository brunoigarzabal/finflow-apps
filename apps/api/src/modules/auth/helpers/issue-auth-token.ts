import type { FastifyReply } from 'fastify'

import { AUTH_COOKIE_OPTIONS } from './cookie-options'

export async function issueAuthToken(reply: FastifyReply, userId: string) {
  const token = await reply.jwtSign({ sub: userId }, { expiresIn: '7d' })
  reply.setCookie('token', token, AUTH_COOKIE_OPTIONS)
  return { token }
}
