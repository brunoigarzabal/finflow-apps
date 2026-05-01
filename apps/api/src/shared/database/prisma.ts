import { PrismaPg } from '@prisma/adapter-pg'
import fp from 'fastify-plugin'

import { PrismaClient } from '../../../generated/prisma/client.js'
import { env } from '../config/env.js'

export default fp(
  async (fastify) => {
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
    const prisma = new PrismaClient({ adapter })

    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async () => {
      await prisma.$disconnect()
    })
  },
  { name: 'prisma' }
)
