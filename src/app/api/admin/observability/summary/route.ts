import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  getSynergiObservabilitySummary,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function GET(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session

  try {
    session = await requireAdminSession('viewer')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_observability_summary_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/observability/summary',
      method: 'GET',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-observability-summary', session.username, ipAddress || 'unknown']),
    120,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_observability_summary_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/summary',
      method: 'GET',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many summary requests. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const summary = await getSynergiObservabilitySummary()
    await recordSynergiAuditEvent({
      eventType: 'admin_observability_summary_viewed',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/summary',
      method: 'GET',
      statusCode: 200,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ ok: true, summary })
  } catch {
    return NextResponse.json({ error: 'Unable to load the observability summary.' }, { status: 502 })
  }
}
