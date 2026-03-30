import { neon, neonConfig } from '@neondatabase/serverless'
import { Agent } from 'undici'

type NeonSql = ReturnType<typeof neon>

let client: NeonSql | null = null
let neonConfigured = false
let insecureDispatcher: Agent | null = null

function shouldAllowInsecureLocalDbSsl() {
  if (process.env.NODE_ENV === 'production') return false
  return process.env.ALLOW_INSECURE_LOCAL_DB_SSL !== 'false'
}

function configureNeonFetch() {
  if (neonConfigured) return
  neonConfigured = true

  if (!shouldAllowInsecureLocalDbSsl()) return

  insecureDispatcher ??= new Agent({
    connect: {
      rejectUnauthorized: false,
    },
  })

  neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      dispatcher: insecureDispatcher as never,
    } as RequestInit)
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in server environment.')
  }
  return databaseUrl
}

function getClient() {
  configureNeonFetch()
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
