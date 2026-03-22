import { sql } from '@/lib/neon'
import { ensurePartnerAdmissionsSchema, type PartnerAccountRecord, type PartnerWorkspaceRecord } from '@/lib/partner-admissions-store'

export type PartnerProfileType =
  | 'service-premium'
  | 'referral-partner'
  | 'market-intelligence'
  | 'project-collaboration'

export type PartnerModuleKey =
  | 'overview'
  | 'partner-profile'
  | 'assets-documents'
  | 'referrals'
  | 'opportunities'
  | 'activity'

export type PartnerProfileRecord = {
  id: string
  partner_account_id: string
  partner_profile_type: PartnerProfileType
  collaboration_scope: string
  headline: string | null
  service_tags: string[]
  primary_regions: string[]
  languages: string[]
  website_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  profile_visibility: 'private' | 'workspace'
  created_at: string
  updated_at: string
}

export type PartnerAssetRecord = {
  id: string
  partner_account_id: string
  title: string
  description: string | null
  asset_kind: 'playbook' | 'document' | 'brief'
  access_level: 'private' | 'shared'
  asset_url: string | null
  asset_body: string | null
  content_format: 'markdown' | 'text'
  download_count: number
  review_status: 'new' | 'reviewed'
  reviewed_at: string | null
  published_at: string
}

export type PartnerOpportunityRecord = {
  id: string
  partner_account_id: string
  title: string
  summary: string | null
  opportunity_type: 'referral' | 'project' | 'intelligence'
  status: 'new' | 'active' | 'watching'
  partner_response: 'new' | 'watching' | 'interested' | 'passed'
  partner_response_notes: string | null
  region_label: string | null
  due_label: string | null
  value_label: string | null
  created_at: string
}

