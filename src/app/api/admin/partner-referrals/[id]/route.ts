import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { updateAdminPartnerReferralStatus, type PartnerReferralRecord } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

const ALLOWED_STATUSES = new Set<PartnerReferralRecord['status']>([
  'submitted',
  'reviewing',
  'qualified',
  'introduced',
  'negotiating',
  'won',
  'closed',
  'declined',
])

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requireAdminSession('reviewer')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_referral_update_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/partner-referrals/[id]',
      method: 'PATCH',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await context.params
  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-referral-update', session.username, id, ipAddress || 'unknown']),
    20,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_referral_update_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/partner-referrals/[id]',
      method: 'PATCH',
      statusCode: 429,
      subjectType: 'partner_referral',
      subjectId: id,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many update attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  let payload: {
    status?: string
    internalNotes?: string
    ownerUsername?: string
    commercialStage?: PartnerReferralRecord['commercial_stage']
    nextAction?: string
    estimatedValueLabel?: string
  }
  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.status || !ALLOWED_STATUSES.has(payload.status as PartnerReferralRecord['status'])) {
    return NextResponse.json({ error: 'Invalid referral status.' }, { status: 400 })
  }

  try {
    const referral = await updateAdminPartnerReferralStatus({
      id,
      status: payload.status as PartnerReferralRecord['status'],
      internalNotes: payload.internalNotes,
      ownerUsername: payload.ownerUsername,
      commercialStage: payload.commercialStage,
      nextAction: payload.nextAction,
      estimatedValueLabel: payload.estimatedValueLabel,
      reviewedBy: session.username,
    })

    if (!referral) {
      return NextResponse.json({ error: 'Partner referral not found.' }, { status: 404 })
    }

    await recordSynergiAuditEvent({
      eventType: 'admin_referral_updated',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/partner-referrals/[id]',
      method: 'PATCH',
      statusCode: 200,
      subjectType: 'partner_referral',
      subjectId: referral.id,
      ipAddress,
      userAgent,
      details: {
        status: referral.status,
        ownerUsername: referral.owner_username,
        commercialStage: referral.commercial_stage,
      },
    })

    return NextResponse.json({ ok: true, item: referral })
  } catch {
    return NextResponse.json({ error: 'Unable to update the partner referral.' }, { status: 502 })
  }
}
