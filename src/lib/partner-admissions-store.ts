import { sql } from '@/lib/neon'
import { generateInviteCode, hashSecret } from '@/lib/passwords'

type CreatePartnerAdmissionInput = {
  fullName: string
  email: string
  companyName?: string
  serviceCategory: string
  serviceSummary: string
  collaborationPitch?: string
  coverageAreas: string[]
  languages: string[]
  sustainabilityFocus: boolean
  privacyAccepted: boolean
  newsletterOptIn: boolean
  captchaProvider: string
  captchaHostname?: string
  submissionLanguage: string
  submissionSource: string
}

export type PartnerAdmissionStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected'

export type PartnerAdmissionRecord = {
  id: string
  full_name: string
  email: string
  company_name: string | null
  service_category: string
  service_summary: string
  collaboration_pitch: string | null
  coverage_areas: unknown
  languages: unknown
  sustainability_focus: boolean
  privacy_accepted: boolean
  newsletter_opt_in: boolean
  captcha_provider: string | null
  captcha_verified: boolean
  captcha_hostname: string | null
  submission_language: string
  submission_source: string
  status: PartnerAdmissionStatus
  review_notes: string | null
  decision_reason: string | null
  handoff_state: string | null
  priority_label: string | null
  assigned_to: string | null
  reviewed_at: string | null
  reviewed_by?: string | null
  created_at: string
  updated_at: string
  partner_account_id?: string | null
  partner_workspace_id?: string | null
}

