import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

export function hashSecret(secret: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(secret, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${derived}`
}

export function verifySecret(secret: string, hashed: string | null | undefined) {
  if (!hashed) return false
  const [salt, stored] = hashed.split(':')
  if (!salt || !stored) return false

  const derived = scryptSync(secret, salt, KEY_LENGTH)
  const storedBuffer = Buffer.from(stored, 'hex')
  if (storedBuffer.length !== derived.length) return false
  return timingSafeEqual(derived, storedBuffer)
}

export function generateInviteCode() {
  return randomBytes(6).toString('base64url').toUpperCase()
}
