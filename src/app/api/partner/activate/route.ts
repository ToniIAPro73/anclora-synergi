import { NextRequest, NextResponse } from 'next/server'
import { createPartnerSessionCookie, requirePartnerSession } from '@/lib/partner-auth'
import { activatePartnerAccount } from '@/lib/partner-admissions-store'
import { hashSecret } from '@/lib/passwords'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function POST(request: NextRequest) {
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const rateLimit = checkRateLimit(buildRateLimitKey(['partner-activate', session.partnerAccountId, ipAddress || 'unknown']), 6, 15 * 60_000)
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'partner_activate_rate_limited',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/activate',
      method: 'POST',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many activation attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 900) } }
    )
  }

  let payload: { password?: string; confirmPassword?: string; remember?: boolean }

  try {
    payload = (await request.json()) as { password?: string; confirmPassword?: string; remember?: boolean }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const password = payload.password?.trim() || ''
  const confirmPassword = payload.confirmPassword?.trim() || ''
  const remember = payload.remember !== false

  if (password.length < 8) {
    await recordSynergiAuditEvent({
      eventType: 'partner_activate_failed',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/activate',
      method: 'POST',
      statusCode: 400,
      ipAddress,
      userAgent,
      subjectType: 'partner_account',
      subjectId: session.partnerAccountId,
      details: { reason: 'password_too_short' },
    })
    return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 })
  }

  if (password !== confirmPassword) {
    await recordSynergiAuditEvent({
      eventType: 'partner_activate_failed',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/activate',
      method: 'POST',
      statusCode: 400,
      ipAddress,
      userAgent,
      subjectType: 'partner_account',
      subjectId: session.partnerAccountId,
      details: { reason: 'password_mismatch' },
    })
    return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 })
  }

  await activatePartnerAccount({
    partnerAccountId: session.partnerAccountId,
    passwordHash: hashSecret(password),
  })

  await createPartnerSessionCookie(session.partnerAccountId, 'active', remember)
  await recordSynergiAuditEvent({
    eventType: 'partner_activate_success',
    actorType: 'partner',
    actorIdentifier: session.partnerAccountId,
    actorRole: 'partner',
    endpoint: '/api/partner/activate',
    method: 'POST',
    statusCode: 200,
    ipAddress,
    userAgent,
    subjectType: 'partner_account',
    subjectId: session.partnerAccountId,
  })

  return NextResponse.json({
    ok: true,
    status: 'activated',
    next_url: '/workspace',
  })
}