export type PartnerReferralRecord = {
  id: string
  partner_account_id: string
  referral_name: string
  referral_company: string | null
  referral_email: string | null
  referral_phone: string | null
  referral_kind: 'buyer' | 'seller' | 'investor' | 'introducer' | 'partner'
  region_label: string | null
  budget_label: string | null
  referral_notes: string | null
  status: 'submitted' | 'reviewing' | 'qualified' | 'introduced' | 'closed' | 'declined'
  internal_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export type PartnerAssetPackRequestRecord = {
  id: string
  partner_account_id: string
  title: string
  pack_type: 'market-pack' | 'brand-pack' | 'area-brief' | 'custom'
  request_notes: string | null
  requested_assets: string[]
  target_region: string | null
  needed_by_label: string | null
  status: 'submitted' | 'reviewing' | 'fulfilled' | 'declined'
  delivered_asset_id: string | null
  internal_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export type AdminPartnerReferralRecord = PartnerReferralRecord & {
  partner_email: string
  partner_full_name: string
  partner_company_name: string | null
  workspace_display_name: string | null
}

export type AdminPartnerAssetPackRequestRecord = PartnerAssetPackRequestRecord & {
  partner_email: string
  partner_full_name: string
  partner_company_name: string | null
  workspace_display_name: string | null
}

export type AdminPublishedPartnerAssetRecord = PartnerAssetRecord & {
  partner_email: string
  partner_full_name: string
  partner_company_name: string | null
  workspace_display_name: string | null
}

export type PartnerActivityEventRecord = {
  id: string
  partner_account_id: string
  event_type:
    | 'activation'
    | 'asset_published'
    | 'asset_reviewed'
    | 'asset_downloaded'
    | 'asset_pack_fulfilled'
    | 'asset_pack_status_updated'
    | 'opportunity_created'
    | 'opportunity_updated'
    | 'profile_updated'
    | 'referral_status_updated'
    | 'referral_submitted'
    | 'asset_pack_requested'
  title: string
  description: string | null
  created_at: string
}

type WorkspaceBundle = {
  profile: PartnerProfileRecord
  assets: PartnerAssetRecord[]
  referrals: PartnerReferralRecord[]
  assetPackRequests: PartnerAssetPackRequestRecord[]
  opportunities: PartnerOpportunityRecord[]
  activity: PartnerActivityEventRecord[]
  moduleOrder: PartnerModuleKey[]
}

declare global {
  var __ancloraSynergiPartnerWorkspaceSchemaReady: Promise<void> | undefined
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

function inferProfileType(account: PartnerAccountRecord): PartnerProfileType {
  const source = `${account.company_name || ''} ${account.full_name}`.toLowerCase()
  if (source.includes('broker') || source.includes('advisor') || source.includes('capital')) return 'referral-partner'
  if (source.includes('intel') || source.includes('research') || source.includes('data')) return 'market-intelligence'
  if (source.includes('project') || source.includes('studio')) return 'project-collaboration'
  return 'service-premium'
}

function getDefaultModuleOrder(profileType: PartnerProfileType): PartnerModuleKey[] {
  switch (profileType) {
    case 'referral-partner':
      return ['overview', 'referrals', 'opportunities', 'activity', 'partner-profile', 'assets-documents']
    case 'market-intelligence':
      return ['overview', 'assets-documents', 'referrals', 'activity', 'partner-profile', 'opportunities']
    case 'project-collaboration':
      return ['overview', 'opportunities', 'referrals', 'assets-documents', 'activity', 'partner-profile']
    default:
      return ['overview', 'partner-profile', 'assets-documents', 'referrals', 'opportunities', 'activity']
  }
}

export async function ensurePartnerWorkspaceSchema() {
  await ensurePartnerAdmissionsSchema()

  await sql`
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
  `

  await sql`
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
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS asset_url TEXT;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS asset_body TEXT;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'markdown';
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'new';
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
  `

  await sql`
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
  `

  await sql`
    ALTER TABLE partner_opportunities
      ADD COLUMN IF NOT EXISTS partner_response TEXT NOT NULL DEFAULT 'new';
  `

  await sql`
    ALTER TABLE partner_opportunities
      ADD COLUMN IF NOT EXISTS partner_response_notes TEXT;
  `

  await sql`
    ALTER TABLE partner_opportunities
      ADD COLUMN IF NOT EXISTS due_label TEXT;
  `

  await sql`
    ALTER TABLE partner_opportunities
      ADD COLUMN IF NOT EXISTS value_label TEXT;
  `

  await sql`
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
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS internal_notes TEXT;
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
  `

  await sql`
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
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS delivered_asset_id UUID REFERENCES partner_assets(id) ON DELETE SET NULL;
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS internal_notes TEXT;
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS resolved_by TEXT;
  `

  await sql`
    CREATE TABLE IF NOT EXISTS partner_activity_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_account_id UUID NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
}

async function seedWorkspaceDefaults(account: PartnerAccountRecord, workspace: PartnerWorkspaceRecord, profileType: PartnerProfileType) {
  const existingAssets = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM partner_assets
    WHERE partner_account_id = ${account.id};
  `

  if (Number(existingAssets[0]?.count || '0') === 0) {
    await sql`
      INSERT INTO partner_assets (
        partner_account_id,
        title,
        description,
        asset_kind,
        access_level,
        asset_url,
        asset_body,
        content_format,
        download_count,
        review_status,
        reviewed_at
      )
      VALUES
        (
          ${account.id},
          ${'Synergi onboarding brief'},
          ${'Documento de bienvenida con lineamientos curatoriales, tono de marca y marco de colaboración inicial.'},
          'brief',
          'private',
          ${'/partner-assets/synergi-onboarding-brief.md'},
          NULL,
          'markdown',
          0,
          'new',
          NULL
        ),
        (
          ${account.id},
          ${'Partner operating playbook'},
          ${'Base operativa para referrals, coordinación y colaboración premium dentro del ecosistema.'},
          'playbook',
          'shared',
          ${'/partner-assets/synergi-operating-playbook.md'},
          NULL,
          'markdown',
          0,
          'new',
          NULL
        );
    `
  }

  const existingOpportunities = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM partner_opportunities
    WHERE partner_account_id = ${account.id};
  `

  if (Number(existingOpportunities[0]?.count || '0') === 0) {
    const opportunityType =
      profileType === 'market-intelligence'
        ? 'intelligence'
        : profileType === 'referral-partner'
          ? 'referral'
          : 'project'

    await sql`
      INSERT INTO partner_opportunities (
        partner_account_id,
        title,
        summary,
        opportunity_type,
        status,
        partner_response,
        region_label
        ,
        due_label,
        value_label
      )
      VALUES (
        ${account.id},
        ${'Initial curated opportunity'},
        ${'Primer placeholder operativo para validar el módulo privado de oportunidades en Synergi.'},
        ${opportunityType},
        'new',
        'new',
        ${'Costa del Sol'},
        ${'Next 14 days'},
        ${'High-fit strategic lead'}
      );
    `
  }

  const existingActivity = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM partner_activity_events
    WHERE partner_account_id = ${account.id};
  `

  if (Number(existingActivity[0]?.count || '0') === 0) {
    await sql`
      INSERT INTO partner_activity_events (
        partner_account_id,
        event_type,
        title,
        description
      )
      VALUES
        (
          ${account.id},
          'activation',
          ${'Workspace provisioned'},
          ${`El espacio ${workspace.display_name} ya está listo para colaboración privada.`}
        ),
        (
          ${account.id},
          'asset_published',
          ${'Initial private assets published'},
          ${'Se han publicado los primeros activos curatoriales del partner workspace.'}
        );
    `
  }
}

export async function getOrCreatePartnerWorkspaceBundle(
  account: PartnerAccountRecord,
  workspace: PartnerWorkspaceRecord
): Promise<WorkspaceBundle> {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const inferredProfileType = inferProfileType(account)

  const profileRows = await sql<PartnerProfileRecord>`
    INSERT INTO partner_profiles (
      partner_account_id,
      partner_profile_type,
      collaboration_scope,
      headline,
      service_tags,
      primary_regions,
      languages,
      profile_visibility,
      updated_at
    )
    VALUES (
      ${account.id},
      ${inferredProfileType},
      ${'curated-collaboration'},
      ${`Partner workspace for ${account.company_name || account.full_name}`},
      ${JSON.stringify([inferredProfileType])},
      ${JSON.stringify(['Costa del Sol'])},
      ${JSON.stringify(['es', 'en'])},
      'workspace',
      NOW()
    )
    ON CONFLICT (partner_account_id)
    DO UPDATE SET updated_at = partner_profiles.updated_at
    RETURNING
      id,
      partner_account_id,
      partner_profile_type,
      collaboration_scope,
      headline,
      service_tags,
      primary_regions,
      languages,
      website_url,
      linkedin_url,
      instagram_url,
      profile_visibility,
      created_at,
      updated_at;
  `

  const rawProfile = profileRows[0]
  const profile: PartnerProfileRecord = {
    ...rawProfile,
    service_tags: normalizeStringArray(rawProfile.service_tags),
    primary_regions: normalizeStringArray(rawProfile.primary_regions),
    languages: normalizeStringArray(rawProfile.languages),
  }

  await seedWorkspaceDefaults(account, workspace, profile.partner_profile_type)

  const assetsRows = await sql<PartnerAssetRecord>`
    SELECT
      id,
      partner_account_id,
      title,
      description,
      asset_kind,
      access_level,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at
    FROM partner_assets
    WHERE partner_account_id = ${account.id}
    ORDER BY published_at DESC
    LIMIT 6;
  `

  const opportunitiesRows = await sql<PartnerOpportunityRecord>`
    SELECT
      id,
      partner_account_id,
      title,
      summary,
      opportunity_type,
      status,
      partner_response,
      partner_response_notes,
      region_label,
      due_label,
      value_label,
      created_at
    FROM partner_opportunities
    WHERE partner_account_id = ${account.id}
    ORDER BY created_at DESC
    LIMIT 6;
  `

  const referralsRows = await listPartnerReferrals(account.id)
  const assetPackRequestRows = await listPartnerAssetPackRequests(account.id)

  const activityRows = await sql<PartnerActivityEventRecord>`
    SELECT
      id,
      partner_account_id,
      event_type,
      title,
      description,
      created_at
    FROM partner_activity_events
    WHERE partner_account_id = ${account.id}
    ORDER BY created_at DESC
    LIMIT 8;
  `

  return {
    profile,
    assets: assetsRows,
    referrals: referralsRows,
    assetPackRequests: assetPackRequestRows,
    opportunities: opportunitiesRows,
    activity: activityRows,
    moduleOrder: getDefaultModuleOrder(profile.partner_profile_type),
  }
}

export async function updatePartnerProfile(
  partnerAccountId: string,
  input: {
    headline: string
    serviceTags: string[]
    primaryRegions: string[]
    languages: string[]
    websiteUrl?: string | null
    linkedinUrl?: string | null
    instagramUrl?: string | null
  }
) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerProfileRecord>`
    UPDATE partner_profiles
    SET
      headline = ${input.headline.trim() || null},
      service_tags = ${JSON.stringify(input.serviceTags)},
      primary_regions = ${JSON.stringify(input.primaryRegions)},
      languages = ${JSON.stringify(input.languages)},
      website_url = ${input.websiteUrl?.trim() || null},
      linkedin_url = ${input.linkedinUrl?.trim() || null},
      instagram_url = ${input.instagramUrl?.trim() || null},
      updated_at = NOW()
    WHERE partner_account_id = ${partnerAccountId}
    RETURNING
      id,
      partner_account_id,
      partner_profile_type,
      collaboration_scope,
      headline,
      service_tags,
      primary_regions,
      languages,
      website_url,
      linkedin_url,
      instagram_url,
      profile_visibility,
      created_at,
      updated_at;
  `

  const raw = rows[0]
  if (!raw) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${partnerAccountId},
      'profile_updated',
      ${'Partner profile updated'},
      ${'Se ha actualizado el perfil operativo del partner dentro del workspace.'}
    );
  `

  return {
    ...raw,
    service_tags: normalizeStringArray(raw.service_tags),
    primary_regions: normalizeStringArray(raw.primary_regions),
    languages: normalizeStringArray(raw.languages),
  } as PartnerProfileRecord
}

export async function markPartnerAssetReviewed(partnerAccountId: string, assetId: string) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerAssetRecord>`
    UPDATE partner_assets
    SET
      review_status = 'reviewed',
      reviewed_at = NOW()
    WHERE id = ${assetId} AND partner_account_id = ${partnerAccountId}
    RETURNING
      id,
      partner_account_id,
      title,
      description,
      asset_kind,
      access_level,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at;
  `

  const asset = rows[0]
  if (!asset) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${partnerAccountId},
      'asset_reviewed',
      ${'Asset reviewed'},
      ${`El partner ha marcado como revisado el asset ${asset.title}.`}
    );
  `

  return asset
}

export async function getPartnerAssetById(partnerAccountId: string, assetId: string) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerAssetRecord>`
    SELECT
      id,
      partner_account_id,
      title,
      description,
      asset_kind,
      access_level,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at
    FROM partner_assets
    WHERE id = ${assetId} AND partner_account_id = ${partnerAccountId}
    LIMIT 1;
  `

  return rows[0] ?? null
}

