import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { listAdminPartnerReferrals, type PartnerReferralRecord } from '@/lib/partner-workspace-store'

const ALLOWED_STATUSES = new Set<PartnerReferralRecord['status']>([
  'submitted',
  'reviewing',
  'qualified',
  'introduced',
  'closed',
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

  if (statusParam && !ALLOWED_STATUSES.has(statusParam as PartnerReferralRecord['status'])) {
    return NextResponse.json({ error: 'Invalid referral status filter.' }, { status: 400 })
  }

  try {
    const items = await listAdminPartnerReferrals({
      status: statusParam ? (statusParam as PartnerReferralRecord['status']) : undefined,
      limit: Number.isFinite(limitParam) ? limitParam : 50,
    })

    return NextResponse.json({ items, total: items.length })
  } catch {
    return NextResponse.json({ error: 'Unable to load partner referrals.' }, { status: 502 })
  }
}
