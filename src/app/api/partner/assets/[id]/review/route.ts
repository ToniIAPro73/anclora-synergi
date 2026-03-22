import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { markPartnerAssetReviewed } from '@/lib/partner-workspace-store'

export async function POST(
  _request: NextRequest,
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

  try {
    const asset = await markPartnerAssetReviewed(session.partnerAccountId, id)
    if (!asset) {
      return NextResponse.json({ error: 'Partner asset not found.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, asset })
  } catch {
    return NextResponse.json({ error: 'Unable to review the partner asset.' }, { status: 502 })
  }
}
