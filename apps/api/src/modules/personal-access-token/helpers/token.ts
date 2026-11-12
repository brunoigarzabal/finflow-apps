import { createHash, randomBytes } from 'node:crypto'

const TOKEN_PREFIX = 'ffpat_'
const TOKEN_BYTES = 32
const DISPLAY_PREFIX_LENGTH = TOKEN_PREFIX.length + 6

export function generatePersonalAccessToken() {
  const token = `${TOKEN_PREFIX}${randomBytes(TOKEN_BYTES).toString('base64url')}`
  return {
    token,
    tokenHash: hashPersonalAccessToken(token),
    tokenPrefix: token.slice(0, DISPLAY_PREFIX_LENGTH),
  }
}

export function hashPersonalAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function isPersonalAccessToken(value: string) {
  return value.startsWith(TOKEN_PREFIX)
}
