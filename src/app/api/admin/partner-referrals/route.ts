import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { listAdminPartnerReferrals, type PartnerReferralRecord } from '@/lib/partner-workspace-store'
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

export async function GET(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requireAdminSession('reviewer')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_referrals_list_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/partner-referrals',
      method: 'GET',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const rateLimit = checkRateLimit(buildRateLimitKey(['admin-referrals-list', ipAddress || 'unknown']), 60, 60_000)
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_referrals_list_rate_limited',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/partner-referrals',
      method: 'GET',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get('status')
  const limitParam = Number(searchParams.get('limit') || '50')

  if (statusParam && !ALLOWED_STATUSES.has(statusParam as PartnerReferralRecord['status'])) {
    return NextResponse.json({ error: 'Invalid referral status filter.' }, { status: 400 })
  }

  try {
    const items = await listAdminPartnerReferrals({
      status: statusParam ? (statusParam as PartnerReferralRecord['status']) : undefined,
      limit: Number.isFinite(limitParam) ? limitParam : 50,
    })

    await recordSynergiAuditEvent({
      eventType: 'admin_referrals_listed',
      actorType: 'admin',
      actorIdentifier: session?.username || 'unknown',
      actorRole: session?.role,
      endpoint: '/api/admin/partner-referrals',
      method: 'GET',
      statusCode: 200,
      ipAddress,
      userAgent,
      details: { status: statusParam || 'all', count: items.length },
    })

    return NextResponse.json({ items, total: items.length })
  } catch {
    return NextResponse.json({ error: 'Unable to load partner referrals.' }, { status: 502 })
  }
}
