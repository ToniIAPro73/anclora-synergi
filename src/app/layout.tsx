import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { SYNERGI_BRAND } from '@/lib/synergi-brand'
import { versionedPublicAsset } from '@/lib/branding/icon-metadata'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: SYNERGI_BRAND.name,
  description: SYNERGI_BRAND.description,
  icons: {
    icon: [
      { url: versionedPublicAsset(SYNERGI_BRAND.faviconPath), sizes: 'any' },
      { url: versionedPublicAsset(SYNERGI_BRAND.favicon32Path), type: 'image/png', sizes: '32x32' },
      { url: versionedPublicAsset(SYNERGI_BRAND.favicon512Path), type: 'image/png', sizes: '512x512' },
    ],
    shortcut: versionedPublicAsset(SYNERGI_BRAND.faviconPath),
    apple: versionedPublicAsset(SYNERGI_BRAND.appleTouchIconPath),
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={dmSans.variable}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
