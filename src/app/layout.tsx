import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { SYNERGI_BRAND } from '@/lib/synergi-brand'

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
      { url: SYNERGI_BRAND.logoPath, type: 'image/png' },
      { url: SYNERGI_BRAND.faviconPath, type: 'image/x-icon' },
    ],
    shortcut: SYNERGI_BRAND.faviconPath,
    apple: SYNERGI_BRAND.logoPath,
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
