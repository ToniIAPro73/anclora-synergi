import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { createAdminPartnerAsset, listAdminPartnerAssets, type PartnerAssetRecord } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requireAdminSession('operator')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_partner_asset_create_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/partner-assets',
      method: 'POST',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let payload: {
    partnerAccountId?: string
    title?: string
    description?: string
    assetKind?: PartnerAssetRecord['asset_kind']
    accessLevel?: PartnerAssetRecord['access_level']
    lifecycleStatus?: PartnerAssetRecord['lifecycle_status']
    versionLabel?: string
    sourceType?: PartnerAssetRecord['source_type']
    supersededByAssetId?: string
    assetUrl?: string
    assetBody?: string
    contentFormat?: PartnerAssetRecord['content_format']
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.partnerAccountId?.trim() || !payload.title?.trim()) {
    return NextResponse.json({ error: 'partnerAccountId and title are required.' }, { status: 400 })
  }

  if (!payload.assetUrl?.trim() && !payload.assetBody?.trim()) {
    return NextResponse.json({ error: 'Provide either assetUrl or assetBody.' }, { status: 400 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-partner-asset-create', session.username, payload.partnerAccountId, ipAddress || 'unknown']),
    15,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_partner_asset_create_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/partner-assets',
      method: 'POST',
      statusCode: 429,
      subjectType: 'partner_account',
      subjectId: payload.partnerAccountId,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many asset publication attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  try {
    const asset = await createAdminPartnerAsset({
      partnerAccountId: payload.partnerAccountId,
      title: payload.title,
      description: payload.description,
      assetKind: payload.assetKind,
      accessLevel: payload.accessLevel,
      lifecycleStatus: payload.lifecycleStatus,
      versionLabel: payload.versionLabel,
      sourceType: payload.sourceType,
      supersededByAssetId: payload.supersededByAssetId,
      assetUrl: payload.assetUrl,
      assetBody: payload.assetBody,
      contentFormat: payload.contentFormat,
      publishedBy: session.username,
    })

    if (!asset) {
      return NextResponse.json({ error: 'Unable to create partner asset.' }, { status: 404 })
    }

    await recordSynergiAuditEvent({
      eventType: 'admin_partner_asset_created',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/partner-assets',
      method: 'POST',
      statusCode: 201,
      subjectType: 'partner_account',
      subjectId: payload.partnerAccountId,
      ipAddress,
      userAgent,
      details: {
        asset_id: asset.id,
        content_format: asset.content_format,
        lifecycle_status: asset.lifecycle_status,
        version_label: asset.version_label,
      },
    })

    return NextResponse.json({ ok: true, asset })
  } catch {
    return NextResponse.json({ error: 'Unable to create partner asset.' }, { status: 502 })
  }
}

export async function GET(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requireAdminSession('reviewer')
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const partnerAccountId = searchParams.get('partnerAccountId') || undefined
  const status = searchParams.get('status') as 'all' | 'current' | 'retired' | 'superseded' | null
  const lifecycleStatus = searchParams.get('lifecycleStatus') as PartnerAssetRecord['lifecycle_status'] | null
  const limit = Number(searchParams.get('limit') || '50')

  try {
    const items = await listAdminPartnerAssets({
      partnerAccountId,
      lifecycleStatus: lifecycleStatus || undefined,
      status: status || undefined,
      limit: Number.isFinite(limit) ? limit : 50,
    })

    await recordSynergiAuditEvent({
      eventType: 'admin_partner_assets_listed',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/partner-assets',
      method: 'GET',
      statusCode: 200,
      ipAddress,
      userAgent,
      details: { total: items.length, lifecycleStatus: lifecycleStatus || 'all', status: status || 'all' },
    })

    return NextResponse.json({ ok: true, items, total: items.length })
  } catch {
    return NextResponse.json({ error: 'Unable to load partner assets.' }, { status: 502 })
  }
}
