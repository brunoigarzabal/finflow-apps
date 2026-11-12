import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { FastifyInstance } from 'fastify'

import { authenticatePersonalAccessToken } from '@/modules/personal-access-token/index.js'

import { createMcpServer } from './helpers/create-mcp-server.js'

const MCP_RATE_LIMIT = { max: 60, timeWindow: '1 minute' }

export async function mcpRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      config: { rateLimit: MCP_RATE_LIMIT },
      schema: { hide: true },
    },
    async (request, reply) => {
      const { userId, tokenId } = await authenticatePersonalAccessToken(
        app.prisma,
        request.headers.authorization
      )

      const server = createMcpServer({
        prisma: app.prisma,
        userId,
        tokenId,
        log: request.log,
      })
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      })

      reply.raw.on('close', () => server.close())

      await server.connect(transport)
      reply.hijack()
      await transport.handleRequest(request.raw, reply.raw, request.body)
    }
  )

  app.route({
    method: ['GET', 'DELETE'],
    url: '/',
    schema: { hide: true },
    handler: (_request, reply) =>
      reply
        .status(405)
        .header('Allow', 'POST')
        .send({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Method not allowed' },
          id: null,
        }),
  })
}
