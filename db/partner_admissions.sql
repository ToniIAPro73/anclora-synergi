CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE TABLE IF NOT EXISTS partner_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_account_id UUID NOT NULL UNIQUE REFERENCES partner_accounts(id) ON DELETE CASCADE,
  workspace_status TEXT NOT NULL DEFAULT 'invited',
  display_name TEXT NOT NULL,
  welcome_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_admission_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES partner_admissions(id) ON DELETE CASCADE,
  decided_status TEXT NOT NULL,
  decided_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_admissions_created_at
  ON partner_admissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_admissions_status
  ON partner_admissions (status);

CREATE INDEX IF NOT EXISTS idx_partner_accounts_email
  ON partner_accounts (email);
