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

declare global {
  var __ancloraSynergiPartnerAdmissionsSchemaReady: Promise<void> | undefined
}

async function ensurePartnerAdmissionsSchema() {
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
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
  limit?: number
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const limit = Math.max(1, Math.min(200, params.limit ?? 50))

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
          reviewed_at,
          reviewed_by,
          partner_account_id,
          partner_workspace_id,
          created_at,
          updated_at
        FROM partner_admissions
        WHERE status = ${params.status}
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
          reviewed_at,
          reviewed_by,
          partner_account_id,
          partner_workspace_id,
          created_at,
          updated_at
        FROM partner_admissions
        ORDER BY created_at DESC
        LIMIT ${limit};
      `

  return rows as PartnerAdmissionRecord[]
}

export async function reviewPartnerAdmission(input: {
  id: string
  status: Exclude<PartnerAdmissionStatus, 'submitted'>
  reviewNotes?: string
  reviewedBy?: string
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    UPDATE partner_admissions
    SET
      status = ${input.status},
      review_notes = ${input.reviewNotes?.trim() || null},
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

export async function acceptPartnerAdmission(input: {
  admissionId: string
  reviewNotes?: string
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
      review_notes
    )
    VALUES (
      ${input.admissionId},
      'accepted',
      ${input.reviewedBy?.trim() || null},
      ${input.reviewNotes?.trim() || null}
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
  reviewedBy?: string
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    UPDATE partner_admissions
    SET
      status = ${input.status},
      review_notes = ${input.reviewNotes?.trim() || null},
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
        review_notes
      )
      VALUES (
        ${input.id},
        ${input.status},
        ${input.reviewedBy?.trim() || null},
        ${input.reviewNotes?.trim() || null}
      );
    `
  }

  return updated
}
