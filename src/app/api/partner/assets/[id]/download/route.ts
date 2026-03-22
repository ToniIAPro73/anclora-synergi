import { readFile } from 'node:fs/promises'
import { basename, extname, resolve, sep } from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerSession } from '@/lib/partner-auth'
import { getPartnerAssetById, registerPartnerAssetDownload } from '@/lib/partner-workspace-store'

const MIME_TYPES: Record<string, string> = {
  '.csv': 'text/csv; charset=utf-8',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function getMimeType(filename: string) {
  return MIME_TYPES[extname(filename).toLowerCase()] || 'application/octet-stream'
}

function buildAttachmentHeaders(filename: string, contentType: string, size?: number) {
  const headers = new Headers({
    'cache-control': 'private, no-store',
    'content-disposition': `attachment; filename="${filename}"`,
    'content-type': contentType,
    'x-robots-tag': 'noindex, nofollow',
  })

  if (typeof size === 'number') {
    headers.set('content-length', String(size))
  }

  return headers
}

async function loadLocalAsset(assetUrl: string) {
  const normalizedUrl = decodeURIComponent(assetUrl.split('?')[0] || '')
  const relativePath = normalizedUrl.replace(/^\/+/, '')
  const publicRoot = resolve(process.cwd(), 'public')
  const absolutePath = resolve(publicRoot, relativePath)

  if (absolutePath !== publicRoot && !absolutePath.startsWith(`${publicRoot}${sep}`)) {
    throw new Error('Invalid asset path.')
  }

  const file = await readFile(absolutePath)
  const filename = basename(absolutePath)

  return {
    body: file,
    filename,
    contentType: getMimeType(filename),
    size: file.byteLength,
  }
}

async function loadRemoteAsset(assetUrl: string) {
  const upstreamResponse = await fetch(assetUrl, { cache: 'no-store' })
  if (!upstreamResponse.ok) {
    throw new Error('Unable to fetch upstream asset.')
  }

  const body = Buffer.from(await upstreamResponse.arrayBuffer())
  const url = new URL(assetUrl)
  const filename = basename(url.pathname) || 'partner-asset'
  const contentType = upstreamResponse.headers.get('content-type') || getMimeType(filename)

  return {
    body,
    filename,
    contentType,
    size: body.byteLength,
  }
}

function loadInlineAsset(assetBody: string, filename: string, contentFormat: 'markdown' | 'text') {
  const body = Buffer.from(assetBody, 'utf-8')

  return {
    body,
    filename,
    contentType: contentFormat === 'markdown' ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8',
    size: body.byteLength,
  }
}

export async function GET(
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
    const asset = await getPartnerAssetById(session.partnerAccountId, id)
    if (!asset) {
      return NextResponse.json({ error: 'Partner asset not found.' }, { status: 404 })
    }

    const fallbackFilename = `${asset.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'partner-asset'}${asset.content_format === 'markdown' ? '.md' : '.txt'}`
    const filePayload = asset.asset_body
      ? loadInlineAsset(asset.asset_body, fallbackFilename, asset.content_format)
      : asset.asset_url
        ? /^https?:\/\//i.test(asset.asset_url)
          ? await loadRemoteAsset(asset.asset_url)
          : await loadLocalAsset(asset.asset_url)
        : null

    if (!filePayload) {
      return NextResponse.json({ error: 'Partner asset not available.' }, { status: 404 })
    }

    await registerPartnerAssetDownload(session.partnerAccountId, id)
    return new NextResponse(filePayload.body, {
      status: 200,
      headers: buildAttachmentHeaders(filePayload.filename, filePayload.contentType, filePayload.size),
    })
  } catch {
    return NextResponse.json({ error: 'Unable to download the partner asset.' }, { status: 502 })
  }
}
