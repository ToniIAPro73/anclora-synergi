import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { listAdminPartnerAssetPackRequests, type PartnerAssetPackRequestRecord } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

const ALLOWED_STATUSES = new Set<PartnerAssetPackRequestRecord['status']>([
  'submitted',
  'reviewing',
  'fulfilled',
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
      eventType: 'admin_asset_packs_list_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/asset-pack-requests',
      method: 'GET',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const rateLimit = checkRateLimit(buildRateLimitKey(['admin-asset-packs-list', ipAddress || 'unknown']), 60, 60_000)
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_asset_packs_list_rate_limited',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/asset-pack-requests',
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

  if (statusParam && !ALLOWED_STATUSES.has(statusParam as PartnerAssetPackRequestRecord['status'])) {
    return NextResponse.json({ error: 'Invalid asset pack status filter.' }, { status: 400 })
  }

  try {
    const items = await listAdminPartnerAssetPackRequests({
      status: statusParam ? (statusParam as PartnerAssetPackRequestRecord['status']) : undefined,
      limit: Number.isFinite(limitParam) ? limitParam : 50,
    })

    await recordSynergiAuditEvent({
      eventType: 'admin_asset_packs_listed',
      actorType: 'admin',
      actorIdentifier: session?.username || 'unknown',
      actorRole: session?.role,
      endpoint: '/api/admin/asset-pack-requests',
      method: 'GET',
      statusCode: 200,
      ipAddress,
      userAgent,
      details: { status: statusParam || 'all', count: items.length },
    })

    return NextResponse.json({ items, total: items.length })
  } catch {
    return NextResponse.json({ error: 'Unable to load partner asset pack requests.' }, { status: 502 })
  }
}
