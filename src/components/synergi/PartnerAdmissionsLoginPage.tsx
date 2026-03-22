'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { buildPrivateEstatesHref, useI18n } from '@/lib/i18n'

export function PartnerAdmissionsLoginPage() {
  const { language, setLanguage, t } = useI18n()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const body = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        throw new Error(body?.error || t('reviewLoginError'))
      }

      window.location.assign('/partner-admissions')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('reviewLoginError'))
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
                src="/brand/logo-anclora-private-estates.png"
                alt="Anclora Private Estates"
                width={40}
                height={40}
                className="synergi-brand-logo"
              />
            </div>
            <div>
              <p className="synergi-brand-name">ANCLORA SYNERGI</p>
              <p className="synergi-brand-line">{t('reviewLoginBrandLine')}</p>
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
            <p className="synergi-eyebrow">{t('reviewLoginEyebrow')}</p>
            <h1 className="synergi-title synergi-review-title">{t('reviewLoginTitle')}</h1>
            <p className="synergi-subtitle">{t('reviewLoginSubtitle')}</p>

            <form className="synergi-form" onSubmit={handleSubmit}>
              <input
                className="synergi-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={t('reviewLoginUsername')}
                autoComplete="username"
                required
                disabled={loading}
              />
              <input
                className="synergi-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('reviewLoginPassword')}
                autoComplete="current-password"
                required
                disabled={loading}
              />

              {error ? <p className="synergi-notice">{error}</p> : null}

              <button className="synergi-button synergi-button-link" type="submit" disabled={loading}>
                {loading ? t('reviewLoginSubmitting') : t('reviewLoginCta')}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}
