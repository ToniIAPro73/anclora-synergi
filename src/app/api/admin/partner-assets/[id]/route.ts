import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  publishAdminPartnerAssetVersion,
  updateAdminPartnerAsset,
  type PartnerAssetRecord,
} from '@/lib/partner-workspace-store'
import { getRequestIp, getRequestUserAgent, recordSynergiAuditEvent } from '@/lib/synergi-security'

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
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await context.params
  let payload: {
    action?: 'update' | 'retire' | 'publish-version'
    title?: string
    description?: string
    lifecycleStatus?: PartnerAssetRecord['lifecycle_status']
    versionLabel?: string
    accessLevel?: PartnerAssetRecord['access_level']
    assetUrl?: string
    assetBody?: string
    supersededByAssetId?: string
    retirementReason?: string
    assetKind?: PartnerAssetRecord['asset_kind']
    contentFormat?: PartnerAssetRecord['content_format']
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  try {
    const asset =
      payload.action === 'publish-version'
        ? await publishAdminPartnerAssetVersion({
            parentAssetId: id,
            title: payload.title,
            description: payload.description,
            assetKind: payload.assetKind,
            accessLevel: payload.accessLevel,
            assetUrl: payload.assetUrl,
            assetBody: payload.assetBody,
            contentFormat: payload.contentFormat,
            publishedBy: session.username,
          })
        : await updateAdminPartnerAsset({
            id,
            title: payload.title,
            description: payload.description,
            lifecycleStatus: payload.lifecycleStatus,
            versionLabel: payload.versionLabel,
            accessLevel: payload.accessLevel,
            assetUrl: payload.assetUrl,
            assetBody: payload.assetBody,
            supersededByAssetId: payload.supersededByAssetId,
            retirementReason: payload.retirementReason,
            reviewedBy: session.username,
          })

    if (!asset) {
      return NextResponse.json({ error: 'Partner asset not found.' }, { status: 404 })
    }

    await recordSynergiAuditEvent({
      eventType: 'admin_partner_asset_updated',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/admin/partner-assets/[id]',
      method: 'PATCH',
      statusCode: 200,
      subjectType: 'partner_asset',
      subjectId: asset.id,
      ipAddress,
      userAgent,
      details: {
        action: payload.action || 'update',
        lifecycleStatus: asset.lifecycle_status,
        versionLabel: asset.version_label,
      },
    })

    return NextResponse.json({ ok: true, item: asset })
  } catch {
    return NextResponse.json({ error: 'Unable to update the partner asset.' }, { status: 502 })
  }
}
