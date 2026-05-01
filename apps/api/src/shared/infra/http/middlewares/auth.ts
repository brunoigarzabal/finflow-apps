import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import { Unauthorized } from '../errors/index.js'

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.decorateRequest('getCurrentUserId', async function () {
      try {
        const { sub } = await this.jwtVerify<{ sub: string }>()
        return sub
      } catch {
        throw new Unauthorized('Invalid or missing token')
      }
    })
  },
  { name: 'auth', dependencies: ['@fastify/jwt'] }
)
