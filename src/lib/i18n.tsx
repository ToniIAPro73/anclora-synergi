'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'es' | 'en' | 'de'

type Dictionary = Record<string, string>

const translations: Record<Language, Dictionary> = {
  es: {
    brandLine: 'Portal de partners del ecosistema Anclora',
    backToPrivateEstates: 'Volver a Private Estates',
    loginEyebrow: 'Synergi Access',
    loginTitle: 'Acceso privado para partners aprobados',
    loginSubtitle: 'La admisión ya ha sido validada por Anclora. Esta pantalla está pensada para partners que ya han recibido la aprobación oficial y sus credenciales por email.',
    sideTitle: 'Un portal propio para colaboración curada',
    sideSubtitle: 'Synergi se desacopla de Nexus y nace como una aplicación independiente para partners aprobados, referrals, servicios premium y colaboración selectiva.',
    signalOneTitle: 'Invitación confirmada',
    signalOneCopy: 'La entrada se realiza con el email aprobado y el código de acceso remitidos por Anclora en la comunicación oficial.',
    signalTwoTitle: 'Canal seguro',
    signalTwoCopy: 'El acceso queda reservado a perfiles autorizados para proteger referrals, documentación compartida y trazabilidad comercial.',
    signalThreeTitle: 'Continuidad natural',
    signalThreeCopy: 'Desde aquí el partner pasará a su workspace privado, con activos, prioridades y colaboración viva con Anclora.',
    formTitle: 'Entrar en Synergi',
    formSubtitle: 'Introduce el email aprobado y la clave temporal o código de acceso recibido.',
    approvedTitle: 'Partner approved',
    approvedCopy: 'Si todavía no has recibido la aprobación oficial, esta no es la puerta correcta. El acceso solo se activa una vez completado el proceso de admisión.',
    fieldEmail: 'Email aprobado',
    fieldCode: 'Código de acceso o contraseña temporal',
    remember: 'Mantener mi acceso en este dispositivo de confianza',
    cta: 'Entrar al portal',
    submitting: 'Validando acceso...',
    pending: 'La interfaz de login ya está preparada en la app independiente de Synergi. El siguiente paso será conectar este formulario al contrato real de autenticación partner.',
    supportTitle: 'Soporte de acceso',
    supportCopy: 'Si no localizas el email de aprobación o necesitas asistencia, contacta con el equipo Synergi.',
    resetTitle: 'Reemitir credenciales',
    resetCopy: 'Solicita una nueva emisión si tu acceso ha caducado o ya no conservas el correo original.',
  },
  en: {
    brandLine: 'Partner portal for the Anclora ecosystem',
    backToPrivateEstates: 'Back to Private Estates',
    loginEyebrow: 'Synergi Access',
    loginTitle: 'Private access for approved partners',
    loginSubtitle: 'Admission has already been validated by Anclora. This screen is designed for partners who have already received official approval and their credentials by email.',
    sideTitle: 'A dedicated portal for curated collaboration',
    sideSubtitle: 'Synergi is being decoupled from Nexus and launched as an independent application for approved partners, referrals, premium services and selective collaboration.',
    signalOneTitle: 'Confirmed invitation',
    signalOneCopy: 'Entry uses the approved email and the access code delivered by Anclora in the official communication.',
    signalTwoTitle: 'Secure channel',
    signalTwoCopy: 'Access is reserved for authorised profiles in order to protect referrals, shared documentation and commercial traceability.',
    signalThreeTitle: 'Natural continuity',
    signalThreeCopy: 'From here the partner will move into their private workspace, with assets, priorities and active collaboration with Anclora.',
    formTitle: 'Sign in to Synergi',
    formSubtitle: 'Enter the approved email and the temporary password or access code you received.',
    approvedTitle: 'Partner approved',
    approvedCopy: 'If you have not yet received official approval, this is not the right entry point. Access is only activated once the admission process is completed.',
    fieldEmail: 'Approved email',
    fieldCode: 'Access code or temporary password',
    remember: 'Keep me signed in on this trusted device',
    cta: 'Enter the portal',
    submitting: 'Validating access...',
    pending: 'The login interface is already prepared inside the independent Synergi app. The next step will be connecting this form to the real partner authentication contract.',
    supportTitle: 'Access support',
    supportCopy: 'If you cannot find the approval email or need assistance, contact the Synergi team.',
    resetTitle: 'Reissue credentials',
    resetCopy: 'Request a fresh credentials issue if your access has expired or you no longer have the original email.',
  },
  de: {
    brandLine: 'Partnerportal des Anclora-Ökosystems',
    backToPrivateEstates: 'Zurück zu Private Estates',
    loginEyebrow: 'Synergi Access',
    loginTitle: 'Privater Zugang für freigegebene Partner',
    loginSubtitle: 'Die Admission wurde bereits von Anclora validiert. Diese Seite ist für Partner gedacht, die ihre offizielle Freigabe und Zugangsdaten per E-Mail bereits erhalten haben.',
    sideTitle: 'Ein eigenes Portal für kuratierte Kollaboration',
    sideSubtitle: 'Synergi wird von Nexus entkoppelt und als eigenständige Anwendung für freigegebene Partner, Referrals, Premium-Services und selektive Zusammenarbeit aufgebaut.',
    signalOneTitle: 'Bestätigte Einladung',
    signalOneCopy: 'Der Zugang erfolgt mit der freigegebenen E-Mail und dem Zugangscode aus der offiziellen Kommunikation von Anclora.',
    signalTwoTitle: 'Sicherer Kanal',
    signalTwoCopy: 'Der Zugang bleibt autorisierten Profilen vorbehalten, um Referrals, geteilte Unterlagen und kommerzielle Nachvollziehbarkeit zu schützen.',
    signalThreeTitle: 'Natürliche Kontinuität',
    signalThreeCopy: 'Von hier aus wechselt der Partner in seinen privaten Workspace mit Assets, Prioritäten und aktiver Kollaboration mit Anclora.',
    formTitle: 'Bei Synergi anmelden',
    formSubtitle: 'Gib die freigegebene E-Mail und das temporäre Passwort oder den Zugangscode ein.',
    approvedTitle: 'Partner approved',
    approvedCopy: 'Wenn du die offizielle Freigabe noch nicht erhalten hast, ist dies nicht der richtige Einstieg. Der Zugang wird erst nach Abschluss der Admission aktiviert.',
    fieldEmail: 'Freigegebene E-Mail',
    fieldCode: 'Zugangscode oder temporäres Passwort',
    remember: 'Auf diesem vertrauenswürdigen Gerät angemeldet bleiben',
    cta: 'Portal betreten',
    submitting: 'Zugang wird validiert...',
    pending: 'Die Login-Oberfläche ist bereits in der eigenständigen Synergi-App vorbereitet. Der nächste Schritt ist die Verbindung dieses Formulars mit dem realen Partner-Authentifizierungsvertrag.',
    supportTitle: 'Zugangssupport',
    supportCopy: 'Wenn du die Freigabe-E-Mail nicht findest oder Hilfe brauchst, kontaktiere das Synergi-Team.',
    resetTitle: 'Zugangsdaten neu ausstellen',
    resetCopy: 'Fordere neue Zugangsdaten an, wenn dein Zugriff abgelaufen ist oder die ursprüngliche E-Mail nicht mehr verfügbar ist.',
  },
}

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: keyof typeof translations.es) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function normalizeLanguage(value: string | null | undefined): Language {
  const candidate = String(value || '').toLowerCase()
  if (candidate === 'en' || candidate === 'de') return candidate
  return 'es'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryLanguage = normalizeLanguage(params.get('lang'))
    const storedLanguage = normalizeLanguage(window.localStorage.getItem('anclora-synergi-lang'))
    const nextLanguage = params.get('lang') ? queryLanguage : storedLanguage
    setLanguageState(nextLanguage)
  }, [])

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage: (nextLanguage) => {
      setLanguageState(nextLanguage)
      window.localStorage.setItem('anclora-synergi-lang', nextLanguage)
      const url = new URL(window.location.href)
      url.searchParams.set('lang', nextLanguage)
      window.history.replaceState({}, '', url.toString())
    },
    t: (key) => translations[language][key],
  }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}

export function buildPrivateEstatesHref(language: Language): string {
  const base = (process.env.NEXT_PUBLIC_PRIVATE_ESTATES_URL || 'https://anclora-private-estates.vercel.app/').trim()
  const url = new URL(base.endsWith('/') ? base : `${base}/`)
  url.searchParams.set('lang', language)
  return url.toString()
}

