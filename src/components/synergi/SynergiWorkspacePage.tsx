'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

type WorkspaceProps = {
  partnerName: string
  companyName: string | null
  workspaceName: string
  welcomeNote: string | null
  accountStatus: string
}

export function SynergiWorkspacePage(props: WorkspaceProps) {
  const { language, setLanguage, t } = useI18n()

  async function handleLogout() {
    await fetch('/api/partner/session', { method: 'DELETE' })
    window.location.assign('/login')
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
              <strong>{props.accountStatus}</strong>
              <span>{t('workspaceStatus')}</span>
            </article>
          </div>
        </section>

        <div className="synergi-review-grid">
          <section className="synergi-panel synergi-review-detail-panel">
            <div className="synergi-review-section-head">
              <h2>{t('workspaceOverviewTitle')}</h2>
              <p>{t('workspaceOverviewSubtitle')}</p>
            </div>
            <div className="synergi-review-detail">
              <div className="synergi-review-content-card">
                <span>{t('workspaceNextStepTitle')}</span>
                <p>{t('workspaceNextStepCopy')}</p>
              </div>
              <div className="synergi-review-content-card">
                <span>{t('workspaceAssetsTitle')}</span>
                <p>{t('workspaceAssetsCopy')}</p>
              </div>
              <div className="synergi-review-actions">
                <button type="button" className="synergi-button synergi-review-action" onClick={() => void handleLogout()}>
                  {t('workspaceLogout')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
