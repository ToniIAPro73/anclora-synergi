import { NextRequest, NextResponse } from 'next/server'
import { clearAdminSessionCookie, createAdminSessionCookie, validateAdminCredentials } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  let payload: { username?: string; password?: string }

  try {
    payload = (await request.json()) as { username?: string; password?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const username = payload.username?.trim() || ''
  const password = payload.password?.trim() || ''

  try {
    const valid = validateAdminCredentials(username, password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }
    await createAdminSessionCookie(username)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create admin session.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  await clearAdminSessionCookie()
  return NextResponse.json({ ok: true })
}
