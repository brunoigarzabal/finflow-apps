import { z } from 'zod'

export const unlinkGoogleResponse = z.object({
  success: z.boolean(),
})
