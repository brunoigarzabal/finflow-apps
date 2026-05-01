import { buildApp } from './app.js'
import { env } from './shared/config/env.js'

async function main() {
  const app = await buildApp()

  await app.listen({ port: env.PORT, host: '0.0.0.0' })
}

main()
