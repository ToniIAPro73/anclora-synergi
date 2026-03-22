import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { createAdminPartnerAsset, type PartnerAssetRecord } from '@/lib/partner-workspace-store'

export async function POST(request: NextRequest) {
  let session
  try {
    session = await requireAdminSession()
  } catch {
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

    return NextResponse.json({ ok: true, asset })
  } catch {
    return NextResponse.json({ error: 'Unable to create partner asset.' }, { status: 502 })
  }
}
