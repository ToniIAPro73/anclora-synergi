import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { reviewPartnerAdmission, type PartnerAdmissionStatus } from '@/lib/partner-admissions-store'

const REVIEWABLE_STATUSES = new Set<Exclude<PartnerAdmissionStatus, 'submitted'>>([
  'under_review',
  'accepted',
  'rejected',
])

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await context.params

  let payload: { status?: string; reviewNotes?: string }

  try {
    payload = (await request.json()) as { status?: string; reviewNotes?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.status || !REVIEWABLE_STATUSES.has(payload.status as Exclude<PartnerAdmissionStatus, 'submitted'>)) {
    return NextResponse.json({ error: 'Invalid review status.' }, { status: 400 })
  }

  try {
    const updated = await reviewPartnerAdmission({
      id,
      status: payload.status as Exclude<PartnerAdmissionStatus, 'submitted'>,
      reviewNotes: payload.reviewNotes,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Partner admission not found.' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Unable to update partner admission in Neon.' },
      { status: 502 }
    )
  }
}
