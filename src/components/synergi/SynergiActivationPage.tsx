'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { buildPrivateEstatesHref, useI18n } from '@/lib/i18n'

export function SynergiActivationPage() {
  const { language, setLanguage, t } = useI18n()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setNotice(null)

    try {
      const response = await fetch('/api/partner/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword, remember }),
      })

      const body = (await response.json().catch(() => null)) as { error?: string; next_url?: string } | null
      if (!response.ok) {
        throw new Error(body?.error || t('activationError'))
      }

      window.location.assign(body?.next_url || '/workspace')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t('activationError'))
      setLoading(false)
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

        <div className="synergi-review-login-wrap">
          <section className="synergi-panel synergi-review-login-panel">
            <p className="synergi-eyebrow">{t('activationEyebrow')}</p>
            <h1 className="synergi-title synergi-review-title">{t('activationTitle')}</h1>
            <p className="synergi-subtitle">{t('activationSubtitle')}</p>

            <form className="synergi-form" onSubmit={handleSubmit}>
              <input
                className="synergi-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('activationPassword')}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <input
                className="synergi-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t('activationConfirmPassword')}
                autoComplete="new-password"
                required
                disabled={loading}
              />

              <label className="synergi-checkrow">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  disabled={loading}
                />
                <span>{t('remember')}</span>
              </label>

              {notice ? <p className="synergi-notice">{notice}</p> : null}

              <button className="synergi-button synergi-button-link" type="submit" disabled={loading}>
                {loading ? t('activationSubmitting') : t('activationCta')}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}
