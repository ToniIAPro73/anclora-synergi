import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { createPartnerReferral, listPartnerReferrals } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

const ALLOWED_REFERRAL_KINDS = new Set(['buyer', 'seller', 'investor', 'introducer', 'partner'] as const)

export async function GET() {
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  if (session.stage !== 'active') {
    return NextResponse.json({ error: 'Partner account must be active.' }, { status: 403 })
  }

  try {
    const referrals = await listPartnerReferrals(session.partnerAccountId)
    return NextResponse.json({ ok: true, referrals })
  } catch {
    return NextResponse.json({ error: 'Unable to load partner referrals.' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  if (session.stage !== 'active') {
    return NextResponse.json({ error: 'Partner account must be active.' }, { status: 403 })
  }

  let payload: {
    referralName?: string
    referralCompany?: string
    referralEmail?: string
    referralPhone?: string
    referralKind?: string
    regionLabel?: string
    budgetLabel?: string
    estimatedValueLabel?: string
    referralNotes?: string
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['partner-referral-create', session.partnerAccountId, ipAddress || 'unknown']),
    20,
    60_000
  )
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'partner_referral_rate_limited',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/referrals',
      method: 'POST',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many referral attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  if (!payload.referralName?.trim()) {
    return NextResponse.json({ error: 'Referral name is required.' }, { status: 400 })
  }

  if (!payload.referralKind || !ALLOWED_REFERRAL_KINDS.has(payload.referralKind as 'buyer' | 'seller' | 'investor' | 'introducer' | 'partner')) {
    return NextResponse.json({ error: 'Invalid referral kind.' }, { status: 400 })
  }

  try {
    const referral = await createPartnerReferral(session.partnerAccountId, {
      referralName: payload.referralName,
      referralCompany: payload.referralCompany,
      referralEmail: payload.referralEmail,
      referralPhone: payload.referralPhone,
      referralKind: payload.referralKind as 'buyer' | 'seller' | 'investor' | 'introducer' | 'partner',
      regionLabel: payload.regionLabel,
      budgetLabel: payload.budgetLabel,
      estimatedValueLabel: payload.estimatedValueLabel,
      referralNotes: payload.referralNotes,
    })

    if (!referral) {
      return NextResponse.json({ error: 'Unable to create the referral.' }, { status: 502 })
    }

    await recordSynergiAuditEvent({
      eventType: 'partner_referral_created',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/referrals',
      method: 'POST',
      statusCode: 201,
      subjectType: 'partner_referral',
      subjectId: referral.id,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ ok: true, referral }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create the referral.' }, { status: 502 })
  }
}
