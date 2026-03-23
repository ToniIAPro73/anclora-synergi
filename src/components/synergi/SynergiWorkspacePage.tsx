'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BarChart3, BellRing, BriefcaseBusiness, FileStack, LayoutGrid, RadioTower, Sparkles, UserRound } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type {
  PartnerActivityEventRecord,
  PartnerAssetPackRequestRecord,
  PartnerAssetRecord,
  PartnerModuleKey,
  PartnerOpportunityRecord,
  PartnerProfileRecord,
  PartnerReferralRecord,
  PartnerWorkspaceReportingRecord,
} from '@/lib/partner-workspace-store'

type WorkspaceProps = {
  partnerName: string
  companyName: string | null
  workspaceName: string
  welcomeNote: string | null
  accountStatus: string
  profile: PartnerProfileRecord
  moduleOrder: PartnerModuleKey[]
  reporting: PartnerWorkspaceReportingRecord
  assets: PartnerAssetRecord[]
  referrals: PartnerReferralRecord[]
  assetPackRequests: PartnerAssetPackRequestRecord[]
  opportunities: PartnerOpportunityRecord[]
  activity: PartnerActivityEventRecord[]
}

const MODULE_ICONS: Record<PartnerModuleKey, typeof LayoutGrid> = {
  overview: LayoutGrid,
  reporting: BarChart3,
  'partner-profile': UserRound,
  'assets-documents': FileStack,
  referrals: Sparkles,
  opportunities: BriefcaseBusiness,
  activity: RadioTower,
}

function formatList(items: string[]) {
  return items.length ? items.join(', ') : '—'
}

function toCommaInput(items: string[]) {
  return items.join(', ')
}

function normalizeLabel(value: string) {
  return value.replace(/[-_]/g, ' ')
}

function formatOpportunityDate(value: string, language: 'es' | 'en' | 'de') {
  return new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string, language: 'es' | 'en' | 'de') {
  return new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function inferAssetFilename(assetUrl: string | null, title: string) {
  if (assetUrl) {
    const segments = assetUrl.split('?')[0].split('/').filter(Boolean)
    const filename = segments.at(-1)
    if (filename) return filename
  }

  return `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'partner-asset'}.txt`
}

function getAttachmentFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1])
  }

  const basicMatch = contentDisposition.match(/filename="([^"]+)"/i) || contentDisposition.match(/filename=([^;]+)/i)
  return basicMatch?.[1]?.trim() || fallback
}

function getNotificationTitleKey(kind: PartnerWorkspaceReportingRecord['notifications'][number]['kind']) {
  switch (kind) {
    case 'profile-incomplete':
      return 'workspaceNotificationProfileIncompleteTitle'
    case 'referrals-open':
      return 'workspaceNotificationReferralsOpenTitle'
    case 'asset-packs-open':
      return 'workspaceNotificationAssetPacksOpenTitle'
    case 'opportunities-active':
      return 'workspaceNotificationOpportunitiesActiveTitle'
    case 'asset-health':
      return 'workspaceNotificationAssetHealthTitle'
    case 'activity-recent':
      return 'workspaceNotificationActivityRecentTitle'
    default:
      return 'workspaceNotificationWorkspaceReadyTitle'
  }
}

function getNotificationCopyKey(kind: PartnerWorkspaceReportingRecord['notifications'][number]['kind']) {
  switch (kind) {
    case 'profile-incomplete':
      return 'workspaceNotificationProfileIncompleteCopy'
    case 'referrals-open':
      return 'workspaceNotificationReferralsOpenCopy'
    case 'asset-packs-open':
      return 'workspaceNotificationAssetPacksOpenCopy'
    case 'opportunities-active':
      return 'workspaceNotificationOpportunitiesActiveCopy'
    case 'asset-health':
      return 'workspaceNotificationAssetHealthCopy'
    case 'activity-recent':
      return 'workspaceNotificationActivityRecentCopy'
    default:
      return 'workspaceNotificationWorkspaceReadyCopy'
  }
}

function getFocusLabelKey(focusLabel: string) {
  switch (focusLabel) {
    case 'Follow up open referrals':
      return 'workspaceFocus_followUpOpenReferrals'
    case 'Prepare or resolve asset packs':
      return 'workspaceFocus_prepareResolveAssetPacks'
    case 'Review active opportunities':
      return 'workspaceFocus_reviewActiveOpportunities'
    case 'Keep referrals and introductions flowing':
      return 'workspaceFocus_keepReferralsFlowing'
    case 'Refresh reports and market materials':
      return 'workspaceFocus_refreshReports'
    case 'Align assets and delivery milestones':
      return 'workspaceFocus_alignAssets'
    default:
      return 'workspaceFocus_maintainWorkspace'
  }
}

