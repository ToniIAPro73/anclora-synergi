'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ClipboardCheck, RefreshCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { SynergiUiToggles } from '@/components/synergi/SynergiUiToggles'
import { buildAncloraGroupHref, useI18n } from '@/lib/i18n'
import { PartnerOperationsConsole } from '@/components/synergi/PartnerOperationsConsole'
import { PartnerAssetsConsole } from '@/components/synergi/PartnerAssetsConsole'

type PartnerAdmissionStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected'

type PartnerAdmissionRecord = {
  id: string
  full_name: string
  email: string
  company_name: string | null
  service_category: string
  service_summary: string
  collaboration_pitch: string | null
  coverage_areas: string[] | string | null
  languages: string[] | string | null
  sustainability_focus: boolean
  privacy_accepted: boolean
  newsletter_opt_in: boolean
  captcha_provider: string | null
  captcha_verified: boolean
  captcha_hostname: string | null
  submission_language: string
  submission_source: string
  status: PartnerAdmissionStatus
  review_notes: string | null
  decision_reason: string | null
  handoff_state: string | null
  priority_label: string | null
  assigned_to: string | null
  reviewed_at: string | null
  reviewed_by?: string | null
  created_at: string
  updated_at: string
  partner_account_id?: string | null
  partner_workspace_id?: string | null
}

type ReviewUpdateResponse = PartnerAdmissionRecord & {
  invite_code?: string
  launch_url?: string
  partner_account?: {
    id: string
    email: string
    full_name: string
    company_name: string | null
    account_status: 'invited' | 'active' | 'paused'
  }
  partner_workspace?: {
    id: string
    workspace_status: 'invited' | 'active' | 'paused'
    display_name: string
    welcome_note: string | null
  }
}

type AdmissionsResponse = {
  items: PartnerAdmissionRecord[]
  total: number
}

const REVIEW_ACTIONS: Array<Exclude<PartnerAdmissionStatus, 'submitted'>> = [
  'under_review',
  'accepted',
  'rejected',
]

function normalizeTextList(value: PartnerAdmissionRecord['coverage_areas']) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

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

