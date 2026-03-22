import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { updatePartnerProfile } from '@/lib/partner-workspace-store'

function parseCommaList(value: string | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function PATCH(request: NextRequest) {
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
    headline?: string
    serviceTags?: string
    primaryRegions?: string
    languages?: string
    websiteUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
  }

  try {
    payload = (await request.json()) as {
      headline?: string
      serviceTags?: string
      primaryRegions?: string
      languages?: string
      websiteUrl?: string
      linkedinUrl?: string
      instagramUrl?: string
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  try {
    const profile = await updatePartnerProfile(session.partnerAccountId, {
      headline: payload.headline || '',
      serviceTags: parseCommaList(payload.serviceTags),
      primaryRegions: parseCommaList(payload.primaryRegions),
      languages: parseCommaList(payload.languages),
      websiteUrl: payload.websiteUrl,
      linkedinUrl: payload.linkedinUrl,
      instagramUrl: payload.instagramUrl,
    })

    if (!profile) {
      return NextResponse.json({ error: 'Partner profile not found.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, profile })
  } catch {
    return NextResponse.json({ error: 'Unable to update the partner profile.' }, { status: 502 })
  }
}
