import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  getSynergiAuditSeverity,
  listSynergiAuditEvents,
  recordSynergiAuditEvent,
  type SecurityActorType,
} from '@/lib/synergi-security'

const ALLOWED_ACTOR_TYPES = new Set<SecurityActorType>(['admin', 'partner', 'system'])

export async function GET(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session

  try {
    session = await requireAdminSession('viewer')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_audit_events_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/observability/audit-events',
      method: 'GET',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const actorType = searchParams.get('actorType')
  const eventType = searchParams.get('eventType')
  const limit = Number(searchParams.get('limit') || '50')

  if (actorType && !ALLOWED_ACTOR_TYPES.has(actorType as SecurityActorType)) {
    return NextResponse.json({ error: 'Invalid actor type filter.' }, { status: 400 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-audit-events', session.username, ipAddress || 'unknown']),
    120,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_audit_events_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/audit-events',
      method: 'GET',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many audit event requests. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const items = await listSynergiAuditEvents({
      actorType: actorType ? (actorType as SecurityActorType) : undefined,
      eventType: eventType || undefined,
      limit: Number.isFinite(limit) ? limit : 50,
    })

    await recordSynergiAuditEvent({
      eventType: 'admin_audit_events_viewed',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/audit-events',
      method: 'GET',
      statusCode: 200,
      ipAddress,
      userAgent,
      details: { count: items.length, actorType: actorType || null, eventType: eventType || null },
    })

    return NextResponse.json({
      ok: true,
      items: items.map((item) => ({
        ...item,
        severity: getSynergiAuditSeverity(item.event_type, item.status_code),
      })),
      total: items.length,
    })
  } catch {
    return NextResponse.json({ error: 'Unable to load audit events.' }, { status: 502 })
  }
}
