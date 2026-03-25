import type { Metadata } from 'next'
import { Cardo, Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'

const cardo = Cardo({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cardo',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Anclora Synergi',
  description: 'Independent partner portal for the curated Anclora ecosystem',
  icons: {
    icon: '/brand/logo-anclora-synergi.png',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${cardo.variable} ${inter.variable}`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
