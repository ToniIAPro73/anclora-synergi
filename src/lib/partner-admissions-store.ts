import { sql } from '@/lib/neon'

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
  created_at: string
  updated_at: string
}

declare global {
  // eslint-disable-next-line no-var
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
    CREATE INDEX IF NOT EXISTS idx_partner_admissions_created_at
      ON partner_admissions (created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_admissions_status
      ON partner_admissions (status);
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
}) {
  globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady ??= ensurePartnerAdmissionsSchema()
  await globalThis.__ancloraSynergiPartnerAdmissionsSchemaReady

  const rows = await sql`
    UPDATE partner_admissions
    SET
      status = ${input.status},
      review_notes = ${input.reviewNotes?.trim() || null},
      reviewed_at = NOW(),
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
      created_at,
      updated_at;
  `

  return (rows[0] as PartnerAdmissionRecord | undefined) ?? null
}
