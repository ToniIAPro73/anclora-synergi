import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { markPartnerAssetReviewed } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function POST(
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
    buildRateLimitKey(['partner-asset-review', session.partnerAccountId, id, ipAddress || 'unknown']),
    30,
    60_000
  )
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'partner_asset_review_rate_limited',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/assets/[id]/review',
      method: 'POST',
      statusCode: 429,
      subjectType: 'partner_asset',
      subjectId: id,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many review attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const asset = await markPartnerAssetReviewed(session.partnerAccountId, id)
    if (!asset) {
      return NextResponse.json({ error: 'Partner asset not found.' }, { status: 404 })
    }

    await recordSynergiAuditEvent({
      eventType: 'partner_asset_reviewed',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/assets/[id]/review',
      method: 'POST',
      statusCode: 200,
      subjectType: 'partner_asset',
      subjectId: id,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ ok: true, asset })
  } catch {
    return NextResponse.json({ error: 'Unable to review the partner asset.' }, { status: 502 })
  }
}
