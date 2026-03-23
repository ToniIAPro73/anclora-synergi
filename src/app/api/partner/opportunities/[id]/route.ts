import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { updatePartnerOpportunityResponse } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

const ALLOWED_RESPONSES = new Set(['watching', 'interested', 'passed'] as const)

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params
  const rateLimit = checkRateLimit(
    buildRateLimitKey(['partner-opportunity-update', session.partnerAccountId, id, ipAddress || 'unknown']),
    30,
    60_000
  )
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'partner_opportunity_rate_limited',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/opportunities/[id]',
      method: 'PATCH',
      statusCode: 429,
      subjectType: 'partner_opportunity',
      subjectId: id,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many update attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  let payload: { partnerResponse?: string; partnerResponseNotes?: string }
  try {
    payload = (await request.json()) as { partnerResponse?: string; partnerResponseNotes?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.partnerResponse || !ALLOWED_RESPONSES.has(payload.partnerResponse as 'watching' | 'interested' | 'passed')) {
    return NextResponse.json({ error: 'Invalid opportunity response.' }, { status: 400 })
  }

  try {
    const opportunity = await updatePartnerOpportunityResponse(
      session.partnerAccountId,
      id,
      payload.partnerResponse as 'watching' | 'interested' | 'passed',
      payload.partnerResponseNotes
    )

    if (!opportunity) {
      return NextResponse.json({ error: 'Partner opportunity not found.' }, { status: 404 })
    }

    await recordSynergiAuditEvent({
      eventType: 'partner_opportunity_updated',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/opportunities/[id]',
      method: 'PATCH',
      statusCode: 200,
      subjectType: 'partner_opportunity',
      subjectId: id,
      ipAddress,
      userAgent,
      details: { response: payload.partnerResponse },
    })

    return NextResponse.json({ ok: true, opportunity })
  } catch {
    return NextResponse.json({ error: 'Unable to update the partner opportunity.' }, { status: 502 })
  }
}
