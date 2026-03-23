import { NextRequest, NextResponse } from 'next/server'
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminDefaultLandingPath,
  getAuthenticatedAdmin,
  resolveAdminCredentials,
} from '@/lib/admin-auth'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function POST(request: NextRequest) {
  let payload: { username?: string; password?: string }

  try {
    payload = (await request.json()) as { username?: string; password?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const username = payload.username?.trim() || ''
  const password = payload.password?.trim() || ''
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const rateLimit = checkRateLimit(buildRateLimitKey(['admin-login', username || 'unknown', ipAddress || 'unknown']), 8, 60_000)
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_login_rate_limited',
      actorType: 'admin',
      actorIdentifier: username || 'unknown',
      endpoint: '/api/admin/session',
      method: 'POST',
      statusCode: 429,
      ipAddress,
      userAgent,
      details: { username },
    })
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const account = resolveAdminCredentials(username, password)
    if (!account) {
      await recordSynergiAuditEvent({
        eventType: 'admin_login_failed',
        actorType: 'admin',
        actorIdentifier: username || 'unknown',
        endpoint: '/api/admin/session',
        method: 'POST',
        statusCode: 401,
        ipAddress,
        userAgent,
      })
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    await createAdminSessionCookie(account.username, account.role)
    await recordSynergiAuditEvent({
      eventType: 'admin_login_success',
      actorType: 'admin',
      actorIdentifier: account.username,
      actorRole: account.role,
      endpoint: '/api/admin/session',
      method: 'POST',
      statusCode: 200,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ ok: true, role: account.role, landingPath: getAdminDefaultLandingPath(account.role) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create admin session.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await getAuthenticatedAdmin().catch(() => null)
  if (!session) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({
    authenticated: true,
    username: session.username,
    role: session.role,
    landingPath: getAdminDefaultLandingPath(session.role),
    expiresAt: session.expiresAt,
  })
}

export async function DELETE() {
  const session = await getAuthenticatedAdmin().catch(() => null)
  await clearAdminSessionCookie()
  await recordSynergiAuditEvent({
    eventType: 'admin_session_ended',
    actorType: 'admin',
    actorIdentifier: session?.username || 'unknown',
    actorRole: session?.role,
    endpoint: '/api/admin/session',
    method: 'DELETE',
    statusCode: 200,
  })
  return NextResponse.json({ ok: true })
}
