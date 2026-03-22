import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { listPartnerAdmissions, type PartnerAdmissionStatus } from '@/lib/partner-admissions-store'

const ALLOWED_STATUSES = new Set<PartnerAdmissionStatus>([
  'submitted',
  'under_review',
  'accepted',
  'rejected',
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

  if (statusParam && !ALLOWED_STATUSES.has(statusParam as PartnerAdmissionStatus)) {
    return NextResponse.json({ error: 'Invalid status filter.' }, { status: 400 })
  }

  try {
    const items = await listPartnerAdmissions({
      status: statusParam ? (statusParam as PartnerAdmissionStatus) : undefined,
      limit: Number.isFinite(limitParam) ? limitParam : 50,
    })

    return NextResponse.json({
      items,
      total: items.length,
    })
  } catch {
    return NextResponse.json(
      { error: 'Unable to load partner admissions from Neon.' },
      { status: 502 }
    )
  }
}
