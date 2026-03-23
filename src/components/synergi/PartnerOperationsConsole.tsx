'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCcw, Sparkles, SplitSquareVertical, UserRound } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type {
  AdminPartnerAssetPackRequestRecord,
  AdminPartnerReferralRecord,
  PartnerAssetPackRequestRecord,
  PartnerAssetRecord,
  PartnerReferralRecord,
} from '@/lib/partner-workspace-store'

type ConsoleMode = 'referrals' | 'asset-packs' | 'assets'

type ReferralsResponse = {
  items: AdminPartnerReferralRecord[]
  total: number
}

type AssetPackRequestsResponse = {
  items: AdminPartnerAssetPackRequestRecord[]
  total: number
}

type AssetsResponse = {
  items: PartnerAssetRecord[]
  total: number
}

const REFERRAL_STATUS_FILTERS = ['all', 'submitted', 'reviewing', 'qualified', 'introduced', 'negotiating', 'won', 'closed', 'declined'] as const
const ASSET_PACK_STATUS_FILTERS = ['all', 'submitted', 'reviewing', 'fulfilled', 'declined'] as const
const ASSET_STATUS_FILTERS = ['all', 'current', 'retired', 'superseded'] as const
const ASSET_KINDS: PartnerAssetRecord['asset_kind'][] = ['brief', 'document', 'playbook']
const ACCESS_LEVELS: PartnerAssetRecord['access_level'][] = ['private', 'shared']
const CONTENT_FORMATS: PartnerAssetRecord['content_format'][] = ['markdown', 'text']

