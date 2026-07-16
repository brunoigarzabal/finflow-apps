import { z } from 'zod'

export const changePasswordBody = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6),
})

export const changePasswordResponse = z.object({
  success: z.boolean(),
})
