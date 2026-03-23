import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { SecurityActorRole } from '@/lib/synergi-security'

const SESSION_COOKIE_NAME = 'synergi_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12

export type AdminRole = SecurityActorRole | 'viewer'

export type AdminSession = {
  username: string
  role: AdminRole
  expiresAt: number
}

type AdminAccount = {
  username: string
  password: string
  role: AdminRole
}

const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 1,
  reviewer: 2,
  operator: 3,
  admin: 4,
  owner: 5,
  partner: 0,
}

function getSessionSecret() {
  const secret = process.env.SYNERGI_ADMIN_SESSION_SECRET?.trim()
  if (!secret) throw new Error('Missing SYNERGI_ADMIN_SESSION_SECRET in server environment.')
  return secret
}

function signSessionPayload(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
}

function buildSessionValue(username: string, role: AdminRole) {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = `${username}:${role}:${expiresAt}`
  const signature = signSessionPayload(payload)
  return `${payload}:${signature}`
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function parseAdminAccounts(): AdminAccount[] {
  const accountsJson = process.env.SYNERGI_ADMIN_ACCOUNTS_JSON?.trim()
  if (accountsJson) {
    try {
      const parsed = JSON.parse(accountsJson) as Array<{ username?: string; password?: string; role?: string }>
      const accounts = parsed
        .map((item) => ({
          username: item.username?.trim() || '',
          password: item.password?.trim() || '',
          role: normalizeRole(item.role),
        }))
        .filter((item) => item.username && item.password)

      if (accounts.length) return accounts
    } catch {
      throw new Error('SYNERGI_ADMIN_ACCOUNTS_JSON must be valid JSON.')
    }
  }

  const username = process.env.SYNERGI_ADMIN_USERNAME?.trim()
  const password = process.env.SYNERGI_ADMIN_PASSWORD?.trim()
  const role = normalizeRole(process.env.SYNERGI_ADMIN_ROLE?.trim())

  if (!username || !password) {
    throw new Error('Missing SYNERGI_ADMIN_USERNAME or SYNERGI_ADMIN_PASSWORD in server environment.')
  }

  return [{ username, password, role }]
}

function normalizeRole(value?: string | null): AdminRole {
  const candidate = (value || '').trim().toLowerCase()
  if (candidate === 'owner') return 'owner'
  if (candidate === 'admin') return 'admin'
  if (candidate === 'operator') return 'operator'
  if (candidate === 'viewer') return 'viewer'
  return 'reviewer'
}

function compareRole(current: AdminRole, required: AdminRole) {
  return ROLE_RANK[current] >= ROLE_RANK[required]
}

export function resolveAdminCredentials(username: string, password: string): AdminAccount | null {
  const accounts = parseAdminAccounts()
  const matched = accounts.find(
    (account) => safeCompare(username, account.username) && safeCompare(password, account.password)
  )
  return matched || null
}

export async function createAdminSessionCookie(username: string, role: AdminRole) {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, buildSessionValue(username, role), {
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
  if (parts.length < 4) return null

  const [username, roleRaw, expiresAtRaw, signature] = parts
  const role = normalizeRole(roleRaw)
  const expiresAt = Number(expiresAtRaw)
  if (!username || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

  const payload = `${username}:${role}:${expiresAt}`
  const expectedSignature = signSessionPayload(payload)
  if (!safeCompare(signature, expectedSignature)) return null

  return { username, role, expiresAt }
}

export async function requireAdminSession(minRole: AdminRole = 'reviewer') {
  const session = await getAuthenticatedAdmin()
  if (!session || !compareRole(session.role, minRole)) {
    throw new Error('UNAUTHORIZED_ADMIN_SESSION')
  }
  return session
}
