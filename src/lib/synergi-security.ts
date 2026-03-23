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

export type SynergiAuditSeverity = 'info' | 'warning' | 'critical'

export type SynergiAuditEventRecord = {
  id: string
  event_type: string
  actor_type: SecurityActorType
  actor_identifier: string | null
  actor_role: SecurityActorRole | 'viewer' | null
  endpoint: string | null
  method: string | null
  status_code: number | null
  subject_type: string | null
  subject_id: string | null
  ip_address: string | null
  user_agent: string | null
  details: Record<string, unknown>
  created_at: string
}

export type SynergiObservabilitySummary = {
  generatedAt: string
  auditEventsLast24h: number
  criticalEventsLast24h: number
  warningEventsLast24h: number
  adminFailedLoginsLast24h: number
  adminDeniedEventsLast24h: number
  partnerFailedLoginsLast24h: number
  partnerRateLimitedEventsLast24h: number
  pendingAdmissions: number
  underReviewAdmissions: number
  pendingReferrals: number
  pendingAssetPackRequests: number
  activeRateLimitBuckets: number
}

export type SynergiReleaseCheckRecord = {
  id: string
  release_name: string
  release_channel: string
  environment: string
  status: 'passed' | 'warning' | 'failed'
  smoke_summary: string | null
  checked_by: string | null
  details: Record<string, unknown>
  created_at: string
}