function formatDate(value: string, language: string) {
  try {
    return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function toList(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) return value.split(',').map((item) => item.trim()).filter(Boolean)
  return []
}

export function PartnerOperationsConsole() {
  const { language, t } = useI18n()
  const [mode, setMode] = useState<ConsoleMode>('referrals')
  const [searchQuery, setSearchQuery] = useState('')

  const [referrals, setReferrals] = useState<AdminPartnerReferralRecord[]>([])
  const [referralFilter, setReferralFilter] = useState<(typeof REFERRAL_STATUS_FILTERS)[number]>('all')
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null)
  const [referralNotes, setReferralNotes] = useState('')
  const [referralOwner, setReferralOwner] = useState('')
  const [referralStage, setReferralStage] = useState<PartnerReferralRecord['commercial_stage']>('intake')
  const [referralNextAction, setReferralNextAction] = useState('')
  const [referralEstimatedValue, setReferralEstimatedValue] = useState('')
  const [referralsLoading, setReferralsLoading] = useState(true)
  const [referralsRefreshing, setReferralsRefreshing] = useState(false)
  const [referralBusyId, setReferralBusyId] = useState<string | null>(null)

  const [assetPackRequests, setAssetPackRequests] = useState<AdminPartnerAssetPackRequestRecord[]>([])
  const [assetPackFilter, setAssetPackFilter] = useState<(typeof ASSET_PACK_STATUS_FILTERS)[number]>('all')
  const [selectedAssetPackId, setSelectedAssetPackId] = useState<string | null>(null)
  const [assetPackNotes, setAssetPackNotes] = useState('')
  const [assetPacksLoading, setAssetPacksLoading] = useState(true)
  const [assetPacksRefreshing, setAssetPacksRefreshing] = useState(false)
  const [assetPackBusyId, setAssetPackBusyId] = useState<string | null>(null)
  const [fulfillmentForm, setFulfillmentForm] = useState({
    title: '',
    description: '',
    assetKind: 'document' as PartnerAssetRecord['asset_kind'],
    accessLevel: 'shared' as PartnerAssetRecord['access_level'],
    assetUrl: '',
    assetBody: '',
    contentFormat: 'markdown' as PartnerAssetRecord['content_format'],
  })

  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const visibleReferrals = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) return referrals

    return referrals.filter((referral) =>
      [
        referral.referral_name,
        referral.referral_company,
        referral.referral_email,
        referral.referral_phone,
        referral.partner_full_name,
        referral.partner_company_name,
        referral.workspace_display_name,
        referral.referral_notes,
        referral.internal_notes,
        referral.owner_username,
        referral.next_action,
        referral.estimated_value_label,
        referral.commercial_stage,
        referral.status,
      ]
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .some((value) => value.toLowerCase().includes(needle))
    )
  }, [referrals, searchQuery])

  const visibleAssetPackRequests = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) return assetPackRequests

    return assetPackRequests.filter((request) =>
      [
        request.title,
        request.request_notes,
        request.partner_full_name,
        request.partner_company_name,
        request.workspace_display_name,
        request.internal_notes,
        request.status,
        request.target_region,
        request.needed_by_label,
      ]
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .some((value) => value.toLowerCase().includes(needle))
    )
  }, [assetPackRequests, searchQuery])

  async function loadReferrals(nextFilter = referralFilter, showRefreshState = false) {
    if (showRefreshState) setReferralsRefreshing(true)
    else setReferralsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (nextFilter !== 'all') params.set('status', nextFilter)
      const response = await fetch(`/api/admin/partner-referrals?${params.toString()}`, { cache: 'no-store' })
      const body = (await response.json().catch(() => null)) as ReferralsResponse | { error?: string } | null

      if (!response.ok || !body || !('items' in body)) {
        throw new Error((body && 'error' in body && body.error) || t('opsLoadError'))
      }

      setReferrals(body.items)
      setSelectedReferralId((current) => {
        if (current && body.items.some((item) => item.id === current)) return current
        return body.items[0]?.id || null
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('opsLoadError'))
    } finally {
      setReferralsLoading(false)
      setReferralsRefreshing(false)
    }
  }

  async function loadAssetPacks(nextFilter = assetPackFilter, showRefreshState = false) {
    if (showRefreshState) setAssetPacksRefreshing(true)
    else setAssetPacksLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (nextFilter !== 'all') params.set('status', nextFilter)
      const response = await fetch(`/api/admin/asset-pack-requests?${params.toString()}`, { cache: 'no-store' })
      const body = (await response.json().catch(() => null)) as AssetPackRequestsResponse | { error?: string } | null

      if (!response.ok || !body || !('items' in body)) {
        throw new Error((body && 'error' in body && body.error) || t('opsLoadError'))
      }

      setAssetPackRequests(body.items)
      setSelectedAssetPackId((current) => {
        if (current && body.items.some((item) => item.id === current)) return current
        return body.items[0]?.id || null
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('opsLoadError'))
    } finally {
      setAssetPacksLoading(false)
      setAssetPacksRefreshing(false)
    }
  }

  useEffect(() => {
    void loadReferrals(referralFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralFilter])

  useEffect(() => {
    void loadAssetPacks(assetPackFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetPackFilter])

  const selectedReferral = useMemo(
    () => visibleReferrals.find((item) => item.id === selectedReferralId) ?? visibleReferrals[0] ?? null,
    [visibleReferrals, selectedReferralId]
  )

  const selectedAssetPack = useMemo(
    () => visibleAssetPackRequests.find((item) => item.id === selectedAssetPackId) ?? visibleAssetPackRequests[0] ?? null,
    [visibleAssetPackRequests, selectedAssetPackId]
  )

  useEffect(() => {
    setReferralNotes(selectedReferral?.internal_notes || '')
    setReferralOwner(selectedReferral?.owner_username || '')
    setReferralStage(selectedReferral?.commercial_stage || 'intake')
    setReferralNextAction(selectedReferral?.next_action || '')
    setReferralEstimatedValue(selectedReferral?.estimated_value_label || '')
    setNotice(null)
  }, [selectedReferral])

  useEffect(() => {
    setAssetPackNotes(selectedAssetPack?.internal_notes || '')
    setFulfillmentForm({
      title: selectedAssetPack?.title || '',
      description: selectedAssetPack?.request_notes || '',
      assetKind: 'document',
      accessLevel: 'shared',
      assetUrl: '',
      assetBody: '',
      contentFormat: 'markdown',
    })
    setNotice(null)
  }, [selectedAssetPack])

  const referralSummary = useMemo(() => {
    return visibleReferrals.reduce(
      (acc, item) => {
        acc.total += 1
        if (['submitted', 'reviewing', 'qualified', 'introduced', 'negotiating'].includes(item.status)) acc.open += 1
        else acc.resolved += 1
        return acc
      },
      { total: 0, open: 0, resolved: 0 }
    )
  }, [visibleReferrals])

  const assetPackSummary = useMemo(() => {
    return visibleAssetPackRequests.reduce(
      (acc, item) => {
        acc.total += 1
        if (item.status === 'submitted' || item.status === 'reviewing') acc.open += 1
        else acc.resolved += 1
        return acc
      },
      { total: 0, open: 0, resolved: 0 }
    )
  }, [visibleAssetPackRequests])

  async function handleReferralUpdate(nextStatus: PartnerReferralRecord['status']) {
    if (!selectedReferral) return

    setReferralBusyId(selectedReferral.id)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/admin/partner-referrals/${selectedReferral.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          internalNotes: referralNotes,
          ownerUsername: referralOwner,
          commercialStage: referralStage,
          nextAction: referralNextAction,
          estimatedValueLabel: referralEstimatedValue,
        }),
      })
      const body = (await response.json().catch(() => null)) as { error?: string; item?: PartnerReferralRecord } | null

      if (!response.ok || !body?.item) {
        throw new Error(body?.error || t('opsSaveError'))
      }

      setReferrals((current) =>
        current.map((item) =>
          item.id === body.item!.id
            ? {
                ...item,
                ...body.item!,
              }
            : item
        )
      )
      setNotice(t('opsSaved'))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t('opsSaveError'))
    } finally {
      setReferralBusyId(null)
    }
  }

  async function handleAssetPackUpdate(nextStatus: PartnerAssetPackRequestRecord['status']) {
    if (!selectedAssetPack) return

    setAssetPackBusyId(selectedAssetPack.id)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/admin/asset-pack-requests/${selectedAssetPack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          internalNotes: assetPackNotes,
          deliveryMethod: fulfillmentForm.deliveryMethod,
          deliveryReference: fulfillmentForm.deliveryReference,
          deliveryNotes: fulfillmentForm.deliveryNotes,
          fulfillmentOwner: fulfillmentForm.fulfillmentOwner,
          fulfillmentAsset:
            nextStatus === 'fulfilled' && fulfillmentForm.title.trim() && (fulfillmentForm.assetBody.trim() || fulfillmentForm.assetUrl.trim())
              ? {
                  title: fulfillmentForm.title,
                  description: fulfillmentForm.description,
                  assetKind: fulfillmentForm.assetKind,
                  accessLevel: fulfillmentForm.accessLevel,
                  assetUrl: fulfillmentForm.assetUrl,
                  assetBody: fulfillmentForm.assetBody,
                  contentFormat: fulfillmentForm.contentFormat,
                }
              : undefined,
        }),
      })
      const body = (await response.json().catch(() => null)) as {
        error?: string
        request?: AdminPartnerAssetPackRequestRecord
        item?: AdminPartnerAssetPackRequestRecord
      } | null

      const updatedRequest = body?.request || body?.item

      if (!response.ok || !updatedRequest) {
        throw new Error(body?.error || t('opsSaveError'))
      }

      setAssetPackRequests((current) =>
        current.map((item) =>
          item.id === updatedRequest.id
            ? {
                ...item,
                ...updatedRequest,
              }
            : item
        )
      )
      setNotice(nextStatus === 'fulfilled' ? t('opsFulfillmentSaved') : t('opsSaved'))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t('opsSaveError'))
    } finally {
      setAssetPackBusyId(null)
    }
  }

  async function handleAssetUpdate(nextAction: 'update' | 'retire' | 'publish-version') {
    if (!selectedAsset) return

    setAssetPublishBusyId(selectedAsset.id)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/admin/partner-assets/${selectedAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: nextAction,
          title: assetForm.title,
          description: assetForm.description,
          assetKind: assetForm.assetKind,
          accessLevel: assetForm.accessLevel,
          lifecycleStatus: nextAction === 'retire' ? 'archived' : assetForm.lifecycleStatus,
          versionLabel: assetForm.versionLabel,
          assetUrl: assetForm.assetUrl,
          assetBody: assetForm.assetBody,
          contentFormat: assetForm.contentFormat,
          retirementReason: assetForm.retirementReason,
        }),
      })

      const body = (await response.json().catch(() => null)) as { error?: string; item?: PartnerAssetRecord } | null

      if (!response.ok || !body?.item) {
        throw new Error(body?.error || t('opsSaveError'))
      }

      setAssets((current) =>
        current.map((item) => (item.id === body.item!.id ? body.item! : item))
      )
      setNotice(nextAction === 'publish-version' ? t('opsAssetVersionPublished') : t('opsSaved'))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t('opsSaveError'))
    } finally {
      setAssetPublishBusyId(null)
    }
  }

  const referralsVisible = mode === 'referrals'
  const assetPacksVisible = mode === 'asset-packs'
  const assetsVisible = mode === 'assets'
  const activeSummary = assetsVisible ? assetSummary : referralsVisible ? referralSummary : assetPackSummary
  const activeRefresh = assetsVisible ? assetsRefreshing : referralsVisible ? referralsRefreshing : assetPacksRefreshing
  const activeRefreshLabel = assetsVisible
    ? assetsRefreshing
      ? t('opsRefreshing')
      : t('opsRefresh')
    : referralsVisible
      ? referralsRefreshing
        ? t('opsRefreshing')
        : t('opsRefresh')
      : assetPacksRefreshing
        ? t('opsRefreshing')
        : t('opsRefresh')

  return (
    <section className="synergi-panel synergi-ops-panel">
      <div className="synergi-review-section-head">
        <p className="synergi-eyebrow">{t('opsEyebrow')}</p>
        <h2>{t('opsTitle')}</h2>
        <p>{t('opsSubtitle')}</p>
      </div>

      <div className="synergi-review-summary-grid synergi-ops-summary-grid">
        <article className="synergi-review-summary-card">
          <Sparkles className="synergi-signal-icon" />
          <strong>{activeSummary.total}</strong>
          <span>{t('opsSummaryTotal')}</span>
        </article>
        <article className="synergi-review-summary-card">
          <UserRound className="synergi-signal-icon is-cyan" />
          <strong>{activeSummary.open}</strong>
          <span>{t('opsSummaryOpen')}</span>
        </article>
        <article className="synergi-review-summary-card">
          <SplitSquareVertical className="synergi-signal-icon" />
          <strong>{activeSummary.resolved}</strong>
          <span>{t('opsSummaryResolved')}</span>
        </article>
      </div>

      <div className="synergi-review-toolbar synergi-ops-toolbar">
        <div className="synergi-review-search synergi-ops-search">
          <input
            className="synergi-input synergi-review-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('opsSearchPlaceholder')}
          />
        </div>

        <div className="synergi-review-filters">
          {(['referrals', 'asset-packs', 'assets'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`synergi-review-filter ${mode === item ? 'is-active' : ''}`}
              onClick={() => setMode(item)}
            >
              {item === 'referrals' ? t('opsTab_referrals') : item === 'asset-packs' ? t('opsTab_assetPacks') : t('opsTab_assets')}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="synergi-review-refresh"
          onClick={() =>
            void (assetsVisible ? loadAssets(assetFilter, true) : referralsVisible ? loadReferrals(referralFilter, true) : loadAssetPacks(assetPackFilter, true))
          }
          disabled={activeRefresh}
        >
          <RefreshCcw size={16} />
          <span>{activeRefreshLabel}</span>
        </button>
      </div>

      {error ? <p className="synergi-notice">{error}</p> : null}
      {notice ? <p className="synergi-notice synergi-notice-success">{notice}</p> : null}

      {referralsVisible ? (
        <div className="synergi-review-grid synergi-ops-grid">
          <section className="synergi-panel synergi-review-list-panel synergi-ops-list-panel">
            <div className="synergi-review-section-head">
              <h3>{t('opsListTitle')}</h3>
              <p>{t('opsListSubtitle')}</p>
            </div>

            <div className="synergi-review-filters synergi-ops-status-filters">
              {REFERRAL_STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`synergi-review-filter ${referralFilter === status ? 'is-active' : ''}`}
                  onClick={() => setReferralFilter(status)}
                >
                  {status === 'all' ? t('reviewStatus_all') : t(`workspaceReferralStatus_${status}`)}
                </button>
              ))}
            </div>

            {referralsLoading ? (
              <div className="synergi-review-empty">{t('opsLoading')}</div>
            ) : visibleReferrals.length === 0 ? (
              <div className="synergi-review-empty">{t('opsEmpty')}</div>
            ) : (
              <div className="synergi-review-list">
                {visibleReferrals.map((referral) => (
                  <button
                    key={referral.id}
                    type="button"
                    className={`synergi-review-item ${selectedReferral?.id === referral.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedReferralId(referral.id)}
                  >
                    <div className="synergi-review-item-top">
                      <strong>{referral.referral_name}</strong>
                      <span className={`synergi-review-badge is-${referral.status}`}>{t(`workspaceReferralStatus_${referral.status}`)}</span>
                    </div>
                    <p>{referral.partner_full_name}</p>
                    <small>
                      {referral.partner_company_name || referral.workspace_display_name || referral.partner_email}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="synergi-panel synergi-review-detail-panel synergi-ops-detail-panel">
            <div className="synergi-review-section-head">
              <h3>{t('opsDetailTitle')}</h3>
              <p>{t('opsDetailSubtitle')}</p>
            </div>

            {!selectedReferral ? (
              <div className="synergi-review-empty">{t('opsDetailEmpty')}</div>
            ) : (
              <div className="synergi-review-detail">
                <div className="synergi-review-meta-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('opsPartner')}</span>
                    <strong>{selectedReferral.partner_full_name}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceCompany')}</span>
                    <strong>{selectedReferral.partner_company_name || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldEmail')}</span>
                    <strong>{selectedReferral.partner_email}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('opsWorkspace')}</span>
                    <strong>{selectedReferral.workspace_display_name || t('reviewValueMissing')}</strong>
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('reviewFieldName')}</span>
                  <p>{selectedReferral.referral_name}</p>
                </div>

                <div className="synergi-review-meta-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('opsReferralKind')}</span>
                    <strong>{t(`workspaceReferralKind_${selectedReferral.referral_kind}`)}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralRegion')}</span>
                    <strong>{selectedReferral.region_label || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralBudget')}</span>
                    <strong>{selectedReferral.budget_label || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralEstimatedValue')}</span>
                    <strong>{selectedReferral.estimated_value_label || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralOwner')}</span>
                    <strong>{selectedReferral.owner_username || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralStage')}</span>
                    <strong>{t(`workspaceReferralStage_${selectedReferral.commercial_stage}`)}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralNextAction')}</span>
                    <strong>{selectedReferral.next_action || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('opsReviewedAt')}</span>
                    <strong>{selectedReferral.reviewed_at ? formatDate(selectedReferral.reviewed_at, language) : t('reviewValueMissing')}</strong>
                  </div>
                </div>

                <div className="synergi-review-meta-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralOwner')}</span>
                    <input
                      className="synergi-input"
                      value={referralOwner}
                      onChange={(event) => setReferralOwner(event.target.value)}
                      placeholder={t('opsReferralOwnerPlaceholder')}
                      disabled={referralBusyId !== null}
                    />
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralStage')}</span>
                    <select
                      className="synergi-select"
                      value={referralStage}
                      onChange={(event) => setReferralStage(event.target.value as PartnerReferralRecord['commercial_stage'])}
                      disabled={referralBusyId !== null}
                    >
                      {(['intake', 'qualified', 'introduced', 'negotiating', 'converted', 'closed'] as const).map((stage) => (
                        <option key={stage} value={stage}>
                          {t(`workspaceReferralStage_${stage}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralEstimatedValue')}</span>
                    <input
                      className="synergi-input"
                      value={referralEstimatedValue}
                      onChange={(event) => setReferralEstimatedValue(event.target.value)}
                      placeholder={t('opsReferralEstimatedValuePlaceholder')}
                      disabled={referralBusyId !== null}
                    />
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceReferralNextAction')}</span>
                    <input
                      className="synergi-input"
                      value={referralNextAction}
                      onChange={(event) => setReferralNextAction(event.target.value)}
                      placeholder={t('opsReferralNextActionPlaceholder')}
                      disabled={referralBusyId !== null}
                    />
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('reviewNotesLabel')}</span>
                  <textarea
                    className="synergi-input synergi-textarea synergi-review-notes"
                    value={referralNotes}
                    onChange={(event) => setReferralNotes(event.target.value)}
                    placeholder={t('opsNotesPlaceholder')}
                    disabled={referralBusyId !== null}
                  />
                </div>

                <div className="synergi-review-actions synergi-ops-actions">
                  <button
                    type="button"
                    className="synergi-button synergi-review-action"
                    onClick={() => void handleReferralUpdate(selectedReferral.status)}
                    disabled={referralBusyId !== null}
                  >
                    {referralBusyId === selectedReferral.id ? t('opsSaving') : t('opsSaveNotes')}
                  </button>
                  {(['reviewing', 'qualified', 'introduced', 'negotiating', 'won', 'closed', 'declined'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`synergi-button synergi-review-action is-${status}`}
                      onClick={() => void handleReferralUpdate(status)}
                      disabled={referralBusyId !== null}
                    >
                      {referralBusyId === selectedReferral.id ? t('opsSaving') : t(`workspaceReferralStatus_${status}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="synergi-review-grid synergi-ops-grid">
          <section className="synergi-panel synergi-review-list-panel synergi-ops-list-panel">
            <div className="synergi-review-section-head">
              <h3>{t('opsListTitle')}</h3>
              <p>{t('opsListSubtitle')}</p>
            </div>

            <div className="synergi-review-filters synergi-ops-status-filters">
              {ASSET_PACK_STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`synergi-review-filter ${assetPackFilter === status ? 'is-active' : ''}`}
                  onClick={() => setAssetPackFilter(status)}
                >
                  {status === 'all' ? t('reviewStatus_all') : t(`workspaceAssetPackStatus_${status}`)}
                </button>
              ))}
            </div>

            {assetPacksLoading ? (
              <div className="synergi-review-empty">{t('opsLoading')}</div>
            ) : visibleAssetPackRequests.length === 0 ? (
              <div className="synergi-review-empty">{t('opsEmpty')}</div>
            ) : (
              <div className="synergi-review-list">
                {visibleAssetPackRequests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    className={`synergi-review-item ${selectedAssetPack?.id === request.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedAssetPackId(request.id)}
                  >
                    <div className="synergi-review-item-top">
                      <strong>{request.title}</strong>
                      <span className={`synergi-review-badge is-${request.status}`}>{t(`workspaceAssetPackStatus_${request.status}`)}</span>
                    </div>
                    <p>{request.partner_full_name}</p>
                    <small>
                      {request.partner_company_name || request.workspace_display_name || request.partner_email}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="synergi-panel synergi-review-detail-panel synergi-ops-detail-panel">
            <div className="synergi-review-section-head">
              <h3>{t('opsDetailTitle')}</h3>
              <p>{t('opsDetailSubtitle')}</p>
            </div>

            {!selectedAssetPack ? (
              <div className="synergi-review-empty">{t('opsDetailEmpty')}</div>
            ) : (
              <div className="synergi-review-detail">
                <div className="synergi-review-meta-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('opsPartner')}</span>
                    <strong>{selectedAssetPack.partner_full_name}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceCompany')}</span>
                    <strong>{selectedAssetPack.partner_company_name || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldEmail')}</span>
                    <strong>{selectedAssetPack.partner_email}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('opsWorkspace')}</span>
                    <strong>{selectedAssetPack.workspace_display_name || t('reviewValueMissing')}</strong>
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('workspaceAssetPackTitle')}</span>
                  <p>{selectedAssetPack.title}</p>
                </div>

                <div className="synergi-review-meta-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceAssetPackStatus')}</span>
                    <strong>{t(`workspaceAssetPackStatus_${selectedAssetPack.status}`)}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceAssetPackNeededBy')}</span>
                    <strong>{selectedAssetPack.needed_by_label || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('workspaceAssetPackRegion')}</span>
                    <strong>{selectedAssetPack.target_region || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('opsResolvedAt')}</span>
                    <strong>{selectedAssetPack.resolved_at ? formatDate(selectedAssetPack.resolved_at, language) : t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldReviewer')}</span>
                    <strong>{selectedAssetPack.reviewed_by || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('opsDeliveredAssetId')}</span>
                    <strong>{selectedAssetPack.delivered_asset_id || t('reviewValueMissing')}</strong>
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('workspaceAssetPackRequestedAssetsLabel')}</span>
                  <p>{toList(selectedAssetPack.requested_assets).join(', ') || t('reviewValueMissing')}</p>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('reviewNotesLabel')}</span>
                  <textarea
                    className="synergi-input synergi-textarea synergi-review-notes"
                    value={assetPackNotes}
                    onChange={(event) => setAssetPackNotes(event.target.value)}
                    placeholder={t('opsNotesPlaceholder')}
                    disabled={assetPackBusyId !== null}
                  />
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('opsFulfillmentSectionTitle')}</span>
                  <p>{t('opsFulfillmentSectionSubtitle')}</p>
                  <div className="synergi-form synergi-ops-fulfillment-grid">
                    <input
                      className="synergi-input"
                      value={fulfillmentForm.title}
                      onChange={(event) => setFulfillmentForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder={t('opsFulfillmentTitleField')}
                      disabled={assetPackBusyId !== null}
                    />
                    <input
                      className="synergi-input"
                      value={fulfillmentForm.description}
                      onChange={(event) => setFulfillmentForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder={t('opsFulfillmentDescriptionField')}
                      disabled={assetPackBusyId !== null}
                    />
                    <div className="synergi-two-cols">
                      <select
                        className="synergi-select"
                        value={fulfillmentForm.assetKind}
                        onChange={(event) =>
                          setFulfillmentForm((current) => ({
                            ...current,
                            assetKind: event.target.value as PartnerAssetRecord['asset_kind'],
                          }))
                        }
                        disabled={assetPackBusyId !== null}
                      >
                        {ASSET_KINDS.map((assetKind) => (
                          <option key={assetKind} value={assetKind}>
                            {assetKind}
                          </option>
                        ))}
                      </select>
                      <select
                        className="synergi-select"
                        value={fulfillmentForm.accessLevel}
                        onChange={(event) =>
                          setFulfillmentForm((current) => ({
                            ...current,
                            accessLevel: event.target.value as PartnerAssetRecord['access_level'],
                          }))
                        }
                        disabled={assetPackBusyId !== null}
                      >
                        {ACCESS_LEVELS.map((accessLevel) => (
                          <option key={accessLevel} value={accessLevel}>
                            {accessLevel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      className="synergi-input"
                      value={fulfillmentForm.assetUrl}
                      onChange={(event) => setFulfillmentForm((current) => ({ ...current, assetUrl: event.target.value }))}
                      placeholder={t('opsFulfillmentUrlField')}
                      disabled={assetPackBusyId !== null}
                    />
                    <select
                      className="synergi-select"
                      value={fulfillmentForm.contentFormat}
                      onChange={(event) =>
                        setFulfillmentForm((current) => ({
                          ...current,
                          contentFormat: event.target.value as PartnerAssetRecord['content_format'],
                        }))
                      }
                      disabled={assetPackBusyId !== null}
                    >
                      {CONTENT_FORMATS.map((contentFormat) => (
                        <option key={contentFormat} value={contentFormat}>
                          {contentFormat}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className="synergi-input synergi-textarea synergi-review-notes"
                      value={fulfillmentForm.assetBody}
                      onChange={(event) => setFulfillmentForm((current) => ({ ...current, assetBody: event.target.value }))}
                      placeholder={t('opsFulfillmentBodyField')}
                      disabled={assetPackBusyId !== null}
                    />
                  </div>
                </div>

                <div className="synergi-review-actions synergi-ops-actions">
                  <button
                    type="button"
                    className="synergi-button synergi-review-action"
                    onClick={() => void handleAssetPackUpdate(selectedAssetPack.status)}
                    disabled={assetPackBusyId !== null}
                  >
                    {assetPackBusyId === selectedAssetPack.id ? t('opsSaving') : t('opsSaveNotes')}
                  </button>
                  {(['reviewing', 'fulfilled', 'declined'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`synergi-button synergi-review-action is-${status}`}
                      onClick={() => void handleAssetPackUpdate(status)}
                      disabled={assetPackBusyId !== null}
                    >
                      {assetPackBusyId === selectedAssetPack.id ? t('opsSaving') : t(`workspaceAssetPackStatus_${status}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
