import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { updateAdminPartnerAssetPackRequest, type PartnerAssetPackRequestRecord } from '@/lib/partner-workspace-store'
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requireAdminSession('operator')
  } catch {
    await recordSynergiAuditEvent({
      eventType: 'admin_asset_pack_update_denied',
      actorType: 'admin',
      actorIdentifier: 'unknown',
      endpoint: '/api/admin/asset-pack-requests/[id]',
      method: 'PATCH',
      statusCode: 401,
      ipAddress,
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await context.params
  const rateLimit = checkRateLimit(
    buildRateLimitKey(['admin-asset-pack-update', session.username, id, ipAddress || 'unknown']),
    20,
    60_000
  )

  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'admin_asset_pack_update_rate_limited',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/asset-pack-requests/[id]',
      method: 'PATCH',
      statusCode: 429,
      subjectType: 'partner_asset_pack_request',
      subjectId: id,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many update attempts. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
  }

  let payload: {
    status?: string
    internalNotes?: string
    deliveredAssetId?: string
    fulfillmentAsset?: {
      title?: string
      description?: string
      assetKind?: 'playbook' | 'document' | 'brief'
      accessLevel?: 'private' | 'shared'
      assetUrl?: string
      assetBody?: string
      contentFormat?: 'markdown' | 'text'
    }
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.status || !ALLOWED_STATUSES.has(payload.status as PartnerAssetPackRequestRecord['status'])) {
    return NextResponse.json({ error: 'Invalid asset pack status.' }, { status: 400 })
  }

  try {
    const result = await updateAdminPartnerAssetPackRequest({
      id,
      status: payload.status as PartnerAssetPackRequestRecord['status'],
      internalNotes: payload.internalNotes,
      reviewedBy: session.username,
      deliveredAssetId: payload.deliveredAssetId,
      fulfillmentAsset:
        payload.fulfillmentAsset?.title?.trim()
          ? {
              title: payload.fulfillmentAsset.title,
              description: payload.fulfillmentAsset.description,
              assetKind: payload.fulfillmentAsset.assetKind,
              accessLevel: payload.fulfillmentAsset.accessLevel,
              assetUrl: payload.fulfillmentAsset.assetUrl,
              assetBody: payload.fulfillmentAsset.assetBody,
              contentFormat: payload.fulfillmentAsset.contentFormat,
            }
          : undefined,
    })

    if (!result?.request) {
      return NextResponse.json({ error: 'Partner asset pack request not found.' }, { status: 404 })
    }

    await recordSynergiAuditEvent({
      eventType: 'admin_asset_pack_updated',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/asset-pack-requests/[id]',
      method: 'PATCH',
      statusCode: 200,
      subjectType: 'partner_asset_pack_request',
      subjectId: result.request.id,
      ipAddress,
      userAgent,
      details: {
        status: result.request.status,
        deliveredAssetId: result.deliveredAssetId || null,
        fulfillmentMode: payload.fulfillmentAsset?.title?.trim() ? 'published_asset' : 'status_only',
      },
    })

    return NextResponse.json({ ok: true, item: result.request, deliveredAssetId: result.deliveredAssetId })
  } catch {
    return NextResponse.json({ error: 'Unable to update the asset pack request.' }, { status: 502 })
  }
}
