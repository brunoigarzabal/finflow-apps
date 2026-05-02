import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { authRoutes } from './modules/auth/index.js'
import { bankAccountRoutes } from './modules/bank-account/index.js'
import { categoryRoutes } from './modules/category/index.js'
import { dashboardRoutes } from './modules/dashboard/index.js'
import { healthRoutes } from './modules/health/index.js'
import { recurringRuleRoutes } from './modules/recurring-rule/index.js'
import { transactionRoutes } from './modules/transaction/index.js'
import { env } from './shared/config/env.js'
import prismaPlugin from './shared/database/prisma.js'
import authPlugin from './shared/infra/http/middlewares/auth.js'
import errorHandler from './shared/infra/http/middlewares/error-handler.js'

export async function buildApp() {
  const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(helmet, { global: true })

  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      message: `Muitas tentativas. Tente novamente em ${Math.ceil(context.ttl / 1000)} segundos.`,
    }),
  })

  app.register(cookie)

  app.register(swagger, {
    openapi: {
      info: {
        title: 'FinFlow API',
        version: '1.0.0',
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

  app.register(healthRoutes, { prefix: '/health' })
  app.register(authRoutes, { prefix: '/auth' })
  app.register(bankAccountRoutes, { prefix: '/bank-accounts' })
  app.register(categoryRoutes, { prefix: '/categories' })
  app.register(transactionRoutes, { prefix: '/transactions' })
  app.register(recurringRuleRoutes, { prefix: '/recurring-rules' })
  app.register(dashboardRoutes, { prefix: '/dashboard' })

  return app
}