export async function registerPartnerAssetDownload(partnerAccountId: string, assetId: string) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerAssetRecord>`
    UPDATE partner_assets
    SET download_count = download_count + 1
    WHERE id = ${assetId} AND partner_account_id = ${partnerAccountId}
    RETURNING
      id,
      partner_account_id,
      title,
      description,
      asset_kind,
      access_level,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at;
  `

  const asset = rows[0]
  if (!asset) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${partnerAccountId},
      'asset_downloaded',
      ${'Asset downloaded'},
      ${`El partner ha descargado el asset ${asset.title}.`}
    );
  `

  return asset
}

export async function updatePartnerOpportunityResponse(
  partnerAccountId: string,
  opportunityId: string,
  partnerResponse: 'watching' | 'interested' | 'passed',
  partnerResponseNotes?: string
) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerOpportunityRecord>`
    UPDATE partner_opportunities
    SET
      partner_response = ${partnerResponse},
      partner_response_notes = ${partnerResponseNotes?.trim() || null}
    WHERE id = ${opportunityId} AND partner_account_id = ${partnerAccountId}
    RETURNING
      id,
      partner_account_id,
      title,
      summary,
      opportunity_type,
      status,
      partner_response,
      partner_response_notes,
      region_label,
      due_label,
      value_label,
      created_at;
  `

  const opportunity = rows[0]
  if (!opportunity) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${partnerAccountId},
      'opportunity_updated',
      ${'Opportunity response updated'},
      ${`El partner ha actualizado la oportunidad ${opportunity.title} a ${partnerResponse}.`}
    );
  `

  return opportunity
}

