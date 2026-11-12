import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { FastifyBaseLogger } from 'fastify'

import type { PrismaClient } from '../../../../generated/prisma/client.js'

export type ToolContext = {
  server: McpServer
  prisma: PrismaClient
  userId: string
  tokenId: string
  log: FastifyBaseLogger
}

export const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const

export function toolHandler<Input>(
  { log, userId, tokenId }: ToolContext,
  tool: string,
  handler: (input: Input) => Promise<unknown>
) {
  return async (input: Input): Promise<CallToolResult> => {
    const startedAt = Date.now()
    const logContext = () => ({
      tool,
      userId,
      tokenId,
      durationMs: Date.now() - startedAt,
    })

    try {
      const data = await handler(input)
      log.info(logContext(), 'mcp tool call')
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (error) {
      log.error({ ...logContext(), err: error }, 'mcp tool call failed')
      throw error
    }
  }
}
