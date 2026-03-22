import { neon } from '@neondatabase/serverless'

type NeonSql = ReturnType<typeof neon>

let client: NeonSql | null = null

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in server environment.')
  }
  return databaseUrl
}

function getClient() {
  if (!client) {
    client = neon(getDatabaseUrl())
  }
  return client
}

export function sql<T extends Record<string, unknown> = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  return getClient()(strings, ...values) as Promise<T[]>
}
