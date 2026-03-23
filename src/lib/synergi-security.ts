import { sql } from '@/lib/neon'

export type SecurityActorType = 'admin' | 'partner' | 'system'
export type SecurityActorRole = 'owner' | 'admin' | 'reviewer' | 'operator' | 'partner'

type RateLimitBucket = {
  count: number
  resetAt: number
}

type AuditEventInput = {
  eventType: string
  actorType: SecurityActorType
  actorIdentifier?: string | null
  actorRole?: SecurityActorRole | 'viewer' | null
  endpoint?: string | null
  method?: string | null
  statusCode?: number | null
  subjectType?: string | null
  subjectId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  details?: Record<string, unknown> | null
}

declare global {
  var __ancloraSynergiRateLimits: Map<string, RateLimitBucket> | undefined
  var __ancloraSynergiSecuritySchemaReady: Promise<void> | undefined
}

const DEFAULT_WINDOW_MS = 60_000

function ensureRateLimitStore() {
  globalThis.__ancloraSynergiRateLimits ??= new Map<string, RateLimitBucket>()
  return globalThis.__ancloraSynergiRateLimits
}

export function getRequestIp(request: Request | { headers: Headers }) {
  const headers = 'headers' in request ? request.headers : null
  if (!headers) return null

  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null

  return headers.get('x-real-ip')?.trim() || headers.get('x-vercel-forwarded-for')?.trim() || null
}

export function getRequestUserAgent(request: Request | { headers: Headers }) {
  return ('headers' in request ? request.headers : null)?.get('user-agent')?.trim() || null
}

export function buildRateLimitKey(parts: Array<string | number | null | undefined>) {
  return parts.filter((part) => part !== null && part !== undefined && String(part).length > 0).join(':')
}

export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = DEFAULT_WINDOW_MS
): { allowed: boolean; retryAfterSeconds?: number } {
  const store = ensureRateLimitStore()
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return { allowed: false, retryAfterSeconds }
  }

  existing.count += 1
  store.set(key, existing)
  return { allowed: true }
}

export async function ensureSynergiSecuritySchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS synergi_audit_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      actor_identifier TEXT,
      actor_role TEXT,
      endpoint TEXT,
      method TEXT,
      status_code INTEGER,
      subject_type TEXT,
      subject_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_created_at
      ON synergi_audit_events (created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_event_type
      ON synergi_audit_events (event_type);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_actor_identifier
      ON synergi_audit_events (actor_identifier);
  `
}

export async function recordSynergiAuditEvent(input: AuditEventInput) {
  globalThis.__ancloraSynergiSecuritySchemaReady ??= ensureSynergiSecuritySchema()
  await globalThis.__ancloraSynergiSecuritySchemaReady

  try {
    await sql`
      INSERT INTO synergi_audit_events (
        event_type,
        actor_type,
        actor_identifier,
        actor_role,
        endpoint,
        method,
        status_code,
        subject_type,
        subject_id,
        ip_address,
        user_agent,
        details
      )
      VALUES (
        ${input.eventType},
        ${input.actorType},
        ${input.actorIdentifier?.trim() || null},
        ${input.actorRole || null},
        ${input.endpoint?.trim() || null},
        ${input.method?.trim() || null},
        ${typeof input.statusCode === 'number' ? input.statusCode : null},
        ${input.subjectType?.trim() || null},
        ${input.subjectId?.trim() || null},
        ${input.ipAddress?.trim() || null},
        ${input.userAgent?.trim() || null},
        ${JSON.stringify(input.details || {})}
      );
    `
  } catch {
    // Audit should never break the user-facing flow.
  }
}
