import { NextRequest, NextResponse } from 'next/server'
import { createPartnerSessionCookie, requirePartnerSession } from '@/lib/partner-auth'
import { activatePartnerAccount } from '@/lib/partner-admissions-store'
import { hashSecret } from '@/lib/passwords'

export async function POST(request: NextRequest) {
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let payload: { password?: string; confirmPassword?: string; remember?: boolean }

  try {
    payload = (await request.json()) as { password?: string; confirmPassword?: string; remember?: boolean }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const password = payload.password?.trim() || ''
  const confirmPassword = payload.confirmPassword?.trim() || ''
  const remember = payload.remember !== false

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 })
  }

  await activatePartnerAccount({
    partnerAccountId: session.partnerAccountId,
    passwordHash: hashSecret(password),
  })

  await createPartnerSessionCookie(session.partnerAccountId, 'active', remember)

  return NextResponse.json({
    ok: true,
    status: 'activated',
    next_url: '/workspace',
  })
}