export type PartnerAccountRecord = {
  id: string
  admission_id: string | null
  email: string
  full_name: string
  company_name: string | null
  account_status: 'invited' | 'active' | 'paused'
  invite_code_hash: string | null
  invite_code_expires_at: string | null
  activated_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type PartnerWorkspaceRecord = {
  id: string
  partner_account_id: string
  workspace_status: 'invited' | 'active' | 'paused'
  display_name: string
  welcome_note: string | null
  created_at: string
  updated_at: string
}

export type PartnerAdmissionDecisionRecord = {
  id: string
  admission_id: string
  decided_status: string
  decided_by: string | null
  review_notes: string | null
  decision_channel: string | null
  decision_summary: string | null
  email_template_key: string | null
  activation_state: string | null
  created_at: string
}

export type PartnerAdmissionReviewBundle = {
  admission: PartnerAdmissionRecord
  account: PartnerAccountRecord | null
  workspace: PartnerWorkspaceRecord | null
  decisionHistory: PartnerAdmissionDecisionRecord[]
  auditTrail: Array<{
    id: string
    event_type: string
    actor_type: string
    actor_identifier: string | null
    actor_role: string | null
    status_code: number | null
    subject_type: string | null
    subject_id: string | null
    created_at: string
    details: unknown
  }>
}

export type SynergiAdmissionsAnalyticsRecord = {
  summary: {
    total: number
    submitted: number
    under_review: number
    accepted: number
    rejected: number
  }
  conversion: {
    acceptance_rate: number
    rejection_rate: number
    activation_rate: number
  }
  sourceBreakdown: Array<{
    submission_source: string
    total: number
    accepted: number
    rejected: number
  }>
  languageBreakdown: Array<{
    submission_language: string
    total: number
  }>
  reviewerBreakdown: Array<{
    reviewed_by: string
    total: number
  }>
}

declare global {
  var __ancloraSynergiPartnerAdmissionsSchemaReady: Promise<void> | undefined
}

export async function ensurePartnerAdmissionsSchema() {
  await sql`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `

  await sql`
    CREATE TABLE IF NOT EXISTS partner_admissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      company_name TEXT,
      service_category TEXT NOT NULL,
      service_summary TEXT NOT NULL,
      collaboration_pitch TEXT,
      coverage_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
      languages JSONB NOT NULL DEFAULT '[]'::jsonb,
      sustainability_focus BOOLEAN NOT NULL DEFAULT FALSE,
      privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
      newsletter_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
      captcha_provider TEXT,
      captcha_verified BOOLEAN NOT NULL DEFAULT FALSE,
      captcha_hostname TEXT,
      submission_language TEXT NOT NULL DEFAULT 'es',
      submission_source TEXT NOT NULL DEFAULT 'synergi',
      status TEXT NOT NULL DEFAULT 'submitted',
      review_notes TEXT,
      decision_reason TEXT,
      handoff_state TEXT,
      priority_label TEXT,
      assigned_to TEXT,
      reviewed_at TIMESTAMPTZ,
      reviewed_by TEXT,
      partner_account_id UUID,
      partner_workspace_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS review_notes TEXT;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS decision_reason TEXT;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS handoff_state TEXT;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS priority_label TEXT;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS assigned_to TEXT;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS partner_account_id UUID;
  `

  await sql`
    ALTER TABLE partner_admissions
      ADD COLUMN IF NOT EXISTS partner_workspace_id UUID;
  `

  await sql`
    CREATE TABLE IF NOT EXISTS partner_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admission_id UUID REFERENCES partner_admissions(id) ON DELETE SET NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      company_name TEXT,
      account_status TEXT NOT NULL DEFAULT 'invited',
      password_hash TEXT,
      invite_code_hash TEXT,
      invite_code_expires_at TIMESTAMPTZ,
      activated_at TIMESTAMPTZ,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS partner_workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_account_id UUID NOT NULL UNIQUE REFERENCES partner_accounts(id) ON DELETE CASCADE,
      workspace_status TEXT NOT NULL DEFAULT 'invited',
      display_name TEXT NOT NULL,
      welcome_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS partner_admission_decisions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admission_id UUID NOT NULL REFERENCES partner_admissions(id) ON DELETE CASCADE,
      decided_status TEXT NOT NULL,
      decided_by TEXT,
      review_notes TEXT,
      decision_channel TEXT,
      decision_summary TEXT,
      email_template_key TEXT,
      activation_state TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    ALTER TABLE partner_admission_decisions
      ADD COLUMN IF NOT EXISTS decision_channel TEXT;
  `

  await sql`
    ALTER TABLE partner_admission_decisions
      ADD COLUMN IF NOT EXISTS decision_summary TEXT;
  `

  await sql`
    ALTER TABLE partner_admission_decisions
      ADD COLUMN IF NOT EXISTS email_template_key TEXT;
  `

  await sql`
    ALTER TABLE partner_admission_decisions
      ADD COLUMN IF NOT EXISTS activation_state TEXT;
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_admissions_created_at
      ON partner_admissions (created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_admissions_status
      ON partner_admissions (status);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_accounts_email
      ON partner_accounts (email);
  `
}

export async function createPartnerAdmission(input: CreatePartnerAdmissionInput) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    INSERT INTO partner_admissions (
      full_name,
      email,
      company_name,
      service_category,
      service_summary,
      collaboration_pitch,
      coverage_areas,
      languages,
      sustainability_focus,
      privacy_accepted,
      newsletter_opt_in,
      captcha_provider,
      captcha_verified,
      captcha_hostname,
      submission_language,
      submission_source
    )
    VALUES (
      ${input.fullName},
      ${input.email},
      ${input.companyName ?? null},
      ${input.serviceCategory},
      ${input.serviceSummary},
      ${input.collaborationPitch ?? null},
      ${JSON.stringify(input.coverageAreas)},
      ${JSON.stringify(input.languages)},
      ${input.sustainabilityFocus},
      ${input.privacyAccepted},
      ${input.newsletterOptIn},
      ${input.captchaProvider},
      ${true},
      ${input.captchaHostname ?? null},
      ${input.submissionLanguage},
      ${input.submissionSource}
    )
    RETURNING id, status, created_at;
  `

  return rows[0] as { id: string; status: string; created_at: string }
}

export async function listPartnerAdmissions(params: {
  status?: PartnerAdmissionStatus
  query?: string
  submissionSource?: string
  limit?: number
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const limit = Math.max(1, Math.min(200, params.limit ?? 50))
  const query = params.query?.trim() || ''
  const queryLike = query ? `%${query}%` : null
  const source = params.submissionSource?.trim() || ''

  const rows = params.status
    ? await sql`
        SELECT
          id,
          full_name,
          email,
          company_name,
          service_category,
          service_summary,
          collaboration_pitch,
          coverage_areas,
          languages,
          sustainability_focus,
          privacy_accepted,
          newsletter_opt_in,
          captcha_provider,
          captcha_verified,
          captcha_hostname,
          submission_language,
          submission_source,
          status,
          review_notes,
          decision_reason,
          handoff_state,
          priority_label,
          assigned_to,
          reviewed_at,
          reviewed_by,
          partner_account_id,
          partner_workspace_id,
          created_at,
          updated_at
        FROM partner_admissions
        WHERE status = ${params.status}
          AND (${source || null}::text IS NULL OR submission_source = ${source || null})
          AND (
            ${queryLike}::text IS NULL
            OR lower(full_name) LIKE lower(${queryLike})
            OR lower(email) LIKE lower(${queryLike})
            OR lower(COALESCE(company_name, '')) LIKE lower(${queryLike})
            OR lower(service_category) LIKE lower(${queryLike})
            OR lower(service_summary) LIKE lower(${queryLike})
            OR lower(COALESCE(collaboration_pitch, '')) LIKE lower(${queryLike})
            OR lower(submission_source) LIKE lower(${queryLike})
            OR lower(COALESCE(review_notes, '')) LIKE lower(${queryLike})
            OR lower(COALESCE(decision_reason, '')) LIKE lower(${queryLike})
            OR lower(COALESCE(priority_label, '')) LIKE lower(${queryLike})
            OR lower(COALESCE(handoff_state, '')) LIKE lower(${queryLike})
          )
        ORDER BY created_at DESC
        LIMIT ${limit};
      `
    : await sql`
        SELECT
          id,
          full_name,
          email,
          company_name,
          service_category,
          service_summary,
          collaboration_pitch,
          coverage_areas,
          languages,
          sustainability_focus,
          privacy_accepted,
          newsletter_opt_in,
          captcha_provider,
          captcha_verified,
          captcha_hostname,
          submission_language,
          submission_source,
          status,
          review_notes,
          decision_reason,
          handoff_state,
          priority_label,
          assigned_to,
          reviewed_at,
          reviewed_by,
          partner_account_id,
          partner_workspace_id,
          created_at,
          updated_at
        FROM partner_admissions
        WHERE (${source || null}::text IS NULL OR submission_source = ${source || null})
          AND (
            ${queryLike}::text IS NULL
            OR lower(full_name) LIKE lower(${queryLike})
            OR lower(email) LIKE lower(${queryLike})
            OR lower(COALESCE(company_name, '')) LIKE lower(${queryLike})
            OR lower(service_category) LIKE lower(${queryLike})
            OR lower(service_summary) LIKE lower(${queryLike})
            OR lower(COALESCE(collaboration_pitch, '')) LIKE lower(${queryLike})
            OR lower(submission_source) LIKE lower(${queryLike})
            OR lower(COALESCE(review_notes, '')) LIKE lower(${queryLike})
            OR lower(COALESCE(decision_reason, '')) LIKE lower(${queryLike})
            OR lower(COALESCE(priority_label, '')) LIKE lower(${queryLike})
            OR lower(COALESCE(handoff_state, '')) LIKE lower(${queryLike})
          )
        ORDER BY created_at DESC
        LIMIT ${limit};
      `

  return rows as PartnerAdmissionRecord[]
}

export async function reviewPartnerAdmission(input: {
  id: string
  status: Exclude<PartnerAdmissionStatus, 'submitted'>
  reviewNotes?: string
  decisionReason?: string
  handoffState?: string
  priorityLabel?: string
  assignedTo?: string
  reviewedBy?: string
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    UPDATE partner_admissions
    SET
      status = ${input.status},
      review_notes = ${input.reviewNotes?.trim() || null},
      decision_reason = ${input.decisionReason?.trim() || null},
      handoff_state = ${input.handoffState?.trim() || null},
      priority_label = ${input.priorityLabel?.trim() || null},
      assigned_to = ${input.assignedTo?.trim() || null},
      reviewed_at = NOW(),
      reviewed_by = ${input.reviewedBy?.trim() || null},
      updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING
      id,
      full_name,
      email,
      company_name,
      service_category,
      service_summary,
      collaboration_pitch,
      coverage_areas,
      languages,
      sustainability_focus,
      privacy_accepted,
      newsletter_opt_in,
      captcha_provider,
      captcha_verified,
      captcha_hostname,
      submission_language,
      submission_source,
      status,
      review_notes,
      decision_reason,
      handoff_state,
      priority_label,
      assigned_to,
      reviewed_at,
      reviewed_by,
      created_at,
      updated_at;
  `

  return (rows[0] as PartnerAdmissionRecord | undefined) ?? null
}

