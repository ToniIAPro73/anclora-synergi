import { NextRequest, NextResponse } from 'next/server'
import { clearPartnerSessionCookie, createPartnerSessionCookie } from '@/lib/partner-auth'
import { getPartnerAccountByEmail, markPartnerLogin } from '@/lib/partner-admissions-store'
import { verifySecret } from '@/lib/passwords'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function POST(request: NextRequest) {
  let payload: { email?: string; secret?: string; remember?: boolean }

  try {
    payload = (await request.json()) as { email?: string; secret?: string; remember?: boolean }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const email = payload.email?.trim() || ''
  const secret = payload.secret?.trim() || ''
  const remember = payload.remember !== false
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const rateLimit = checkRateLimit(buildRateLimitKey(['partner-login', email || 'unknown', ipAddress || 'unknown']), 8, 60_000)

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'partner_login_rate_limited',
      actorType: 'partner',
      actorIdentifier: email || 'unknown',
      endpoint: '/api/partner/session',
      method: 'POST',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  if (!email || !secret) {
    await recordSynergiAuditEvent({
      eventType: 'partner_login_failed',
      actorType: 'partner',
      actorIdentifier: email || 'unknown',
      endpoint: '/api/partner/session',
      method: 'POST',
      statusCode: 400,
      ipAddress,
      userAgent,
      details: { reason: 'missing_credentials' },
    })
    return NextResponse.json({ error: 'Email and access secret are required.' }, { status: 400 })
  }

  const account = await getPartnerAccountByEmail(email)
  if (!account) {
    await recordSynergiAuditEvent({
      eventType: 'partner_login_failed',
      actorType: 'partner',
      actorIdentifier: email,
      endpoint: '/api/partner/session',
      method: 'POST',
      statusCode: 404,
      ipAddress,
      userAgent,
      details: { reason: 'account_not_found' },
    })
    return NextResponse.json({ error: 'Partner account not found.' }, { status: 404 })
  }

  const inviteCodeStillValid =
    !!account.invite_code_hash &&
    (!account.invite_code_expires_at || Date.now() <= new Date(account.invite_code_expires_at).getTime()) &&
    verifySecret(secret, account.invite_code_hash)

  if (inviteCodeStillValid) {
    await createPartnerSessionCookie(account.id, 'invited', remember)
    await recordSynergiAuditEvent({
      eventType: 'partner_login_success',
      actorType: 'partner',
      actorIdentifier: account.email,
      actorRole: 'partner',
      endpoint: '/api/partner/session',
      method: 'POST',
      statusCode: 200,
      ipAddress,
      userAgent,
      subjectType: 'partner_account',
      subjectId: account.id,
      details: { status: 'activation_required' },
    })
    return NextResponse.json({
      ok: true,
      status: 'activation_required',
      next_url: '/activate',
    })
  }

  const passwordValid = verifySecret(secret, account.password_hash)
  if (!passwordValid) {
    await recordSynergiAuditEvent({
      eventType: 'partner_login_failed',
      actorType: 'partner',
      actorIdentifier: account.email,
      endpoint: '/api/partner/session',
      method: 'POST',
      statusCode: 401,
      ipAddress,
      userAgent,
      subjectType: 'partner_account',
      subjectId: account.id,
      details: { reason: 'invalid_secret' },
    })
    if (account.invite_code_hash && account.invite_code_expires_at && Date.now() > new Date(account.invite_code_expires_at).getTime()) {
      return NextResponse.json({ error: 'Invitation code expired.' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Invalid password or access code.' }, { status: 401 })
  }

  await markPartnerLogin(account.id)
  await createPartnerSessionCookie(account.id, 'active', remember)
  await recordSynergiAuditEvent({
    eventType: 'partner_login_success',
    actorType: 'partner',
    actorIdentifier: account.email,
    actorRole: 'partner',
    endpoint: '/api/partner/session',
    method: 'POST',
    statusCode: 200,
    ipAddress,
    userAgent,
    subjectType: 'partner_account',
    subjectId: account.id,
    details: { status: 'authenticated' },
  })

  return NextResponse.json({
    ok: true,
    status: 'authenticated',
    next_url: '/workspace',
  })
}

export async function DELETE() {
  await clearPartnerSessionCookie()
  return NextResponse.json({ ok: true })
}
