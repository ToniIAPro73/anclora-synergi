'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BriefcaseBusiness, FileStack, LayoutGrid, RadioTower, UserRound } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type {
  PartnerActivityEventRecord,
  PartnerAssetRecord,
  PartnerModuleKey,
  PartnerOpportunityRecord,
  PartnerProfileRecord,
} from '@/lib/partner-workspace-store'

type WorkspaceProps = {
  partnerName: string
  companyName: string | null
  workspaceName: string
  welcomeNote: string | null
  accountStatus: string
  profile: PartnerProfileRecord
  moduleOrder: PartnerModuleKey[]
  assets: PartnerAssetRecord[]
  opportunities: PartnerOpportunityRecord[]
  activity: PartnerActivityEventRecord[]
}

const MODULE_ICONS: Record<PartnerModuleKey, typeof LayoutGrid> = {
  overview: LayoutGrid,
  'partner-profile': UserRound,
  'assets-documents': FileStack,
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

export function SynergiWorkspacePage(props: WorkspaceProps) {
  const { language, setLanguage, t } = useI18n()
  const [activeModule, setActiveModule] = useState<PartnerModuleKey>(props.moduleOrder[0] || 'overview')
  const [assets, setAssets] = useState(props.assets)
  const [opportunities, setOpportunities] = useState(props.opportunities)
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(props.opportunities[0]?.id || null)
  const [opportunityNotes, setOpportunityNotes] = useState<Record<string, string>>(
    Object.fromEntries(props.opportunities.map((opportunity) => [opportunity.id, opportunity.partner_response_notes || '']))
  )
  const [savingProfile, setSavingProfile] = useState(false)
  const [assetBusyId, setAssetBusyId] = useState<string | null>(null)
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null)
  const [opportunityBusyId, setOpportunityBusyId] = useState<string | null>(null)
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
      <div className="synergi-workspace-module-grid">
        <article className="synergi-review-content-card">
          <span>{t('workspaceOverviewTitle')}</span>
          <p>{props.welcomeNote || t('workspaceSubtitle')}</p>
        </article>
        <article className="synergi-review-content-card">
          <span>{t('workspaceProfileType')}</span>
          <p>{t(`workspaceProfileType_${props.profile.partner_profile_type}`)}</p>
        </article>
        <article className="synergi-review-content-card">
          <span>{t('workspaceStatus')}</span>
          <p>{t(`workspaceStatus_${props.accountStatus}`)}</p>
        </article>
        <article className="synergi-review-content-card">
          <span>{t('workspaceCollaborationScope')}</span>
          <p>{normalizeLabel(props.profile.collaboration_scope)}</p>
        </article>
        <article className="synergi-review-content-card">
          <span>{t('workspaceModulePriority')}</span>
          <p>{props.moduleOrder.map((module) => t(`workspaceTab_${module}`)).join(' / ')}</p>
        </article>
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
      <div className="synergi-workspace-stack">
        {assets.length ? assets.map((asset) => (
          <article key={asset.id} className="synergi-review-content-card">
            <span>{asset.asset_kind}</span>
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
            </div>
            <div className="synergi-workspace-action-grid">
              <button
                type="button"
                className="synergi-button synergi-workspace-action"
                onClick={() => void handleAssetDownload(asset)}
                disabled={downloadingAssetId === asset.id}
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

  function renderActivity() {
    return (
      <div className="synergi-workspace-stack">
        {props.activity.length ? props.activity.map((event) => (
          <article key={event.id} className="synergi-review-content-card">
            <span>{event.event_type}</span>
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
      case 'partner-profile':
        return renderProfile()
      case 'assets-documents':
        return renderAssets()
      case 'opportunities':
        return renderOpportunities()
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
