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

CREATE TABLE IF NOT EXISTS partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_account_id UUID NOT NULL UNIQUE REFERENCES partner_accounts(id) ON DELETE CASCADE,
  partner_profile_type TEXT NOT NULL DEFAULT 'service-premium',
  collaboration_scope TEXT NOT NULL DEFAULT 'curated-collaboration',
  headline TEXT,
  service_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_regions JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  website_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  profile_visibility TEXT NOT NULL DEFAULT 'workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_account_id UUID NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  asset_kind TEXT NOT NULL DEFAULT 'document',
  access_level TEXT NOT NULL DEFAULT 'private',
  asset_url TEXT,
  asset_body TEXT,
  content_format TEXT NOT NULL DEFAULT 'markdown',
  download_count INTEGER NOT NULL DEFAULT 0,
  review_status TEXT NOT NULL DEFAULT 'new',
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_account_id UUID NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  opportunity_type TEXT NOT NULL DEFAULT 'project',
  status TEXT NOT NULL DEFAULT 'new',
  partner_response TEXT NOT NULL DEFAULT 'new',
  partner_response_notes TEXT,
  region_label TEXT,
  due_label TEXT,
  value_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_account_id UUID NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
  referral_name TEXT NOT NULL,
  referral_company TEXT,
  referral_email TEXT,
  referral_phone TEXT,
  referral_kind TEXT NOT NULL DEFAULT 'buyer',
  region_label TEXT,
  budget_label TEXT,
  referral_notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  internal_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_asset_pack_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_account_id UUID NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pack_type TEXT NOT NULL DEFAULT 'custom',
  request_notes TEXT,
  requested_assets JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_region TEXT,
  needed_by_label TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  delivered_asset_id UUID REFERENCES partner_assets(id) ON DELETE SET NULL,
  internal_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS partner_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_account_id UUID NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_admissions_created_at
  ON partner_admissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_admissions_status
  ON partner_admissions (status);

CREATE INDEX IF NOT EXISTS idx_partner_accounts_email
  ON partner_accounts (email);

CREATE INDEX IF NOT EXISTS idx_partner_referrals_account_created_at
  ON partner_referrals (partner_account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_referrals_status
  ON partner_referrals (status);

CREATE INDEX IF NOT EXISTS idx_partner_asset_pack_requests_account_created_at
  ON partner_asset_pack_requests (partner_account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_asset_pack_requests_status
  ON partner_asset_pack_requests (status);

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

CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_created_at
  ON synergi_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_event_type
  ON synergi_audit_events (event_type);

CREATE INDEX IF NOT EXISTS idx_synergi_audit_events_actor_identifier
  ON synergi_audit_events (actor_identifier);
