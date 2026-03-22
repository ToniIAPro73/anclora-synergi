'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, KeyRound, ShieldCheck, Sparkles, UserRoundPlus } from 'lucide-react'
import { buildPrivateEstatesHref, useI18n } from '@/lib/i18n'

export function SynergiPortalPage() {
  const { language, setLanguage, t } = useI18n()
  const [form, setForm] = useState({
    name: '',
    brand: '',
    email: '',
    speciality: '',
    vision: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setNotice(null)

    window.setTimeout(() => {
      setSubmitting(false)
      setNotice(t('admissionPending'))
    }, 480)
  }

  return (
    <main className="synergi-page">
      <div className="synergi-noise" />
      <section className="synergi-shell">
        <header className="synergi-topbar">
          <Link href={buildPrivateEstatesHref(language)} className="synergi-backlink">
            {t('backToPrivateEstates')}
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
              <p className="synergi-brand-line">{t('brandLine')}</p>
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

        <section className="synergi-panel synergi-landing-hero">
          <div>
            <p className="synergi-eyebrow">{t('portalEyebrow')}</p>
            <h1 className="synergi-title">{t('portalTitle')}</h1>
            <p className="synergi-subtitle">{t('portalSubtitle')}</p>
          </div>

          <div className="synergi-hero-pills">
            <span>{t('portalPillOne')}</span>
            <span>{t('portalPillTwo')}</span>
            <span>{t('portalPillThree')}</span>
          </div>
        </section>

        <div className="synergi-grid synergi-portal-grid">
          <section className="synergi-panel synergi-hero-panel">
            <div className="synergi-section-intro">
              <div className="synergi-section-icon">
                <UserRoundPlus size={18} />
              </div>
              <div>
                <p className="synergi-form-eyebrow">{t('admissionEyebrow')}</p>
                <h2 className="synergi-section-title">{t('admissionTitle')}</h2>
                <p className="synergi-section-copy">{t('admissionSubtitle')}</p>
              </div>
            </div>

            <div className="synergi-signals">
              <article className="synergi-signal-card">
                <Sparkles className="synergi-signal-icon" />
                <h3>{t('admissionStepOneTitle')}</h3>
                <p>{t('admissionStepOneCopy')}</p>
              </article>
              <article className="synergi-signal-card">
                <ShieldCheck className="synergi-signal-icon is-cyan" />
                <h3>{t('admissionStepTwoTitle')}</h3>
                <p>{t('admissionStepTwoCopy')}</p>
              </article>
            </div>

            <form className="synergi-form" onSubmit={handleSubmit}>
              <input
                className="synergi-input"
                placeholder={t('admissionFieldName')}
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                disabled={submitting}
              />
              <div className="synergi-two-cols">
                <input
                  className="synergi-input"
                  placeholder={t('admissionFieldBrand')}
                  value={form.brand}
                  onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
                  disabled={submitting}
                />
                <input
                  className="synergi-input"
                  type="email"
                  placeholder={t('admissionFieldEmail')}
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>
              <input
                className="synergi-input"
                placeholder={t('admissionFieldSpeciality')}
                value={form.speciality}
                onChange={(event) => setForm((prev) => ({ ...prev, speciality: event.target.value }))}
                disabled={submitting}
              />
              <textarea
                className="synergi-input synergi-textarea"
                placeholder={t('admissionFieldVision')}
                value={form.vision}
                onChange={(event) => setForm((prev) => ({ ...prev, vision: event.target.value }))}
                required
                disabled={submitting}
              />

              {notice ? <p className="synergi-notice">{notice}</p> : null}

              <button className="synergi-button" type="submit" disabled={submitting}>
                {submitting ? t('admissionSubmitting') : t('admissionCta')}
              </button>
            </form>
          </section>

          <section className="synergi-panel synergi-form-panel">
            <div className="synergi-approved-card">
              <div className="synergi-approved-icon">
                <KeyRound size={18} />
              </div>
              <div>
                <p className="synergi-approved-title">{t('approvedAreaEyebrow')}</p>
                <p className="synergi-approved-copy">{t('approvedAreaCopy')}</p>
              </div>
            </div>

            <div className="synergi-form-header">
              <p className="synergi-form-eyebrow">{t('loginEyebrow')}</p>
              <h2>{t('approvedAreaTitle')}</h2>
              <p>{t('approvedAreaSubtitle')}</p>
            </div>

            <div className="synergi-signal-stack">
              <article className="synergi-signal-card">
                <KeyRound className="synergi-signal-icon" />
                <h3>{t('approvedStepOneTitle')}</h3>
                <p>{t('approvedStepOneCopy')}</p>
              </article>
              <article className="synergi-signal-card">
                <ArrowRight className="synergi-signal-icon is-cyan" />
                <h3>{t('approvedStepTwoTitle')}</h3>
                <p>{t('approvedStepTwoCopy')}</p>
              </article>
            </div>

            <div className="synergi-login-cta-box">
              <Link href="/login" className="synergi-button synergi-button-link">
                {t('approvedAreaCta')}
              </Link>
            </div>

            <div className="synergi-support-grid">
              <a href="mailto:synergi@anclora.com?subject=Synergi%20Partner%20Access" className="synergi-support-card">
                <p>{t('supportTitle')}</p>
                <span>{t('supportCopy')}</span>
              </a>
              <a href="mailto:synergi@anclora.com?subject=Reset%20Synergi%20Credentials" className="synergi-support-card">
                <p>{t('resetTitle')}</p>
                <span>{t('resetCopy')}</span>
              </a>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
