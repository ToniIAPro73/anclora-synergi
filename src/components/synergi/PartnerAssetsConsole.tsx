'use client'

import { useEffect, useMemo, useState } from 'react'
import { Boxes, RefreshCcw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { AdminPublishedPartnerAssetRecord, PartnerAssetRecord } from '@/lib/partner-workspace-store'

type AssetsResponse = {
  items: AdminPublishedPartnerAssetRecord[]
  total: number
}

const ASSET_LIFECYCLE_FILTERS = ['all', 'active', 'archived', 'superseded'] as const

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

export function PartnerAssetsConsole() {
  const { language, t } = useI18n()
  const [assets, setAssets] = useState<AdminPublishedPartnerAssetRecord[]>([])
  const [filter, setFilter] = useState<(typeof ASSET_LIFECYCLE_FILTERS)[number]>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    lifecycleStatus: 'active' as PartnerAssetRecord['lifecycle_status'],
    versionLabel: '',
    accessLevel: 'shared' as PartnerAssetRecord['access_level'],
    assetUrl: '',
    assetBody: '',
    supersededByAssetId: '',
  })

  const visibleAssets = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) return assets

    return assets.filter((asset) =>
      [
        asset.title,
        asset.description,
        asset.partner_full_name,
        asset.partner_company_name,
        asset.partner_email,
        asset.workspace_display_name,
        asset.asset_kind,
        asset.lifecycle_status,
        asset.version_label,
        asset.source_type,
      ]
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .some((value) => value.toLowerCase().includes(needle))
    )
  }, [assets, searchQuery])

  const selectedAsset = useMemo(
    () => visibleAssets.find((item) => item.id === selectedId) ?? visibleAssets[0] ?? null,
    [selectedId, visibleAssets]
  )

  useEffect(() => {
    setForm({
      title: selectedAsset?.title || '',
      description: selectedAsset?.description || '',
      lifecycleStatus: selectedAsset?.lifecycle_status || 'active',
      versionLabel: selectedAsset?.version_label || '',
      accessLevel: selectedAsset?.access_level || 'shared',
      assetUrl: selectedAsset?.asset_url || '',
      assetBody: selectedAsset?.asset_body || '',
      supersededByAssetId: selectedAsset?.superseded_by_asset_id || '',
    })
    setNotice(null)
  }, [selectedAsset])

  async function loadAssets(nextFilter = filter, showRefreshState = false) {
    if (showRefreshState) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (nextFilter !== 'all') params.set('lifecycleStatus', nextFilter)
      const response = await fetch(`/api/admin/partner-assets?${params.toString()}`, { cache: 'no-store' })
      const body = (await response.json().catch(() => null)) as AssetsResponse | { error?: string } | null

      if (!response.ok || !body || !('items' in body)) {
        throw new Error((body && 'error' in body && body.error) || t('opsLoadError'))
      }

      setAssets(body.items)
      setSelectedId((current) => {
        if (current && body.items.some((item) => item.id === current)) return current
        return body.items[0]?.id || null
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('opsLoadError'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadAssets(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function handleSave() {
    if (!selectedAsset) return

    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/admin/partner-assets/${selectedAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          lifecycleStatus: form.lifecycleStatus,
          versionLabel: form.versionLabel,
          accessLevel: form.accessLevel,
          assetUrl: form.assetUrl,
          assetBody: form.assetBody,
          supersededByAssetId: form.supersededByAssetId || null,
        }),
      })

      const body = (await response.json().catch(() => null)) as { error?: string; item?: AdminPublishedPartnerAssetRecord } | null
      if (!response.ok || !body?.item) {
        throw new Error(body?.error || t('opsSaveError'))
      }

      setAssets((current) => current.map((asset) => (asset.id === body.item!.id ? body.item! : asset)))
      setNotice(t('opsSaved'))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('opsSaveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="synergi-panel synergi-ops-panel">
      <div className="synergi-review-section-head">
        <p className="synergi-eyebrow">{t('opsEyebrow')}</p>
        <h2>{t('opsAssetsTitle')}</h2>
        <p>{t('opsAssetsSubtitle')}</p>
      </div>

      <div className="synergi-review-summary-grid synergi-ops-summary-grid">
        <article className="synergi-review-summary-card">
          <Boxes className="synergi-signal-icon" />
          <strong>{visibleAssets.length}</strong>
          <span>{t('opsSummaryTotal')}</span>
        </article>
        <article className="synergi-review-summary-card">
          <Boxes className="synergi-signal-icon is-cyan" />
          <strong>{visibleAssets.filter((asset) => asset.lifecycle_status === 'active').length}</strong>
          <span>{t('opsAssetsActive')}</span>
        </article>
        <article className="synergi-review-summary-card">
          <Boxes className="synergi-signal-icon" />
          <strong>{visibleAssets.filter((asset) => asset.lifecycle_status !== 'active').length}</strong>
          <span>{t('opsAssetsManaged')}</span>
        </article>
      </div>

      <div className="synergi-review-toolbar synergi-ops-toolbar">
        <div className="synergi-review-search synergi-ops-search">
          <input
            className="synergi-input synergi-review-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('opsAssetsSearchPlaceholder')}
          />
        </div>

        <div className="synergi-review-filters">
          {ASSET_LIFECYCLE_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              className={`synergi-review-filter ${filter === status ? 'is-active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? t('reviewStatus_all') : t(`workspaceAssetLifecycle_${status}`)}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="synergi-review-refresh"
          onClick={() => void loadAssets(filter, true)}
          disabled={refreshing}
        >
          <RefreshCcw size={16} />
          <span>{refreshing ? t('opsRefreshing') : t('opsRefresh')}</span>
        </button>
      </div>

      {error ? <p className="synergi-notice">{error}</p> : null}
      {notice ? <p className="synergi-notice synergi-notice-success">{notice}</p> : null}

      <div className="synergi-review-grid synergi-ops-grid">
        <section className="synergi-panel synergi-review-list-panel synergi-ops-list-panel">
          <div className="synergi-review-section-head">
            <h3>{t('opsListTitle')}</h3>
            <p>{t('opsAssetsListSubtitle')}</p>
          </div>

          {loading ? (
            <div className="synergi-review-empty">{t('opsLoading')}</div>
          ) : visibleAssets.length === 0 ? (
            <div className="synergi-review-empty">{t('opsEmpty')}</div>
          ) : (
            <div className="synergi-review-list">
              {visibleAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={`synergi-review-item ${selectedAsset?.id === asset.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedId(asset.id)}
                >
                  <div className="synergi-review-item-top">
                    <strong>{asset.title}</strong>
                    <span className={`synergi-review-badge is-${asset.lifecycle_status}`}>
                      {t(`workspaceAssetLifecycle_${asset.lifecycle_status}`)}
                    </span>
                  </div>
                  <p>{asset.partner_full_name}</p>
                  <small>{asset.partner_company_name || asset.workspace_display_name || asset.partner_email}</small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="synergi-panel synergi-review-detail-panel synergi-ops-detail-panel">
          <div className="synergi-review-section-head">
            <h3>{t('opsDetailTitle')}</h3>
            <p>{t('opsAssetsDetailSubtitle')}</p>
          </div>

          {!selectedAsset ? (
            <div className="synergi-review-empty">{t('opsDetailEmpty')}</div>
          ) : (
            <div className="synergi-review-detail">
              <div className="synergi-review-meta-grid">
                <div className="synergi-review-meta-card">
                  <span>{t('opsPartner')}</span>
                  <strong>{selectedAsset.partner_full_name}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceCompany')}</span>
                  <strong>{selectedAsset.partner_company_name || t('reviewValueMissing')}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('opsWorkspace')}</span>
                  <strong>{selectedAsset.workspace_display_name || t('reviewValueMissing')}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('opsResolvedAt')}</span>
                  <strong>{formatDate(selectedAsset.published_at || selectedAsset.updated_at, language)}</strong>
                </div>
              </div>

              <div className="synergi-form synergi-ops-fulfillment-grid">
                <input
                  className="synergi-input"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder={t('opsAssetTitleField')}
                  disabled={saving}
                />
                <input
                  className="synergi-input"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder={t('opsAssetDescriptionField')}
                  disabled={saving}
                />
                <div className="synergi-two-cols">
                  <select
                    className="synergi-select"
                    value={form.lifecycleStatus}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        lifecycleStatus: event.target.value as PartnerAssetRecord['lifecycle_status'],
                      }))
                    }
                    disabled={saving}
                  >
                    {(['active', 'archived', 'superseded'] as const).map((status) => (
                      <option key={status} value={status}>
                        {t(`workspaceAssetLifecycle_${status}`)}
                      </option>
                    ))}
                  </select>
                  <select
                    className="synergi-select"
                    value={form.accessLevel}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        accessLevel: event.target.value as PartnerAssetRecord['access_level'],
                      }))
                    }
                    disabled={saving}
                  >
                    {(['private', 'shared'] as const).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="synergi-two-cols">
                  <input
                    className="synergi-input"
                    value={form.versionLabel}
                    onChange={(event) => setForm((current) => ({ ...current, versionLabel: event.target.value }))}
                    placeholder={t('opsAssetVersionField')}
                    disabled={saving}
                  />
                  <input
                    className="synergi-input"
                    value={form.supersededByAssetId}
                    onChange={(event) => setForm((current) => ({ ...current, supersededByAssetId: event.target.value }))}
                    placeholder={t('opsAssetSupersededByField')}
                    disabled={saving}
                  />
                </div>
                <input
                  className="synergi-input"
                  value={form.assetUrl}
                  onChange={(event) => setForm((current) => ({ ...current, assetUrl: event.target.value }))}
                  placeholder={t('opsFulfillmentUrlField')}
                  disabled={saving}
                />
                <textarea
                  className="synergi-input synergi-textarea synergi-review-notes"
                  value={form.assetBody}
                  onChange={(event) => setForm((current) => ({ ...current, assetBody: event.target.value }))}
                  placeholder={t('opsFulfillmentBodyField')}
                  disabled={saving}
                />
              </div>

              <div className="synergi-review-meta-grid">
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetSource')}</span>
                  <strong>{t(`workspaceAssetSource_${selectedAsset.source_type}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetStatus')}</span>
                  <strong>{t(`workspaceAssetStatus_${selectedAsset.review_status}`)}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetDownloads')}</span>
                  <strong>{selectedAsset.download_count}</strong>
                </div>
                <div className="synergi-review-meta-card">
                  <span>{t('workspaceAssetVersion')}</span>
                  <strong>{selectedAsset.version_label || t('reviewValueMissing')}</strong>
                </div>
              </div>

              <div className="synergi-review-actions synergi-ops-actions">
                <button
                  type="button"
                  className="synergi-button synergi-review-action"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? t('opsSaving') : t('opsSaveNotes')}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
