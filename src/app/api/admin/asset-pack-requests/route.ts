import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { listAdminPartnerAssetPackRequests, type PartnerAssetPackRequestRecord } from '@/lib/partner-workspace-store'

const ALLOWED_STATUSES = new Set<PartnerAssetPackRequestRecord['status']>([
  'submitted',
  'reviewing',
  'fulfilled',
  'declined',
])

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
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

    return NextResponse.json({ items, total: items.length })
  } catch {
    return NextResponse.json({ error: 'Unable to load partner asset pack requests.' }, { status: 502 })
  }
}
