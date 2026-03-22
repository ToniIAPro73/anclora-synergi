import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'synergi_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12

function getSessionSecret() {
  const secret = process.env.SYNERGI_ADMIN_SESSION_SECRET?.trim()
  if (!secret) throw new Error('Missing SYNERGI_ADMIN_SESSION_SECRET in server environment.')
  return secret
}

function signSessionPayload(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
}

function buildSessionValue(username: string) {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = `${username}:${expiresAt}`
  const signature = signSessionPayload(payload)
  return `${payload}:${signature}`
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

export function validateAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.SYNERGI_ADMIN_USERNAME?.trim()
  const expectedPassword = process.env.SYNERGI_ADMIN_PASSWORD?.trim()

  if (!expectedUsername || !expectedPassword) {
    throw new Error('Missing SYNERGI_ADMIN_USERNAME or SYNERGI_ADMIN_PASSWORD in server environment.')
  }

  return safeCompare(username, expectedUsername) && safeCompare(password, expectedPassword)
}

export async function createAdminSessionCookie(username: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, buildSessionValue(username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function clearAdminSessionCookie() {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  })
}

export async function getAuthenticatedAdmin() {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE_NAME)?.value
  if (!raw) return null

  const parts = raw.split(':')
  if (parts.length < 3) return null

  const [username, expiresAtRaw, signature] = parts
  const expiresAt = Number(expiresAtRaw)
  if (!username || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

  const payload = `${username}:${expiresAt}`
  const expectedSignature = signSessionPayload(payload)
  if (!safeCompare(signature, expectedSignature)) return null

  return { username, expiresAt }
}

export async function requireAdminSession() {
  const session = await getAuthenticatedAdmin()
  if (!session) {
    throw new Error('UNAUTHORIZED_ADMIN_SESSION')
  }
  return session
}