export function PartnerAdmissionsReviewPage() {
  const { language, t } = useI18n()
  const [items, setItems] = useState<PartnerAdmissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<PartnerAdmissionStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [reviewNotes, setReviewNotes] = useState('')
  const [decisionReason, setDecisionReason] = useState('')
  const [handoffState, setHandoffState] = useState('in_review')
  const [priorityLabel, setPriorityLabel] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [savingStatus, setSavingStatus] = useState<PartnerAdmissionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [decisionPayload, setDecisionPayload] = useState<{
    admissionId: string
    inviteCode?: string
    launchUrl?: string
  } | null>(null)

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' })
    window.location.assign('/partner-admissions/login')
  }

  const loadAdmissions = useCallback(async (
    nextFilter = statusFilter,
    showRefreshState = false,
    query = searchQuery,
    source = sourceFilter
  ) => {
    if (showRefreshState) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (nextFilter !== 'all') params.set('status', nextFilter)
      if (query.trim()) params.set('q', query.trim())
      if (source !== 'all') params.set('source', source)
      const response = await fetch(`/api/partner-admissions?${params.toString()}`, { cache: 'no-store' })
      const body = (await response.json()) as AdmissionsResponse | { error?: string }

      if (!response.ok || !('items' in body)) {
        throw new Error(('error' in body && body.error) || t('reviewLoadError'))
      }

      setItems(body.items)
      setSelectedId((current) => {
        if (current && body.items.some((item) => item.id === current)) return current
        return body.items[0]?.id || null
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('reviewLoadError'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [searchQuery, sourceFilter, statusFilter, t])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAdmissions(statusFilter, false, searchQuery, sourceFilter)
    }, 240)

    return () => window.clearTimeout(timeout)
  }, [loadAdmissions, searchQuery, sourceFilter, statusFilter])

  const selectedAdmission = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  )

  useEffect(() => {
    setReviewNotes(selectedAdmission?.review_notes || '')
    setDecisionReason(selectedAdmission?.decision_reason || selectedAdmission?.review_notes || '')
    setHandoffState(
      selectedAdmission?.handoff_state ||
        (selectedAdmission?.status === 'accepted'
          ? 'invite_issued'
          : selectedAdmission?.status === 'rejected'
            ? 'closed'
            : 'in_review')
    )
    setPriorityLabel(selectedAdmission?.priority_label || '')
    setAssignedTo(selectedAdmission?.assigned_to || '')
    setNotice(null)
    if (decisionPayload && selectedAdmission?.id !== decisionPayload.admissionId) {
      setDecisionPayload(null)
    }
  }, [decisionPayload, selectedAdmission])

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1
        acc[item.status] += 1
        if (item.review_notes || item.decision_reason) acc.traced += 1
        if (item.handoff_state && item.handoff_state !== 'in_review') acc.handoff += 1
        return acc
      },
      {
        total: 0,
        submitted: 0,
        under_review: 0,
        accepted: 0,
        rejected: 0,
        traced: 0,
        handoff: 0,
      }
    )
  }, [items])

  const sourceOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.submission_source))).sort()
  }, [items])

  async function handleReview(status: Exclude<PartnerAdmissionStatus, 'submitted'>) {
    if (!selectedAdmission) return

    setSavingStatus(status)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/partner-admissions/${selectedAdmission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reviewNotes,
          decisionReason,
          handoffState,
          priorityLabel,
          assignedTo,
        }),
      })

      const body = (await response.json()) as ReviewUpdateResponse | { error?: string }

      if (!response.ok || !('id' in body)) {
        throw new Error(('error' in body && body.error) || t('reviewUpdateError'))
      }

      setItems((current) => current.map((item) => (item.id === body.id ? body : item)))
      if (status === 'accepted') {
        setDecisionPayload({
          admissionId: body.id,
          inviteCode: body.invite_code,
          launchUrl: body.launch_url,
        })
        setNotice(t('reviewAcceptedNotice'))
      } else {
        setDecisionPayload(null)
        setNotice(t('reviewSavedNotice'))
      }
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : t('reviewUpdateError'))
    } finally {
      setSavingStatus(null)
    }
  }

  return (
    <main className="synergi-page">
      <div className="synergi-noise" />
      <section className="synergi-shell">
        <header className="synergi-topbar">
          <Link href={buildAncloraGroupHref()} className="synergi-backlink">
            {t('backToAncloraGroup')}
          </Link>

          <div className="synergi-brand">
            <div className="synergi-brand-badge">
              <Image
                src="/brand/logo-anclora-synergi.png"
                alt="Anclora Synergi"
                width={40}
                height={40}
                className="synergi-brand-logo"
              />
            </div>
            <div>
              <p className="synergi-brand-name">ANCLORA SYNERGI</p>
              <p className="synergi-brand-line">{t('reviewBrandLine')}</p>
            </div>
          </div>

          <SynergiUiToggles />
        </header>

        <section className="synergi-panel synergi-review-hero">
          <div>
            <p className="synergi-eyebrow">{t('reviewEyebrow')}</p>
            <h1 className="synergi-title synergi-review-title">{t('reviewTitle')}</h1>
            <p className="synergi-subtitle">{t('reviewSubtitle')}</p>
          </div>

          <div className="synergi-review-summary-grid">
            <article className="synergi-review-summary-card">
              <Sparkles className="synergi-signal-icon" />
              <strong>{summary.total}</strong>
              <span>{t('reviewSummaryTotal')}</span>
            </article>
            <article className="synergi-review-summary-card">
              <ClipboardCheck className="synergi-signal-icon is-cyan" />
              <strong>{summary.submitted + summary.under_review}</strong>
              <span>{t('reviewSummaryOpen')}</span>
            </article>
            <article className="synergi-review-summary-card">
              <ShieldCheck className="synergi-signal-icon" />
              <strong>{summary.accepted}</strong>
              <span>{t('reviewSummaryAccepted')}</span>
            </article>
            <article className="synergi-review-summary-card">
              <ClipboardCheck className="synergi-signal-icon is-cyan" />
              <strong>{summary.traced}</strong>
              <span>{t('reviewSummaryTraced')}</span>
            </article>
          </div>
        </section>

        <div className="synergi-review-toolbar synergi-review-toolbar--stack">
          <div className="synergi-review-search">
            <input
              className="synergi-input synergi-review-search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('reviewSearchPlaceholder')}
            />
            <select
              className="synergi-select synergi-review-source-filter"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="all">{t('reviewSource_all')}</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source === 'synergi' ? t('reviewSource_synergi') : source}
                </option>
              ))}
            </select>
          </div>

          <div className="synergi-review-filters">
            {(['all', 'submitted', 'under_review', 'accepted', 'rejected'] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={`synergi-review-filter ${statusFilter === status ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {t(`reviewStatus_${status}`)}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="synergi-review-refresh"
            onClick={() => void loadAdmissions(statusFilter, true, searchQuery, sourceFilter)}
            disabled={refreshing}
          >
            <RefreshCcw size={16} />
            <span>{refreshing ? t('reviewRefreshing') : t('reviewRefresh')}</span>
          </button>
          <button type="button" className="synergi-review-refresh" onClick={() => void handleLogout()}>
            <span>{t('reviewLogout')}</span>
          </button>
        </div>

        {error ? <p className="synergi-notice">{error}</p> : null}
        {notice ? <p className="synergi-notice">{notice}</p> : null}

        <div className="synergi-review-grid">
          <section className="synergi-panel synergi-review-list-panel">
            <div className="synergi-review-section-head">
              <h2>{t('reviewListTitle')}</h2>
              <p>{t('reviewListSubtitle')}</p>
            </div>

            {loading ? (
              <div className="synergi-review-empty">{t('reviewLoading')}</div>
            ) : items.length === 0 ? (
              <div className="synergi-review-empty">{t('reviewEmpty')}</div>
            ) : (
              <div className="synergi-review-list">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`synergi-review-item ${selectedId === item.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="synergi-review-item-top">
                      <strong>{item.full_name}</strong>
                      <span className={`synergi-review-badge is-${item.status}`}>{t(`reviewStatus_${item.status}`)}</span>
                    </div>
                    <p>{item.company_name || item.email}</p>
                    <small>{formatDate(item.created_at, language)}</small>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="synergi-panel synergi-review-detail-panel">
            <div className="synergi-review-section-head">
              <h2>{t('reviewDetailTitle')}</h2>
              <p>{t('reviewDetailSubtitle')}</p>
            </div>

            {!selectedAdmission ? (
              <div className="synergi-review-empty">{t('reviewDetailEmpty')}</div>
            ) : (
              <div className="synergi-review-detail">
                <div className="synergi-review-meta-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldName')}</span>
                    <strong>{selectedAdmission.full_name}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldCompany')}</span>
                    <strong>{selectedAdmission.company_name || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldEmail')}</span>
                    <strong>{selectedAdmission.email}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldCategory')}</span>
                    <strong>{selectedAdmission.service_category}</strong>
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('reviewFieldSummary')}</span>
                  <p>{selectedAdmission.service_summary}</p>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('reviewFieldPitch')}</span>
                  <p>{selectedAdmission.collaboration_pitch || t('reviewValueMissing')}</p>
                </div>

                <div className="synergi-review-meta-grid synergi-review-360-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldLanguages')}</span>
                    <strong>{normalizeTextList(selectedAdmission.languages).join(', ') || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldCoverage')}</span>
                    <strong>{normalizeTextList(selectedAdmission.coverage_areas).join(', ') || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldSource')}</span>
                    <strong>{selectedAdmission.submission_source}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldCaptcha')}</span>
                    <strong>{selectedAdmission.captcha_verified ? t('reviewCaptchaVerified') : t('reviewCaptchaMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldReviewer')}</span>
                    <strong>{selectedAdmission.reviewed_by || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldReviewedAt')}</span>
                    <strong>{selectedAdmission.reviewed_at ? formatDate(selectedAdmission.reviewed_at, language) : t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldPriority')}</span>
                    <strong>{selectedAdmission.priority_label || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldAssignedTo')}</span>
                    <strong>{selectedAdmission.assigned_to || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldDecisionReason')}</span>
                    <strong>{selectedAdmission.decision_reason || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldHandoffState')}</span>
                    <strong>{selectedAdmission.handoff_state || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldPartnerAccount')}</span>
                    <strong>{selectedAdmission.partner_account_id || t('reviewValueMissing')}</strong>
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldPartnerWorkspace')}</span>
                    <strong>{selectedAdmission.partner_workspace_id || t('reviewValueMissing')}</strong>
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('review360Title')}</span>
                  <div className="synergi-review-timeline">
                    <div className="synergi-review-timeline-item">
                      <span>{t('reviewTimelineSubmitted')}</span>
                      <strong>{formatDate(selectedAdmission.created_at, language)}</strong>
                    </div>
                    <div className="synergi-review-timeline-item">
                      <span>{t('reviewTimelineReviewed')}</span>
                      <strong>{selectedAdmission.reviewed_at ? formatDate(selectedAdmission.reviewed_at, language) : t('reviewValueMissing')}</strong>
                    </div>
                    <div className="synergi-review-timeline-item">
                      <span>{t('reviewTimelineHandoff')}</span>
                      <strong>{selectedAdmission.handoff_state || t('reviewValueMissing')}</strong>
                    </div>
                    <div className="synergi-review-timeline-item">
                      <span>{t('reviewTimelineTraceability')}</span>
                      <strong>{selectedAdmission.review_notes || selectedAdmission.decision_reason || t('reviewValueMissing')}</strong>
                    </div>
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('reviewDecisionReasonLabel')}</span>
                  <textarea
                    className="synergi-input synergi-textarea synergi-review-notes"
                    value={decisionReason}
                    onChange={(event) => setDecisionReason(event.target.value)}
                    placeholder={t('reviewDecisionReasonPlaceholder')}
                    disabled={savingStatus !== null}
                  />
                </div>

                <div className="synergi-review-meta-grid synergi-review-handoff-grid">
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldPriority')}</span>
                    <input
                      className="synergi-input"
                      value={priorityLabel}
                      onChange={(event) => setPriorityLabel(event.target.value)}
                      placeholder={t('reviewPriorityPlaceholder')}
                      disabled={savingStatus !== null}
                    />
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldAssignedTo')}</span>
                    <input
                      className="synergi-input"
                      value={assignedTo}
                      onChange={(event) => setAssignedTo(event.target.value)}
                      placeholder={t('reviewAssignedToPlaceholder')}
                      disabled={savingStatus !== null}
                    />
                  </div>
                  <div className="synergi-review-meta-card">
                    <span>{t('reviewFieldHandoffState')}</span>
                    <select
                      className="synergi-select"
                      value={handoffState}
                      onChange={(event) => setHandoffState(event.target.value)}
                      disabled={savingStatus !== null}
                    >
                      {(['in_review', 'invite_issued', 'activation_pending', 'workspace_ready', 'closed'] as const).map((state) => (
                        <option key={state} value={state}>
                          {t(`reviewHandoffState_${state}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="synergi-review-content-card">
                  <span>{t('reviewNotesLabel')}</span>
                  <textarea
                    className="synergi-input synergi-textarea synergi-review-notes"
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    placeholder={t('reviewNotesPlaceholder')}
                    disabled={savingStatus !== null}
                  />
                </div>

                {decisionPayload?.admissionId === selectedAdmission.id ? (
                  <div className="synergi-review-content-card">
                    <span>{t('reviewDecisionOutputTitle')}</span>
                    <div className="synergi-review-decision-output">
                      <div>
                        <strong>{t('reviewDecisionInviteCode')}</strong>
                        <p>{decisionPayload.inviteCode || t('reviewValueMissing')}</p>
                      </div>
                      <div>
                        <strong>{t('reviewDecisionLaunchUrl')}</strong>
                        <p>{decisionPayload.launchUrl || t('reviewValueMissing')}</p>
                      </div>
                      <div>
                        <strong>{t('reviewDecisionReasonLabel')}</strong>
                        <p>{decisionReason || selectedAdmission.decision_reason || t('reviewValueMissing')}</p>
                      </div>
                      <div>
                        <strong>{t('reviewFieldHandoffState')}</strong>
                        <p>{handoffState || selectedAdmission.handoff_state || t('reviewValueMissing')}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="synergi-review-actions">
                  {REVIEW_ACTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`synergi-button synergi-review-action is-${status}`}
                      onClick={() => void handleReview(status)}
                      disabled={savingStatus !== null}
                    >
                      {savingStatus === status ? t('reviewSaving') : t(`reviewAction_${status}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <PartnerOperationsConsole />
        <PartnerAssetsConsole />
      </section>
    </main>
  )
}
