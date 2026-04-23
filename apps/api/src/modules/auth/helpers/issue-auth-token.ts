import type { FastifyReply } from 'fastify'

import { env } from '@/shared/config/env.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
}

export async function issueAuthToken(reply: FastifyReply, userId: string) {
  const token = await reply.jwtSign({ sub: userId }, { expiresIn: '7d' })
  reply.setCookie('token', token, COOKIE_OPTIONS)
  return { token }
}
