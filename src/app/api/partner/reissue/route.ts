import { NextRequest, NextResponse } from 'next/server'
import { getPartnerAccountByEmail, issuePartnerInvite } from '@/lib/partner-admissions-store'
import { sendPartnerReissueEmail } from '@/lib/synergi-email'

export async function POST(request: NextRequest) {
  let payload: { email?: string }

  try {
    payload = (await request.json()) as { email?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const email = payload.email?.trim() || ''
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  try {
    const account = await getPartnerAccountByEmail(email)
    if (!account) {
      return NextResponse.json({
        ok: true,
        message: 'If the account exists, a new credential email will be sent shortly.',
      })
    }

    const issued = await issuePartnerInvite({ partnerAccountId: account.id })
    if (!issued) {
      return NextResponse.json({
        ok: true,
        message: 'If the account exists, a new credential email will be sent shortly.',
      })
    }

    await sendPartnerReissueEmail({
      partnerName: issued.account.full_name,
      email: issued.account.email,
      inviteCode: issued.inviteCode,
      launchUrl: issued.launchUrl,
    })

    return NextResponse.json({
      ok: true,
      message: 'If the account exists, a new credential email will be sent shortly.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Unable to process the credential reissue request.' },
      { status: 502 }
    )
  }
}