export async function getPartnerAccountByEmail(email: string) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    SELECT
      id,
      admission_id,
      email,
      full_name,
      company_name,
      account_status,
      password_hash,
      invite_code_hash,
      invite_code_expires_at,
      activated_at,
      last_login_at,
      created_at,
      updated_at
    FROM partner_accounts
    WHERE email = ${email}
    LIMIT 1;
  `

  return (rows[0] as (PartnerAccountRecord & { password_hash: string | null }) | undefined) ?? null
}

export async function getPartnerAccountById(id: string) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    SELECT
      id,
      admission_id,
      email,
      full_name,
      company_name,
      account_status,
      invite_code_hash,
      invite_code_expires_at,
      activated_at,
      last_login_at,
      created_at,
      updated_at
    FROM partner_accounts
    WHERE id = ${id}
    LIMIT 1;
  `

  return (rows[0] as PartnerAccountRecord | undefined) ?? null
}

export async function getPartnerWorkspaceByAccountId(partnerAccountId: string) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    SELECT
      id,
      partner_account_id,
      workspace_status,
      display_name,
      welcome_note,
      created_at,
      updated_at
    FROM partner_workspaces
    WHERE partner_account_id = ${partnerAccountId}
    LIMIT 1;
  `

  return (rows[0] as PartnerWorkspaceRecord | undefined) ?? null
}

export async function markPartnerLogin(partnerAccountId: string) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  await sql`
    UPDATE partner_accounts
    SET last_login_at = NOW(), updated_at = NOW()
    WHERE id = ${partnerAccountId};
  `
}

export async function activatePartnerAccount(input: {
  partnerAccountId: string
  passwordHash: string
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  await sql`
    UPDATE partner_accounts
    SET
      account_status = 'active',
      password_hash = ${input.passwordHash},
      invite_code_hash = NULL,
      invite_code_expires_at = NULL,
      activated_at = NOW(),
      updated_at = NOW()
    WHERE id = ${input.partnerAccountId};
  `

  await sql`
    UPDATE partner_workspaces
    SET workspace_status = 'active', updated_at = NOW()
    WHERE partner_account_id = ${input.partnerAccountId};
  `
}

export async function issuePartnerInvite(input: {
  partnerAccountId: string
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const inviteCode = generateInviteCode()
  const inviteCodeHash = hashSecret(inviteCode)

  const rows = await sql`
    UPDATE partner_accounts
    SET
      invite_code_hash = ${inviteCodeHash},
      invite_code_expires_at = NOW() + INTERVAL '7 days',
      updated_at = NOW()
    WHERE id = ${input.partnerAccountId}
    RETURNING
      id,
      admission_id,
      email,
      full_name,
      company_name,
      account_status,
      invite_code_hash,
      invite_code_expires_at,
      activated_at,
      last_login_at,
      created_at,
      updated_at;
  `

  const account = (rows[0] as PartnerAccountRecord | undefined) ?? null
  if (!account) return null

  return {
    account,
    inviteCode,
    launchUrl: `/login?email=${encodeURIComponent(account.email)}`,
  }
}

export type PartnerAdmissionsAnalyticsTimelinePoint = {
  day: string
  submissions: number
  reviewed: number
  accepted: number
  rejected: number
  activated: number
}

export type PartnerAdmissionsAnalyticsRecord = {
  generated_at: string
  funnel: {
    total_submissions: number
    submitted: number
    under_review: number
    accepted: number
    rejected: number
    reviewed: number
    review_rate: number
    acceptance_rate: number
    activation_rate: number
    active_workspace_rate: number
    avg_review_hours: number | null
    avg_activation_hours: number | null
  }
  accounts: {
    invited: number
    active: number
    paused: number
  }
  workspaces: {
    invited: number
    active: number
    paused: number
  }
  sources: Array<{ source: string; count: number }>
  priorities: Array<{ label: string; count: number }>
  timeline: PartnerAdmissionsAnalyticsTimelinePoint[]
  recent: PartnerAdmissionRecord[]
}

export async function acceptPartnerAdmission(input: {
  admissionId: string
  reviewNotes?: string
  decisionReason?: string
  handoffState?: string
  priorityLabel?: string
  assignedTo?: string
  reviewedBy?: string
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const admissions = await sql`
    SELECT id, full_name, email, company_name
    FROM partner_admissions
    WHERE id = ${input.admissionId}
    LIMIT 1;
  `

  const admission = admissions[0] as
    | { id: string; full_name: string; email: string; company_name: string | null }
    | undefined

  if (!admission) return null

  const inviteCode = generateInviteCode()
  const inviteCodeHash = hashSecret(inviteCode)

  const accountRows = await sql`
    INSERT INTO partner_accounts (
      admission_id,
      email,
      full_name,
      company_name,
      account_status,
      invite_code_hash,
      invite_code_expires_at,
      updated_at
    )
    VALUES (
      ${admission.id},
      ${admission.email},
      ${admission.full_name},
      ${admission.company_name},
      'invited',
      ${inviteCodeHash},
      NOW() + INTERVAL '7 days',
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      admission_id = EXCLUDED.admission_id,
      full_name = EXCLUDED.full_name,
      company_name = EXCLUDED.company_name,
      account_status = 'invited',
      invite_code_hash = EXCLUDED.invite_code_hash,
      invite_code_expires_at = EXCLUDED.invite_code_expires_at,
      updated_at = NOW()
    RETURNING id, email, full_name, company_name, account_status;
  `

  const account = accountRows[0] as {
    id: string
    email: string
    full_name: string
    company_name: string | null
    account_status: 'invited' | 'active' | 'paused'
  }

  const workspaceRows = await sql`
    INSERT INTO partner_workspaces (
      partner_account_id,
      workspace_status,
      display_name,
      welcome_note,
      updated_at
    )
    VALUES (
      ${account.id},
      'invited',
      ${account.company_name || account.full_name},
      ${'Synergi workspace activated for curated collaboration with Anclora.'},
      NOW()
    )
    ON CONFLICT (partner_account_id)
    DO UPDATE SET
      workspace_status = 'invited',
      display_name = EXCLUDED.display_name,
      updated_at = NOW()
    RETURNING id, workspace_status, display_name, welcome_note;
  `

  const workspace = workspaceRows[0] as PartnerWorkspaceRecord

  const updatedAdmissions = await sql`
    UPDATE partner_admissions
    SET
      status = 'accepted',
      review_notes = ${input.reviewNotes?.trim() || null},
      decision_reason = ${input.decisionReason?.trim() || input.reviewNotes?.trim() || null},
      handoff_state = ${input.handoffState?.trim() || 'invite_issued'},
      priority_label = ${input.priorityLabel?.trim() || null},
      assigned_to = ${input.assignedTo?.trim() || null},
      reviewed_at = NOW(),
      reviewed_by = ${input.reviewedBy?.trim() || null},
      partner_account_id = ${account.id},
      partner_workspace_id = ${workspace.id},
      updated_at = NOW()
    WHERE id = ${input.admissionId}
    RETURNING
      id,
      full_name,
      email,
      company_name,
      service_category,
      service_summary,
      collaboration_pitch,
      coverage_areas,
      languages,
      sustainability_focus,
      privacy_accepted,
      newsletter_opt_in,
      captcha_provider,
      captcha_verified,
      captcha_hostname,
      submission_language,
      submission_source,
      status,
      review_notes,
      decision_reason,
      handoff_state,
      priority_label,
      assigned_to,
      reviewed_at,
      reviewed_by,
      partner_account_id,
      partner_workspace_id,
      created_at,
      updated_at;
  `

  await sql`
    INSERT INTO partner_admission_decisions (
      admission_id,
      decided_status,
      decided_by,
      review_notes,
      decision_channel,
      decision_summary,
      email_template_key,
      activation_state
    )
    VALUES (
      ${input.admissionId},
      'accepted',
      ${input.reviewedBy?.trim() || null},
      ${input.reviewNotes?.trim() || null},
      'backoffice',
      ${input.decisionReason?.trim() || input.reviewNotes?.trim() || null},
      'partner-accepted',
      ${input.handoffState?.trim() || 'invite_issued'}
    );
  `

  return {
    admission: updatedAdmissions[0] as PartnerAdmissionRecord,
    account,
    workspace,
    inviteCode,
    launchUrl: `/login?email=${encodeURIComponent(account.email)}`,
  }
}

export async function updatePartnerAdmissionStatus(input: {
  id: string
  status: Exclude<PartnerAdmissionStatus, 'submitted' | 'accepted'>
  reviewNotes?: string
  decisionReason?: string
  handoffState?: string
  priorityLabel?: string
  assignedTo?: string
  reviewedBy?: string
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    UPDATE partner_admissions
    SET
      status = ${input.status},
      review_notes = ${input.reviewNotes?.trim() || null},
      decision_reason = ${input.decisionReason?.trim() || input.reviewNotes?.trim() || null},
      handoff_state = ${input.handoffState?.trim() || (input.status === 'rejected' ? 'closed' : 'in_review')},
      priority_label = ${input.priorityLabel?.trim() || null},
      assigned_to = ${input.assignedTo?.trim() || null},
      reviewed_at = NOW(),
      reviewed_by = ${input.reviewedBy?.trim() || null},
      updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING
      id,
      full_name,
      email,
      company_name,
      service_category,
      service_summary,
      collaboration_pitch,
      coverage_areas,
      languages,
      sustainability_focus,
      privacy_accepted,
      newsletter_opt_in,
      captcha_provider,
      captcha_verified,
      captcha_hostname,
      submission_language,
      submission_source,
      status,
      review_notes,
      decision_reason,
      handoff_state,
      priority_label,
      assigned_to,
      reviewed_at,
      reviewed_by,
      partner_account_id,
      partner_workspace_id,
      created_at,
      updated_at;
  `

  const updated = (rows[0] as PartnerAdmissionRecord | undefined) ?? null
  if (updated) {
    await sql`
    INSERT INTO partner_admission_decisions (
      admission_id,
      decided_status,
      decided_by,
      review_notes,
      decision_channel,
      decision_summary,
      email_template_key,
      activation_state
    )
    VALUES (
      ${input.id},
      ${input.status},
      ${input.reviewedBy?.trim() || null},
      ${input.reviewNotes?.trim() || null},
      'backoffice',
      ${input.decisionReason?.trim() || input.reviewNotes?.trim() || null},
      ${input.status === 'rejected' ? 'partner-rejected' : 'partner-review-update'},
      ${input.status === 'rejected' ? 'closed' : 'in_review'}
    );
  `
  }

  return updated
}