export async function listPartnerReferrals(partnerAccountId: string) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  return sql<PartnerReferralRecord>`
    SELECT
      id,
      partner_account_id,
      referral_name,
      referral_company,
      referral_email,
      referral_phone,
      referral_kind,
      region_label,
      budget_label,
      referral_notes,
      status,
      internal_notes,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at
    FROM partner_referrals
    WHERE partner_account_id = ${partnerAccountId}
    ORDER BY created_at DESC
    LIMIT 24;
  `
}

export async function createPartnerReferral(
  partnerAccountId: string,
  input: {
    referralName: string
    referralCompany?: string | null
    referralEmail?: string | null
    referralPhone?: string | null
    referralKind: 'buyer' | 'seller' | 'investor' | 'introducer' | 'partner'
    regionLabel?: string | null
    budgetLabel?: string | null
    referralNotes?: string | null
  }
) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerReferralRecord>`
    INSERT INTO partner_referrals (
      partner_account_id,
      referral_name,
      referral_company,
      referral_email,
      referral_phone,
      referral_kind,
      region_label,
      budget_label,
      referral_notes,
      status,
      updated_at
    )
    VALUES (
      ${partnerAccountId},
      ${input.referralName.trim()},
      ${input.referralCompany?.trim() || null},
      ${input.referralEmail?.trim() || null},
      ${input.referralPhone?.trim() || null},
      ${input.referralKind},
      ${input.regionLabel?.trim() || null},
      ${input.budgetLabel?.trim() || null},
      ${input.referralNotes?.trim() || null},
      'submitted',
      NOW()
    )
    RETURNING
      id,
      partner_account_id,
      referral_name,
      referral_company,
      referral_email,
      referral_phone,
      referral_kind,
      region_label,
      budget_label,
      referral_notes,
      status,
      internal_notes,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at;
  `

  const referral = rows[0]
  if (!referral) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${partnerAccountId},
      'referral_submitted',
      ${'Referral submitted'},
      ${`El partner ha enviado el referral ${referral.referral_name}.`}
    );
  `

  return referral
}

export async function listPartnerAssetPackRequests(partnerAccountId: string) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<Omit<PartnerAssetPackRequestRecord, 'requested_assets'> & { requested_assets: unknown }>`
    SELECT
      id,
      partner_account_id,
      title,
      pack_type,
      request_notes,
      requested_assets,
      target_region,
      needed_by_label,
      status,
      delivered_asset_id,
      internal_notes,
      reviewed_by,
      reviewed_at,
      resolved_by,
      created_at,
      updated_at,
      resolved_at
    FROM partner_asset_pack_requests
    WHERE partner_account_id = ${partnerAccountId}
    ORDER BY created_at DESC
    LIMIT 24;
  `

  return rows.map((row) => ({
    ...row,
    requested_assets: normalizeStringArray(row.requested_assets),
  })) as PartnerAssetPackRequestRecord[]
}

export async function createPartnerAssetPackRequest(
  partnerAccountId: string,
  input: {
    title: string
    packType: 'market-pack' | 'brand-pack' | 'area-brief' | 'custom'
    requestNotes?: string | null
    requestedAssets: string[]
    targetRegion?: string | null
    neededByLabel?: string | null
  }
) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<Omit<PartnerAssetPackRequestRecord, 'requested_assets'> & { requested_assets: unknown }>`
    INSERT INTO partner_asset_pack_requests (
      partner_account_id,
      title,
      pack_type,
      request_notes,
      requested_assets,
      target_region,
      needed_by_label,
      status,
      updated_at
    )
    VALUES (
      ${partnerAccountId},
      ${input.title.trim()},
      ${input.packType},
      ${input.requestNotes?.trim() || null},
      ${JSON.stringify(input.requestedAssets)},
      ${input.targetRegion?.trim() || null},
      ${input.neededByLabel?.trim() || null},
      'submitted',
      NOW()
    )
    RETURNING
      id,
      partner_account_id,
      title,
      pack_type,
      request_notes,
      requested_assets,
      target_region,
      needed_by_label,
      status,
      delivered_asset_id,
      internal_notes,
      reviewed_by,
      reviewed_at,
      resolved_by,
      created_at,
      updated_at,
      resolved_at;
  `

  const rawRequest = rows[0]
  if (!rawRequest) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${partnerAccountId},
      'asset_pack_requested',
      ${'Asset pack requested'},
      ${`El partner ha solicitado el asset pack ${rawRequest.title}.`}
    );
  `

  return {
    ...rawRequest,
    requested_assets: normalizeStringArray(rawRequest.requested_assets),
  } as PartnerAssetPackRequestRecord
}

