'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe, Laptop2, MoonStar, SunMedium, X } from 'lucide-react'
import { useI18n, type Language } from '@/lib/i18n'

type SynergiTheme = 'dark' | 'light' | 'system'

const LANGUAGE_LABELS = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
} as const

const preferenceCopy = {
  es: {
    trigger: 'Preferencias globales',
    title: 'Preferencias',
    language: 'Idioma',
    close: 'Cerrar preferencias',
    save: 'Guardar y cerrar',
  },
  en: {
    trigger: 'Global preferences',
    title: 'Preferences',
    language: 'Language',
    close: 'Close preferences',
    save: 'Save and close',
  },
  de: {
    trigger: 'Globale Einstellungen',
    title: 'Präferenzen',
    language: 'Sprache',
    close: 'Einstellungen schließen',
    save: 'Speichern und schließen',
  },
} as const

const themeIcons = {
  dark: MoonStar,
  light: SunMedium,
  system: Laptop2,
} as const

function resolveTheme(theme: SynergiTheme) {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function SynergiUiToggles() {
  const { t } = useI18n()
  const [theme, setTheme] = useState<SynergiTheme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const storedTheme = window.localStorage.getItem('anclora-synergi-theme')
    return storedTheme === 'light' || storedTheme === 'system' ? storedTheme : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = () => {
      root.dataset.theme = resolveTheme(theme)
    }

    applyTheme()
    window.localStorage.setItem('anclora-synergi-theme', theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  return (
    <div className="synergi-topbar-controls">
      <div className="synergi-language synergi-theme-toggle" role="group" aria-label={t('themeToggleLabel')}>
        {([
          { value: 'light', label: t('themeLight') },
          { value: 'dark', label: t('themeDark') },
          { value: 'system', label: t('themeSystem') },
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

      <SynergiGlobalPreferencesToggle />
    </div>
  )
}

export function SynergiGlobalPreferencesToggle() {
  const { language, setLanguage } = useI18n()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const copy = preferenceCopy[language]

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="synergi-preferences-wrap" ref={panelRef}>
      <button
        type="button"
        className="synergi-preferences-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={copy.trigger}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Globe size={16} strokeWidth={1.8} />
        <span className="synergi-preferences-language">{LANGUAGE_LABELS[language]}</span>
        <ChevronDown size={15} strokeWidth={1.8} className={open ? 'is-open' : ''} />
      </button>

      {open ? (
        <div className="synergi-preferences-panel" role="dialog" aria-label={copy.trigger}>
          <div className="synergi-preferences-panel-head">
            <div>
              <p>{copy.trigger}</p>
              <h2>{copy.title}</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={copy.close}>
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>

          <label className="synergi-preferences-field">
            <span>{copy.language}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              {(['es', 'en', 'de'] as const).map((item) => (
                <option key={item} value={item}>{LANGUAGE_LABELS[item]}</option>
              ))}
            </select>
          </label>

          <button type="button" className="synergi-preferences-save" onClick={() => setOpen(false)}>
            {copy.save}
          </button>
        </div>
      ) : null}
    </div>
  )
}
