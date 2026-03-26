'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Laptop2, MoonStar, SunMedium } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

function buildAncloraGroupHref() {
  return process.env.NEXT_PUBLIC_ANCLORA_GROUP_URL?.trim() || 'https://anclora-group.vercel.app/workspace'
}

export function PartnerAdmissionsLoginPage() {
  const { language, setLanguage, t } = useI18n()
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const storedTheme = window.localStorage.getItem('anclora-synergi-theme')
    return storedTheme === 'light' || storedTheme === 'system' ? storedTheme : 'dark'
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
              <p className="synergi-brand-line">{t('reviewLoginBrandLine')}</p>
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
