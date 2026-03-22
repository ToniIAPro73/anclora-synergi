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

export type PartnerActivityEventRecord = {
  id: string
  partner_account_id: string
  event_type: 'activation' | 'asset_published' | 'asset_reviewed' | 'asset_downloaded' | 'opportunity_created' | 'opportunity_updated' | 'profile_updated'
  title: string
  description: string | null
  created_at: string
}

type WorkspaceBundle = {
  profile: PartnerProfileRecord
  assets: PartnerAssetRecord[]
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
      return ['overview', 'opportunities', 'activity', 'partner-profile', 'assets-documents']
    case 'market-intelligence':
      return ['overview', 'assets-documents', 'activity', 'partner-profile', 'opportunities']
    case 'project-collaboration':
      return ['overview', 'opportunities', 'assets-documents', 'activity', 'partner-profile']
    default:
      return ['overview', 'partner-profile', 'assets-documents', 'opportunities', 'activity']
  }
}

async function ensurePartnerWorkspaceSchema() {
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
