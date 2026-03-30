'use client'

import { useEffect, useState } from 'react'
import { Laptop2, MoonStar, SunMedium } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type SynergiTheme = 'dark' | 'light' | 'system'

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
  const { language, setLanguage, t } = useI18n()
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

      <div className="synergi-language synergi-language-toggle" role="group" aria-label={t('languageToggleLabel')}>
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
  )
}
