import { sql } from '@/lib/neon'
import { ensurePartnerAdmissionsSchema, type PartnerAccountRecord, type PartnerWorkspaceRecord } from '@/lib/partner-admissions-store'

export type PartnerProfileType =
  | 'service-premium'
  | 'referral-partner'
  | 'market-intelligence'
  | 'project-collaboration'

export type PartnerModuleKey =
  | 'overview'
  | 'reporting'
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
  asset_group_key: string
  version_number: number
  is_current_version: boolean
  asset_kind: 'playbook' | 'document' | 'brief'
  access_level: 'private' | 'shared'
  lifecycle_status: 'active' | 'archived' | 'superseded'
  version_label: string | null
  source_type: 'manual' | 'asset-pack-request' | 'seeded'
  superseded_by_asset_id: string | null
  retired_at: string | null
  retirement_reason: string | null
  published_by: string | null
  asset_url: string | null
  asset_body: string | null
  content_format: 'markdown' | 'text'
  download_count: number
  review_status: 'new' | 'reviewed'
  reviewed_at: string | null
  published_at: string
  updated_at: string
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
  estimated_value_label: string | null
  referral_notes: string | null
  status: 'submitted' | 'reviewing' | 'qualified' | 'introduced' | 'negotiating' | 'won' | 'closed' | 'declined'
  owner_username: string | null
  commercial_stage: 'intake' | 'qualified' | 'introduced' | 'negotiating' | 'converted' | 'closed'
  next_action: string | null
  last_contact_at: string | null
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
  delivery_method: string | null
  delivery_reference: string | null
  delivery_notes: string | null
  fulfillment_owner: string | null
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

export type SynergiWorkspaceFunnelAnalyticsRecord = {
  admissions: {
    total: number
    submitted: number
    under_review: number
    accepted: number
    rejected: number
  }
  activation: {
    invited_accounts: number
    active_accounts: number
    activated_accounts: number
    activation_rate: number
  }
  workspace: {
    active_workspaces: number
    private_assets: number
    shared_assets: number
    archived_assets: number
    total_downloads: number
  }
  commercial: {
    referrals_total: number
    referrals_open: number
    referrals_won: number
    asset_packs_total: number
    asset_packs_open: number
    opportunities_active: number
  }
  topPartners: Array<{
    partner_account_id: string
    partner_name: string
    company_name: string | null
    workspace_name: string | null
    referrals_total: number
    downloads_total: number
    opportunities_active: number
  }>
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

export type PartnerWorkspaceReportingRecord = {
  partner_account_id: string
  partner_name: string
  company_name: string | null
  workspace_display_name: string
  account_status: PartnerAccountRecord['account_status']
  workspace_status: PartnerWorkspaceRecord['workspace_status']
  profile_type: PartnerProfileType
  collaboration_scope: string
  headline: string | null
  profile_completeness: number
  module_order: PartnerModuleKey[]
  metrics: {
    assets_total: number
    assets_reviewed: number
    assets_current: number
    assets_retired: number
    assets_versioned: number
    total_downloads: number
    referrals_total: number
    referrals_open: number
    referrals_closed: number
    referrals_owned: number
    asset_packs_total: number
    asset_packs_open: number
    asset_packs_fulfilled: number
    asset_packs_delivered: number
    opportunities_total: number
    opportunities_active: number
    activity_total: number
  }
  highlights: PartnerActivityEventRecord[]
  notifications: PartnerWorkspaceNotificationRecord[]
  last_activity_at: string | null
  focus_label: string
}

export type PartnerWorkspaceNotificationKind =
  | 'profile-incomplete'
  | 'referrals-open'
  | 'asset-packs-open'
  | 'opportunities-active'
  | 'asset-health'
  | 'activity-recent'
  | 'workspace-ready'

export type PartnerWorkspaceNotificationRecord = {
  id: string
  kind: PartnerWorkspaceNotificationKind
  severity: 'info' | 'success' | 'warning'
  count: number | null
  created_at: string
}

export type PartnerWorkspaceAnalyticsTimelinePoint = {
  day: string
  activity_total: number
  asset_downloads: number
  referral_submissions: number
  asset_pack_requests: number
  opportunity_updates: number
}

export type PartnerWorkspaceAnalyticsTopPartnerRecord = {
  partner_account_id: string
  partner_name: string
  company_name: string | null
  workspace_display_name: string | null
  account_status: PartnerAccountRecord['account_status']
  workspace_status: PartnerWorkspaceRecord['workspace_status']
  profile_completeness: number
  assets_total: number
  assets_reviewed: number
  assets_current: number
  assets_retired: number
  assets_versioned: number
  total_downloads: number
  referrals_total: number
  referrals_open: number
  referrals_closed: number
  referrals_owned: number
  asset_packs_total: number
  asset_packs_open: number
  asset_packs_fulfilled: number
  asset_packs_delivered: number
  opportunities_total: number
  opportunities_active: number
  activity_total: number
  last_activity_at: string | null
  focus_label: string
}

export type PartnerWorkspaceActivityFeedRecord = PartnerActivityEventRecord & {
  partner_name: string
  company_name: string | null
  workspace_display_name: string | null
}

export type PartnerWorkspaceAnalyticsRecord = {
  generated_at: string
  metrics: {
    partners_total: number
    active_partners: number
    workspaces_active: number
    avg_profile_completeness: number | null
    active_partners_30d: number
    active_workspaces_30d: number
    assets_total: number
    assets_reviewed: number
    assets_current: number
    assets_retired: number
    assets_versioned: number
    downloads_total: number
    referrals_total: number
    referrals_open: number
    referrals_closed: number
    referrals_owned: number
    asset_packs_total: number
    asset_packs_open: number
    asset_packs_fulfilled: number
    asset_packs_delivered: number
    opportunities_total: number
    opportunities_active: number
    activity_total: number
  }
  timeline: PartnerWorkspaceAnalyticsTimelinePoint[]
  topPartners: PartnerWorkspaceAnalyticsTopPartnerRecord[]
  recentActivity: PartnerWorkspaceActivityFeedRecord[]
}

type WorkspaceBundle = {
  profile: PartnerProfileRecord
  assets: PartnerAssetRecord[]
  referrals: PartnerReferralRecord[]
  assetPackRequests: PartnerAssetPackRequestRecord[]
  opportunities: PartnerOpportunityRecord[]
  activity: PartnerActivityEventRecord[]
  moduleOrder: PartnerModuleKey[]
  reporting: PartnerWorkspaceReportingRecord
}

type WorkspaceBundleInput = Omit<WorkspaceBundle, 'reporting'>

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

function slugifyAssetGroupKey(value: string) {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'partner-asset'
  )
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
      return ['overview', 'reporting', 'referrals', 'opportunities', 'activity', 'partner-profile', 'assets-documents']
    case 'market-intelligence':
      return ['overview', 'reporting', 'assets-documents', 'referrals', 'activity', 'partner-profile', 'opportunities']
    case 'project-collaboration':
      return ['overview', 'reporting', 'opportunities', 'referrals', 'assets-documents', 'activity', 'partner-profile']
    default:
      return ['overview', 'reporting', 'partner-profile', 'assets-documents', 'referrals', 'opportunities', 'activity']
  }
}

