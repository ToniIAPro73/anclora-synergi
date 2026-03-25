'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpenText, KeyRound, Laptop2, MoonStar, ShieldCheck, Sparkles, SunMedium, UserRoundPlus } from 'lucide-react'
import { buildPrivateEstatesHref, useI18n } from '@/lib/i18n'

declare global {
  interface Window {
    grecaptcha?: {
      ready?: (callback: () => void) => void
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string
          size?: 'normal' | 'compact'
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark'
        }
      ) => number
      reset: (widgetId?: number) => void
    }
    onSynergiRecaptchaVerified?: (token: string) => void
  }
}

const PARTNER_GUIDE_HREF = '/docs/Gu%C3%ADa_del_Partner.pdf'

export function SynergiPortalPage() {
  const { language, setLanguage, t } = useI18n()
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const storedTheme = window.localStorage.getItem('anclora-synergi-theme')
    return storedTheme === 'light' || storedTheme === 'system' ? storedTheme : 'dark'
  })
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || ''
  const [form, setForm] = useState({
    name: '',
    brand: '',
    email: '',
    speciality: '',
    vision: '',
    privacyAccepted: false,
    newsletterOptIn: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaReady, setCaptchaReady] = useState(!recaptchaSiteKey)
  const captchaContainerRef = useRef<HTMLDivElement | null>(null)
  const captchaWidgetIdRef = useRef<number | null>(null)
  const themeIcons = {
    dark: MoonStar,
    light: SunMedium,
    system: Laptop2,
  } as const

  useEffect(() => {
    window.onSynergiRecaptchaVerified = (token: string) => {
      setCaptchaToken(token)
      setNotice(null)
    }

    return () => {
      delete window.onSynergiRecaptchaVerified
    }
  }, [])

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

  useEffect(() => {
    if (!recaptchaSiteKey) {
      setCaptchaReady(false)
      return
    }

    const renderWidget = () => {
      const api = window.grecaptcha
      const container = captchaContainerRef.current
      if (!api || !container || captchaWidgetIdRef.current !== null) return

      const isMobileViewport = window.matchMedia('(max-width: 420px)').matches
      api.ready?.(() => {
        captchaWidgetIdRef.current = api.render(container, {
          sitekey: recaptchaSiteKey,
          theme: 'dark',
          size: isMobileViewport ? 'compact' : 'normal',
          callback: (token: string) => {
            window.onSynergiRecaptchaVerified?.(token)
            setNotice(null)
          },
          'expired-callback': () => {
            setCaptchaToken(null)
          },
          'error-callback': () => {
            setCaptchaToken(null)
          },
        })
        setCaptchaReady(true)
      })
    }

    if (window.grecaptcha) {
      renderWidget()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-synergi-recaptcha="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', renderWidget, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.synergiRecaptcha = 'true'
    script.addEventListener('load', renderWidget, { once: true })
    document.head.appendChild(script)
  }, [recaptchaSiteKey, t])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (recaptchaSiteKey && !captchaToken) {
      setNotice(t('captchaRequired'))
      return
    }

    setSubmitting(true)
    setNotice(null)

    try {
      const response = await fetch('/api/partner-admission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          email: form.email,
          speciality: form.speciality,
          vision: form.vision,
          privacyAccepted: form.privacyAccepted,
          newsletterOptIn: form.newsletterOptIn,
          submissionLanguage: language,
          captchaToken,
        }),
      })

      const body = (await response.json().catch(() => null)) as
        | { message?: string; error?: string; details?: string[] }
        | null

      if (!response.ok) {
        const detailText = body?.details?.length ? ` (${body.details.join(', ')})` : ''
        throw new Error((body?.error || t('admissionError')) + detailText)
      }

      setNotice(body?.message || t('admissionSuccess'))
      setForm({
        name: '',
        brand: '',
        email: '',
        speciality: '',
        vision: '',
        privacyAccepted: false,
        newsletterOptIn: false,
      })
      setCaptchaToken(null)
      if (window.grecaptcha && captchaWidgetIdRef.current !== null) {
        window.grecaptcha.reset(captchaWidgetIdRef.current)
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t('admissionError'))
    } finally {
      setSubmitting(false)
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
              <p className="synergi-brand-line">{t('brandLine')}</p>
            </div>
          </div>

          <div className="synergi-topbar-controls">
            <div className="synergi-language">
              {([
                { value: 'dark', label: 'Tema oscuro' },
                { value: 'light', label: 'Tema claro' },
                { value: 'system', label: 'Tema automático' },
              ] as const).map((item) => (
                (() => {
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
                })()
              ))}
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

            <a href={PARTNER_GUIDE_HREF} download className="synergi-guide-link-card">
              <div className="synergi-guide-link-copy">
                <span>{t('partnerGuideEyebrow')}</span>
                <strong>{t('partnerGuideTitle')}</strong>
                <p>{t('partnerGuidePublicCopy')}</p>
              </div>
              <div className="synergi-guide-link-meta">
                <BookOpenText size={18} />
              </div>
            </a>

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

              <div className="synergi-captcha-block">
                <p className="synergi-captcha-label">{t('captchaLabel')}</p>
                {recaptchaSiteKey ? (
                  <>
                    <div className="synergi-captcha-shell">
                      <div ref={captchaContainerRef} className="synergi-captcha-widget-frame" />
                    </div>
                    {!captchaToken ? (
                      <p className="synergi-captcha-help">
                        {captchaReady ? t('captchaHelp') : t('captchaLoading')}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="synergi-captcha-help">{t('captchaMissing')}</p>
                )}
              </div>

              <label className="synergi-checkrow">
                <input
                  type="checkbox"
                  checked={form.newsletterOptIn}
                  onChange={(event) => setForm((prev) => ({ ...prev, newsletterOptIn: event.target.checked }))}
                  disabled={submitting}
                />
                <span>{t('newsletterOptIn')}</span>
              </label>

              <label className="synergi-checkrow synergi-checkrow-start">
                <input
                  type="checkbox"
                  checked={form.privacyAccepted}
                  onChange={(event) => setForm((prev) => ({ ...prev, privacyAccepted: event.target.checked }))}
                  disabled={submitting}
                  required
                />
                <span>{t('privacyAccepted')}</span>
              </label>

              {notice ? <p className="synergi-notice">{notice}</p> : null}

              <button
                className="synergi-button"
                type="submit"
                disabled={submitting || !recaptchaSiteKey || !captchaToken || !form.privacyAccepted}
              >
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
