import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getPartnerAdmissionsAnalytics } from '@/lib/partner-admissions-store'
import { getPartnerWorkspaceAnalytics } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function GET(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get('days') || '30')
  const recentLimit = Number(searchParams.get('recentLimit') || '10')

  let session
  try {
    session = await requireAdminSession('reviewer')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_analytics_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/analytics',
      method: 'GET',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-analytics', session.username, ipAddress || 'unknown']),
    24,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_analytics_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/analytics',
      method: 'GET',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many analytics requests. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const [admissions, workspace] = await Promise.all([
      getPartnerAdmissionsAnalytics({
        days: Number.isFinite(days) ? days : 30,
        recentLimit: Number.isFinite(recentLimit) ? recentLimit : 10,
      }),
      getPartnerWorkspaceAnalytics({
        days: Number.isFinite(days) ? days : 30,
        recentLimit: Number.isFinite(recentLimit) ? recentLimit : 10,
      }),
    ])

    await recordSynergiAuditEvent({
      eventType: 'admin_analytics_viewed',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/analytics',
      method: 'GET',
      statusCode: 200,
      ipAddress,
      userAgent,
      details: {
        days: Number.isFinite(days) ? days : 30,
        recentLimit: Number.isFinite(recentLimit) ? recentLimit : 10,
      },
    })

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      admissions,
      workspace,
    })
  } catch {
    return NextResponse.json({ error: 'Unable to load analytics dashboard.' }, { status: 502 })
  }
}
