import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  acceptPartnerAdmission,
  updatePartnerAdmissionStatus,
  type PartnerAdmissionStatus,
} from '@/lib/partner-admissions-store'
import { sendPartnerAcceptedEmail, sendPartnerRejectedEmail } from '@/lib/synergi-email'

const REVIEWABLE_STATUSES = new Set<Exclude<PartnerAdmissionStatus, 'submitted'>>([
  'under_review',
  'accepted',
  'rejected',
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
    if (payload.status === 'accepted') {
      const accepted = await acceptPartnerAdmission({
        admissionId: id,
        reviewNotes: payload.reviewNotes,
        reviewedBy: session.username,
      })

      if (!accepted) {
        return NextResponse.json({ error: 'Partner admission not found.' }, { status: 404 })
      }

      await sendPartnerAcceptedEmail({
        partnerName: accepted.account.full_name,
        email: accepted.account.email,
        companyName: accepted.account.company_name,
        inviteCode: accepted.inviteCode,
        launchUrl: accepted.launchUrl,
      })

      return NextResponse.json({
        ...accepted.admission,
        invite_code: accepted.inviteCode,
        launch_url: accepted.launchUrl,
        partner_account: accepted.account,
        partner_workspace: accepted.workspace,
      })
    }

    const updated = await updatePartnerAdmissionStatus({
      id,
      status: payload.status as Exclude<PartnerAdmissionStatus, 'submitted' | 'accepted'>,
      reviewNotes: payload.reviewNotes,
      reviewedBy: session.username,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Partner admission not found.' }, { status: 404 })
    }

    if (payload.status === 'rejected') {
      await sendPartnerRejectedEmail({
        partnerName: updated.full_name,
        email: updated.email,
      })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Unable to complete the partner admission decision workflow.' },
      { status: 502 }
    )
  }
}
