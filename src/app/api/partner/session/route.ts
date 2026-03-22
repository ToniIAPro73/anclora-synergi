import { NextRequest, NextResponse } from 'next/server'
import { clearPartnerSessionCookie, createPartnerSessionCookie } from '@/lib/partner-auth'
import { getPartnerAccountByEmail, markPartnerLogin } from '@/lib/partner-admissions-store'
import { verifySecret } from '@/lib/passwords'

export async function POST(request: NextRequest) {
  let payload: { email?: string; secret?: string; remember?: boolean }

  try {
    payload = (await request.json()) as { email?: string; secret?: string; remember?: boolean }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const email = payload.email?.trim() || ''
  const secret = payload.secret?.trim() || ''
  const remember = payload.remember !== false

  if (!email || !secret) {
    return NextResponse.json({ error: 'Email and access secret are required.' }, { status: 400 })
  }

  const account = await getPartnerAccountByEmail(email)
  if (!account) {
    return NextResponse.json({ error: 'Partner account not found.' }, { status: 404 })
  }

  const inviteCodeStillValid =
    !!account.invite_code_hash &&
    (!account.invite_code_expires_at || Date.now() <= new Date(account.invite_code_expires_at).getTime()) &&
    verifySecret(secret, account.invite_code_hash)

  if (inviteCodeStillValid) {
    await createPartnerSessionCookie(account.id, 'invited', remember)
    return NextResponse.json({
      ok: true,
      status: 'activation_required',
      next_url: '/activate',
    })
  }

  const passwordValid = verifySecret(secret, account.password_hash)
  if (!passwordValid) {
    if (account.invite_code_hash && account.invite_code_expires_at && Date.now() > new Date(account.invite_code_expires_at).getTime()) {
      return NextResponse.json({ error: 'Invitation code expired.' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Invalid password or access code.' }, { status: 401 })
  }

  await markPartnerLogin(account.id)
  await createPartnerSessionCookie(account.id, 'active', remember)

  return NextResponse.json({
    ok: true,
    status: 'authenticated',
    next_url: '/workspace',
  })
}

export async function DELETE() {
  await clearPartnerSessionCookie()
  return NextResponse.json({ ok: true })
}
