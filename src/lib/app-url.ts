export function getSynergiAppUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicitUrl) return explicitUrl.replace(/\/+$/, '')

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    const normalized = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
    return normalized.replace(/\/+$/, '')
  }

  return 'https://anclora-synergi.vercel.app'
}

export function buildSynergiAbsoluteUrl(path: string) {
  const base = getSynergiAppUrl()
  return new URL(path, `${base}/`).toString()
}
