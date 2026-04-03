import 'fastify'

import type { PrismaClient } from '../generated/prisma/client.js'

declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient
  }

  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
  }
}