export async function getPartnerAdmissionReviewBundle(admissionId: string) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const admissions = await sql<PartnerAdmissionRecord>`
    SELECT
      id,
      full_name,
      email,
      company_name,
      service_category,
      service_summary,
      collaboration_pitch,
      coverage_areas,
      languages,
      sustainability_focus,
      privacy_accepted,
      newsletter_opt_in,
      captcha_provider,
      captcha_verified,
      captcha_hostname,
      submission_language,
      submission_source,
      status,
      review_notes,
      decision_reason,
      handoff_state,
      priority_label,
      assigned_to,
      reviewed_at,
      reviewed_by,
      partner_account_id,
      partner_workspace_id,
      created_at,
      updated_at
    FROM partner_admissions
    WHERE id = ${admissionId}
    LIMIT 1;
  `

  const admission = admissions[0]
  if (!admission) return null

  const decisionHistory = await sql<PartnerAdmissionDecisionRecord>`
    SELECT
      id,
      admission_id,
      decided_status,
      decided_by,
      review_notes,
      decision_channel,
      decision_summary,
      email_template_key,
      activation_state,
      created_at
    FROM partner_admission_decisions
    WHERE admission_id = ${admissionId}
    ORDER BY created_at DESC
    LIMIT 12;
  `

  const accountRows = admission.partner_account_id
    ? await sql<PartnerAccountRecord>`
        SELECT
          id,
          admission_id,
          email,
          full_name,
          company_name,
          account_status,
          invite_code_hash,
          invite_code_expires_at,
          activated_at,
          last_login_at,
          created_at,
          updated_at
        FROM partner_accounts
        WHERE id = ${admission.partner_account_id}
        LIMIT 1;
      `
    : []

  const workspaceRows = admission.partner_workspace_id
    ? await sql<PartnerWorkspaceRecord>`
        SELECT
          id,
          partner_account_id,
          workspace_status,
          display_name,
          welcome_note,
          created_at,
          updated_at
        FROM partner_workspaces
        WHERE id = ${admission.partner_workspace_id}
        LIMIT 1;
      `
    : []

  const auditTrail = await sql<PartnerAdmissionReviewBundle['auditTrail'][number]>`
    SELECT
      id,
      event_type,
      actor_type,
      actor_identifier,
      actor_role,
      status_code,
      subject_type,
      subject_id,
      created_at,
      details
    FROM synergi_audit_events
    WHERE actor_identifier = ${admission.email}
      OR (subject_type = 'partner_admission' AND subject_id = ${admission.id})
      OR (${admission.partner_account_id || null}::text IS NOT NULL AND subject_id = ${admission.partner_account_id || null})
    ORDER BY created_at DESC
    LIMIT 16;
  `.catch(() => [])

  return {
    admission,
    account: accountRows[0] ?? null,
    workspace: workspaceRows[0] ?? null,
    decisionHistory,
    auditTrail,
  } satisfies PartnerAdmissionReviewBundle
}

