import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export type PartnerSessionStage = 'invited' | 'active'

const SESSION_COOKIE_NAME = 'synergi_partner_session'
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 14
const SHORT_TTL_MS = 1000 * 60 * 60 * 8

function getSessionSecret() {
  const secret =
    process.env.SYNERGI_PARTNER_SESSION_SECRET?.trim() ||
    process.env.SYNERGI_ADMIN_SESSION_SECRET?.trim()

  if (!secret) {
    throw new Error('Missing SYNERGI_PARTNER_SESSION_SECRET in server environment.')
  }

  return secret
}

function signSessionPayload(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function buildSessionValue(partnerAccountId: string, stage: PartnerSessionStage, remember: boolean) {
  const expiresAt = Date.now() + (remember ? DEFAULT_TTL_MS : SHORT_TTL_MS)
  const payload = `${partnerAccountId}:${stage}:${expiresAt}`
  const signature = signSessionPayload(payload)
  return {
    value: `${payload}:${signature}`,
    expiresAt,
  }
}

export async function createPartnerSessionCookie(
  partnerAccountId: string,
  stage: PartnerSessionStage,
  remember: boolean
) {
  const store = await cookies()
  const session = buildSessionValue(partnerAccountId, stage, remember)

  store.set(SESSION_COOKIE_NAME, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor((session.expiresAt - Date.now()) / 1000),
  })
}

export async function clearPartnerSessionCookie() {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  })
}

export async function getAuthenticatedPartner() {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE_NAME)?.value
  if (!raw) return null

  const parts = raw.split(':')
  if (parts.length < 4) return null

  const [partnerAccountId, stage, expiresAtRaw, signature] = parts
  const expiresAt = Number(expiresAtRaw)
  if (!partnerAccountId || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null
  if (stage !== 'invited' && stage !== 'active') return null

  const payload = `${partnerAccountId}:${stage}:${expiresAt}`
  const expectedSignature = signSessionPayload(payload)
  if (!safeCompare(signature, expectedSignature)) return null

  return {
    partnerAccountId,
    stage: stage as PartnerSessionStage,
    expiresAt,
  }
}

export async function requirePartnerSession() {
  const session = await getAuthenticatedPartner()
  if (!session) throw new Error('UNAUTHORIZED_PARTNER_SESSION')
  return session
}
