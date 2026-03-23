import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { updatePartnerProfile } from '@/lib/partner-workspace-store'
import {
  buildRateLimitKey,
  checkRateLimit,
  getRequestIp,
  getRequestUserAgent,
  recordSynergiAuditEvent,
} from '@/lib/synergi-security'

function parseCommaList(value: string | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function PATCH(request: NextRequest) {
  const ipAddress = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  let session
  try {
    session = await requirePartnerSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  if (session.stage !== 'active') {
    return NextResponse.json({ error: 'Partner account must be active.' }, { status: 403 })
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(['partner-profile-update', session.partnerAccountId, ipAddress || 'unknown']),
    20,
    60_000
  )
  if (!rateLimit.allowed) {
    await recordSynergiAuditEvent({
      eventType: 'partner_profile_rate_limited',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/profile',
      method: 'PATCH',
      statusCode: 429,
      ipAddress,
      userAgent,
    })
    return NextResponse.json(
      { error: 'Too many profile updates. Please try again later.' },
      { status: 429, headers: { 'retry-after': String(rateLimit.retryAfterSeconds || 60) } }
    )
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

    await recordSynergiAuditEvent({
      eventType: 'partner_profile_updated',
      actorType: 'partner',
      actorIdentifier: session.partnerAccountId,
      actorRole: 'partner',
      endpoint: '/api/partner/profile',
      method: 'PATCH',
      statusCode: 200,
      subjectType: 'partner_profile',
      subjectId: session.partnerAccountId,
      ipAddress,
      userAgent,
      details: { updated_fields: Object.keys(payload).filter((key) => payload[key as keyof typeof payload] !== undefined) },
    })

    return NextResponse.json({ ok: true, profile })
  } catch {
    return NextResponse.json({ error: 'Unable to update the partner profile.' }, { status: 502 })
  }
}