export async function getSynergiAdmissionsAnalytics() {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const summaryRows = await sql<{
    total: string
    submitted: string
    under_review: string
    accepted: string
    rejected: string
    active_accounts: string
  }>`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE status = 'submitted')::text AS submitted,
      COUNT(*) FILTER (WHERE status = 'under_review')::text AS under_review,
      COUNT(*) FILTER (WHERE status = 'accepted')::text AS accepted,
      COUNT(*) FILTER (WHERE status = 'rejected')::text AS rejected,
      COUNT(*) FILTER (WHERE partner_account_id IS NOT NULL)::text AS active_accounts
    FROM partner_admissions;
  `

  const sourceBreakdown = await sql<{
    submission_source: string
    total: string
    accepted: string
    rejected: string
  }>`
    SELECT
      submission_source,
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE status = 'accepted')::text AS accepted,
      COUNT(*) FILTER (WHERE status = 'rejected')::text AS rejected
    FROM partner_admissions
    GROUP BY submission_source
    ORDER BY COUNT(*) DESC, submission_source ASC;
  `

  const languageBreakdown = await sql<{
    submission_language: string
    total: string
  }>`
    SELECT
      submission_language,
      COUNT(*)::text AS total
    FROM partner_admissions
    GROUP BY submission_language
    ORDER BY COUNT(*) DESC, submission_language ASC;
  `

  const reviewerBreakdown = await sql<{
    reviewed_by: string | null
    total: string
  }>`
    SELECT
      reviewed_by,
      COUNT(*)::text AS total
    FROM partner_admissions
    WHERE reviewed_by IS NOT NULL
    GROUP BY reviewed_by
    ORDER BY COUNT(*) DESC, reviewed_by ASC
    LIMIT 8;
  `

  const summary = summaryRows[0]
  const total = Number(summary?.total || '0')
  const accepted = Number(summary?.accepted || '0')
  const rejected = Number(summary?.rejected || '0')
  const activeAccounts = Number(summary?.active_accounts || '0')

  return {
    summary: {
      total,
      submitted: Number(summary?.submitted || '0'),
      under_review: Number(summary?.under_review || '0'),
      accepted,
      rejected,
    },
    conversion: {
      acceptance_rate: total > 0 ? Number(((accepted / total) * 100).toFixed(1)) : 0,
      rejection_rate: total > 0 ? Number(((rejected / total) * 100).toFixed(1)) : 0,
      activation_rate: accepted > 0 ? Number(((activeAccounts / accepted) * 100).toFixed(1)) : 0,
    },
    sourceBreakdown: sourceBreakdown.map((row) => ({
      submission_source: row.submission_source,
      total: Number(row.total),
      accepted: Number(row.accepted),
      rejected: Number(row.rejected),
    })),
    languageBreakdown: languageBreakdown.map((row) => ({
      submission_language: row.submission_language,
      total: Number(row.total),
    })),
    reviewerBreakdown: reviewerBreakdown.map((row) => ({
      reviewed_by: row.reviewed_by || 'system',
      total: Number(row.total),
    })),
  } satisfies SynergiAdmissionsAnalyticsRecord
}

