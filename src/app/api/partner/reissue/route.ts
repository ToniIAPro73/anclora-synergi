import { NextRequest, NextResponse } from 'next/server'
import { getPartnerAccountByEmail, issuePartnerInvite } from '@/lib/partner-admissions-store'
import { sendPartnerReissueEmail } from '@/lib/synergi-email'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function POST(request: NextRequest) {
  let payload: { email?: string }

  try {
    payload = (await request.json()) as { email?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const email = payload.email?.trim() || ''
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const rateLimit = checkRateLimit(buildRateLimitKey(['partner-reissue', email, ipAddress || 'unknown']), 3, 15 * 60_000)
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'partner_reissue_rate_limited',
      actorType: 'partner',
      actorIdentifier: email,
      endpoint: '/api/partner/reissue',
      method: 'POST',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many reissue requests. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 900) } }
    )
  }

  try {
    const account = await getPartnerAccountByEmail(email)
    if (!account) {
      await recordSynergiAuditEvent({
        eventType: 'partner_reissue_requested',
        actorType: 'partner',
        actorIdentifier: email,
        endpoint: '/api/partner/reissue',
        method: 'POST',
        statusCode: 200,
        ipAddress,
        userAgent,
        details: { account_found: false },
      })
      return NextResponse.json({
        ok: true,
        message: 'If the account exists, a new credential email will be sent shortly.',
      })
    }

    const issued = await issuePartnerInvite({ partnerAccountId: account.id })
    if (!issued) {
      await recordSynergiAuditEvent({
        eventType: 'partner_reissue_requested',
        actorType: 'partner',
        actorIdentifier: account.email,
        actorRole: 'partner',
        endpoint: '/api/partner/reissue',
        method: 'POST',
        statusCode: 200,
        ipAddress,
        userAgent,
        subjectType: 'partner_account',
        subjectId: account.id,
        details: { account_found: true, invite_issued: false },
      })
      return NextResponse.json({
        ok: true,
        message: 'If the account exists, a new credential email will be sent shortly.',
      })
    }

    await sendPartnerReissueEmail({
      partnerName: issued.account.full_name,
      email: issued.account.email,
      inviteCode: issued.inviteCode,
      launchUrl: issued.launchUrl,
    })

    await recordSynergiAuditEvent({
      eventType: 'partner_reissue_requested',
      actorType: 'partner',
      actorIdentifier: issued.account.email,
      actorRole: 'partner',
      endpoint: '/api/partner/reissue',
      method: 'POST',
      statusCode: 200,
      ipAddress,
      userAgent,
      subjectType: 'partner_account',
      subjectId: issued.account.id,
      details: { account_found: true },
    })

    return NextResponse.json({
      ok: true,
      message: 'If the account exists, a new credential email will be sent shortly.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Unable to process the credential reissue request.' },
      { status: 502 }
    )
  }
}
