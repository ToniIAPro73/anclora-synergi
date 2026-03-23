import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  getSynergiReleaseChecksSummary,
  listSynergiReleaseChecks,
  recordSynergiAuditEvent,
  recordSynergiReleaseCheck,
} from '@/lib/synergi-security'

type ReleaseCheckStatus = 'passed' | 'warning' | 'failed'

const ALLOWED_STATUSES = new Set<ReleaseCheckStatus>(['passed', 'warning', 'failed'])

export async function GET(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session

  try {
    session = await requireAdminSession('viewer')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_release_checks_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/observability/release-checks',
      method: 'GET',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Number(searchParams.get('limit') || '12')

  if (status && !ALLOWED_STATUSES.has(status as ReleaseCheckStatus)) {
    return NextResponse.json({ error: 'Invalid release status filter.' }, { status: 400 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-release-checks', session.username, ipAddress || 'unknown']),
    60,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_release_checks_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/release-checks',
      method: 'GET',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many release check requests. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const [summary, items] = await Promise.all([
      getSynergiReleaseChecksSummary(),
      listSynergiReleaseChecks({
        status: status ? (status as 'passed' | 'warning' | 'failed') : undefined,
        limit: Number.isFinite(limit) ? limit : 12,
      }),
    ])

    await recordSynergiAuditEvent({
      eventType: 'admin_release_checks_viewed',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/release-checks',
      method: 'GET',
      statusCode: 200,
      ipAddress,
      userAgent,
      details: { count: items.length, status: status || 'all' },
    })

    return NextResponse.json({ ok: true, summary, items, total: items.length })
  } catch {
    return NextResponse.json({ error: 'Unable to load release checks.' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session

  try {
    session = await requireAdminSession('operator')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_release_checks_create_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/observability/release-checks',
      method: 'POST',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let payload: {
    releaseName?: string
    releaseChannel?: string
    environment?: string
    status?: 'passed' | 'warning' | 'failed'
    smokeSummary?: string
    details?: Record<string, unknown>
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.releaseName?.trim() || !payload.status) {
    return NextResponse.json({ error: 'releaseName and status are required.' }, { status: 400 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-release-checks-create', session.username, ipAddress || 'unknown']),
    30,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_release_checks_create_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/release-checks',
      method: 'POST',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many release check requests. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const releaseCheck = await recordSynergiReleaseCheck({
      releaseName: payload.releaseName,
      releaseChannel: payload.releaseChannel,
      environment: payload.environment,
      status: payload.status,
      smokeSummary: payload.smokeSummary,
      checkedBy: session.username,
      details: payload.details,
    })

    if (!releaseCheck) {
      return NextResponse.json({ error: 'Unable to store release check.' }, { status: 502 })
    }

    await recordSynergiAuditEvent({
      eventType: 'admin_release_checks_created',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/observability/release-checks',
      method: 'POST',
      statusCode: 201,
      ipAddress,
      userAgent,
      details: {
        release_name: releaseCheck.release_name,
        status: releaseCheck.status,
      },
    })

    return NextResponse.json({ ok: true, item: releaseCheck }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create release check.' }, { status: 502 })
  }
}