export async function listAdminPartnerReferrals(input?: {
  status?: PartnerReferralRecord['status']
  limit?: number
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const limit = Math.max(1, Math.min(input?.limit || 50, 100))

  return sql<AdminPartnerReferralRecord>`
    SELECT
      r.id,
      r.partner_account_id,
      r.referral_name,
      r.referral_company,
      r.referral_email,
      r.referral_phone,
      r.referral_kind,
      r.region_label,
      r.budget_label,
      r.referral_notes,
      r.status,
      r.internal_notes,
      r.reviewed_by,
      r.reviewed_at,
      r.created_at,
      r.updated_at,
      a.email AS partner_email,
      a.full_name AS partner_full_name,
      a.company_name AS partner_company_name,
      w.display_name AS workspace_display_name
    FROM partner_referrals r
    INNER JOIN partner_accounts a ON a.id = r.partner_account_id
    LEFT JOIN partner_workspaces w ON w.partner_account_id = r.partner_account_id
    WHERE (${input?.status || null}::text IS NULL OR r.status = ${input?.status || null})
    ORDER BY r.created_at DESC
    LIMIT ${limit};
  `
}

export async function updateAdminPartnerReferralStatus(input: {
  id: string
  status: PartnerReferralRecord['status']
  internalNotes?: string | null
  reviewedBy: string
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const updatedRows = await sql<PartnerReferralRecord>`
    UPDATE partner_referrals
    SET
      status = ${input.status},
      internal_notes = ${input.internalNotes?.trim() || null},
      reviewed_by = ${input.reviewedBy},
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING
      id,
      partner_account_id,
      referral_name,
      referral_company,
      referral_email,
      referral_phone,
      referral_kind,
      region_label,
      budget_label,
      referral_notes,
      status,
      internal_notes,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at;
  `

  const referral = updatedRows[0]
  if (!referral) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${referral.partner_account_id},
      'referral_status_updated',
      ${'Referral status updated'},
      ${`Synergi ha actualizado el referral ${referral.referral_name} a ${input.status}.`}
    );
  `

  const hydratedRows = await listAdminPartnerReferrals({ limit: 100 })
  return hydratedRows.find((item) => item.id === input.id) || null
}

export async function listAdminPartnerAssetPackRequests(input?: {
  status?: PartnerAssetPackRequestRecord['status']
  limit?: number
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const limit = Math.max(1, Math.min(input?.limit || 50, 100))

  const rows = await sql<Omit<AdminPartnerAssetPackRequestRecord, 'requested_assets'> & { requested_assets: unknown }>`
    SELECT
      r.id,
      r.partner_account_id,
      r.title,
      r.pack_type,
      r.request_notes,
      r.requested_assets,
      r.target_region,
      r.needed_by_label,
      r.status,
      r.delivered_asset_id,
      r.internal_notes,
      r.reviewed_by,
      r.resolved_by,
      r.created_at,
      r.updated_at,
      r.resolved_at,
      a.email AS partner_email,
      a.full_name AS partner_full_name,
      a.company_name AS partner_company_name,
      w.display_name AS workspace_display_name
    FROM partner_asset_pack_requests r
    INNER JOIN partner_accounts a ON a.id = r.partner_account_id
    LEFT JOIN partner_workspaces w ON w.partner_account_id = r.partner_account_id
    WHERE (${input?.status || null}::text IS NULL OR r.status = ${input?.status || null})
    ORDER BY r.created_at DESC
    LIMIT ${limit};
  `

  return rows.map((row) => ({
    ...row,
    requested_assets: normalizeStringArray(row.requested_assets),
  })) as AdminPartnerAssetPackRequestRecord[]
}

export async function updateAdminPartnerAssetPackRequest(input: {
  id: string
  status: PartnerAssetPackRequestRecord['status']
  internalNotes?: string | null
  reviewedBy: string
  deliveredAssetId?: string | null
  fulfillmentAsset?: {
    title: string
    description?: string | null
    assetKind?: PartnerAssetRecord['asset_kind']
    accessLevel?: PartnerAssetRecord['access_level']
    assetUrl?: string | null
    assetBody?: string | null
    contentFormat?: PartnerAssetRecord['content_format']
  } | null
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const currentRows = await sql<PartnerAssetPackRequestRecord & { requested_assets: unknown }>`
    SELECT
      id,
      partner_account_id,
      title,
      pack_type,
      request_notes,
      requested_assets,
      target_region,
      needed_by_label,
      status,
      delivered_asset_id,
      internal_notes,
      reviewed_by,
      reviewed_at,
      resolved_by,
      created_at,
      updated_at,
      resolved_at
    FROM partner_asset_pack_requests
    WHERE id = ${input.id}
    LIMIT 1;
  `

  const current = currentRows[0]
  if (!current) return null

  let deliveredAssetId = input.deliveredAssetId?.trim() || current.delivered_asset_id

  if (input.status === 'fulfilled' && input.fulfillmentAsset?.title.trim()) {
    const assetRows = await sql<{ id: string }>`
      INSERT INTO partner_assets (
        partner_account_id,
        title,
        description,
        asset_kind,
        access_level,
        asset_url,
        asset_body,
        content_format,
        download_count,
        review_status,
        reviewed_at
      )
      VALUES (
        ${current.partner_account_id},
        ${input.fulfillmentAsset.title.trim()},
        ${input.fulfillmentAsset.description?.trim() || null},
        ${input.fulfillmentAsset.assetKind || 'document'},
        ${input.fulfillmentAsset.accessLevel || 'shared'},
        ${input.fulfillmentAsset.assetUrl?.trim() || null},
        ${input.fulfillmentAsset.assetBody?.trim() || null},
        ${input.fulfillmentAsset.contentFormat || 'markdown'},
        0,
        'new',
        NULL
      )
      RETURNING id;
    `

    deliveredAssetId = assetRows[0]?.id || null
  }

  const updatedRows = await sql<PartnerAssetPackRequestRecord & { requested_assets: unknown }>`
    UPDATE partner_asset_pack_requests
    SET
      status = ${input.status},
      delivered_asset_id = ${deliveredAssetId},
      internal_notes = ${input.internalNotes?.trim() || null},
      reviewed_by = ${input.reviewedBy},
      reviewed_at = NOW(),
      resolved_by = ${input.reviewedBy},
      resolved_at = CASE WHEN ${input.status} IN ('fulfilled', 'declined') THEN NOW() ELSE NULL END,
      updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING
      id,
      partner_account_id,
      title,
      pack_type,
      request_notes,
      requested_assets,
      target_region,
      needed_by_label,
      status,
      delivered_asset_id,
      internal_notes,
      reviewed_by,
      reviewed_at,
      resolved_by,
      created_at,
      updated_at,
      resolved_at;
  `

  const updated = updatedRows[0]
  if (!updated) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${updated.partner_account_id},
      ${input.status === 'fulfilled' ? 'asset_pack_fulfilled' : 'asset_pack_status_updated'},
      ${input.status === 'fulfilled' ? 'Asset pack fulfilled' : 'Asset pack status updated'},
      ${
        input.status === 'fulfilled'
          ? `Synergi ha resuelto la solicitud ${updated.title}${deliveredAssetId ? ' y ha publicado un nuevo asset.' : '.'}`
          : `Synergi ha actualizado la solicitud ${updated.title} a ${input.status}.`
      }
    );
  `

  const hydratedRows = await listAdminPartnerAssetPackRequests({ limit: 100 })
  const request = hydratedRows.find((item) => item.id === input.id) || null

  return {
    request,
    deliveredAssetId,
  }
}

export async function createAdminPartnerAsset(input: {
  partnerAccountId: string
  title: string
  description?: string | null
  assetKind?: PartnerAssetRecord['asset_kind']
  accessLevel?: PartnerAssetRecord['access_level']
  assetUrl?: string | null
  assetBody?: string | null
  contentFormat?: PartnerAssetRecord['content_format']
  publishedBy: string
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerAssetRecord>`
    INSERT INTO partner_assets (
      partner_account_id,
      title,
      description,
      asset_kind,
      access_level,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at
    )
    VALUES (
      ${input.partnerAccountId},
      ${input.title.trim()},
      ${input.description?.trim() || null},
      ${input.assetKind || 'document'},
      ${input.accessLevel || 'shared'},
      ${input.assetUrl?.trim() || null},
      ${input.assetBody?.trim() || null},
      ${input.contentFormat || 'markdown'},
      0,
      'new',
      NULL
    )
    RETURNING
      id,
      partner_account_id,
      title,
      description,
      asset_kind,
      access_level,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at;
  `

  const asset = rows[0]
  if (!asset) return null

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${input.partnerAccountId},
      'asset_published',
      ${'Asset published'},
      ${`Synergi ha publicado el asset ${asset.title} para el partner.`}
    );
  `

  return asset
}
