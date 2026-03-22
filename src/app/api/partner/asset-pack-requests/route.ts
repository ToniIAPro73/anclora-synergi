import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { createPartnerAssetPackRequest, listPartnerAssetPackRequests } from '@/lib/partner-workspace-store'

const ALLOWED_PACK_TYPES = new Set(['market-pack', 'brand-pack', 'area-brief', 'custom'] as const)

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

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
    const requests = await listPartnerAssetPackRequests(session.partnerAccountId)
    return NextResponse.json({ ok: true, requests })
  } catch {
    return NextResponse.json({ error: 'Unable to load asset pack requests.' }, { status: 502 })
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
    title?: string
    packType?: string
    requestNotes?: string
    requestedAssets?: unknown
    targetRegion?: string
    neededByLabel?: string
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.title?.trim()) {
    return NextResponse.json({ error: 'Request title is required.' }, { status: 400 })
  }

  if (!payload.packType || !ALLOWED_PACK_TYPES.has(payload.packType as 'market-pack' | 'brand-pack' | 'area-brief' | 'custom')) {
    return NextResponse.json({ error: 'Invalid asset pack type.' }, { status: 400 })
  }

  const requestedAssets = parseStringArray(payload.requestedAssets)

  try {
    const assetPackRequest = await createPartnerAssetPackRequest(session.partnerAccountId, {
      title: payload.title,
      packType: payload.packType as 'market-pack' | 'brand-pack' | 'area-brief' | 'custom',
      requestNotes: payload.requestNotes,
      requestedAssets,
      targetRegion: payload.targetRegion,
      neededByLabel: payload.neededByLabel,
    })

    if (!assetPackRequest) {
      return NextResponse.json({ error: 'Unable to create the asset pack request.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, request: assetPackRequest }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create the asset pack request.' }, { status: 502 })
  }
}
