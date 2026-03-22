import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { updateAdminPartnerReferralStatus, type PartnerReferralRecord } from '@/lib/partner-workspace-store'

const ALLOWED_STATUSES = new Set<PartnerReferralRecord['status']>([
  'submitted',
  'reviewing',
  'qualified',
  'introduced',
  'closed',
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

  let payload: { status?: string; internalNotes?: string }
  try {
    payload = (await request.json()) as { status?: string; internalNotes?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.status || !ALLOWED_STATUSES.has(payload.status as PartnerReferralRecord['status'])) {
    return NextResponse.json({ error: 'Invalid referral status.' }, { status: 400 })
  }

  try {
    const referral = await updateAdminPartnerReferralStatus({
      id,
      status: payload.status as PartnerReferralRecord['status'],
      internalNotes: payload.internalNotes,
      reviewedBy: session.username,
    })

    if (!referral) {
      return NextResponse.json({ error: 'Partner referral not found.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, item: referral })
  } catch {
    return NextResponse.json({ error: 'Unable to update the partner referral.' }, { status: 502 })
  }
}
