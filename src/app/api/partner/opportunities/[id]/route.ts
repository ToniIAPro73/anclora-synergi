import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { updatePartnerOpportunityResponse } from '@/lib/partner-workspace-store'

const ALLOWED_RESPONSES = new Set(['watching', 'interested', 'passed'] as const)

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  if (session.stage !== 'active') {
    return NextResponse.json({ error: 'Partner account must be active.' }, { status: 403 })
  }

  const { id } = await context.params

  let payload: { partnerResponse?: string; partnerResponseNotes?: string }
  try {
    payload = (await request.json()) as { partnerResponse?: string; partnerResponseNotes?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.partnerResponse || !ALLOWED_RESPONSES.has(payload.partnerResponse as 'watching' | 'interested' | 'passed')) {
    return NextResponse.json({ error: 'Invalid opportunity response.' }, { status: 400 })
  }

  try {
    const opportunity = await updatePartnerOpportunityResponse(
      session.partnerAccountId,
      id,
      payload.partnerResponse as 'watching' | 'interested' | 'passed',
      payload.partnerResponseNotes
    )

    if (!opportunity) {
      return NextResponse.json({ error: 'Partner opportunity not found.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, opportunity })
  } catch {
    return NextResponse.json({ error: 'Unable to update the partner opportunity.' }, { status: 502 })
  }
}
