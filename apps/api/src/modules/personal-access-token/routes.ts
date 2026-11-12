import type { FastifyInstance } from 'fastify'

import { createPersonalAccessTokenHandler } from './create-personal-access-token/create-personal-access-token.js'
import { listPersonalAccessTokensHandler } from './list-personal-access-tokens/list-personal-access-tokens.js'
import { revokePersonalAccessTokenHandler } from './revoke-personal-access-token/revoke-personal-access-token.js'

export async function personalAccessTokenRoutes(app: FastifyInstance) {
  app.register(listPersonalAccessTokensHandler)
  app.register(createPersonalAccessTokenHandler)
  app.register(revokePersonalAccessTokenHandler)
}
