'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe, Laptop2, MoonStar, SunMedium, X } from 'lucide-react'
import { useI18n, type Language } from '@/lib/i18n'

type SynergiTheme = 'dark' | 'light' | 'system'
type SynergiCurrency = 'EUR' | 'USD' | 'GBP' | 'CHF'
type SynergiUnitSystem = 'metric' | 'imperial'

const CURRENCIES: SynergiCurrency[] = ['EUR', 'USD', 'GBP', 'CHF']
const UNITS: { code: SynergiUnitSystem; symbol: string }[] = [
  { code: 'metric', symbol: 'm²' },
  { code: 'imperial', symbol: 'Sqft' },
]

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
    currency: 'Moneda',
    units: 'Unidades de medida',
    close: 'Cerrar preferencias',
    save: 'Guardar y cerrar',
    unitLabels: {
      metric: 'Metro cuadrado - m² / Hectárea - ha',
      imperial: 'Pie cuadrado - ft² / Acre - ac',
    },
  },
  en: {
    trigger: 'Global preferences',
    title: 'Preferences',
    language: 'Language',
    currency: 'Currency',
    units: 'Measure units',
    close: 'Close preferences',
    save: 'Save and close',
    unitLabels: {
      metric: 'Square meter - m² / Hectare - ha',
      imperial: 'Square foot - ft² / Acre - ac',
    },
  },
  de: {
    trigger: 'Globale Einstellungen',
    title: 'Präferenzen',
    language: 'Sprache',
    currency: 'Währung',
    units: 'Maßeinheiten',
    close: 'Einstellungen schließen',
    save: 'Speichern und schließen',
    unitLabels: {
      metric: 'Quadratmeter - m² / Hektar - ha',
      imperial: 'Quadratfuß - ft² / Acre - ac',
    },
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
  const [currency, setCurrency] = useState<SynergiCurrency>(() => {
    if (typeof window === 'undefined') return 'EUR'
    const storedCurrency = window.localStorage.getItem('anclora-synergi-currency') as SynergiCurrency | null
    return storedCurrency && CURRENCIES.includes(storedCurrency) ? storedCurrency : 'EUR'
  })
  const [unitSystem, setUnitSystem] = useState<SynergiUnitSystem>(() => {
    if (typeof window === 'undefined') return 'metric'
    return window.localStorage.getItem('anclora-synergi-units') === 'imperial' ? 'imperial' : 'metric'
  })
  const copy = preferenceCopy[language]
  const unit = UNITS.find((item) => item.code === unitSystem) || UNITS[0]

  useEffect(() => {
    window.localStorage.setItem('anclora-synergi-currency', currency)
    window.localStorage.setItem('anclora-synergi-units', unitSystem)
  }, [currency, unitSystem])

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
        <span className="synergi-preferences-token">{currency}</span>
        <span className="synergi-preferences-token">{unit.symbol}</span>
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

          <label className="synergi-preferences-field">
            <span>{copy.currency}</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as SynergiCurrency)}>
              {CURRENCIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="synergi-preferences-field">
            <span>{copy.units}</span>
            <select value={unitSystem} onChange={(event) => setUnitSystem(event.target.value as SynergiUnitSystem)}>
              {UNITS.map((item) => (
                <option key={item.code} value={item.code}>{copy.unitLabels[item.code]}</option>
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
