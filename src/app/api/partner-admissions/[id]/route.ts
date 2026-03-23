import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  acceptPartnerAdmission,
  getPartnerAdmissionReviewBundle,
  updatePartnerAdmissionStatus,
  type PartnerAdmissionStatus,
} from '@/lib/partner-admissions-store'
import { sendPartnerAcceptedEmail, sendPartnerRejectedEmail } from '@/lib/synergi-email'
import { getRequestIp, getRequestUserAgent, recordSynergiAuditEvent } from '@/lib/synergi-security'

const REVIEWABLE_STATUSES = new Set<Exclude<PartnerAdmissionStatus, 'submitted'>>([
  'under_review',
  'accepted',
  'rejected',
])

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requireAdminSession('reviewer')
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const bundle = await getPartnerAdmissionReviewBundle(id)
    if (!bundle) {
      return NextResponse.json({ error: 'Partner admission not found.' }, { status: 404 })
    }

    await recordSynergiAuditEvent({
      eventType: 'admin_admission_detail_viewed',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/partner-admissions/[id]',
      method: 'GET',
      statusCode: 200,
      subjectType: 'partner_admission',
      subjectId: id,
      ipAddress,
      userAgent,
    })

    return NextResponse.json(bundle)
  } catch {
    return NextResponse.json({ error: 'Unable to load the partner admission detail.' }, { status: 502 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requireAdminSession('reviewer')
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await context.params

  let payload: {
    status?: string
    reviewNotes?: string
    decisionReason?: string
    handoffState?: string
    priorityLabel?: string
    assignedTo?: string
  }

  try {
    payload = (await request.json()) as typeof payload
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
        decisionReason: payload.decisionReason,
        handoffState: payload.handoffState,
        priorityLabel: payload.priorityLabel,
        assignedTo: payload.assignedTo,
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

      await recordSynergiAuditEvent({
        eventType: 'admin_admission_accepted',
        actorType: 'admin',
        actorIdentifier: session.username,
        actorRole: session.role,
        endpoint: '/api/partner-admissions/[id]',
        method: 'PATCH',
        statusCode: 200,
        subjectType: 'partner_admission',
        subjectId: accepted.admission.id,
        ipAddress,
        userAgent,
        details: {
          decisionReason: payload.decisionReason || null,
          handoffState: payload.handoffState || 'invite_issued',
          priorityLabel: payload.priorityLabel || null,
          assignedTo: payload.assignedTo || null,
        },
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
      decisionReason: payload.decisionReason,
      handoffState: payload.handoffState,
      priorityLabel: payload.priorityLabel,
      assignedTo: payload.assignedTo,
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

    await recordSynergiAuditEvent({
      eventType: 'admin_admission_updated',
      actorType: 'admin',
      actorIdentifier: session.username,
      actorRole: session.role,
      endpoint: '/api/partner-admissions/[id]',
      method: 'PATCH',
      statusCode: 200,
      subjectType: 'partner_admission',
      subjectId: updated.id,
      ipAddress,
      userAgent,
      details: {
        status: updated.status,
        decisionReason: payload.decisionReason || null,
        handoffState: payload.handoffState || null,
        priorityLabel: payload.priorityLabel || null,
        assignedTo: payload.assignedTo || null,
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Unable to complete the partner admission decision workflow.' },
      { status: 502 }
    )
  }
}