export type SynergiReleaseCheckSummary = {
  generatedAt: string
  totalLast30d: number
  passedLast30d: number
  warningLast30d: number
  failedLast30d: number
  latestCheckAt: string | null
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

  await sql`
    CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_actor_type_created_at
      ON synergi_audit_events (actor_type, created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_status_code
      ON synergi_audit_events (status_code);
  `

  await sql`
    CREATE TABLE IF NOT EXISTS synergi_release_checks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      release_name TEXT NOT NULL,
      release_channel TEXT NOT NULL DEFAULT 'production',
      environment TEXT NOT NULL DEFAULT 'production',
      status TEXT NOT NULL DEFAULT 'passed',
      smoke_summary TEXT,
      checked_by TEXT,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_synergi_release_checks_created_at
      ON synergi_release_checks (created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_synergi_release_checks_status
      ON synergi_release_checks (status);
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

export function getSynergiAuditSeverity(eventType: string, statusCode?: number | null): SynergiAuditSeverity {
  const normalizedType = eventType.trim().toLowerCase()
  const code = typeof statusCode === 'number' ? statusCode : null

  if (
    normalizedType.includes('failed') ||
    normalizedType.includes('denied') ||
    normalizedType.includes('rate_limited') ||
    (code !== null && code >= 500)
  ) {
    return 'critical'
  }

  if ((code !== null && code >= 400) || normalizedType.includes('warning')) {
    return 'warning'
  }

  return 'info'
}

export async function listSynergiAuditEvents(input?: {
  limit?: number
  actorType?: SecurityActorType
  eventType?: string
}) {
  globalThis.__ancloraSynergiSecuritySchemaReady ??= ensureSynergiSecuritySchema()
  await globalThis.__ancloraSynergiSecuritySchemaReady

  const limit = Math.max(1, Math.min(input?.limit || 50, 200))

  const rows = await sql<SynergiAuditEventRecord>`
    SELECT
      id,
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
      details,
      created_at
    FROM synergi_audit_events
    WHERE (${input?.actorType || null}::text IS NULL OR actor_type = ${input?.actorType || null})
      AND (${input?.eventType || null}::text IS NULL OR event_type = ${input?.eventType || null})
    ORDER BY created_at DESC
    LIMIT ${limit};
  `

  return rows.map((row) => ({
    ...row,
    details: typeof row.details === 'object' && row.details !== null ? row.details : {},
  }))
}

export async function getSynergiObservabilitySummary(): Promise<SynergiObservabilitySummary> {
  globalThis.__ancloraSynergiSecuritySchemaReady ??= ensureSynergiSecuritySchema()
  await globalThis.__ancloraSynergiSecuritySchemaReady

  const [auditRollup] = await sql<{
    audit_events_last_24h: string
    critical_events_last_24h: string
    warning_events_last_24h: string
    admin_failed_logins_last_24h: string
    admin_denied_events_last_24h: string
    partner_failed_logins_last_24h: string
    partner_rate_limited_events_last_24h: string
  }>`
    SELECT
      COUNT(*)::text AS audit_events_last_24h,
      COUNT(*) FILTER (
        WHERE event_type ILIKE '%failed%'
          OR event_type ILIKE '%denied%'
          OR event_type ILIKE '%rate_limited%'
          OR status_code >= 500
      )::text AS critical_events_last_24h,
      COUNT(*) FILTER (
        WHERE (status_code BETWEEN 400 AND 499)
          AND NOT (event_type ILIKE '%failed%' OR event_type ILIKE '%denied%' OR event_type ILIKE '%rate_limited%')
      )::text AS warning_events_last_24h,
      COUNT(*) FILTER (WHERE event_type = 'admin_login_failed')::text AS admin_failed_logins_last_24h,
      COUNT(*) FILTER (WHERE actor_type = 'admin' AND event_type ILIKE '%denied%')::text AS admin_denied_events_last_24h,
      COUNT(*) FILTER (WHERE event_type = 'partner_login_failed')::text AS partner_failed_logins_last_24h,
      COUNT(*) FILTER (
        WHERE actor_type = 'partner'
          AND event_type ILIKE '%rate_limited%'
      )::text AS partner_rate_limited_events_last_24h
    FROM synergi_audit_events
    WHERE created_at >= NOW() - INTERVAL '24 hours';
  `

  const [workflowRollup] = await sql<{
    pending_admissions: string
    under_review_admissions: string
    pending_referrals: string
    pending_asset_pack_requests: string
  }>`
    SELECT
      (SELECT COUNT(*)::text FROM partner_admissions WHERE status = 'submitted') AS pending_admissions,
      (SELECT COUNT(*)::text FROM partner_admissions WHERE status = 'under_review') AS under_review_admissions,
      (SELECT COUNT(*)::text FROM partner_referrals WHERE status IN ('submitted', 'reviewing')) AS pending_referrals,
      (SELECT COUNT(*)::text FROM partner_asset_pack_requests WHERE status IN ('submitted', 'reviewing')) AS pending_asset_pack_requests;
  `

  const activeRateLimitBuckets = Array.from(ensureRateLimitStore().values()).filter((bucket) => bucket.resetAt > Date.now()).length

  return {
    generatedAt: new Date().toISOString(),
    auditEventsLast24h: Number(auditRollup?.audit_events_last_24h || '0'),
    criticalEventsLast24h: Number(auditRollup?.critical_events_last_24h || '0'),
    warningEventsLast24h: Number(auditRollup?.warning_events_last_24h || '0'),
    adminFailedLoginsLast24h: Number(auditRollup?.admin_failed_logins_last_24h || '0'),
    adminDeniedEventsLast24h: Number(auditRollup?.admin_denied_events_last_24h || '0'),
    partnerFailedLoginsLast24h: Number(auditRollup?.partner_failed_logins_last_24h || '0'),
    partnerRateLimitedEventsLast24h: Number(auditRollup?.partner_rate_limited_events_last_24h || '0'),
    pendingAdmissions: Number(workflowRollup?.pending_admissions || '0'),
    underReviewAdmissions: Number(workflowRollup?.under_review_admissions || '0'),
    pendingReferrals: Number(workflowRollup?.pending_referrals || '0'),
    pendingAssetPackRequests: Number(workflowRollup?.pending_asset_pack_requests || '0'),
    activeRateLimitBuckets,
  }
}

export async function recordSynergiReleaseCheck(input: {
  releaseName: string
  releaseChannel?: string | null
  environment?: string | null
  status: SynergiReleaseCheckRecord['status']
  smokeSummary?: string | null
  checkedBy?: string | null
  details?: Record<string, unknown> | null
}) {
  globalThis.__ancloraSynergiSecuritySchemaReady ??= ensureSynergiSecuritySchema()
  await globalThis.__ancloraSynergiSecuritySchemaReady

  const rows = await sql<SynergiReleaseCheckRecord>`
    INSERT INTO synergi_release_checks (
      release_name,
      release_channel,
      environment,
      status,
      smoke_summary,
      checked_by,
      details
    )
    VALUES (
      ${input.releaseName.trim()},
      ${input.releaseChannel?.trim() || 'production'},
      ${input.environment?.trim() || 'production'},
      ${input.status},
      ${input.smokeSummary?.trim() || null},
      ${input.checkedBy?.trim() || null},
      ${JSON.stringify(input.details || {})}
    )
    RETURNING
      id,
      release_name,
      release_channel,
      environment,
      status,
      smoke_summary,
      checked_by,
      details,
      created_at;
  `

  return rows[0] || null
}

export async function listSynergiReleaseChecks(input?: {
  limit?: number
  status?: SynergiReleaseCheckRecord['status']
}) {
  globalThis.__ancloraSynergiSecuritySchemaReady ??= ensureSynergiSecuritySchema()
  await globalThis.__ancloraSynergiSecuritySchemaReady

  const limit = Math.max(1, Math.min(input?.limit || 12, 100))

  const rows = await sql<SynergiReleaseCheckRecord>`
    SELECT
      id,
      release_name,
      release_channel,
      environment,
      status,
      smoke_summary,
      checked_by,
      details,
      created_at
    FROM synergi_release_checks
    WHERE (${input?.status || null}::text IS NULL OR status = ${input?.status || null})
    ORDER BY created_at DESC
    LIMIT ${limit};
  `

  return rows.map((row) => ({
    ...row,
    details: typeof row.details === 'object' && row.details !== null ? row.details : {},
  }))
}

export async function getSynergiReleaseChecksSummary(): Promise<SynergiReleaseCheckSummary> {
  globalThis.__ancloraSynergiSecuritySchemaReady ??= ensureSynergiSecuritySchema()
  await globalThis.__ancloraSynergiSecuritySchemaReady

  const [summary] = await sql<{
    total_last_30d: string
    passed_last_30d: string
    warning_last_30d: string
    failed_last_30d: string
    latest_check_at: string | null
  }>`
    SELECT
      COUNT(*)::text AS total_last_30d,
      COUNT(*) FILTER (WHERE status = 'passed')::text AS passed_last_30d,
      COUNT(*) FILTER (WHERE status = 'warning')::text AS warning_last_30d,
      COUNT(*) FILTER (WHERE status = 'failed')::text AS failed_last_30d,
      MAX(created_at) AS latest_check_at
    FROM synergi_release_checks
    WHERE created_at >= NOW() - INTERVAL '30 days';
  `

  return {
    generatedAt: new Date().toISOString(),
    totalLast30d: Number(summary?.total_last_30d || '0'),
    passedLast30d: Number(summary?.passed_last_30d || '0'),
    warningLast30d: Number(summary?.warning_last_30d || '0'),
    failedLast30d: Number(summary?.failed_last_30d || '0'),
    latestCheckAt: summary?.latest_check_at || null,
  }
}
