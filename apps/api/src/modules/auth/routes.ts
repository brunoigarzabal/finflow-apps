import type { FastifyInstance } from 'fastify'

import { changeEmailHandler } from './change-email/change-email.js'
import { changePasswordHandler } from './change-password/change-password.js'
import { getProfileHandler } from './get-profile/get-profile.js'
import { googleLoginHandler } from './google-login/google-login.js'
import { loginHandler } from './login/login.js'
import { logoutHandler } from './logout/logout.js'
import { registerHandler } from './register/register.js'
import { unlinkGoogleHandler } from './unlink-google/unlink-google.js'

export async function authRoutes(app: FastifyInstance) {
  app.register(registerHandler)
  app.register(loginHandler)
  app.register(googleLoginHandler)
  app.register(logoutHandler)
  app.register(getProfileHandler)
  app.register(changePasswordHandler)
  app.register(changeEmailHandler)
  app.register(unlinkGoogleHandler)
}
