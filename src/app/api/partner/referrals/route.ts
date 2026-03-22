import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { createPartnerReferral, listPartnerReferrals } from '@/lib/partner-workspace-store'

const ALLOWED_REFERRAL_KINDS = new Set(['buyer', 'seller', 'investor', 'introducer', 'partner'] as const)

export async function GET() {
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  if (session.stage !== 'active') {
    return NextResponse.json({ error: 'Partner account must be active.' }, { status: 403 })
  }

  try {
    const referrals = await listPartnerReferrals(session.partnerAccountId)
    return NextResponse.json({ ok: true, referrals })
  } catch {
    return NextResponse.json({ error: 'Unable to load partner referrals.' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  if (session.stage !== 'active') {
    return NextResponse.json({ error: 'Partner account must be active.' }, { status: 403 })
  }

  let payload: {
    referralName?: string
    referralCompany?: string
    referralEmail?: string
    referralPhone?: string
    referralKind?: string
    regionLabel?: string
    budgetLabel?: string
    referralNotes?: string
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.referralName?.trim()) {
    return NextResponse.json({ error: 'Referral name is required.' }, { status: 400 })
  }

  if (!payload.referralKind || !ALLOWED_REFERRAL_KINDS.has(payload.referralKind as 'buyer' | 'seller' | 'investor' | 'introducer' | 'partner')) {
    return NextResponse.json({ error: 'Invalid referral kind.' }, { status: 400 })
  }

  try {
    const referral = await createPartnerReferral(session.partnerAccountId, {
      referralName: payload.referralName,
      referralCompany: payload.referralCompany,
      referralEmail: payload.referralEmail,
      referralPhone: payload.referralPhone,
      referralKind: payload.referralKind as 'buyer' | 'seller' | 'investor' | 'introducer' | 'partner',
      regionLabel: payload.regionLabel,
      budgetLabel: payload.budgetLabel,
      referralNotes: payload.referralNotes,
    })

    if (!referral) {
      return NextResponse.json({ error: 'Unable to create the referral.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, referral }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create the referral.' }, { status: 502 })
  }
}