export function SynergiWorkspacePage(props: WorkspaceProps) {
  const { language, setLanguage, t } = useI18n()
  const [activeModule, setActiveModule] = useState<PartnerModuleKey>(props.moduleOrder[0] || 'overview')
  const [assets, setAssets] = useState(props.assets)
  const [referrals, setReferrals] = useState(props.referrals)
  const [assetPackRequests, setAssetPackRequests] = useState(props.assetPackRequests)
  const [opportunities, setOpportunities] = useState(props.opportunities)
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(props.opportunities[0]?.id || null)
  const [opportunityNotes, setOpportunityNotes] = useState<Record<string, string>>(
    Object.fromEntries(props.opportunities.map((opportunity) => [opportunity.id, opportunity.partner_response_notes || '']))
  )
  const [savingProfile, setSavingProfile] = useState(false)
  const [assetBusyId, setAssetBusyId] = useState<string | null>(null)
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null)
  const [opportunityBusyId, setOpportunityBusyId] = useState<string | null>(null)
  const [submittingReferral, setSubmittingReferral] = useState(false)
  const [submittingAssetPack, setSubmittingAssetPack] = useState(false)
  const [profileNotice, setProfileNotice] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [moduleNotice, setModuleNotice] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState({
    headline: props.profile.headline || '',
    serviceTags: toCommaInput(props.profile.service_tags),
    primaryRegions: toCommaInput(props.profile.primary_regions),
    languages: toCommaInput(props.profile.languages),
    websiteUrl: props.profile.website_url || '',
    linkedinUrl: props.profile.linkedin_url || '',
    instagramUrl: props.profile.instagram_url || '',
  })
  const [referralForm, setReferralForm] = useState({
    referralName: '',
    referralCompany: '',
    referralEmail: '',
    referralPhone: '',
    referralKind: 'buyer' as PartnerReferralRecord['referral_kind'],
    regionLabel: '',
    budgetLabel: '',
    estimatedValueLabel: '',
    referralNotes: '',
  })
  const [assetPackForm, setAssetPackForm] = useState({
    title: '',
    packType: 'custom' as PartnerAssetPackRequestRecord['pack_type'],
    requestedAssets: '',
    targetRegion: '',
    neededByLabel: '',
    requestNotes: '',
    deliveryMethod: 'workspace-asset',
    deliveryReference: '',
    deliveryOwner: '',
  })
  async function handleLogout() {
    await fetch('/api/partner/session', { method: 'DELETE' })
    window.location.assign('/login')
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileNotice(null)
    setProfileError(null)

    try {
      const response = await fetch('/api/partner/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      const body = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        throw new Error(body?.error || t('workspaceProfileError'))
      }

      setProfileNotice(t('workspaceProfileSaved'))
    } catch (submitError) {
      setProfileError(submitError instanceof Error ? submitError.message : t('workspaceProfileError'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleAssetReview(assetId: string) {
    setAssetBusyId(assetId)
    setModuleNotice(null)
    setModuleError(null)

    try {
      const response = await fetch(`/api/partner/assets/${assetId}/review`, {
        method: 'POST',
      })
      const body = (await response.json().catch(() => null)) as { error?: string; asset?: PartnerAssetRecord } | null
      if (!response.ok || !body?.asset) {
        throw new Error(body?.error || t('workspaceAssetReviewError'))
      }

      setAssets((current) => current.map((asset) => (asset.id === assetId ? body.asset! : asset)))
      setModuleNotice(t('workspaceAssetReviewSuccess'))
    } catch (submitError) {
      setModuleError(submitError instanceof Error ? submitError.message : t('workspaceAssetReviewError'))
    } finally {
      setAssetBusyId(null)
    }
  }

  async function handleAssetDownload(asset: PartnerAssetRecord) {
    setDownloadingAssetId(asset.id)
    setModuleNotice(null)
    setModuleError(null)

    try {
      const response = await fetch(`/api/partner/assets/${asset.id}/download`, {
        method: 'GET',
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || t('workspaceAssetDownloadError'))
      }

      const blob = await response.blob()
      const fallbackFilename = inferAssetFilename(asset.asset_url, asset.title)
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = getAttachmentFilename(response.headers.get('content-disposition'), fallbackFilename)
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)

      setAssets((current) =>
        current.map((currentAsset) =>
          currentAsset.id === asset.id
            ? { ...currentAsset, download_count: currentAsset.download_count + 1 }
            : currentAsset
        )
      )
      setModuleNotice(t('workspaceAssetDownloadSuccess'))
    } catch (downloadError) {
      setModuleError(downloadError instanceof Error ? downloadError.message : t('workspaceAssetDownloadError'))
    } finally {
      setDownloadingAssetId(null)
    }
  }

  async function handleReferralSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingReferral(true)
    setModuleNotice(null)
    setModuleError(null)

    try {
      const response = await fetch('/api/partner/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralForm),
      })
      const body = (await response.json().catch(() => null)) as { error?: string; referral?: PartnerReferralRecord } | null

      if (!response.ok || !body?.referral) {
        throw new Error(body?.error || t('workspaceReferralSubmitError'))
      }

      setReferrals((current) => [body.referral!, ...current])
      setReferralForm({
        referralName: '',
        referralCompany: '',
        referralEmail: '',
        referralPhone: '',
        referralKind: 'buyer',
        regionLabel: '',
        budgetLabel: '',
        estimatedValueLabel: '',
        referralNotes: '',
      })
      setModuleNotice(t('workspaceReferralSubmitSuccess'))
    } catch (submitError) {
      setModuleError(submitError instanceof Error ? submitError.message : t('workspaceReferralSubmitError'))
    } finally {
      setSubmittingReferral(false)
    }
  }

  async function handleAssetPackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingAssetPack(true)
    setModuleNotice(null)
    setModuleError(null)

    try {
      const response = await fetch('/api/partner/asset-pack-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...assetPackForm,
          requestedAssets: assetPackForm.requestedAssets
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      })
      const body = (await response.json().catch(() => null)) as {
        error?: string
        request?: PartnerAssetPackRequestRecord
      } | null

      if (!response.ok || !body?.request) {
        throw new Error(body?.error || t('workspaceAssetPackRequestError'))
      }

      setAssetPackRequests((current) => [body.request!, ...current])
      setAssetPackForm({
        title: '',
        packType: 'custom',
        requestedAssets: '',
        targetRegion: '',
        neededByLabel: '',
        requestNotes: '',
        deliveryMethod: 'workspace-asset',
        deliveryReference: '',
        deliveryOwner: '',
      })
      setModuleNotice(t('workspaceAssetPackSubmitSuccess'))
    } catch (submitError) {
      setModuleError(submitError instanceof Error ? submitError.message : t('workspaceAssetPackRequestError'))
    } finally {
      setSubmittingAssetPack(false)
    }
  }

  async function handleOpportunityResponse(
    opportunityId: string,
    partnerResponse: 'watching' | 'interested' | 'passed'
  ) {
    setOpportunityBusyId(opportunityId)
    setModuleNotice(null)
    setModuleError(null)

    try {
      const response = await fetch(`/api/partner/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerResponse,
          partnerResponseNotes: opportunityNotes[opportunityId] || '',
        }),
      })
      const body = (await response.json().catch(() => null)) as { error?: string; opportunity?: PartnerOpportunityRecord } | null
      if (!response.ok || !body?.opportunity) {
        throw new Error(body?.error || t('workspaceOpportunityError'))
      }

      const updatedOpportunity = body.opportunity

      setOpportunities((current) =>
        current.map((opportunity) => (opportunity.id === opportunityId ? updatedOpportunity : opportunity))
      )
      setOpportunityNotes((current) => ({
        ...current,
        [opportunityId]: updatedOpportunity.partner_response_notes || '',
      }))
      setModuleNotice(t('workspaceOpportunitySuccess'))
    } catch (submitError) {
      setModuleError(submitError instanceof Error ? submitError.message : t('workspaceOpportunityError'))
    } finally {
      setOpportunityBusyId(null)
    }
  }

  async function handleOpportunityNotesSave(opportunity: PartnerOpportunityRecord) {
    if (opportunity.partner_response === 'new') {
      setModuleNotice(null)
      setModuleError(t('workspaceOpportunitySelectResponseFirst'))
      return
    }

    await handleOpportunityResponse(
      opportunity.id,
      opportunity.partner_response as 'watching' | 'interested' | 'passed'
    )
  }

  function renderOverview() {
    return (
      <div className="synergi-workspace-dashboard">
        <section className="synergi-workspace-dashboard-main">
          <article className="synergi-review-content-card synergi-workspace-dashboard-hero">
            <div className="synergi-workspace-dashboard-hero-head">
              <div>
                <span>{t('workspaceOverviewTitle')}</span>
                <p>{props.welcomeNote || t('workspaceSubtitle')}</p>
              </div>
              <strong className="synergi-workspace-hero-pill">{t(getFocusLabelKey(props.reporting.focus_label))}</strong>
            </div>

            <div className="synergi-workspace-kpi-grid">
              <article className="synergi-workspace-kpi-card">
                <span>{t('workspaceReportingProfileScore')}</span>
                <strong>{props.reporting.profile_completeness}%</strong>
                <small>{t('workspaceReportingProfileScoreHelp')}</small>
              </article>
              <article className="synergi-workspace-kpi-card">
                <span>{t('workspaceReportingAccount')}</span>
                <strong>{t(`workspaceStatus_${props.accountStatus}`)}</strong>
                <small>{t(`workspaceProfileType_${props.profile.partner_profile_type}`)}</small>
              </article>
              <article className="synergi-workspace-kpi-card">
                <span>{t('workspaceReportingActivity')}</span>
                <strong>{props.reporting.metrics.activity_total}</strong>
                <small>{props.reporting.last_activity_at ? formatDateTime(props.reporting.last_activity_at, language) : t('reviewValueMissing')}</small>
              </article>
              <article className="synergi-workspace-kpi-card">
                <span>{t('workspaceReportingModuleChain')}</span>
                <strong>{props.moduleOrder.length}</strong>
                <small>{props.moduleOrder.map((module) => t(`workspaceTab_${module}`)).join(' · ')}</small>
              </article>
            </div>
          </article>

          <div className="synergi-workspace-notifications-grid">
            {props.reporting.notifications.map((notification) => (
              <article key={notification.id} className={`synergi-review-content-card synergi-workspace-notification-card is-${notification.severity}`}>
                <div className="synergi-workspace-notification-head">
                  <BellRing className="synergi-signal-icon is-cyan" />
                  <span className={`synergi-workspace-notification-badge is-${notification.severity}`}>
                    {t(`workspaceNotificationSeverity_${notification.severity}`)}
                  </span>
                </div>
                <strong>{t(getNotificationTitleKey(notification.kind))}</strong>
                <p>{t(getNotificationCopyKey(notification.kind))}</p>
                <div className="synergi-workspace-notification-footer">
                  <span>{notification.count !== null ? `${notification.count}` : '—'}</span>
                  <small>{formatDateTime(notification.created_at, language)}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="synergi-workspace-dashboard-aside">
          <article className="synergi-review-content-card">
            <span>{t('workspaceReportingHighlightsTitle')}</span>
            <p>{t('workspaceReportingHighlightsSubtitle')}</p>
            <div className="synergi-workspace-highlight-stack">
              {props.reporting.highlights.length ? props.reporting.highlights.map((event) => (
                <article key={event.id} className="synergi-workspace-highlight-card">
                  <span>{t(`workspaceActivityType_${event.event_type}`)}</span>
                  <strong>{event.title}</strong>
                  <p>{event.description || t('workspaceEmptyActivity')}</p>
                </article>
              )) : (
                <article className="synergi-review-empty">{t('workspaceEmptyActivity')}</article>
              )}
            </div>
          </article>

          <article className="synergi-review-content-card">
            <span>{t('workspaceModulePriority')}</span>
            <p>{props.moduleOrder.map((module) => t(`workspaceTab_${module}`)).join(' / ')}</p>
          </article>
        </aside>
      </div>
    )
  }

  function renderReporting() {
    const metrics = props.reporting.metrics

    return (
      <div className="synergi-workspace-reporting-layout">
        <section className="synergi-workspace-stack">
          <div className="synergi-review-section-head">
            <h3>{t('workspaceReportingDeepTitle')}</h3>
            <p>{t('workspaceReportingDeepSubtitle')}</p>
          </div>

          <div className="synergi-workspace-kpi-grid synergi-workspace-kpi-grid--dense">
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingAssetsTotal')}</span>
              <strong>{metrics.assets_total}</strong>
              <small>{t('workspaceReportingAssetsTotalHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingAssetsReviewed')}</span>
              <strong>{metrics.assets_reviewed}</strong>
              <small>{t('workspaceReportingAssetsReviewedHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingAssetsCurrent')}</span>
              <strong>{metrics.assets_current}</strong>
              <small>{t('workspaceReportingAssetsCurrentHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingAssetsRetired')}</span>
              <strong>{metrics.assets_retired}</strong>
              <small>{t('workspaceReportingAssetsRetiredHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingAssetsVersioned')}</span>
              <strong>{metrics.assets_versioned}</strong>
              <small>{t('workspaceReportingAssetsVersionedHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingDownloads')}</span>
              <strong>{metrics.total_downloads}</strong>
              <small>{t('workspaceReportingDownloadsHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingReferrals')}</span>
              <strong>{metrics.referrals_total}</strong>
              <small>{t('workspaceReportingReferralsHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingAssetPacks')}</span>
              <strong>{metrics.asset_packs_total}</strong>
              <small>{t('workspaceReportingAssetPacksHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingAssetPacksDelivered')}</span>
              <strong>{metrics.asset_packs_delivered}</strong>
              <small>{t('workspaceReportingAssetPacksDeliveredHelp')}</small>
            </article>
            <article className="synergi-workspace-kpi-card">
              <span>{t('workspaceReportingOpportunities')}</span>
              <strong>{metrics.opportunities_total}</strong>
              <small>{t('workspaceReportingOpportunitiesHelp')}</small>
            </article>
          </div>
        </section>

        <aside className="synergi-workspace-stack">
          <article className="synergi-review-content-card">
            <span>{t('workspaceReportingSignalsTitle')}</span>
            <p>{t('workspaceReportingSignalsSubtitle')}</p>
            <div className="synergi-workspace-highlight-stack">
              {props.reporting.notifications.map((notification) => (
                <article key={notification.id} className={`synergi-workspace-highlight-card is-${notification.severity}`}>
                  <div className="synergi-workspace-notification-head">
                    <BellRing className="synergi-signal-icon is-cyan" />
                    <strong>{t(getNotificationTitleKey(notification.kind))}</strong>
                  </div>
                  <p>{t(getNotificationCopyKey(notification.kind))}</p>
                  <small>
                    {notification.count !== null
                      ? `${t('workspaceReportingSignalCount')} ${notification.count}`
                      : formatDateTime(notification.created_at, language)}
                  </small>
                </article>
              ))}
            </div>
          </article>
          <article className="synergi-review-content-card">
            <span>{t('workspaceReportingModuleMap')}</span>
            <p>{props.moduleOrder.map((module) => t(`workspaceTab_${module}`)).join(' · ')}</p>
          </article>
        </aside>
      </div>
    )
  }

  function renderProfile() {
    return (
      <div className="synergi-workspace-module-grid">
        <article className="synergi-review-content-card">
          <span>{t('workspaceProfileSummaryTitle')}</span>
          <p>{props.profile.headline || t('workspaceEmptyProfile')}</p>
        </article>
        <form className="synergi-form synergi-workspace-form-card" onSubmit={handleProfileSubmit}>
          <input
            className="synergi-input"
            placeholder={t('workspaceProfileHeadline')}
            value={profileForm.headline}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, headline: event.target.value }))}
            disabled={savingProfile}
          />
          <input
            className="synergi-input"
            placeholder={t('workspaceProfileServiceTags')}
            value={profileForm.serviceTags}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, serviceTags: event.target.value }))}
            disabled={savingProfile}
          />
          <input
            className="synergi-input"
            placeholder={t('workspaceProfileRegions')}
            value={profileForm.primaryRegions}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, primaryRegions: event.target.value }))}
            disabled={savingProfile}
          />
          <input
            className="synergi-input"
            placeholder={t('workspaceProfileLanguages')}
            value={profileForm.languages}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, languages: event.target.value }))}
            disabled={savingProfile}
          />
          <div className="synergi-two-cols">
            <input
              className="synergi-input"
              placeholder={t('workspaceProfileWebsite')}
              value={profileForm.websiteUrl}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, websiteUrl: event.target.value }))}
              disabled={savingProfile}
            />
            <input
              className="synergi-input"
              placeholder={t('workspaceProfileLinkedin')}
              value={profileForm.linkedinUrl}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, linkedinUrl: event.target.value }))}
              disabled={savingProfile}
            />
          </div>
          <input
            className="synergi-input"
            placeholder={t('workspaceProfileInstagram')}
            value={profileForm.instagramUrl}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, instagramUrl: event.target.value }))}
            disabled={savingProfile}
          />
          {profileError ? <p className="synergi-notice">{profileError}</p> : null}
          {profileNotice ? <p className="synergi-notice synergi-notice-success">{profileNotice}</p> : null}
          <button type="submit" className="synergi-button synergi-button-link" disabled={savingProfile}>
            {savingProfile ? t('workspaceProfileSaving') : t('workspaceProfileSave')}
          </button>
        </form>
        <article className="synergi-review-content-card">
          <span>{t('workspaceProfileSnapshot')}</span>
          <p>{`${t('workspaceProfileType')}: ${t(`workspaceProfileType_${props.profile.partner_profile_type}`)}\n${t('workspaceProfileServiceTagsLabel')}: ${formatList(props.profile.service_tags)}\n${t('workspaceProfileRegionsLabel')}: ${formatList(props.profile.primary_regions)}\n${t('workspaceProfileLanguagesLabel')}: ${formatList(props.profile.languages)}`}</p>
        </article>
      </div>
    )
  }

  function renderAssets() {
    return (
      <div className="synergi-workspace-assets-layout">
        <section className="synergi-workspace-stack">
          <div className="synergi-review-section-head">
            <h3>{t('workspaceAssetsLibraryTitle')}</h3>
            <p>{t('workspaceAssetsLibrarySubtitle')}</p>
          </div>
          {assets.length ? assets.map((asset) => (
            <article key={asset.id} className="synergi-review-content-card">
              <span>{asset.asset_kind} · {asset.is_current_version ? t('workspaceAssetCurrent') : t('workspaceAssetVersioned')}</span>
              <p>{asset.title}</p>
              <p className="synergi-workspace-muted">{asset.description || t('workspaceEmptyAssets')}</p>
              <div className="synergi-workspace-inline-meta">
                <span>{inferAssetFilename(asset.asset_url, asset.title)}</span>
                <small>{`${normalizeLabel(asset.access_level)} · ${normalizeLabel(asset.asset_kind)}`}</small>
              </div>
              <div className="synergi-review-meta-grid synergi-workspace-meta-grid">
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetStatus')}</span>
                  <strong>{t(`workspaceAssetStatus_${asset.review_status}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetDownloads')}</span>
                  <strong>{asset.download_count}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetLifecycle')}</span>
                  <strong>{t(`workspaceAssetLifecycle_${asset.lifecycle_status}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetVersion')}</span>
                  <strong>{asset.version_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPublishedBy')}</span>
                  <strong>{asset.published_by || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetSource')}</span>
                  <strong>{t(`workspaceAssetSource_${asset.source_type}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetSuperseded')}</span>
                  <strong>{asset.superseded_by_asset_id || '—'}</strong>
                </div>
                {asset.retired_at ? (
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceAssetRetiredAt')}</span>
                    <strong>{formatDateTime(asset.retired_at, language)}</strong>
                  </div>
                ) : null}
              </div>
              <div className="synergi-workspace-action-grid">
                <button
                  type="button"
                  className="synergi-button synergi-workspace-action"
                  onClick={() => void handleAssetDownload(asset)}
                  disabled={downloadingAssetId === asset.id || asset.lifecycle_status === 'archived'}
                >
                  {downloadingAssetId === asset.id ? t('workspaceAssetDownloading') : t('workspaceAssetDownload')}
                </button>
                <button
                  type="button"
                  className="synergi-button synergi-workspace-action"
                  onClick={() => void handleAssetReview(asset.id)}
                  disabled={
                    downloadingAssetId === asset.id ||
                    assetBusyId === asset.id ||
                    asset.review_status === 'reviewed'
                  }
                >
                  {assetBusyId === asset.id ? t('workspaceAssetReviewing') : t('workspaceAssetReview')}
                </button>
              </div>
            </article>
          )) : (
            <article className="synergi-review-empty">{t('workspaceEmptyAssets')}</article>
          )}
        </section>

        <section className="synergi-workspace-stack">
          <div className="synergi-review-section-head">
            <h3>{t('workspaceAssetPacksTitle')}</h3>
            <p>{t('workspaceAssetPacksSubtitle')}</p>
          </div>

          <form className="synergi-form synergi-workspace-form-card" onSubmit={handleAssetPackSubmit}>
            <input
              className="synergi-input"
              placeholder={t('workspaceAssetPackTitle')}
              value={assetPackForm.title}
              onChange={(event) => setAssetPackForm((current) => ({ ...current, title: event.target.value }))}
              disabled={submittingAssetPack}
            />
            <div className="synergi-two-cols">
              <select
                className="synergi-select"
                value={assetPackForm.packType}
                onChange={(event) =>
                  setAssetPackForm((current) => ({
                    ...current,
                    packType: event.target.value as PartnerAssetPackRequestRecord['pack_type'],
                  }))
                }
                disabled={submittingAssetPack}
              >
                {(['market-pack', 'brand-pack', 'area-brief', 'custom'] as const).map((type) => (
                  <option key={type} value={type}>
                    {t(`workspaceAssetPackType_${type}`)}
                  </option>
                ))}
              </select>
              <input
                className="synergi-input"
                placeholder={t('workspaceAssetPackNeededBy')}
                value={assetPackForm.neededByLabel}
                onChange={(event) => setAssetPackForm((current) => ({ ...current, neededByLabel: event.target.value }))}
                disabled={submittingAssetPack}
              />
            </div>
            <input
              className="synergi-input"
              placeholder={t('workspaceAssetPackRegion')}
              value={assetPackForm.targetRegion}
              onChange={(event) => setAssetPackForm((current) => ({ ...current, targetRegion: event.target.value }))}
              disabled={submittingAssetPack}
            />
            <input
              className="synergi-input"
              placeholder={t('workspaceAssetPackRequestedAssets')}
              value={assetPackForm.requestedAssets}
              onChange={(event) => setAssetPackForm((current) => ({ ...current, requestedAssets: event.target.value }))}
              disabled={submittingAssetPack}
            />
            <div className="synergi-two-cols">
              <input
                className="synergi-input"
                placeholder={t('workspaceAssetPackDeliveryMethod')}
                value={assetPackForm.deliveryMethod}
                onChange={(event) => setAssetPackForm((current) => ({ ...current, deliveryMethod: event.target.value }))}
                disabled={submittingAssetPack}
              />
              <input
                className="synergi-input"
                placeholder={t('workspaceAssetPackDeliveryReference')}
                value={assetPackForm.deliveryReference}
                onChange={(event) => setAssetPackForm((current) => ({ ...current, deliveryReference: event.target.value }))}
                disabled={submittingAssetPack}
              />
            </div>
            <input
              className="synergi-input"
              placeholder={t('workspaceAssetPackDeliveryOwner')}
              value={assetPackForm.deliveryOwner}
              onChange={(event) => setAssetPackForm((current) => ({ ...current, deliveryOwner: event.target.value }))}
              disabled={submittingAssetPack}
            />
            <textarea
              className="synergi-textarea synergi-workspace-opportunity-notes"
              placeholder={t('workspaceAssetPackContextPlaceholder')}
              value={assetPackForm.requestNotes}
              onChange={(event) => setAssetPackForm((current) => ({ ...current, requestNotes: event.target.value }))}
              disabled={submittingAssetPack}
            />
            <button type="submit" className="synergi-button synergi-workspace-action" disabled={submittingAssetPack}>
              {submittingAssetPack ? t('workspaceAssetPackRequesting') : t('workspaceAssetPackSubmit')}
            </button>
          </form>

          {assetPackRequests.length ? assetPackRequests.map((request) => (
            <article key={request.id} className="synergi-review-content-card">
              <span>{t(`workspaceAssetPackType_${request.pack_type}`)}</span>
              <p>{request.title}</p>
              <p className="synergi-workspace-muted">{request.request_notes || t('workspaceAssetPacksEmpty')}</p>
              <div className="synergi-review-meta-grid synergi-workspace-meta-grid">
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPackStatus')}</span>
                  <strong>{t(`workspaceAssetPackStatus_${request.status}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPackRegion')}</span>
                  <strong>{request.target_region || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPackNeededBy')}</span>
                  <strong>{request.needed_by_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPackRequestedAssetsLabel')}</span>
                  <strong>{request.requested_assets.length ? request.requested_assets.join(', ') : '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPackDeliveryMethod')}</span>
                  <strong>{request.delivery_method || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPackDeliveryReference')}</span>
                  <strong>{request.delivery_reference || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetPackDeliveryOwner')}</span>
                  <strong>{request.fulfillment_owner || '—'}</strong>
                </div>
              </div>
              {request.delivery_notes ? <p className="synergi-workspace-muted">{request.delivery_notes}</p> : null}
            </article>
          )) : (
            <article className="synergi-review-empty">{t('workspaceAssetPacksEmpty')}</article>
          )}
        </section>
      </div>
    )
  }

  function renderOpportunities() {
    const selectedOpportunity =
      opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) || opportunities[0] || null

    return (
      <div className="synergi-workspace-opportunities-layout">
        <div className="synergi-workspace-stack">
          <div className="synergi-review-section-head">
            <h3>{t('workspaceOpportunityQueueTitle')}</h3>
            <p>{t('workspaceOpportunityQueueSubtitle')}</p>
          </div>
          {opportunities.length ? opportunities.map((opportunity) => (
            <button
              key={opportunity.id}
              type="button"
              className={`synergi-review-content-card synergi-workspace-opportunity-card ${selectedOpportunity?.id === opportunity.id ? 'is-active' : ''}`}
              onClick={() => setSelectedOpportunityId(opportunity.id)}
            >
              <div className="synergi-workspace-opportunity-card-head">
                <span>{t(`workspaceOpportunityType_${opportunity.opportunity_type}`)}</span>
                <strong className={`synergi-workspace-opportunity-response is-${opportunity.partner_response}`}>
                  {t(`workspaceOpportunityResponse_${opportunity.partner_response}`)}
                </strong>
              </div>
              <p>{opportunity.title}</p>
              <p className="synergi-workspace-muted">{opportunity.summary || t('workspaceEmptyOpportunities')}</p>
              <div className="synergi-workspace-inline-meta">
                <span>{opportunity.region_label || '—'}</span>
                <small>{opportunity.due_label || '—'}</small>
              </div>
            </button>
          )) : (
            <article className="synergi-review-empty">{t('workspaceEmptyOpportunities')}</article>
          )}
        </div>

        <div className="synergi-workspace-stack">
          <div className="synergi-review-section-head">
            <h3>{t('workspaceOpportunityDetailTitle')}</h3>
            <p>{t('workspaceOpportunityDetailSubtitle')}</p>
          </div>
          {selectedOpportunity ? (
            <article className="synergi-review-content-card synergi-workspace-opportunity-detail">
              <div className="synergi-workspace-opportunity-detail-head">
                <div>
                  <span>{t(`workspaceOpportunityType_${selectedOpportunity.opportunity_type}`)}</span>
                  <p>{selectedOpportunity.title}</p>
                </div>
                <strong className={`synergi-workspace-opportunity-response is-${selectedOpportunity.partner_response}`}>
                  {t(`workspaceOpportunityResponse_${selectedOpportunity.partner_response}`)}
                </strong>
              </div>

              <p className="synergi-workspace-opportunity-summary">
                {selectedOpportunity.summary || t('workspaceEmptyOpportunities')}
              </p>

              <div className="synergi-review-meta-grid synergi-workspace-meta-grid">
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceOpportunityType')}</span>
                  <strong>{t(`workspaceOpportunityType_${selectedOpportunity.opportunity_type}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceOpportunityStatus')}</span>
                  <strong>{t(`workspaceOpportunityStatus_${selectedOpportunity.status}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceOpportunityRegion')}</span>
                  <strong>{selectedOpportunity.region_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceOpportunityDue')}</span>
                  <strong>{selectedOpportunity.due_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceOpportunityValue')}</span>
                  <strong>{selectedOpportunity.value_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceOpportunityCreated')}</span>
                  <strong>{formatOpportunityDate(selectedOpportunity.created_at, language)}</strong>
                </div>
              </div>

              <div className="synergi-workspace-stack">
                <div className="synergi-review-section-head">
                  <h3>{t('workspaceOpportunityResponse')}</h3>
                  <p>{t('workspaceOpportunityResponseHelp')}</p>
                </div>
                <div className="synergi-workspace-action-grid">
                  {(['watching', 'interested', 'passed'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`synergi-button synergi-workspace-action ${selectedOpportunity.partner_response === status ? 'is-selected' : ''}`}
                      onClick={() => void handleOpportunityResponse(selectedOpportunity.id, status)}
                      disabled={opportunityBusyId === selectedOpportunity.id}
                    >
                      {opportunityBusyId === selectedOpportunity.id
                        ? t('workspaceOpportunitySaving')
                        : t(`workspaceOpportunityCta_${status}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="synergi-workspace-stack">
                <label className="synergi-workspace-opportunity-label" htmlFor={`opportunity-notes-${selectedOpportunity.id}`}>
                  {t('workspaceOpportunityNotesLabel')}
                </label>
                <textarea
                  id={`opportunity-notes-${selectedOpportunity.id}`}
                  className="synergi-textarea synergi-workspace-opportunity-notes"
                  placeholder={t('workspaceOpportunityNotesPlaceholder')}
                  value={opportunityNotes[selectedOpportunity.id] || ''}
                  onChange={(event) =>
                    setOpportunityNotes((current) => ({
                      ...current,
                      [selectedOpportunity.id]: event.target.value,
                    }))
                  }
                  disabled={opportunityBusyId === selectedOpportunity.id}
                />
                <div className="synergi-workspace-opportunity-footer">
                  <small>{t('workspaceOpportunityNotesHelp')}</small>
                  <button
                    type="button"
                    className="synergi-button synergi-workspace-action synergi-workspace-opportunity-save"
                    onClick={() => void handleOpportunityNotesSave(selectedOpportunity)}
                    disabled={opportunityBusyId === selectedOpportunity.id || selectedOpportunity.partner_response === 'new'}
                  >
                    {opportunityBusyId === selectedOpportunity.id ? t('workspaceOpportunitySaving') : t('workspaceOpportunitySaveNotes')}
                  </button>
                </div>
              </div>
            </article>
          ) : (
            <article className="synergi-review-empty">{t('workspaceEmptyOpportunities')}</article>
          )}
        </div>
      </div>
    )
  }

  function renderReferrals() {
    return (
      <div className="synergi-workspace-referrals-layout">
        <section className="synergi-workspace-stack">
          <div className="synergi-review-section-head">
            <h3>{t('workspaceReferralsTitle')}</h3>
            <p>{t('workspaceReferralsSubtitle')}</p>
          </div>

          <form className="synergi-form synergi-workspace-form-card" onSubmit={handleReferralSubmit}>
            <input
              className="synergi-input"
              placeholder={t('workspaceReferralName')}
              value={referralForm.referralName}
              onChange={(event) => setReferralForm((current) => ({ ...current, referralName: event.target.value }))}
              disabled={submittingReferral}
            />
            <div className="synergi-two-cols">
              <input
                className="synergi-input"
                placeholder={t('workspaceReferralCompany')}
                value={referralForm.referralCompany}
                onChange={(event) => setReferralForm((current) => ({ ...current, referralCompany: event.target.value }))}
                disabled={submittingReferral}
              />
              <select
                className="synergi-select"
                value={referralForm.referralKind}
                onChange={(event) =>
                  setReferralForm((current) => ({
                    ...current,
                    referralKind: event.target.value as PartnerReferralRecord['referral_kind'],
                  }))
                }
                disabled={submittingReferral}
              >
                {(['buyer', 'seller', 'investor', 'introducer', 'partner'] as const).map((kind) => (
                  <option key={kind} value={kind}>
                    {t(`workspaceReferralKind_${kind}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="synergi-two-cols">
              <input
                className="synergi-input"
                placeholder={t('workspaceReferralEmail')}
                value={referralForm.referralEmail}
                onChange={(event) => setReferralForm((current) => ({ ...current, referralEmail: event.target.value }))}
                disabled={submittingReferral}
              />
              <input
                className="synergi-input"
                placeholder={t('workspaceReferralPhone')}
                value={referralForm.referralPhone}
                onChange={(event) => setReferralForm((current) => ({ ...current, referralPhone: event.target.value }))}
                disabled={submittingReferral}
              />
            </div>
            <div className="synergi-two-cols">
              <input
                className="synergi-input"
                placeholder={t('workspaceReferralRegion')}
                value={referralForm.regionLabel}
                onChange={(event) => setReferralForm((current) => ({ ...current, regionLabel: event.target.value }))}
                disabled={submittingReferral}
              />
              <input
                className="synergi-input"
                placeholder={t('workspaceReferralBudget')}
                value={referralForm.budgetLabel}
                onChange={(event) => setReferralForm((current) => ({ ...current, budgetLabel: event.target.value }))}
                disabled={submittingReferral}
              />
            </div>
            <input
              className="synergi-input"
              placeholder={t('workspaceReferralEstimatedValue')}
              value={referralForm.estimatedValueLabel}
              onChange={(event) => setReferralForm((current) => ({ ...current, estimatedValueLabel: event.target.value }))}
              disabled={submittingReferral}
            />
            <textarea
              className="synergi-textarea synergi-workspace-opportunity-notes"
              placeholder={t('workspaceReferralNotes')}
              value={referralForm.referralNotes}
              onChange={(event) => setReferralForm((current) => ({ ...current, referralNotes: event.target.value }))}
              disabled={submittingReferral}
            />
            <button type="submit" className="synergi-button synergi-workspace-action" disabled={submittingReferral}>
              {submittingReferral ? t('workspaceReferralSubmitting') : t('workspaceReferralSubmit')}
            </button>
          </form>

          {referrals.length ? referrals.map((referral) => (
            <article key={referral.id} className="synergi-review-content-card synergi-workspace-referral-card">
              <div className="synergi-workspace-opportunity-card-head">
                <span>{t(`workspaceReferralKind_${referral.referral_kind}`)}</span>
                <strong className={`synergi-workspace-opportunity-response is-${referral.status}`}>
                  {t(`workspaceReferralStatus_${referral.status}`)}
                </strong>
              </div>
              <p>{referral.referral_name}</p>
              <p className="synergi-workspace-muted">{referral.referral_notes || t('workspaceReferralsEmpty')}</p>
              <div className="synergi-review-meta-grid synergi-workspace-meta-grid">
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceReferralCompany')}</span>
                  <strong>{referral.referral_company || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceReferralRegion')}</span>
                  <strong>{referral.region_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceReferralBudget')}</span>
                  <strong>{referral.budget_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceReferralEstimatedValue')}</span>
                  <strong>{referral.estimated_value_label || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceReferralOwner')}</span>
                  <strong>{referral.owner_username || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceReferralStage')}</span>
                  <strong>{t(`workspaceReferralStage_${referral.commercial_stage}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceReferralNextAction')}</span>
                  <strong>{referral.next_action || '—'}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceOpportunityCreated')}</span>
                  <strong>{formatOpportunityDate(referral.created_at, language)}</strong>
                </div>
              </div>
            </article>
          )) : (
            <article className="synergi-review-empty">{t('workspaceReferralsEmpty')}</article>
          )}
        </section>
      </div>
    )
  }

  function renderActivity() {
    return (
      <div className="synergi-workspace-stack">
        {props.activity.length ? props.activity.map((event) => (
          <article key={event.id} className="synergi-review-content-card">
            <span>{normalizeLabel(event.event_type)}</span>
            <p>{event.title}</p>
            <p className="synergi-workspace-muted">{event.description || t('workspaceEmptyActivity')}</p>
          </article>
        )) : (
          <article className="synergi-review-empty">{t('workspaceEmptyActivity')}</article>
        )}
      </div>
    )
  }

  function renderModuleContent() {
    switch (activeModule) {
      case 'reporting':
        return renderReporting()
      case 'partner-profile':
        return renderProfile()
      case 'assets-documents':
        return renderAssets()
      case 'opportunities':
        return renderOpportunities()
      case 'referrals':
        return renderReferrals()
      case 'activity':
        return renderActivity()
      default:
        return renderOverview()
    }
  }

  return (
    <main className="synergi-page">
      <div className="synergi-noise" />
      <section className="synergi-shell">
        <header className="synergi-topbar">
          <Link href="/login" className="synergi-backlink">
            {t('workspaceBackToLogin')}
          </Link>

          <div className="synergi-brand">
            <div className="synergi-brand-badge">
              <Image
                src="/brand/logo-anclora-private-estates.png"
                alt="Anclora Private Estates"
                width={40}
                height={40}
                className="synergi-brand-logo"
              />
            </div>
            <div>
              <p className="synergi-brand-name">ANCLORA SYNERGI</p>
              <p className="synergi-brand-line">{t('workspaceBrandLine')}</p>
            </div>
          </div>

          <div className="synergi-language">
            {(['es', 'en', 'de'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={item === language ? 'is-active' : ''}
                onClick={() => setLanguage(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <section className="synergi-panel synergi-review-hero">
          <div>
            <p className="synergi-eyebrow">{t('workspaceEyebrow')}</p>
            <h1 className="synergi-title synergi-review-title">{props.workspaceName}</h1>
            <p className="synergi-subtitle">
              {props.welcomeNote || t('workspaceSubtitle')}
            </p>
          </div>

          <div className="synergi-review-summary-grid">
            <article className="synergi-review-summary-card">
              <strong>{props.partnerName}</strong>
              <span>{t('workspacePartnerName')}</span>
            </article>
            <article className="synergi-review-summary-card">
              <strong>{props.companyName || t('reviewValueMissing')}</strong>
              <span>{t('workspaceCompany')}</span>
            </article>
            <article className="synergi-review-summary-card">
              <strong>{t(`workspaceProfileType_${props.profile.partner_profile_type}`)}</strong>
              <span>{t('workspaceProfileType')}</span>
            </article>
          </div>
        </section>

        <div className="synergi-review-grid synergi-workspace-grid">
          <aside className="synergi-panel synergi-review-list-panel">
            <div className="synergi-review-section-head">
              <h2>{t('workspaceModulesTitle')}</h2>
              <p>{t('workspaceModulesSubtitle')}</p>
            </div>
            <div className="synergi-workspace-module-nav">
              {props.moduleOrder.map((module) => {
                const Icon = MODULE_ICONS[module]
                return (
                  <button
                    key={module}
                    type="button"
                    className={`synergi-review-item ${activeModule === module ? 'is-active' : ''}`}
                    onClick={() => setActiveModule(module)}
                  >
                    <div className="synergi-workspace-module-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{t(`workspaceTab_${module}`)}</strong>
                      <p>{t(`workspaceTabCopy_${module}`)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="synergi-review-actions synergi-workspace-logout">
              <button type="button" className="synergi-button synergi-review-action" onClick={() => void handleLogout()}>
                {t('workspaceLogout')}
              </button>
            </div>
          </aside>

          <section className="synergi-panel synergi-review-detail-panel">
            <div className="synergi-review-section-head">
              <h2>{t(`workspaceTab_${activeModule}`)}</h2>
              <p>{t(`workspaceTabCopy_${activeModule}`)}</p>
            </div>
            {moduleError ? <p className="synergi-notice">{moduleError}</p> : null}
            {moduleNotice ? <p className="synergi-notice synergi-notice-success">{moduleNotice}</p> : null}
            <div className="synergi-review-detail">{renderModuleContent()}</div>
          </section>
        </div>
      </section>
    </main>
  )
}
