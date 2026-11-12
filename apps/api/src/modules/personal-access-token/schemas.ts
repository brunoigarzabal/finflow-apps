import { z } from 'zod'

export const personalAccessTokenResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  tokenPrefix: z.string(),
  lastUsedAt: z.date().nullable(),
  createdAt: z.date(),
})

export const personalAccessTokenIdParam = z.object({
  id: z.uuid(),
})
