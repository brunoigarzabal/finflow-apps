import fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from './env.js'
import prismaPlugin from './lib/prisma.js'
import errorHandler from './plugins/error-handler.js'
import authPlugin from './plugins/auth.js'
import healthModule from './modules/health/index.js'
import authModule from './modules/auth/index.js'
import bankAccountModule from './modules/bank-account/index.js'
import categoryModule from './modules/category/index.js'
import transactionModule from './modules/transaction/index.js'
import dashboardModule from './modules/dashboard/index.js'

export async function buildApp() {
  const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(cors, {
    origin: true,
    credentials: true,
  })

  app.register(cookie)

  app.register(swagger, {
    openapi: {
      info: {
        title: 'FinFlow API',
        version: '0.0.1',
      },
      components: {
        securitySchemes: {
          bearer: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  app.register(swaggerUi, { routePrefix: '/docs' })

  app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  })

  app.register(prismaPlugin)
  app.register(errorHandler)
  app.register(authPlugin)

  app.register(healthModule, { prefix: '/health' })
  app.register(authModule, { prefix: '/auth' })
  app.register(bankAccountModule, { prefix: '/bank-accounts' })
  app.register(categoryModule, { prefix: '/categories' })
  app.register(transactionModule, { prefix: '/transactions' })
  app.register(dashboardModule, { prefix: '/dashboard' })

  return app
}
