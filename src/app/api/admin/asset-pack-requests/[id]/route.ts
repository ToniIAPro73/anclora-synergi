import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { updateAdminPartnerAssetPackRequest, type PartnerAssetPackRequestRecord } from '@/lib/partner-workspace-store'

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
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await context.params

  let payload: {
    status?: string
    internalNotes?: string
    deliveredAssetId?: string
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
    })

    if (!result?.request) {
      return NextResponse.json({ error: 'Partner asset pack request not found.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, item: result.request, deliveredAssetId: result.deliveredAssetId })
  } catch {
    return NextResponse.json({ error: 'Unable to update the asset pack request.' }, { status: 502 })
  }
}
