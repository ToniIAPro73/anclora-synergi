'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart3, BellRing, RefreshCcw, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { SynergiUiToggles } from '@/components/synergi/SynergiUiToggles'
import { useI18n } from '@/lib/i18n'
import type { PartnerAdmissionsAnalyticsRecord } from '@/lib/partner-admissions-store'
import type { PartnerWorkspaceAnalyticsRecord } from '@/lib/partner-workspace-store'

type AdminAnalyticsResponse = {
  ok: true
  generatedAt: string
  admissions: PartnerAdmissionsAnalyticsRecord
  workspace: PartnerWorkspaceAnalyticsRecord
}

function formatNumber(language: string, value: number) {
  return new Intl.NumberFormat(language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES').format(value)
}

function formatPercent(language: string, value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return `${new Intl.NumberFormat(language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES', {
    maximumFractionDigits: 1,
  }).format(value * 100)}%`
}

function formatDateTime(value: string, language: string) {
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatSimpleDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
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

function severityLabel(kind: PartnerWorkspaceAnalyticsRecord['recentActivity'][number]['event_type']) {
  switch (kind) {
    case 'asset_pack_fulfilled':
      return 'success'
    case 'asset_pack_requested':
    case 'referral_submitted':
      return 'warning'
    case 'profile_updated':
    case 'asset_downloaded':
    case 'asset_published':
    case 'asset_reviewed':
    case 'opportunity_created':
    case 'opportunity_updated':
    case 'referral_status_updated':
      return 'info'
    default:
      return 'info'
  }
}

export function AdminAnalyticsDashboard() {
  const { language, t } = useI18n()
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/analytics?days=30&recentLimit=10', { cache: 'no-store' })
      const body = (await response.json().catch(() => null)) as AdminAnalyticsResponse | { error?: string } | null

      if (!response.ok || !body || !('ok' in body)) {
        throw new Error((body && 'error' in body && body.error) || t('analyticsLoadError'))
      }

      setData(body)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('analyticsLoadError'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    void loadAnalytics(false)
  }, [loadAnalytics])

  const funnelCards = useMemo(() => {
    if (!data) return []

    return [
      {
        label: t('analyticsMetricSubmissionsTotal'),
        value: data.admissions.funnel.total_submissions,
        help: t('analyticsMetricSubmissionsHelp'),
      },
      {
        label: t('analyticsMetricReviewRate'),
        value: formatPercent(language, data.admissions.funnel.review_rate),
        help: t('analyticsMetricReviewRateHelp'),
      },
      {
        label: t('analyticsMetricAcceptanceRate'),
        value: formatPercent(language, data.admissions.funnel.acceptance_rate),
        help: t('analyticsMetricAcceptanceRateHelp'),
      },
      {
        label: t('analyticsMetricActivationRate'),
        value: formatPercent(language, data.admissions.funnel.activation_rate),
        help: t('analyticsMetricActivationRateHelp'),
      },
      {
        label: t('analyticsMetricWorkspaceRate'),
        value: formatPercent(language, data.admissions.funnel.active_workspace_rate),
        help: t('analyticsMetricWorkspaceRateHelp'),
      },
      {
        label: t('analyticsMetricReviewHours'),
        value: data.admissions.funnel.avg_review_hours === null ? '—' : `${data.admissions.funnel.avg_review_hours}`,
        help: t('analyticsMetricReviewHoursHelp'),
      },
      {
        label: t('analyticsMetricActivationHours'),
        value: data.admissions.funnel.avg_activation_hours === null ? '—' : `${data.admissions.funnel.avg_activation_hours}`,
        help: t('analyticsMetricActivationHoursHelp'),
      },
    ]
  }, [data, language, t])

  const workspaceCards = useMemo(() => {
    if (!data) return []

    const metrics = data.workspace.metrics
    return [
      {
        label: t('analyticsMetricPartnersTotal'),
        value: metrics.partners_total,
        help: t('analyticsMetricPartnersTotalHelp'),
      },
      {
        label: t('analyticsMetricPartnersActive'),
        value: metrics.active_partners,
        help: t('analyticsMetricPartnersActiveHelp'),
      },
      {
        label: t('analyticsMetricWorkspacesActive'),
        value: metrics.workspaces_active,
        help: t('analyticsMetricWorkspacesActiveHelp'),
      },
      {
        label: t('analyticsMetricActivePartners30d'),
        value: metrics.active_partners_30d,
        help: t('analyticsMetricActivePartners30dHelp'),
      },
      {
        label: t('analyticsMetricActiveWorkspaces30d'),
        value: metrics.active_workspaces_30d,
        help: t('analyticsMetricActiveWorkspaces30dHelp'),
      },
      {
        label: t('analyticsMetricAvgProfile'),
        value: metrics.avg_profile_completeness === null ? '—' : formatPercent(language, metrics.avg_profile_completeness),
        help: t('analyticsMetricAvgProfileHelp'),
      },
      {
        label: t('analyticsMetricDownloadsTotal'),
        value: metrics.downloads_total,
        help: t('analyticsMetricDownloadsTotalHelp'),
      },
      {
        label: t('analyticsMetricAssetsCurrent'),
        value: metrics.assets_current,
        help: t('analyticsMetricAssetsCurrentHelp'),
      },
      {
        label: t('analyticsMetricAssetsRetired'),
        value: metrics.assets_retired,
        help: t('analyticsMetricAssetsRetiredHelp'),
      },
      {
        label: t('analyticsMetricAssetsVersioned'),
        value: metrics.assets_versioned,
        help: t('analyticsMetricAssetsVersionedHelp'),
      },
      {
        label: t('analyticsMetricActivityTotal'),
        value: metrics.activity_total,
        help: t('analyticsMetricActivityTotalHelp'),
      },
      {
        label: t('analyticsMetricReferralsOwned'),
        value: metrics.referrals_owned,
        help: t('analyticsMetricReferralsOwnedHelp'),
      },
      {
        label: t('analyticsMetricReferralsOpen'),
        value: metrics.referrals_open,
        help: t('analyticsMetricReferralsOpenHelp'),
      },
      {
        label: t('analyticsMetricAssetPacksOpen'),
        value: metrics.asset_packs_open,
        help: t('analyticsMetricAssetPacksOpenHelp'),
      },
      {
        label: t('analyticsMetricAssetPacksDelivered'),
        value: metrics.asset_packs_delivered,
        help: t('analyticsMetricAssetPacksDeliveredHelp'),
      },
      {
        label: t('analyticsMetricOpportunitiesActive'),
        value: metrics.opportunities_active,
        help: t('analyticsMetricOpportunitiesActiveHelp'),
      },
    ]
  }, [data, language, t])

  const maxTimelineValue = useMemo(() => {
    if (!data) return 0
    return Math.max(...data.workspace.timeline.map((item) => item.activity_total), 1)
  }, [data])

  const generatedAt = data ? formatDateTime(data.generatedAt, language) : null

  return (
    <main className="synergi-page synergi-admin-analytics-page">
      <div className="synergi-noise" />
      <div className="synergi-shell synergi-admin-analytics-shell">
        <div className="synergi-topbar synergi-admin-analytics-topbar">
          <Link href="/partner-admissions" className="synergi-backlink">
            ← {t('backToAdmin')}
          </Link>
          <div className="synergi-brand">
            <div className="synergi-brand-badge">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="synergi-brand-name">{t('analyticsBrandLine')}</p>
              <p className="synergi-brand-line">{t('analyticsSubtitle')}</p>
            </div>
          </div>
          <SynergiUiToggles />
        </div>

        <section className="synergi-panel synergi-admin-analytics-hero">
          <div className="synergi-admin-analytics-hero-head">
            <div className="synergi-section-intro">
              <div className="synergi-section-icon">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="synergi-kicker">{t('analyticsEyebrow')}</p>
                <h1 className="synergi-title synergi-admin-analytics-title">{t('analyticsTitle')}</h1>
                <p className="synergi-section-copy">{t('analyticsSubtitle')}</p>
              </div>
            </div>
            <div className="synergi-admin-analytics-meta">
              <span>{t('analyticsGeneratedAt')}</span>
              <strong>{generatedAt || '—'}</strong>
              <button type="button" className="synergi-button synergi-admin-analytics-refresh" onClick={() => void loadAnalytics(true)} disabled={loading || refreshing}>
                <RefreshCcw size={16} />
                {refreshing ? t('analyticsRefreshing') : t('analyticsRefresh')}
              </button>
            </div>
          </div>

          {error ? <p className="synergi-notice">{error}</p> : null}

          <div className="synergi-hero-pills synergi-admin-analytics-pills">
            <span>{t('analyticsMetricSubmissionsTotal')}: {data ? formatNumber(language, data.admissions.funnel.total_submissions) : '—'}</span>
            <span>{t('analyticsMetricPartnersActive')}: {data ? formatNumber(language, data.workspace.metrics.active_partners) : '—'}</span>
            <span>{t('analyticsMetricDownloadsTotal')}: {data ? formatNumber(language, data.workspace.metrics.downloads_total) : '—'}</span>
            <span>{t('analyticsMetricAssetsCurrent')}: {data ? formatNumber(language, data.workspace.metrics.assets_current) : '—'}</span>
            <span>{t('analyticsMetricActivityTotal')}: {data ? formatNumber(language, data.workspace.metrics.activity_total) : '—'}</span>
          </div>
        </section>

        <section className="synergi-admin-analytics-section">
          <div className="synergi-admin-analytics-section-head">
            <div>
              <p className="synergi-kicker">{t('analyticsFunnelTitle')}</p>
              <h2>{t('analyticsFunnelSubtitle')}</h2>
            </div>
          </div>
          <div className="synergi-admin-analytics-grid synergi-admin-analytics-grid--dense">
            {funnelCards.map((card) => (
              <article key={card.label} className="synergi-panel synergi-admin-analytics-card">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.help}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="synergi-admin-analytics-layout">
          <div className="synergi-admin-analytics-main">
            <article className="synergi-panel synergi-admin-analytics-section">
              <div className="synergi-admin-analytics-section-head">
                <div>
                  <p className="synergi-kicker">{t('analyticsTimelineTitle')}</p>
                  <h2>{t('analyticsTimelineSubtitle')}</h2>
                </div>
                <div className="synergi-admin-analytics-badge">
                  <TrendingUp size={16} />
                  {t('analyticsMetricActivityTotal')}: {data ? formatNumber(language, data.workspace.metrics.activity_total) : '—'}
                </div>
              </div>

              <div className="synergi-admin-analytics-timeline">
                {data?.workspace.timeline.map((point) => {
                  const barWidth = `${Math.max(8, (point.activity_total / maxTimelineValue) * 100)}%`
                  return (
                    <div key={point.day} className="synergi-admin-analytics-timeline-row">
                      <div className="synergi-admin-analytics-timeline-label">
                        <strong>{formatSimpleDate(point.day, language)}</strong>
                        <span>{formatNumber(language, point.activity_total)} {t('analyticsMetricActivityTotal')}</span>
                      </div>
                      <div className="synergi-admin-analytics-timeline-track">
                        <span className="synergi-admin-analytics-timeline-bar" style={{ width: barWidth }} />
                      </div>
                      <div className="synergi-admin-analytics-timeline-stats">
                        <span>{t('workspaceReportingDownloads')}: {point.asset_downloads}</span>
                        <span>{t('workspaceReportingReferrals')}: {point.referral_submissions}</span>
                        <span>{t('workspaceReportingAssetPacks')}: {point.asset_pack_requests}</span>
                        <span>{t('workspaceReportingOpportunities')}: {point.opportunity_updates}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="synergi-panel synergi-admin-analytics-section">
              <div className="synergi-admin-analytics-section-head">
                <div>
                  <p className="synergi-kicker">{t('analyticsTopPartnersTitle')}</p>
                  <h2>{t('analyticsTopPartnersSubtitle')}</h2>
                </div>
              </div>

              <div className="synergi-admin-analytics-partner-list">
                {data?.workspace.topPartners.length ? (
                  data.workspace.topPartners.map((partner) => (
                    <article key={partner.partner_account_id} className="synergi-admin-analytics-partner-card">
                      <div className="synergi-admin-analytics-partner-head">
                        <div>
                          <strong>{partner.partner_name}</strong>
                          <p>{partner.company_name || partner.workspace_display_name || t('reviewValueMissing')}</p>
                        </div>
                        <div className="synergi-admin-analytics-partner-pill">
                          {t(getFocusLabelKey(partner.focus_label))}
                        </div>
                      </div>
                      <div className="synergi-admin-analytics-partner-grid">
                        <span>{t('workspaceReportingProfileScore')}: {partner.profile_completeness}%</span>
                        <span>{t('analyticsMetricDownloadsTotal')}: {partner.total_downloads}</span>
                        <span>{t('analyticsMetricAssetsCurrent')}: {partner.assets_current}</span>
                        <span>{t('analyticsMetricAssetsRetired')}: {partner.assets_retired}</span>
                        <span>{t('analyticsMetricReferralsOpen')}: {partner.referrals_open}</span>
                        <span>{t('analyticsMetricReferralsOwned')}: {partner.referrals_owned}</span>
                        <span>{t('analyticsMetricAssetPacksOpen')}: {partner.asset_packs_open}</span>
                        <span>{t('analyticsMetricAssetPacksDelivered')}: {partner.asset_packs_delivered}</span>
                        <span>{t('analyticsMetricOpportunitiesActive')}: {partner.opportunities_active}</span>
                        <span>{t('analyticsMetricActivityTotal')}: {partner.activity_total}</span>
                      </div>
                      <small>
                        {partner.last_activity_at
                          ? `${t('workspaceReportingActivity')} · ${formatDateTime(partner.last_activity_at, language)}`
                          : t('reviewValueMissing')}
                      </small>
                    </article>
                  ))
                ) : (
                  <p className="synergi-notice">{t('analyticsEmpty')}</p>
                )}
              </div>
            </article>
          </div>

          <aside className="synergi-admin-analytics-side">
            <article className="synergi-panel synergi-admin-analytics-section">
              <div className="synergi-admin-analytics-section-head">
                <div>
                  <p className="synergi-kicker">{t('analyticsWorkspaceTitle')}</p>
                  <h2>{t('analyticsWorkspaceSubtitle')}</h2>
                </div>
                <div className="synergi-admin-analytics-badge">
                  <Users size={16} />
                  {t('analyticsMetricPartnersTotal')}: {data ? formatNumber(language, data.workspace.metrics.partners_total) : '—'}
                </div>
              </div>

              <div className="synergi-admin-analytics-grid synergi-admin-analytics-grid--compact">
                {workspaceCards.map((card) => (
                  <article key={card.label} className="synergi-panel synergi-admin-analytics-card synergi-admin-analytics-card--compact">
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <small>{card.help}</small>
                  </article>
                ))}
              </div>
            </article>

            <article className="synergi-panel synergi-admin-analytics-section">
              <div className="synergi-admin-analytics-section-head">
                <div>
                  <p className="synergi-kicker">{t('analyticsRecentActivityTitle')}</p>
                  <h2>{t('analyticsRecentActivitySubtitle')}</h2>
                </div>
              </div>

              <div className="synergi-admin-analytics-feed">
                {data?.workspace.recentActivity.length ? (
                  data.workspace.recentActivity.map((event) => (
                    <article key={event.id} className={`synergi-admin-analytics-feed-item is-${severityLabel(event.event_type)}`}>
                      <div className="synergi-admin-analytics-feed-head">
                        <div>
                          <strong>{event.title}</strong>
                          <p>
                            {event.partner_name}
                            {event.company_name ? ` · ${event.company_name}` : ''}
                          </p>
                        </div>
                        <BellRing size={16} />
                      </div>
                      <p>{event.description || t('reviewValueMissing')}</p>
                      <small>{formatDateTime(event.created_at, language)}</small>
                    </article>
                  ))
                ) : (
                  <p className="synergi-notice">{t('analyticsEmpty')}</p>
                )}
              </div>
            </article>
          </aside>
        </section>

        {loading && !data ? <p className="synergi-notice">{t('analyticsLoading')}</p> : null}
      </div>
    </main>
  )
}
