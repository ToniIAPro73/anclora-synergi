import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { createAdminPartnerAsset, type PartnerAssetRecord } from '@/lib/partner-workspace-store'
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
      details: { asset_id: asset.id, content_format: asset.content_format },
    })

    return NextResponse.json({ ok: true, asset })
  } catch {
    return NextResponse.json({ error: 'Unable to create partner asset.' }, { status: 502 })
  }
}
