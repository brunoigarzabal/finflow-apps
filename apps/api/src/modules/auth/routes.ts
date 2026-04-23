import type { FastifyInstance } from 'fastify'

import { registerHandler } from './register/register.js'
import { loginHandler } from './login/login.js'
import { googleLoginHandler } from './google-login/google-login.js'
import { logoutHandler } from './logout/logout.js'
import { getProfileHandler } from './get-profile/get-profile.js'

export async function authRoutes(app: FastifyInstance) {
  app.register(registerHandler)
  app.register(loginHandler)
  app.register(googleLoginHandler)
  app.register(logoutHandler)
  app.register(getProfileHandler)
}
