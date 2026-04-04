'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { KeyRound, Laptop2, Mail, MoonStar, ShieldCheck, Sparkles, SunMedium } from 'lucide-react'
import { SynergiBrandMark } from '@/components/synergi/SynergiBrandMark'
import { buildPrivateEstatesHref, useI18n } from '@/lib/i18n'
import { SYNERGI_BRAND } from '@/lib/synergi-brand'

export function SynergiLoginPage({
  prefillEmail = '',
  prefillSecret = '',
}: {
  prefillEmail?: string
  prefillSecret?: string
}) {
  const { language, setLanguage, t } = useI18n()
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const storedTheme = window.localStorage.getItem('anclora-synergi-theme')
    return storedTheme === 'light' || storedTheme === 'system' ? storedTheme : 'dark'
  })
  const [form, setForm] = useState({
    email: prefillEmail,
    secret: prefillSecret,
    remember: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [reissueEmail, setReissueEmail] = useState(prefillEmail)
  const [reissueSubmitting, setReissueSubmitting] = useState(false)
  const [reissueNotice, setReissueNotice] = useState<string | null>(null)
  const [reissueError, setReissueError] = useState<string | null>(null)
  const themeIcons = {
    dark: MoonStar,
    light: SunMedium,
    system: Laptop2,
  } as const

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = () => {
      const resolvedTheme = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
        : theme
      root.dataset.theme = resolvedTheme
    }

    applyTheme()
    window.localStorage.setItem('anclora-synergi-theme', theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/partner/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          secret: form.secret,
          remember: form.remember,
        }),
      })

      const body = (await response.json().catch(() => null)) as
        | { error?: string; status?: string; next_url?: string }
        | null

      if (!response.ok) {
        throw new Error(body?.error || t('loginError'))
      }

      if (body?.status === 'activation_required') {
        setNotice(t('loginActivationRequired'))
      } else {
        setNotice(t('loginSuccess'))
      }

      window.location.assign(body?.next_url || '/workspace')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('loginError'))
      setSubmitting(false)
    }
  }

  async function handleReissue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReissueSubmitting(true)
    setReissueNotice(null)
    setReissueError(null)

    try {
      const response = await fetch('/api/partner/reissue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: reissueEmail }),
      })

      const body = (await response.json().catch(() => null)) as { error?: string; message?: string } | null
      if (!response.ok) {
        throw new Error(body?.error || t('reissueError'))
      }

      setReissueNotice(body?.message || t('reissueSuccess'))
    } catch (submitError) {
      setReissueError(submitError instanceof Error ? submitError.message : t('reissueError'))
    } finally {
      setReissueSubmitting(false)
    }
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
              <SynergiBrandMark size={40} className="synergi-brand-logo" />
            </div>
            <div>
              <p className="synergi-brand-name">{SYNERGI_BRAND.name.toUpperCase()}</p>
              <p className="synergi-brand-line">{t('brandLine')}</p>
            </div>
          </div>

          <div className="synergi-topbar-controls">
            <div className="synergi-language">
              {([
                { value: 'dark', label: 'Tema oscuro' },
                { value: 'light', label: 'Tema claro' },
                { value: 'system', label: 'Tema automático' },
              ] as const).map((item) => {
                const Icon = themeIcons[item.value]
                return (
                  <button
                    key={item.value}
                    type="button"
                    className={item.value === theme ? 'is-active' : ''}
                    onClick={() => setTheme(item.value)}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </button>
                )
              })}
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
          </div>
        </header>

        <div className="synergi-grid">
          <section className="synergi-panel synergi-hero-panel">
            <p className="synergi-eyebrow">{t('loginEyebrow')}</p>
            <h1 className="synergi-title">{t('loginTitle')}</h1>
            <p className="synergi-subtitle">{t('loginSubtitle')}</p>

            <div className="synergi-highlight">
              <h2>{t('sideTitle')}</h2>
              <p>{t('sideSubtitle')}</p>
            </div>

            <div className="synergi-signals">
              <article className="synergi-signal-card">
                <Mail className="synergi-signal-icon" />
                <h3>{t('signalOneTitle')}</h3>
                <p>{t('signalOneCopy')}</p>
              </article>
              <article className="synergi-signal-card">
                <ShieldCheck className="synergi-signal-icon is-cyan" />
                <h3>{t('signalTwoTitle')}</h3>
                <p>{t('signalTwoCopy')}</p>
              </article>
              <article className="synergi-signal-card">
                <Sparkles className="synergi-signal-icon" />
                <h3>{t('signalThreeTitle')}</h3>
                <p>{t('signalThreeCopy')}</p>
              </article>
            </div>
          </section>

          <section className="synergi-panel synergi-form-panel">
            <div className="synergi-approved-card">
              <div className="synergi-approved-icon">
                <KeyRound size={18} />
              </div>
              <div>
                <p className="synergi-approved-title">{t('approvedTitle')}</p>
                <p className="synergi-approved-copy">{t('approvedCopy')}</p>
              </div>
            </div>

            <div className="synergi-form-header">
              <p className="synergi-form-eyebrow">{t('loginEyebrow')}</p>
              <h2>{t('formTitle')}</h2>
              <p>{t('formSubtitle')}</p>
            </div>

            <form className="synergi-form" onSubmit={handleSubmit}>
              <input
                className="synergi-input"
                type="email"
                placeholder={t('fieldEmail')}
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                autoComplete="email"
                required
                disabled={submitting}
              />
              <input
                className="synergi-input"
                type="password"
                placeholder={t('fieldCode')}
                value={form.secret}
                onChange={(event) => setForm((prev) => ({ ...prev, secret: event.target.value }))}
                autoComplete="current-password"
                required
                disabled={submitting}
              />

              <label className="synergi-checkrow">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) => setForm((prev) => ({ ...prev, remember: event.target.checked }))}
                  disabled={submitting}
                />
                <span>{t('remember')}</span>
              </label>

              {error ? <p className="synergi-notice">{error}</p> : null}
              {notice ? <p className="synergi-notice synergi-notice-success">{notice}</p> : null}

              <button className="synergi-button" type="submit" disabled={submitting}>
                {submitting ? t('submitting') : t('cta')}
              </button>
            </form>

            <div className="synergi-support-grid">
              <a href="mailto:synergi@anclora.com?subject=Synergi%20Partner%20Access" className="synergi-support-card">
                <p>{t('supportTitle')}</p>
                <span>{t('supportCopy')}</span>
              </a>
              <div className="synergi-support-card synergi-support-card-form">
                <p>{t('resetTitle')}</p>
                <span>{t('resetCopy')}</span>
                <form className="synergi-form synergi-inline-form" onSubmit={handleReissue}>
                  <input
                    className="synergi-input"
                    type="email"
                    placeholder={t('reissueEmail')}
                    value={reissueEmail}
                    onChange={(event) => setReissueEmail(event.target.value)}
                    autoComplete="email"
                    required
                    disabled={reissueSubmitting}
                  />
                  {reissueError ? <p className="synergi-notice">{reissueError}</p> : null}
                  {reissueNotice ? <p className="synergi-notice synergi-notice-success">{reissueNotice}</p> : null}
                  <button className="synergi-button synergi-button-link" type="submit" disabled={reissueSubmitting}>
                    {reissueSubmitting ? t('reissueSubmitting') : t('reissueCta')}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
