'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Activity, RefreshCcw, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react'
import { SynergiUiToggles } from '@/components/synergi/SynergiUiToggles'
import { useI18n } from '@/lib/i18n'
import type { SynergiAuditEventRecord, SynergiObservabilitySummary, SynergiReleaseCheckRecord, SynergiReleaseCheckSummary } from '@/lib/synergi-security'

type ObservabilityResponse = {
  ok: true
  summary: SynergiObservabilitySummary
  events: SynergiAuditEventRecord[]
}

type ReleaseChecksResponse = {
  ok: true
  summary: SynergiReleaseCheckSummary
  items: SynergiReleaseCheckRecord[]
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

function formatNumber(language: string, value: number) {
  return new Intl.NumberFormat(language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES').format(value)
}

function getSeverityTone(status: SynergiReleaseCheckRecord['status']) {
  switch (status) {
    case 'failed':
      return 'critical'
    case 'warning':
      return 'warning'
    default:
      return 'success'
  }
}

export function PartnerObservabilityDashboard(props: { canCreateReleaseChecks: boolean }) {
  const { language, t } = useI18n()
  const [observability, setObservability] = useState<ObservabilityResponse | null>(null)
  const [releaseChecks, setReleaseChecks] = useState<ReleaseChecksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittingRelease, setSubmittingRelease] = useState(false)
  const [releaseForm, setReleaseForm] = useState({
    releaseName: '',
    releaseChannel: 'production',
    environment: 'vercel',
    status: 'passed' as SynergiReleaseCheckRecord['status'],
    smokeSummary: '',
  })
  const [releaseNotice, setReleaseNotice] = useState<string | null>(null)
  const [releaseError, setReleaseError] = useState<string | null>(null)

  const loadDashboard = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [observabilityResponse, releaseResponse] = await Promise.all([
        fetch('/api/admin/observability/summary', { cache: 'no-store' }),
        fetch('/api/admin/observability/release-checks?limit=10', { cache: 'no-store' }),
      ])

      const observabilityBody = (await observabilityResponse.json().catch(() => null)) as ObservabilityResponse | { error?: string } | null
      const releaseBody = (await releaseResponse.json().catch(() => null)) as ReleaseChecksResponse | { error?: string } | null

      if (!observabilityResponse.ok || !observabilityBody || !('ok' in observabilityBody)) {
        throw new Error((observabilityBody && 'error' in observabilityBody && observabilityBody.error) || t('observabilityLoadError'))
      }

      if (!releaseResponse.ok || !releaseBody || !('ok' in releaseBody)) {
        throw new Error((releaseBody && 'error' in releaseBody && releaseBody.error) || t('observabilityLoadError'))
      }

      setObservability(observabilityBody)
      setReleaseChecks(releaseBody)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('observabilityLoadError'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    void loadDashboard(false)
  }, [loadDashboard])

  const releaseSummaryCards = useMemo(() => {
    if (!releaseChecks) return []

    return [
      {
        label: t('observabilityReleaseTotal'),
        value: releaseChecks.summary.totalLast30d,
      },
      {
        label: t('observabilityReleasePassed'),
        value: releaseChecks.summary.passedLast30d,
      },
      {
        label: t('observabilityReleaseWarning'),
        value: releaseChecks.summary.warningLast30d,
      },
      {
        label: t('observabilityReleaseFailed'),
        value: releaseChecks.summary.failedLast30d,
      },
    ]
  }, [releaseChecks, t])

  async function handleReleaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingRelease(true)
    setReleaseError(null)
    setReleaseNotice(null)

    try {
      const response = await fetch('/api/admin/observability/release-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(releaseForm),
      })
      const body = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(body?.error || t('observabilityReleaseError'))
      }

      setReleaseNotice(t('observabilityReleaseSaved'))
      setReleaseForm((current) => ({ ...current, releaseName: '', smokeSummary: '' }))
      await loadDashboard(true)
    } catch (submitError) {
      setReleaseError(submitError instanceof Error ? submitError.message : t('observabilityReleaseError'))
    } finally {
      setSubmittingRelease(false)
    }
  }

  const summaryCards = useMemo(() => {
    if (!observability) return []

    return [
      { label: t('observabilityAudit24h'), value: observability.summary.auditEventsLast24h },
      { label: t('observabilityCritical24h'), value: observability.summary.criticalEventsLast24h },
      { label: t('observabilityWarnings24h'), value: observability.summary.warningEventsLast24h },
      { label: t('observabilityPendingAdmissions'), value: observability.summary.pendingAdmissions },
      { label: t('observabilityOpenReferrals'), value: observability.summary.pendingReferrals },
      { label: t('observabilityOpenAssetPacks'), value: observability.summary.pendingAssetPackRequests },
    ]
  }, [observability, t])

  return (
    <main className="synergi-page synergi-observability-page">
      <div className="synergi-noise" />
      <div className="synergi-shell synergi-observability-shell">
        <div className="synergi-topbar">
          <a href="/partner-admissions" className="synergi-backlink">
            ← {t('backToAdmin')}
          </a>
          <div className="synergi-brand">
            <div className="synergi-brand-badge">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="synergi-brand-name">{t('observabilityBrandLine')}</p>
              <p className="synergi-brand-line">{t('observabilitySubtitle')}</p>
            </div>
          </div>
          <SynergiUiToggles />
        </div>

        <section className="synergi-panel synergi-observability-hero">
          <div className="synergi-section-intro">
            <div className="synergi-section-icon">
              <ShieldAlert size={22} />
            </div>
            <div>
              <p className="synergi-kicker">{t('observabilityEyebrow')}</p>
              <h1 className="synergi-title">{t('observabilityTitle')}</h1>
              <p className="synergi-section-copy">{t('observabilitySubtitle')}</p>
            </div>
          </div>
          <div className="synergi-admin-analytics-meta">
            <span>{t('observabilityGeneratedAt')}</span>
            <strong>{observability ? formatDateTime(observability.summary.generatedAt, language) : '—'}</strong>
            <button type="button" className="synergi-button" onClick={() => void loadDashboard(true)} disabled={loading || refreshing}>
              <RefreshCcw size={16} />
              {refreshing ? t('observabilityRefreshing') : t('observabilityRefresh')}
            </button>
          </div>
        </section>

        {error ? <p className="synergi-notice">{error}</p> : null}

        <section className="synergi-admin-analytics-grid synergi-admin-analytics-grid--dense">
          {summaryCards.map((card) => (
            <article key={card.label} className="synergi-panel synergi-admin-analytics-card">
              <span>{card.label}</span>
              <strong>{formatNumber(language, card.value)}</strong>
            </article>
          ))}
        </section>

        <section className="synergi-observability-layout">
          <article className="synergi-panel synergi-observability-section">
            <div className="synergi-admin-analytics-section-head">
              <div>
                <p className="synergi-kicker">{t('observabilityAuditTitle')}</p>
                <h2>{t('observabilityAuditSubtitle')}</h2>
              </div>
            </div>
            <div className="synergi-admin-analytics-feed">
              {observability?.events.length ? (
                observability.events.map((event) => (
                  <article key={event.id} className={`synergi-admin-analytics-feed-item is-${event.status_code && event.status_code >= 500 ? 'critical' : event.status_code && event.status_code >= 400 ? 'warning' : 'info'}`}>
                    <div className="synergi-admin-analytics-feed-head">
                      <div>
                        <strong>{event.event_type}</strong>
                        <p>
                          {event.actor_type}
                          {event.actor_identifier ? ` · ${event.actor_identifier}` : ''}
                          {event.endpoint ? ` · ${event.endpoint}` : ''}
                        </p>
                      </div>
                      <Activity size={16} />
                    </div>
                    <p>{event.details && Object.keys(event.details).length ? JSON.stringify(event.details) : t('reviewValueMissing')}</p>
                    <small>{formatDateTime(event.created_at, language)}</small>
                  </article>
                ))
              ) : (
                <p className="synergi-notice">{t('observabilityAuditEmpty')}</p>
              )}
            </div>
          </article>

          <aside className="synergi-observability-side">
            <article className="synergi-panel synergi-observability-section">
              <div className="synergi-admin-analytics-section-head">
                <div>
                  <p className="synergi-kicker">{t('observabilityReleaseTitle')}</p>
                  <h2>{t('observabilityReleaseSubtitle')}</h2>
                </div>
              </div>

              <div className="synergi-admin-analytics-grid synergi-admin-analytics-grid--compact">
                {releaseSummaryCards.map((card) => (
                  <article key={card.label} className="synergi-panel synergi-admin-analytics-card synergi-admin-analytics-card--compact">
                    <span>{card.label}</span>
                    <strong>{formatNumber(language, card.value)}</strong>
                  </article>
                ))}
              </div>

              {props.canCreateReleaseChecks ? (
                <form className="synergi-form synergi-observability-form" onSubmit={(event) => void handleReleaseSubmit(event)}>
                  <p className="synergi-kicker">{t('observabilityReleaseFormTitle')}</p>
                  <p className="synergi-section-copy">{t('observabilityReleaseFormSubtitle')}</p>
                  <input
                    className="synergi-input"
                    value={releaseForm.releaseName}
                    onChange={(event) => setReleaseForm((current) => ({ ...current, releaseName: event.target.value }))}
                    placeholder={t('observabilityReleaseName')}
                    disabled={submittingRelease}
                  />
                  <div className="synergi-two-cols">
                    <input
                      className="synergi-input"
                      value={releaseForm.releaseChannel}
                      onChange={(event) => setReleaseForm((current) => ({ ...current, releaseChannel: event.target.value }))}
                      placeholder={t('observabilityReleaseChannel')}
                      disabled={submittingRelease}
                    />
                    <input
                      className="synergi-input"
                      value={releaseForm.environment}
                      onChange={(event) => setReleaseForm((current) => ({ ...current, environment: event.target.value }))}
                      placeholder={t('observabilityReleaseEnvironment')}
                      disabled={submittingRelease}
                    />
                  </div>
                  <select
                    className="synergi-select"
                    value={releaseForm.status}
                    onChange={(event) => setReleaseForm((current) => ({ ...current, status: event.target.value as SynergiReleaseCheckRecord['status'] }))}
                    disabled={submittingRelease}
                  >
                    <option value="passed">{t('observabilityStatusPassed')}</option>
                    <option value="warning">{t('observabilityStatusWarning')}</option>
                    <option value="failed">{t('observabilityStatusFailed')}</option>
                  </select>
                  <textarea
                    className="synergi-input synergi-textarea"
                    value={releaseForm.smokeSummary}
                    onChange={(event) => setReleaseForm((current) => ({ ...current, smokeSummary: event.target.value }))}
                    placeholder={t('observabilityReleaseSmokeSummary')}
                    disabled={submittingRelease}
                  />
                  {releaseNotice ? <p className="synergi-notice synergi-notice-success">{releaseNotice}</p> : null}
                  {releaseError ? <p className="synergi-notice">{releaseError}</p> : null}
                  <button type="submit" className="synergi-button" disabled={submittingRelease}>
                    {submittingRelease ? t('observabilityReleaseSubmitting') : t('observabilityReleaseSubmit')}
                  </button>
                </form>
              ) : null}
            </article>

            <article className="synergi-panel synergi-observability-section">
              <div className="synergi-admin-analytics-section-head">
                <div>
                  <p className="synergi-kicker">{t('observabilityReleaseChecksTitle')}</p>
                  <h2>{t('observabilityReleaseChecksSubtitle')}</h2>
                </div>
              </div>
              <div className="synergi-admin-analytics-feed">
                {releaseChecks?.items.length ? (
                  releaseChecks.items.map((item) => (
                    <article key={item.id} className={`synergi-admin-analytics-feed-item is-${getSeverityTone(item.status)}`}>
                      <div className="synergi-admin-analytics-feed-head">
                        <div>
                          <strong>{item.release_name}</strong>
                          <p>
                            {item.release_channel}
                            {item.environment ? ` · ${item.environment}` : ''}
                          </p>
                        </div>
                        <TriangleAlert size={16} />
                      </div>
                      <p>{item.smoke_summary || t('reviewValueMissing')}</p>
                      <small>
                        {item.checked_by ? `${item.checked_by} · ` : ''}
                        {formatDateTime(item.created_at, language)}
                      </small>
                    </article>
                  ))
                ) : (
                  <p className="synergi-notice">{t('observabilityReleaseEmpty')}</p>
                )}
              </div>
            </article>
          </aside>
        </section>

        {loading && !observability ? <p className="synergi-notice">{t('observabilityLoading')}</p> : null}
      </div>
    </main>
  )
}