function calculateProfileCompleteness(profile: PartnerProfileRecord) {
  const checks = [
    profile.headline,
    profile.service_tags.length > 0,
    profile.primary_regions.length > 0,
    profile.languages.length > 0,
    profile.website_url,
    profile.linkedin_url,
    profile.instagram_url,
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function summarizeWorkspaceFocus(
  profileType: PartnerProfileType,
  metrics: PartnerWorkspaceReportingRecord['metrics']
) {
  if (metrics.referrals_open > 0) return 'Follow up open referrals'
  if (metrics.asset_packs_open > 0) return 'Prepare or resolve asset packs'
  if (metrics.assets_retired > 0 || metrics.assets_versioned > 0) return 'Review asset versions and retirements'
  if (metrics.opportunities_active > 0) return 'Review active opportunities'

  switch (profileType) {
    case 'referral-partner':
      return 'Keep referrals and introductions flowing'
    case 'market-intelligence':
      return 'Refresh reports and market materials'
    case 'project-collaboration':
      return 'Align assets and delivery milestones'
    default:
      return 'Maintain partner profile and curated assets'
  }
}

function buildWorkspaceNotifications(
  profile: PartnerProfileRecord,
  workspace: PartnerWorkspaceRecord,
  metrics: PartnerWorkspaceReportingRecord['metrics'],
  highlights: PartnerActivityEventRecord[]
): PartnerWorkspaceNotificationRecord[] {
  const notifications: PartnerWorkspaceNotificationRecord[] = []
  const latestActivity = highlights[0]
  const now = new Date().toISOString()

  if (
    profile.profile_visibility === 'workspace' &&
    metrics.assets_total > 0 &&
    (metrics.assets_reviewed < metrics.assets_total || metrics.assets_retired > 0)
  ) {
    notifications.push({
      id: `${profile.partner_account_id}-asset-health`,
      kind: 'asset-health',
      severity: 'info',
      count: Math.max(metrics.assets_total - metrics.assets_reviewed, metrics.assets_retired),
      created_at: latestActivity?.created_at || now,
    })
  }

  if (metrics.referrals_open > 0) {
    notifications.push({
      id: `${profile.partner_account_id}-referrals-open`,
      kind: 'referrals-open',
      severity: 'warning',
      count: metrics.referrals_open,
      created_at: latestActivity?.created_at || now,
    })
  }

  if (metrics.asset_packs_open > 0) {
    notifications.push({
      id: `${profile.partner_account_id}-asset-packs-open`,
      kind: 'asset-packs-open',
      severity: 'warning',
      count: metrics.asset_packs_open,
      created_at: latestActivity?.created_at || now,
    })
  }

  if (metrics.opportunities_active > 0) {
    notifications.push({
      id: `${profile.partner_account_id}-opportunities-active`,
      kind: 'opportunities-active',
      severity: 'info',
      count: metrics.opportunities_active,
      created_at: latestActivity?.created_at || now,
    })
  }

  if (latestActivity) {
    notifications.push({
      id: `${profile.partner_account_id}-activity-recent`,
      kind: 'activity-recent',
      severity: 'success',
      count: null,
      created_at: latestActivity.created_at,
    })
  }

  if (notifications.length === 0) {
    notifications.push({
      id: `${workspace.partner_account_id}-workspace-ready`,
      kind: 'workspace-ready',
      severity: 'success',
      count: metrics.activity_total,
      created_at: now,
    })
  }

  return notifications.slice(0, 5)
}

export function buildPartnerWorkspaceReporting(
  account: PartnerAccountRecord,
  workspace: PartnerWorkspaceRecord,
  bundle: WorkspaceBundleInput
): PartnerWorkspaceReportingRecord {
  const metrics = {
    assets_total: bundle.assets.length,
    assets_reviewed: bundle.assets.filter((asset) => asset.review_status === 'reviewed').length,
    assets_current: bundle.assets.filter((asset) => asset.is_current_version && asset.lifecycle_status === 'active').length,
    assets_retired: bundle.assets.filter((asset) => asset.lifecycle_status === 'archived').length,
    assets_versioned: bundle.assets.filter((asset) => asset.version_number > 1).length,
    total_downloads: bundle.assets.reduce((sum, asset) => sum + asset.download_count, 0),
    referrals_total: bundle.referrals.length,
    referrals_open: bundle.referrals.filter((referral) => ['submitted', 'reviewing'].includes(referral.status)).length,
    referrals_closed: bundle.referrals.filter((referral) => ['closed', 'declined'].includes(referral.status)).length,
    referrals_owned: bundle.referrals.filter((referral) => Boolean(referral.owner_username)).length,
    asset_packs_total: bundle.assetPackRequests.length,
    asset_packs_open: bundle.assetPackRequests.filter((request) => ['submitted', 'reviewing'].includes(request.status)).length,
    asset_packs_fulfilled: bundle.assetPackRequests.filter((request) => request.status === 'fulfilled').length,
    asset_packs_delivered: bundle.assetPackRequests.filter((request) => Boolean(request.delivered_asset_id)).length,
    opportunities_total: bundle.opportunities.length,
    opportunities_active: bundle.opportunities.filter((opportunity) => ['active', 'watching'].includes(opportunity.status)).length,
    activity_total: bundle.activity.length,
  }

  return {
    partner_account_id: account.id,
    partner_name: account.full_name,
    company_name: account.company_name,
    workspace_display_name: workspace.display_name,
    account_status: account.account_status,
    workspace_status: workspace.workspace_status,
    profile_type: bundle.profile.partner_profile_type,
    collaboration_scope: bundle.profile.collaboration_scope,
    headline: bundle.profile.headline,
    profile_completeness: calculateProfileCompleteness(bundle.profile),
    module_order: bundle.moduleOrder,
    metrics,
    highlights: bundle.activity.slice(0, 4),
    notifications: buildWorkspaceNotifications(bundle.profile, workspace, metrics, bundle.activity.slice(0, 4)),
    last_activity_at: bundle.activity[0]?.created_at || null,
    focus_label: summarizeWorkspaceFocus(bundle.profile.partner_profile_type, metrics),
  }
}

export async function getPartnerWorkspaceAnalytics(input?: {
  days?: number
  recentLimit?: number
}): Promise<PartnerWorkspaceAnalyticsRecord> {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const days = Math.max(7, Math.min(input?.days || 30, 90))
  const recentLimit = Math.max(1, Math.min(input?.recentLimit || 12, 50))

  const [
    partnerTotalsRows,
    workspaceTotalsRows,
    profileCompletenessRows,
    assetTotalsRows,
    referralTotalsRows,
    assetPackTotalsRows,
    opportunityTotalsRows,
    activityTotalsRows,
    engagementRows,
    timelineRows,
    topPartnerRows,
    recentActivityRows,
  ] = await Promise.all([
    sql<{ total_partners: string; active_partners: string }>`
      SELECT
        COUNT(*)::text AS total_partners,
        COUNT(*) FILTER (WHERE account_status = 'active')::text AS active_partners
      FROM partner_accounts;
    `,
    sql<{ active_workspaces: string; paused_workspaces: string; invited_workspaces: string }>`
      SELECT
        COUNT(*) FILTER (WHERE workspace_status = 'active')::text AS active_workspaces,
        COUNT(*) FILTER (WHERE workspace_status = 'paused')::text AS paused_workspaces,
        COUNT(*) FILTER (WHERE workspace_status = 'invited')::text AS invited_workspaces
      FROM partner_workspaces;
    `,
    sql<{ avg_profile_completeness: string | null }>`
      SELECT
        AVG(
          (
            CASE WHEN headline IS NOT NULL AND btrim(headline) <> '' THEN 1 ELSE 0 END +
            CASE WHEN jsonb_array_length(service_tags) > 0 THEN 1 ELSE 0 END +
            CASE WHEN jsonb_array_length(primary_regions) > 0 THEN 1 ELSE 0 END +
            CASE WHEN jsonb_array_length(languages) > 0 THEN 1 ELSE 0 END +
            CASE WHEN website_url IS NOT NULL AND btrim(website_url) <> '' THEN 1 ELSE 0 END +
            CASE WHEN linkedin_url IS NOT NULL AND btrim(linkedin_url) <> '' THEN 1 ELSE 0 END +
            CASE WHEN instagram_url IS NOT NULL AND btrim(instagram_url) <> '' THEN 1 ELSE 0 END
          ) / 7.0
        )::text AS avg_profile_completeness
      FROM partner_profiles;
    `,
    sql<{ total_assets: string; reviewed_assets: string; current_assets: string; retired_assets: string; versioned_assets: string; total_downloads: string }>`
      SELECT
        COUNT(*)::text AS total_assets,
        COUNT(*) FILTER (WHERE review_status = 'reviewed')::text AS reviewed_assets,
        COUNT(*) FILTER (WHERE is_current_version = TRUE AND lifecycle_status = 'active')::text AS current_assets,
        COUNT(*) FILTER (WHERE lifecycle_status = 'archived')::text AS retired_assets,
        COUNT(*) FILTER (WHERE version_number > 1)::text AS versioned_assets,
        COALESCE(SUM(download_count), 0)::text AS total_downloads
      FROM partner_assets;
    `,
    sql<{ total_referrals: string; open_referrals: string; closed_referrals: string; owned_referrals: string }>`
      SELECT
        COUNT(*)::text AS total_referrals,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'reviewing'))::text AS open_referrals,
        COUNT(*) FILTER (WHERE status IN ('qualified', 'introduced', 'closed', 'declined'))::text AS closed_referrals,
        COUNT(*) FILTER (WHERE owner_username IS NOT NULL AND btrim(owner_username) <> '')::text AS owned_referrals
      FROM partner_referrals;
    `,
    sql<{ total_asset_packs: string; open_asset_packs: string; fulfilled_asset_packs: string; delivered_asset_packs: string }>`
      SELECT
        COUNT(*)::text AS total_asset_packs,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'reviewing'))::text AS open_asset_packs,
        COUNT(*) FILTER (WHERE status = 'fulfilled')::text AS fulfilled_asset_packs,
        COUNT(*) FILTER (WHERE delivered_asset_id IS NOT NULL)::text AS delivered_asset_packs
      FROM partner_asset_pack_requests;
    `,
    sql<{ total_opportunities: string; active_opportunities: string }>`
      SELECT
        COUNT(*)::text AS total_opportunities,
        COUNT(*) FILTER (WHERE status IN ('active', 'watching'))::text AS active_opportunities
      FROM partner_opportunities;
    `,
    sql<{ total_activity: string }>`
      SELECT COUNT(*)::text AS total_activity
      FROM partner_activity_events;
    `,
    sql<{ active_partners_30d: string; active_workspaces_30d: string }>`
      SELECT
        COUNT(DISTINCT e.partner_account_id)::text AS active_partners_30d,
        COUNT(DISTINCT CASE WHEN w.workspace_status = 'active' THEN e.partner_account_id END)::text AS active_workspaces_30d
      FROM partner_activity_events e
      LEFT JOIN partner_workspaces w ON w.partner_account_id = e.partner_account_id
      WHERE e.created_at >= NOW() - (${days} * INTERVAL '1 day');
    `,
    sql<PartnerWorkspaceAnalyticsTimelinePoint>`
      WITH series AS (
        SELECT generate_series(
          date_trunc('day', NOW()) - (${days - 1} * INTERVAL '1 day'),
          date_trunc('day', NOW()),
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        series.day::text AS day,
        COALESCE((SELECT COUNT(*)::int FROM partner_activity_events e WHERE e.created_at::date = series.day), 0) AS activity_total,
        COALESCE((SELECT COUNT(*)::int FROM partner_activity_events e WHERE e.created_at::date = series.day AND e.event_type = 'asset_downloaded'), 0) AS asset_downloads,
        COALESCE((SELECT COUNT(*)::int FROM partner_activity_events e WHERE e.created_at::date = series.day AND e.event_type = 'referral_submitted'), 0) AS referral_submissions,
        COALESCE((SELECT COUNT(*)::int FROM partner_activity_events e WHERE e.created_at::date = series.day AND e.event_type = 'asset_pack_requested'), 0) AS asset_pack_requests,
        COALESCE((SELECT COUNT(*)::int FROM partner_activity_events e WHERE e.created_at::date = series.day AND e.event_type IN ('opportunity_created', 'opportunity_updated')), 0) AS opportunity_updates
      FROM series
      ORDER BY series.day ASC;
    `,
    sql<{
      partner_account_id: string
      partner_name: string
      company_name: string | null
      account_status: string
      workspace_status: string | null
      workspace_display_name: string | null
      partner_profile_type: PartnerProfileType | null
      collaboration_scope: string | null
      headline: string | null
      service_tags: unknown
      primary_regions: unknown
      languages: unknown
      website_url: string | null
      linkedin_url: string | null
      instagram_url: string | null
      profile_visibility: string | null
      assets_total: string
      assets_reviewed: string
      assets_current: string
      assets_retired: string
      assets_versioned: string
      total_downloads: string
      referrals_total: string
      referrals_open: string
      referrals_closed: string
      referrals_owned: string
      asset_packs_total: string
      asset_packs_open: string
      asset_packs_fulfilled: string
      asset_packs_delivered: string
      opportunities_total: string
      opportunities_active: string
      activity_total: string
      last_activity_at: string | null
    }>`
      WITH
        assets AS (
          SELECT
            partner_account_id,
            COUNT(*)::int AS assets_total,
            COUNT(*) FILTER (WHERE review_status = 'reviewed')::int AS assets_reviewed,
            COUNT(*) FILTER (WHERE is_current_version = TRUE AND lifecycle_status = 'active')::int AS assets_current,
            COUNT(*) FILTER (WHERE lifecycle_status = 'archived')::int AS assets_retired,
            COUNT(*) FILTER (WHERE version_number > 1)::int AS assets_versioned,
            COALESCE(SUM(download_count), 0)::int AS total_downloads
          FROM partner_assets
          GROUP BY partner_account_id
        ),
        referrals AS (
          SELECT
            partner_account_id,
            COUNT(*)::int AS referrals_total,
            COUNT(*) FILTER (WHERE status IN ('submitted', 'reviewing'))::int AS referrals_open,
            COUNT(*) FILTER (WHERE status IN ('qualified', 'introduced', 'closed', 'declined'))::int AS referrals_closed,
            COUNT(*) FILTER (WHERE owner_username IS NOT NULL AND btrim(owner_username) <> '')::int AS referrals_owned
          FROM partner_referrals
          GROUP BY partner_account_id
        ),
        asset_packs AS (
          SELECT
            partner_account_id,
            COUNT(*)::int AS asset_packs_total,
            COUNT(*) FILTER (WHERE status IN ('submitted', 'reviewing'))::int AS asset_packs_open,
            COUNT(*) FILTER (WHERE status = 'fulfilled')::int AS asset_packs_fulfilled,
            COUNT(*) FILTER (WHERE delivered_asset_id IS NOT NULL)::int AS asset_packs_delivered
          FROM partner_asset_pack_requests
          GROUP BY partner_account_id
        ),
        opportunities AS (
          SELECT
            partner_account_id,
            COUNT(*)::int AS opportunities_total,
            COUNT(*) FILTER (WHERE status IN ('active', 'watching'))::int AS opportunities_active
          FROM partner_opportunities
          GROUP BY partner_account_id
        ),
        activity AS (
          SELECT
            partner_account_id,
            COUNT(*)::int AS activity_total,
            MAX(created_at) AS last_activity_at
          FROM partner_activity_events
          GROUP BY partner_account_id
        )
      SELECT
        a.id AS partner_account_id,
        a.full_name AS partner_name,
        a.company_name,
        a.account_status,
        COALESCE(w.workspace_status, 'invited') AS workspace_status,
        w.display_name AS workspace_display_name,
        p.partner_profile_type,
        p.collaboration_scope,
        p.headline,
        p.service_tags,
        p.primary_regions,
        p.languages,
        p.website_url,
        p.linkedin_url,
        p.instagram_url,
        p.profile_visibility,
        COALESCE(assets.assets_total, 0)::text AS assets_total,
        COALESCE(assets.assets_reviewed, 0)::text AS assets_reviewed,
        COALESCE(assets.assets_current, 0)::text AS assets_current,
        COALESCE(assets.assets_retired, 0)::text AS assets_retired,
        COALESCE(assets.assets_versioned, 0)::text AS assets_versioned,
        COALESCE(assets.total_downloads, 0)::text AS total_downloads,
        COALESCE(referrals.referrals_total, 0)::text AS referrals_total,
        COALESCE(referrals.referrals_open, 0)::text AS referrals_open,
        COALESCE(referrals.referrals_closed, 0)::text AS referrals_closed,
        COALESCE(referrals.referrals_owned, 0)::text AS referrals_owned,
        COALESCE(asset_packs.asset_packs_total, 0)::text AS asset_packs_total,
        COALESCE(asset_packs.asset_packs_open, 0)::text AS asset_packs_open,
        COALESCE(asset_packs.asset_packs_fulfilled, 0)::text AS asset_packs_fulfilled,
        COALESCE(asset_packs.asset_packs_delivered, 0)::text AS asset_packs_delivered,
        COALESCE(opportunities.opportunities_total, 0)::text AS opportunities_total,
        COALESCE(opportunities.opportunities_active, 0)::text AS opportunities_active,
        COALESCE(activity.activity_total, 0)::text AS activity_total,
        activity.last_activity_at
      FROM partner_accounts a
      LEFT JOIN partner_workspaces w ON w.partner_account_id = a.id
      LEFT JOIN partner_profiles p ON p.partner_account_id = a.id
      LEFT JOIN assets ON assets.partner_account_id = a.id
      LEFT JOIN referrals ON referrals.partner_account_id = a.id
      LEFT JOIN asset_packs ON asset_packs.partner_account_id = a.id
      LEFT JOIN opportunities ON opportunities.partner_account_id = a.id
      LEFT JOIN activity ON activity.partner_account_id = a.id
      ORDER BY COALESCE(activity.activity_total, 0) DESC, COALESCE(assets.total_downloads, 0) DESC, COALESCE(activity.last_activity_at, a.updated_at) DESC
      LIMIT 8;
    `,
    sql<{
      id: string
      partner_account_id: string
      event_type: PartnerActivityEventRecord['event_type']
      title: string
      description: string | null
      created_at: string
      partner_name: string
      company_name: string | null
      workspace_display_name: string | null
    }>`
      SELECT
        e.id,
        e.partner_account_id,
        e.event_type,
        e.title,
        e.description,
        e.created_at,
        a.full_name AS partner_name,
        a.company_name,
        w.display_name AS workspace_display_name
      FROM partner_activity_events e
      INNER JOIN partner_accounts a ON a.id = e.partner_account_id
      LEFT JOIN partner_workspaces w ON w.partner_account_id = e.partner_account_id
      ORDER BY e.created_at DESC
      LIMIT ${recentLimit};
    `,
  ])

  const totalPartners = Number(partnerTotalsRows[0]?.total_partners || '0')
  const activePartners = Number(partnerTotalsRows[0]?.active_partners || '0')
  const activeWorkspaces = Number(workspaceTotalsRows[0]?.active_workspaces || '0')
  const profileCompleteness = profileCompletenessRows[0]?.avg_profile_completeness
    ? Number(Number(profileCompletenessRows[0]?.avg_profile_completeness).toFixed(3))
    : null

  const metrics = {
    partners_total: totalPartners,
    active_partners: activePartners,
    workspaces_active: activeWorkspaces,
    avg_profile_completeness: profileCompleteness,
    assets_total: Number(assetTotalsRows[0]?.total_assets || '0'),
    assets_reviewed: Number(assetTotalsRows[0]?.reviewed_assets || '0'),
    assets_current: Number(assetTotalsRows[0]?.current_assets || '0'),
    assets_retired: Number(assetTotalsRows[0]?.retired_assets || '0'),
    assets_versioned: Number(assetTotalsRows[0]?.versioned_assets || '0'),
    downloads_total: Number(assetTotalsRows[0]?.total_downloads || '0'),
    referrals_total: Number(referralTotalsRows[0]?.total_referrals || '0'),
    referrals_open: Number(referralTotalsRows[0]?.open_referrals || '0'),
    referrals_closed: Number(referralTotalsRows[0]?.closed_referrals || '0'),
    referrals_owned: Number(referralTotalsRows[0]?.owned_referrals || '0'),
    asset_packs_total: Number(assetPackTotalsRows[0]?.total_asset_packs || '0'),
    asset_packs_open: Number(assetPackTotalsRows[0]?.open_asset_packs || '0'),
    asset_packs_fulfilled: Number(assetPackTotalsRows[0]?.fulfilled_asset_packs || '0'),
    asset_packs_delivered: Number(assetPackTotalsRows[0]?.delivered_asset_packs || '0'),
    opportunities_total: Number(opportunityTotalsRows[0]?.total_opportunities || '0'),
    opportunities_active: Number(opportunityTotalsRows[0]?.active_opportunities || '0'),
    activity_total: Number(activityTotalsRows[0]?.total_activity || '0'),
    active_partners_30d: Number(engagementRows[0]?.active_partners_30d || '0'),
    active_workspaces_30d: Number(engagementRows[0]?.active_workspaces_30d || '0'),
  }

  const topPartners = topPartnerRows.map((row) => {
    const profileType =
      row.partner_profile_type ||
      inferProfileType({
        id: row.partner_account_id,
        admission_id: null,
        email: '',
        full_name: row.partner_name,
        company_name: row.company_name,
        account_status: (row.account_status as PartnerAccountRecord['account_status']) || 'invited',
        invite_code_hash: null,
        invite_code_expires_at: null,
        activated_at: null,
        last_login_at: null,
        created_at: row.last_activity_at || new Date().toISOString(),
        updated_at: row.last_activity_at || new Date().toISOString(),
      })

    const profile: PartnerProfileRecord = {
      id: `${row.partner_account_id}-analytics-profile`,
      partner_account_id: row.partner_account_id,
      partner_profile_type: profileType,
      collaboration_scope: row.collaboration_scope || 'curated-collaboration',
      headline: row.headline,
      service_tags: normalizeStringArray(row.service_tags),
      primary_regions: normalizeStringArray(row.primary_regions),
      languages: normalizeStringArray(row.languages),
      website_url: row.website_url,
      linkedin_url: row.linkedin_url,
      instagram_url: row.instagram_url,
      profile_visibility: (row.profile_visibility as PartnerProfileRecord['profile_visibility']) || 'workspace',
      created_at: row.last_activity_at || new Date().toISOString(),
      updated_at: row.last_activity_at || new Date().toISOString(),
    }

    const focusLabel = summarizeWorkspaceFocus(profileType, {
      assets_total: Number(row.assets_total),
      assets_reviewed: Number(row.assets_reviewed),
      assets_current: Number(row.assets_current || 0),
      assets_retired: Number(row.assets_retired || 0),
      assets_versioned: Number(row.assets_versioned || 0),
      total_downloads: Number(row.total_downloads),
      referrals_total: Number(row.referrals_total),
      referrals_open: Number(row.referrals_open),
      referrals_closed: Number(row.referrals_closed),
      referrals_owned: Number(row.referrals_owned || 0),
      asset_packs_total: Number(row.asset_packs_total),
      asset_packs_open: Number(row.asset_packs_open),
      asset_packs_fulfilled: Number(row.asset_packs_fulfilled),
      asset_packs_delivered: Number(row.asset_packs_delivered || 0),
      opportunities_total: Number(row.opportunities_total),
      opportunities_active: Number(row.opportunities_active),
      activity_total: Number(row.activity_total),
    })

    return {
      partner_account_id: row.partner_account_id,
      partner_name: row.partner_name,
      company_name: row.company_name,
      workspace_display_name: row.workspace_display_name,
      account_status: (row.account_status as PartnerAccountRecord['account_status']) || 'invited',
      workspace_status: (row.workspace_status as PartnerWorkspaceRecord['workspace_status']) || 'invited',
      profile_completeness: calculateProfileCompleteness(profile),
      assets_total: Number(row.assets_total),
      assets_reviewed: Number(row.assets_reviewed),
      assets_current: Number(row.assets_current),
      assets_retired: Number(row.assets_retired),
      assets_versioned: Number(row.assets_versioned),
      total_downloads: Number(row.total_downloads),
      referrals_total: Number(row.referrals_total),
      referrals_open: Number(row.referrals_open),
      referrals_closed: Number(row.referrals_closed),
      referrals_owned: Number(row.referrals_owned),
      asset_packs_total: Number(row.asset_packs_total),
      asset_packs_open: Number(row.asset_packs_open),
      asset_packs_fulfilled: Number(row.asset_packs_fulfilled),
      asset_packs_delivered: Number(row.asset_packs_delivered),
      opportunities_total: Number(row.opportunities_total),
      opportunities_active: Number(row.opportunities_active),
      activity_total: Number(row.activity_total),
      last_activity_at: row.last_activity_at,
      focus_label: focusLabel,
    } satisfies PartnerWorkspaceAnalyticsTopPartnerRecord
  })

  const recentActivity = recentActivityRows.map((event) => ({
    id: event.id,
    partner_account_id: event.partner_account_id,
    event_type: event.event_type,
    title: event.title,
    description: event.description,
    created_at: event.created_at,
    partner_name: event.partner_name,
    company_name: event.company_name,
    workspace_display_name: event.workspace_display_name,
  }))

  return {
    generated_at: new Date().toISOString(),
    metrics,
    timeline: timelineRows.map((item) => ({
      day: item.day,
      activity_total: Number(item.activity_total),
      asset_downloads: Number(item.asset_downloads),
      referral_submissions: Number(item.referral_submissions),
      asset_pack_requests: Number(item.asset_pack_requests),
      opportunity_updates: Number(item.opportunity_updates),
    })),
    topPartners,
    recentActivity,
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
      asset_group_key TEXT NOT NULL DEFAULT '',
      version_number INTEGER NOT NULL DEFAULT 1,
      is_current_version BOOLEAN NOT NULL DEFAULT TRUE,
      asset_kind TEXT NOT NULL DEFAULT 'document',
      access_level TEXT NOT NULL DEFAULT 'private',
      lifecycle_status TEXT NOT NULL DEFAULT 'active',
      version_label TEXT,
      source_type TEXT NOT NULL DEFAULT 'manual',
      superseded_by_asset_id UUID REFERENCES partner_assets(id) ON DELETE SET NULL,
      retired_at TIMESTAMPTZ,
      retirement_reason TEXT,
      published_by TEXT,
      asset_url TEXT,
      asset_body TEXT,
      content_format TEXT NOT NULL DEFAULT 'markdown',
      download_count INTEGER NOT NULL DEFAULT 0,
      review_status TEXT NOT NULL DEFAULT 'new',
      reviewed_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_assets_partner_group_version
      ON partner_assets (partner_account_id, asset_group_key, version_number DESC);
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS asset_group_key TEXT NOT NULL DEFAULT '';
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN NOT NULL DEFAULT TRUE;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'active';
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS version_label TEXT;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'manual';
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS superseded_by_asset_id UUID REFERENCES partner_assets(id) ON DELETE SET NULL;
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
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS retired_at TIMESTAMPTZ;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS retirement_reason TEXT;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS published_by TEXT;
  `

  await sql`
    ALTER TABLE partner_assets
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
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
      estimated_value_label TEXT,
      referral_notes TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      owner_username TEXT,
      commercial_stage TEXT NOT NULL DEFAULT 'intake',
      next_action TEXT,
      last_contact_at TIMESTAMPTZ,
      internal_notes TEXT,
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS estimated_value_label TEXT;
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS owner_username TEXT;
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS commercial_stage TEXT NOT NULL DEFAULT 'intake';
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS next_action TEXT;
  `

  await sql`
    ALTER TABLE partner_referrals
      ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
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
      delivery_method TEXT,
      delivery_reference TEXT,
      delivery_notes TEXT,
      fulfillment_owner TEXT,
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
      ADD COLUMN IF NOT EXISTS delivery_method TEXT;
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS delivery_reference TEXT;
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
  `

  await sql`
    ALTER TABLE partner_asset_pack_requests
      ADD COLUMN IF NOT EXISTS fulfillment_owner TEXT;
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

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_accounts_status
      ON partner_accounts (account_status);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_workspaces_status
      ON partner_workspaces (workspace_status);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_assets_account_published_at
      ON partner_assets (partner_account_id, published_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_assets_review_status
      ON partner_assets (review_status);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_opportunities_account_created_at
      ON partner_opportunities (partner_account_id, created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_opportunities_status
      ON partner_opportunities (status);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_referrals_account_created_at
      ON partner_referrals (partner_account_id, created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_referrals_status
      ON partner_referrals (status);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_asset_pack_requests_account_created_at
      ON partner_asset_pack_requests (partner_account_id, created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_asset_pack_requests_status
      ON partner_asset_pack_requests (status);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_activity_events_created_at
      ON partner_activity_events (created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_activity_events_account_created_at
      ON partner_activity_events (partner_account_id, created_at DESC);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_partner_activity_events_event_type_created_at
      ON partner_activity_events (event_type, created_at DESC);
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
        asset_group_key,
        version_number,
        is_current_version,
        asset_kind,
        access_level,
        lifecycle_status,
        version_label,
        source_type,
        published_by,
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
          ${slugifyAssetGroupKey('Synergi onboarding brief')},
          1,
          TRUE,
          'brief',
          'private',
          'active',
          'v1',
          'seeded',
          ${'system'},
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
          ${slugifyAssetGroupKey('Partner operating playbook')},
          1,
          TRUE,
          'playbook',
          'shared',
          'active',
          'v1',
          'seeded',
          ${'system'},
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
      asset_group_key,
      version_number,
      is_current_version,
      asset_kind,
      access_level,
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
      retired_at,
      retirement_reason,
      published_by,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at,
      updated_at
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

  const bundle = {
    profile,
    assets: assetsRows,
    referrals: referralsRows,
    assetPackRequests: assetPackRequestRows,
    opportunities: opportunitiesRows,
    activity: activityRows,
    moduleOrder: getDefaultModuleOrder(profile.partner_profile_type),
  }

  return {
    ...bundle,
    reporting: buildPartnerWorkspaceReporting(account, workspace, bundle),
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
      asset_group_key,
      version_number,
      is_current_version,
      asset_kind,
      access_level,
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
      retired_at,
      retirement_reason,
      published_by,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at,
      updated_at;
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
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
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
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
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
      estimated_value_label,
      referral_notes,
      status,
      owner_username,
      commercial_stage,
      next_action,
      last_contact_at,
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
    estimatedValueLabel?: string | null
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
      estimated_value_label,
      referral_notes,
      status,
      owner_username,
      commercial_stage,
      next_action,
      last_contact_at,
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
      ${input.estimatedValueLabel?.trim() || null},
      ${input.referralNotes?.trim() || null},
      'submitted',
      NULL,
      'intake',
      NULL,
      NULL,
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
      estimated_value_label,
      referral_notes,
      status,
      owner_username,
      commercial_stage,
      next_action,
      last_contact_at,
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
      r.estimated_value_label,
      r.referral_notes,
      r.status,
      r.owner_username,
      r.commercial_stage,
      r.next_action,
      r.last_contact_at,
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
  ownerUsername?: string | null
  commercialStage?: PartnerReferralRecord['commercial_stage']
  nextAction?: string | null
  estimatedValueLabel?: string | null
  lastContactAt?: string | null
  reviewedBy: string
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const updatedRows = await sql<PartnerReferralRecord>`
    UPDATE partner_referrals
    SET
      status = ${input.status},
      owner_username = ${input.ownerUsername?.trim() || null},
      commercial_stage = ${input.commercialStage || 'intake'},
      next_action = ${input.nextAction?.trim() || null},
      estimated_value_label = ${input.estimatedValueLabel?.trim() || null},
      last_contact_at = CASE
        WHEN ${input.lastContactAt?.trim() || null}::text IS NOT NULL THEN ${input.lastContactAt || null}::timestamptz
        WHEN ${input.status} IN ('introduced', 'negotiating', 'won', 'closed', 'declined') THEN NOW()
        ELSE last_contact_at
      END,
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
      estimated_value_label,
      referral_notes,
      status,
      owner_username,
      commercial_stage,
      next_action,
      last_contact_at,
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
      r.delivery_method,
      r.delivery_reference,
      r.delivery_notes,
      r.fulfillment_owner,
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
  deliveryMethod?: string | null
  deliveryReference?: string | null
  deliveryNotes?: string | null
  fulfillmentOwner?: string | null
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
      delivery_method,
      delivery_reference,
      delivery_notes,
      fulfillment_owner,
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
        lifecycle_status,
        version_label,
        source_type,
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
        'active',
        'v1',
        'asset-pack-request',
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
      delivery_method = ${input.status === 'fulfilled' ? input.deliveryMethod?.trim() || 'workspace-asset' : null},
      delivery_reference = ${input.status === 'fulfilled' ? input.deliveryReference?.trim() || deliveredAssetId : null},
      delivery_notes = ${input.status === 'fulfilled' ? input.deliveryNotes?.trim() || null : null},
      fulfillment_owner = ${input.status === 'fulfilled' ? input.fulfillmentOwner?.trim() || input.reviewedBy : null},
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
      delivery_method,
      delivery_reference,
      delivery_notes,
      fulfillment_owner,
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
  assetGroupKey?: string | null
  versionNumber?: number
  isCurrentVersion?: boolean
  assetKind?: PartnerAssetRecord['asset_kind']
  accessLevel?: PartnerAssetRecord['access_level']
  lifecycleStatus?: PartnerAssetRecord['lifecycle_status']
  versionLabel?: string | null
  sourceType?: PartnerAssetRecord['source_type']
  supersededByAssetId?: string | null
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
      asset_group_key,
      version_number,
      is_current_version,
      asset_kind,
      access_level,
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
      published_by,
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
      ${input.assetGroupKey?.trim() || slugifyAssetGroupKey(input.title)},
      ${Number.isFinite(input.versionNumber as number) ? input.versionNumber : 1},
      ${typeof input.isCurrentVersion === 'boolean' ? input.isCurrentVersion : true},
      ${input.assetKind || 'document'},
      ${input.accessLevel || 'shared'},
      ${input.lifecycleStatus || 'active'},
      ${input.versionLabel?.trim() || 'v1'},
      ${input.sourceType || 'manual'},
      ${input.supersededByAssetId?.trim() || null},
      ${input.publishedBy},
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
      asset_group_key,
      version_number,
      is_current_version,
      asset_kind,
      access_level,
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
      retired_at,
      retirement_reason,
      published_by,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at,
      updated_at;
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

export async function publishAdminPartnerAssetVersion(input: {
  parentAssetId: string
  title?: string | null
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

  const currentRows = await sql<PartnerAssetRecord>`
    SELECT
      id,
      partner_account_id,
      title,
      description,
      asset_group_key,
      version_number,
      is_current_version,
      asset_kind,
      access_level,
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
      retired_at,
      retirement_reason,
      published_by,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at,
      updated_at
    FROM partner_assets
    WHERE id = ${input.parentAssetId}
    LIMIT 1;
  `

  const current = currentRows[0]
  if (!current) return null

  const nextVersionNumber = current.version_number + 1
  const versionLabel = `v${nextVersionNumber}`

  const newAsset = await createAdminPartnerAsset({
    partnerAccountId: current.partner_account_id,
    title: input.title?.trim() || current.title,
    description: input.description?.trim() ?? current.description,
    assetGroupKey: current.asset_group_key || slugifyAssetGroupKey(current.title),
    versionNumber: nextVersionNumber,
    isCurrentVersion: true,
    assetKind: input.assetKind || current.asset_kind,
    accessLevel: input.accessLevel || current.access_level,
    lifecycleStatus: 'active',
    versionLabel,
    sourceType: 'manual',
    assetUrl: input.assetUrl?.trim() ?? current.asset_url,
    assetBody: input.assetBody?.trim() ?? current.asset_body,
    contentFormat: input.contentFormat || current.content_format,
    publishedBy: input.publishedBy,
  })

  if (!newAsset) return null

  await sql`
    UPDATE partner_assets
    SET
      is_current_version = FALSE,
      lifecycle_status = 'superseded',
      superseded_by_asset_id = ${newAsset.id},
      updated_at = NOW()
    WHERE id = ${current.id};
  `

  await sql`
    INSERT INTO partner_activity_events (
      partner_account_id,
      event_type,
      title,
      description
    )
    VALUES (
      ${current.partner_account_id},
      'asset_version_published',
      ${'Asset version published'},
      ${`Synergi ha publicado la versión ${versionLabel} del asset ${newAsset.title}.`}
    );
  `

  return newAsset
}

export async function listAdminPartnerAssets(input?: {
  partnerAccountId?: string
  lifecycleStatus?: PartnerAssetRecord['lifecycle_status']
  status?: 'all' | 'current' | 'retired' | 'superseded'
  limit?: number
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const limit = Math.max(1, Math.min(input?.limit || 50, 100))
  const status = input?.status || 'all'

  return sql<AdminPublishedPartnerAssetRecord>`
    SELECT
      p.id,
      p.partner_account_id,
      p.title,
      p.description,
      p.asset_group_key,
      p.version_number,
      p.is_current_version,
      p.asset_kind,
      p.access_level,
      p.lifecycle_status,
      p.version_label,
      p.source_type,
      p.superseded_by_asset_id,
      p.retired_at,
      p.retirement_reason,
      p.published_by,
      p.asset_url,
      p.asset_body,
      p.content_format,
      p.download_count,
      p.review_status,
      p.reviewed_at,
      p.published_at,
      p.updated_at,
      a.email AS partner_email,
      a.full_name AS partner_full_name,
      a.company_name AS partner_company_name,
      w.display_name AS workspace_display_name
    FROM partner_assets p
    INNER JOIN partner_accounts a ON a.id = p.partner_account_id
    LEFT JOIN partner_workspaces w ON w.partner_account_id = p.partner_account_id
    WHERE (${input?.partnerAccountId || null}::uuid IS NULL OR p.partner_account_id = ${input?.partnerAccountId || null})
      AND (${input?.lifecycleStatus || null}::text IS NULL OR p.lifecycle_status = ${input?.lifecycleStatus || null})
      AND (
        ${status} = 'all'
        OR (${status} = 'current' AND p.is_current_version = TRUE)
        OR (${status} = 'retired' AND p.lifecycle_status = 'archived')
        OR (${status} = 'superseded' AND p.lifecycle_status = 'superseded')
      )
    ORDER BY p.published_at DESC
    LIMIT ${limit};
  `
}

export async function updateAdminPartnerAsset(input: {
  id: string
  title?: string
  description?: string | null
  assetGroupKey?: string | null
  versionNumber?: number
  isCurrentVersion?: boolean
  lifecycleStatus?: PartnerAssetRecord['lifecycle_status']
  versionLabel?: string | null
  accessLevel?: PartnerAssetRecord['access_level']
  assetUrl?: string | null
  assetBody?: string | null
  supersededByAssetId?: string | null
  retirementReason?: string | null
  reviewedBy: string
}) {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const rows = await sql<PartnerAssetRecord>`
    UPDATE partner_assets
    SET
      title = COALESCE(${input.title?.trim() || null}, title),
      description = COALESCE(${input.description?.trim() || null}, description),
      asset_group_key = COALESCE(${input.assetGroupKey?.trim() || null}, asset_group_key),
      version_number = COALESCE(${Number.isFinite(input.versionNumber as number) ? input.versionNumber : null}, version_number),
      is_current_version = COALESCE(${typeof input.isCurrentVersion === 'boolean' ? input.isCurrentVersion : null}, is_current_version),
      lifecycle_status = COALESCE(${input.lifecycleStatus || null}, lifecycle_status),
      version_label = COALESCE(${input.versionLabel?.trim() || null}, version_label),
      access_level = COALESCE(${input.accessLevel || null}, access_level),
      asset_url = COALESCE(${input.assetUrl?.trim() || null}, asset_url),
      asset_body = COALESCE(${input.assetBody?.trim() || null}, asset_body),
      superseded_by_asset_id = COALESCE(${input.supersededByAssetId?.trim() || null}, superseded_by_asset_id),
      retired_at = CASE
        WHEN ${input.lifecycleStatus || null} = 'archived' THEN COALESCE(retired_at, NOW())
        WHEN ${input.lifecycleStatus || null} = 'active' THEN NULL
        ELSE retired_at
      END,
      retirement_reason = CASE
        WHEN ${input.lifecycleStatus || null} = 'archived' THEN COALESCE(${input.retirementReason?.trim() || null}, retirement_reason)
        WHEN ${input.lifecycleStatus || null} = 'active' THEN NULL
        ELSE retirement_reason
      END,
      reviewed_at = NOW(),
      review_status = 'reviewed',
      updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING
      id,
      partner_account_id,
      title,
      description,
      asset_group_key,
      version_number,
      is_current_version,
      asset_kind,
      access_level,
      lifecycle_status,
      version_label,
      source_type,
      superseded_by_asset_id,
      retired_at,
      retirement_reason,
      published_by,
      asset_url,
      asset_body,
      content_format,
      download_count,
      review_status,
      reviewed_at,
      published_at,
      updated_at;
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
      ${asset.partner_account_id},
      ${asset.lifecycle_status === 'active' ? 'asset_published' : 'asset_reviewed'},
      ${asset.lifecycle_status === 'active' ? 'Asset published' : 'Asset lifecycle updated'},
      ${
        asset.lifecycle_status === 'active'
          ? `Synergi ha publicado el asset ${asset.title}.`
          : `Synergi ha actualizado el asset ${asset.title} con estado ${asset.lifecycle_status}.`
      }
    );
  `

  const hydratedRows = await listAdminPartnerAssets({ partnerAccountId: asset.partner_account_id, limit: 100 })
  return hydratedRows.find((item) => item.id === input.id) || null
}

export async function getSynergiWorkspaceAnalytics() {
  globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady ??= ensurePartnerWorkspaceSchema()
  await globalThis.__ancloraSynergiPartnerWorkspaceSchemaReady

  const summaryRows = await sql<{
    private_assets: string
    shared_assets: string
    archived_assets: string
    total_downloads: string
    referrals_total: string
    referrals_open: string
    referrals_won: string
    asset_packs_total: string
    asset_packs_open: string
    opportunities_active: string
    active_workspaces: string
  }>`
    SELECT
      (SELECT COUNT(*)::text FROM partner_assets WHERE access_level = 'private') AS private_assets,
      (SELECT COUNT(*)::text FROM partner_assets WHERE access_level = 'shared') AS shared_assets,
      (SELECT COUNT(*)::text FROM partner_assets WHERE lifecycle_status = 'archived') AS archived_assets,
      (SELECT COALESCE(SUM(download_count), 0)::text FROM partner_assets) AS total_downloads,
      (SELECT COUNT(*)::text FROM partner_referrals) AS referrals_total,
      (SELECT COUNT(*)::text FROM partner_referrals WHERE status IN ('submitted', 'reviewing', 'qualified', 'introduced', 'negotiating')) AS referrals_open,
      (SELECT COUNT(*)::text FROM partner_referrals WHERE status = 'won') AS referrals_won,
      (SELECT COUNT(*)::text FROM partner_asset_pack_requests) AS asset_packs_total,
      (SELECT COUNT(*)::text FROM partner_asset_pack_requests WHERE status IN ('submitted', 'reviewing')) AS asset_packs_open,
      (SELECT COUNT(*)::text FROM partner_opportunities WHERE status IN ('active', 'watching')) AS opportunities_active,
      (SELECT COUNT(*)::text FROM partner_workspaces WHERE workspace_status = 'active') AS active_workspaces;
  `

  const topPartners = await sql<SynergiWorkspaceFunnelAnalyticsRecord['topPartners'][number] & {
    referrals_total: string
    downloads_total: string
    opportunities_active: string
  }>`
    SELECT
      a.id AS partner_account_id,
      a.full_name AS partner_name,
      a.company_name AS company_name,
      w.display_name AS workspace_name,
      COALESCE(ref.referrals_total, 0)::text AS referrals_total,
      COALESCE(assets.downloads_total, 0)::text AS downloads_total,
      COALESCE(opp.opportunities_active, 0)::text AS opportunities_active
    FROM partner_accounts a
    LEFT JOIN partner_workspaces w ON w.partner_account_id = a.id
    LEFT JOIN (
      SELECT partner_account_id, COUNT(*) AS referrals_total
      FROM partner_referrals
      GROUP BY partner_account_id
    ) ref ON ref.partner_account_id = a.id
    LEFT JOIN (
      SELECT partner_account_id, COALESCE(SUM(download_count), 0) AS downloads_total
      FROM partner_assets
      GROUP BY partner_account_id
    ) assets ON assets.partner_account_id = a.id
    LEFT JOIN (
      SELECT partner_account_id, COUNT(*) AS opportunities_active
      FROM partner_opportunities
      WHERE status IN ('active', 'watching')
      GROUP BY partner_account_id
    ) opp ON opp.partner_account_id = a.id
    ORDER BY COALESCE(ref.referrals_total, 0) DESC, COALESCE(assets.downloads_total, 0) DESC, a.created_at DESC
    LIMIT 8;
  `

  const summary = summaryRows[0]
  return {
    admissions: {
      total: 0,
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
    },
    activation: {
      invited_accounts: 0,
      active_accounts: 0,
      activated_accounts: 0,
      activation_rate: 0,
    },
    workspace: {
      active_workspaces: Number(summary?.active_workspaces || '0'),
      private_assets: Number(summary?.private_assets || '0'),
      shared_assets: Number(summary?.shared_assets || '0'),
      archived_assets: Number(summary?.archived_assets || '0'),
      total_downloads: Number(summary?.total_downloads || '0'),
    },
    commercial: {
      referrals_total: Number(summary?.referrals_total || '0'),
      referrals_open: Number(summary?.referrals_open || '0'),
      referrals_won: Number(summary?.referrals_won || '0'),
      asset_packs_total: Number(summary?.asset_packs_total || '0'),
      asset_packs_open: Number(summary?.asset_packs_open || '0'),
      opportunities_active: Number(summary?.opportunities_active || '0'),
    },
    topPartners: topPartners.map((row) => ({
      partner_account_id: row.partner_account_id,
      partner_name: row.partner_name,
      company_name: row.company_name,
      workspace_name: row.workspace_name,
      referrals_total: Number(row.referrals_total),
      downloads_total: Number(row.downloads_total),
      opportunities_active: Number(row.opportunities_active),
    })),
  } satisfies SynergiWorkspaceFunnelAnalyticsRecord
}