export async function getPartnerAdmissionsAnalytics(input?: {
  days?: number
  recentLimit?: number
}): Promise<PartnerAdmissionsAnalyticsRecord> {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const days = Math.max(7, Math.min(input?.days || 30, 90))
  const recentLimit = Math.max(1, Math.min(input?.recentLimit || 10, 50))

  const funnelRows = await sql<{
    total_submissions: string
    submitted: string
    under_review: string
    accepted: string
    rejected: string
    reviewed: string
    avg_review_hours: string | null
    avg_activation_hours: string | null
  }>`
    SELECT
      COUNT(*)::text AS total_submissions,
      COUNT(*) FILTER (WHERE status = 'submitted')::text AS submitted,
      COUNT(*) FILTER (WHERE status = 'under_review')::text AS under_review,
      COUNT(*) FILTER (WHERE status = 'accepted')::text AS accepted,
      COUNT(*) FILTER (WHERE status = 'rejected')::text AS rejected,
      COUNT(*) FILTER (WHERE reviewed_at IS NOT NULL)::text AS reviewed,
      AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600.0) FILTER (WHERE reviewed_at IS NOT NULL)::text AS avg_review_hours,
      AVG(EXTRACT(EPOCH FROM (a.activated_at - pa.reviewed_at)) / 3600.0) FILTER (
        WHERE pa.status = 'accepted'
          AND a.activated_at IS NOT NULL
          AND pa.reviewed_at IS NOT NULL
      )::text AS avg_activation_hours
    FROM partner_admissions pa
    LEFT JOIN partner_accounts a ON a.admission_id = pa.id;
  `

  const accountRows = await sql<{ account_status: string; count: string }>`
    SELECT account_status, COUNT(*)::text AS count
    FROM partner_accounts
    GROUP BY account_status;
  `

  const workspaceRows = await sql<{ workspace_status: string; count: string }>`
    SELECT workspace_status, COUNT(*)::text AS count
    FROM partner_workspaces
    GROUP BY workspace_status;
  `

  const sourceRows = await sql<{ submission_source: string; count: string }>`
    SELECT submission_source, COUNT(*)::text AS count
    FROM partner_admissions
    GROUP BY submission_source
    ORDER BY COUNT(*) DESC, submission_source ASC
    LIMIT 8;
  `

  const priorityRows = await sql<{ priority_label: string | null; count: string }>`
    SELECT COALESCE(priority_label, 'unassigned') AS priority_label, COUNT(*)::text AS count
    FROM partner_admissions
    GROUP BY COALESCE(priority_label, 'unassigned')
    ORDER BY COUNT(*) DESC, priority_label ASC
    LIMIT 8;
  `

  const timelineRows = await sql<PartnerAdmissionsAnalyticsTimelinePoint>`
    WITH series AS (
      SELECT generate_series(
        date_trunc('day', NOW()) - (${days - 1} * INTERVAL '1 day'),
        date_trunc('day', NOW()),
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT
      series.day::text AS day,
      COALESCE((SELECT COUNT(*)::int FROM partner_admissions pa WHERE pa.created_at::date = series.day), 0) AS submissions,
      COALESCE((SELECT COUNT(*)::int FROM partner_admissions pa WHERE pa.reviewed_at::date = series.day), 0) AS reviewed,
      COALESCE((SELECT COUNT(*)::int FROM partner_admissions pa WHERE pa.status = 'accepted' AND pa.updated_at::date = series.day), 0) AS accepted,
      COALESCE((SELECT COUNT(*)::int FROM partner_admissions pa WHERE pa.status = 'rejected' AND pa.updated_at::date = series.day), 0) AS rejected,
      COALESCE((SELECT COUNT(*)::int FROM partner_accounts a WHERE a.activated_at::date = series.day), 0) AS activated
    FROM series
    ORDER BY series.day ASC;
  `

  const funnel = funnelRows[0] || {
    total_submissions: '0',
    submitted: '0',
    under_review: '0',
    accepted: '0',
    rejected: '0',
    reviewed: '0',
    avg_review_hours: null,
    avg_activation_hours: null,
  }

  const totalSubmissions = Number(funnel.total_submissions || '0')
  const reviewed = Number(funnel.reviewed || '0')
  const accepted = Number(funnel.accepted || '0')
  const rejected = Number(funnel.rejected || '0')
  const submitted = Number(funnel.submitted || '0')
  const underReview = Number(funnel.under_review || '0')
  const activeAccounts = Number(accountRows.find((item) => item.account_status === 'active')?.count || '0')
  const activeWorkspaces = Number(workspaceRows.find((item) => item.workspace_status === 'active')?.count || '0')
  const acceptedAccountCount = accepted

  const recent = await listPartnerAdmissions({ limit: recentLimit })

  return {
    generated_at: new Date().toISOString(),
    funnel: {
      total_submissions: totalSubmissions,
      submitted,
      under_review: underReview,
      accepted,
      rejected,
      reviewed,
      review_rate: totalSubmissions ? Number((reviewed / totalSubmissions).toFixed(3)) : 0,
      acceptance_rate: totalSubmissions ? Number((accepted / totalSubmissions).toFixed(3)) : 0,
      activation_rate: acceptedAccountCount ? Number((activeAccounts / acceptedAccountCount).toFixed(3)) : 0,
      active_workspace_rate: acceptedAccountCount ? Number((activeWorkspaces / acceptedAccountCount).toFixed(3)) : 0,
      avg_review_hours: funnel.avg_review_hours ? Number(Number(funnel.avg_review_hours).toFixed(2)) : null,
      avg_activation_hours: funnel.avg_activation_hours ? Number(Number(funnel.avg_activation_hours).toFixed(2)) : null,
    },
    accounts: {
      invited: Number(accountRows.find((item) => item.account_status === 'invited')?.count || '0'),
      active: activeAccounts,
      paused: Number(accountRows.find((item) => item.account_status === 'paused')?.count || '0'),
    },
    workspaces: {
      invited: Number(workspaceRows.find((item) => item.workspace_status === 'invited')?.count || '0'),
      active: activeWorkspaces,
      paused: Number(workspaceRows.find((item) => item.workspace_status === 'paused')?.count || '0'),
    },
    sources: sourceRows.map((item) => ({ source: item.submission_source, count: Number(item.count) })),
    priorities: priorityRows.map((item) => ({ label: item.priority_label || 'unassigned', count: Number(item.count) })),
    timeline: timelineRows.map((item) => ({
      day: item.day,
      submissions: Number(item.submissions),
      reviewed: Number(item.reviewed),
      accepted: Number(item.accepted),
      rejected: Number(item.rejected),
      activated: Number(item.activated),
    })),
    recent,
  }
}
