'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'es' | 'en' | 'de'

type Dictionary = Record<string, string>

const translations: Record<Language, Dictionary> = {
  es: {
    brandLine: 'Portal de partners del ecosistema Anclora',
    backToPrivateEstates: 'Volver a Private Estates',
    portalEyebrow: 'Synergi Portal',
    portalTitle: 'Una única puerta para admisión y acceso partner',
    portalSubtitle: 'Desde aquí conviven el proceso de solicitud de partnership y la entrada privada para colaboradores ya aprobados. El embudo correcto sigue intacto y el login solo se activa cuando Anclora ya ha validado el acceso.',
    portalPillOne: 'Solicitud curada',
    portalPillTwo: 'Acceso aprobado',
    portalPillThree: 'Workspace privado',
    admissionEyebrow: 'Partnership Request',
    admissionTitle: 'Solicitar partnership',
    admissionSubtitle: 'Comparte tu perfil, especialidad y visión de colaboración para que el equipo de Anclora evalúe tu encaje dentro de Synergi.',
    admissionStepOneTitle: 'Solicitud estructurada',
    admissionStepOneCopy: 'El partner expone su propuesta de valor, especialidad, cobertura y tipo de colaboración.',
    admissionStepTwoTitle: 'Revisión y respuesta',
    admissionStepTwoCopy: 'Anclora revisa el encaje y, si procede, remite por email la aprobación junto con las credenciales de acceso.',
    admissionFieldName: 'Nombre completo',
    admissionFieldBrand: 'Empresa o marca',
    admissionFieldEmail: 'Email profesional',
    admissionFieldSpeciality: 'Especialidad o tipo de servicio',
    admissionFieldVision: 'Explica cómo imaginas la colaboración con Anclora',
    captchaLabel: 'Verificación de seguridad',
    captchaHelp: 'Completa el reCAPTCHA antes de enviar la solicitud.',
    captchaRequired: 'Para enviar la solicitud, primero debes completar el reCAPTCHA.',
    captchaError: 'No se ha podido validar el reCAPTCHA. Inténtalo de nuevo.',
    captchaUnavailable: 'El reCAPTCHA no ha terminado de inicializarse correctamente. Recarga la página e inténtalo de nuevo.',
    captchaMissing: 'Falta configurar la clave pública de reCAPTCHA en Synergi.',
    admissionCta: 'Enviar solicitud',
    admissionSubmitting: 'Registrando solicitud...',
    admissionPending: 'La home mixta de Synergi ya está preparada. El siguiente paso será conectar esta solicitud al backend real de admisión partner.',
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
    approvedAreaEyebrow: 'Approved Partners',
    approvedAreaTitle: 'Ya soy partner',
    approvedAreaSubtitle: 'Si ya has sido admitido y has recibido tus credenciales por email, entra por esta ruta privada hacia el login de Synergi.',
    approvedAreaCopy: 'Esta vía está reservada a partners ya aprobados. La primera vez podrás entrar con el código inicial remitido por email; después, continuarás por el login habitual.',
    approvedStepOneTitle: 'Credenciales iniciales',
    approvedStepOneCopy: 'La primera entrada se realiza con los datos remitidos en el email de aprobación de partnership.',
    approvedStepTwoTitle: 'Acceso recurrente',
    approvedStepTwoCopy: 'Una vez activado el acceso, el partner vuelve directamente al login privado de Synergi en posteriores sesiones.',
    approvedAreaCta: 'Ir al login partner',
    supportTitle: 'Soporte de acceso',
    supportCopy: 'Si no localizas el email de aprobación o necesitas asistencia, contacta con el equipo Synergi.',
    resetTitle: 'Reenviar credenciales',
    resetCopy: 'Solicita una nueva emisión si tu acceso ha caducado o ya no conservas el correo original.',
  },
  en: {
    brandLine: 'Partner portal for the Anclora ecosystem',
    backToPrivateEstates: 'Back to Private Estates',
    portalEyebrow: 'Synergi Portal',
    portalTitle: 'A single doorway for admission and partner access',
    portalSubtitle: 'This is where the partnership request flow and the private entry for already approved collaborators live together. The funnel stays intact and the login only activates once Anclora has validated the access.',
    portalPillOne: 'Curated request',
    portalPillTwo: 'Approved access',
    portalPillThree: 'Private workspace',
    admissionEyebrow: 'Partnership Request',
    admissionTitle: 'Request partnership',
    admissionSubtitle: 'Share your profile, speciality and collaboration vision so the Anclora team can evaluate your fit inside Synergi.',
    admissionStepOneTitle: 'Structured request',
    admissionStepOneCopy: 'The partner presents their value proposition, speciality, coverage and collaboration type.',
    admissionStepTwoTitle: 'Review and reply',
    admissionStepTwoCopy: 'Anclora reviews the fit and, if approved, sends the acceptance together with the access credentials by email.',
    admissionFieldName: 'Full name',
    admissionFieldBrand: 'Company or brand',
    admissionFieldEmail: 'Professional email',
    admissionFieldSpeciality: 'Speciality or service type',
    admissionFieldVision: 'Explain how you imagine the collaboration with Anclora',
    captchaLabel: 'Security verification',
    captchaHelp: 'Complete the reCAPTCHA before submitting the request.',
    captchaRequired: 'You must complete the reCAPTCHA before submitting the request.',
    captchaError: 'The reCAPTCHA could not be validated. Please try again.',
    captchaUnavailable: 'The reCAPTCHA has not finished initialising correctly. Reload the page and try again.',
    captchaMissing: 'The public reCAPTCHA site key is missing in Synergi.',
    admissionCta: 'Submit request',
    admissionSubmitting: 'Registering request...',
    admissionPending: 'The mixed Synergi home is already prepared. The next step will be connecting this request flow to the real partner admission backend.',
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
    approvedAreaEyebrow: 'Approved Partners',
    approvedAreaTitle: 'I am already a partner',
    approvedAreaSubtitle: 'If you have already been admitted and received your credentials by email, continue through this private route to the Synergi login.',
    approvedAreaCopy: 'This path is reserved for already approved partners. On first entry you can use the initial code sent by email; afterwards you will continue through the regular login.',
    approvedStepOneTitle: 'Initial credentials',
    approvedStepOneCopy: 'The first sign-in uses the credentials sent in the partnership approval email.',
    approvedStepTwoTitle: 'Recurring access',
    approvedStepTwoCopy: 'Once access has been activated, the partner returns straight to the private Synergi login in future sessions.',
    approvedAreaCta: 'Go to partner login',
    supportTitle: 'Access support',
    supportCopy: 'If you cannot find the approval email or need assistance, contact the Synergi team.',
    resetTitle: 'Reissue credentials',
    resetCopy: 'Request a fresh credentials issue if your access has expired or you no longer have the original email.',
  },
  de: {
    brandLine: 'Partnerportal des Anclora-Ökosystems',
    backToPrivateEstates: 'Zurück zu Private Estates',
    portalEyebrow: 'Synergi Portal',
    portalTitle: 'Ein gemeinsamer Einstieg für Admission und Partnerzugang',
    portalSubtitle: 'Hier leben die Partnership-Anfrage und der private Zugang für bereits freigegebene Kollaborateure zusammen. Der Funnel bleibt intakt und das Login wird erst aktiv, wenn Anclora den Zugang validiert hat.',
    portalPillOne: 'Kuratiertes Gesuch',
    portalPillTwo: 'Freigegebener Zugang',
    portalPillThree: 'Privater Workspace',
    admissionEyebrow: 'Partnership Request',
    admissionTitle: 'Partnership anfragen',
    admissionSubtitle: 'Teile Profil, Spezialisierung und Kollaborationsvision, damit das Anclora-Team deinen Fit innerhalb von Synergi bewerten kann.',
    admissionStepOneTitle: 'Strukturierte Anfrage',
    admissionStepOneCopy: 'Der Partner beschreibt Wertversprechen, Spezialisierung, Abdeckung und Kollaborationstyp.',
    admissionStepTwoTitle: 'Prüfung und Antwort',
    admissionStepTwoCopy: 'Anclora prüft den Fit und sendet bei Freigabe die Bestätigung zusammen mit den Zugangsdaten per E-Mail.',
    admissionFieldName: 'Vollständiger Name',
    admissionFieldBrand: 'Unternehmen oder Marke',
    admissionFieldEmail: 'Geschäftliche E-Mail',
    admissionFieldSpeciality: 'Spezialisierung oder Service-Typ',
    admissionFieldVision: 'Erkläre, wie du dir die Zusammenarbeit mit Anclora vorstellst',
    captchaLabel: 'Sicherheitsprüfung',
    captchaHelp: 'Schließe das reCAPTCHA ab, bevor du die Anfrage sendest.',
    captchaRequired: 'Bevor du die Anfrage sendest, musst du zuerst das reCAPTCHA abschließen.',
    captchaError: 'Das reCAPTCHA konnte nicht validiert werden. Bitte versuche es erneut.',
    captchaUnavailable: 'Das reCAPTCHA konnte nicht korrekt initialisiert werden. Lade die Seite neu und versuche es erneut.',
    captchaMissing: 'Der öffentliche reCAPTCHA-Site-Key fehlt in Synergi.',
    admissionCta: 'Anfrage senden',
    admissionSubmitting: 'Anfrage wird registriert...',
    admissionPending: 'Die gemischte Synergi-Startseite ist bereits vorbereitet. Der nächste Schritt ist die Anbindung dieses Anfrageflusses an das reale Admission-Backend für Partner.',
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
    approvedAreaEyebrow: 'Approved Partners',
    approvedAreaTitle: 'Ich bin bereits Partner',
    approvedAreaSubtitle: 'Wenn du bereits zugelassen bist und deine Zugangsdaten per E-Mail erhalten hast, gehe über diesen privaten Einstieg zum Synergi-Login.',
    approvedAreaCopy: 'Dieser Weg ist für bereits freigegebene Partner reserviert. Beim ersten Zugang verwendest du den initialen Code aus der E-Mail; danach nutzt du den regulären Login.',
    approvedStepOneTitle: 'Erste Zugangsdaten',
    approvedStepOneCopy: 'Der erste Zugang erfolgt mit den Daten aus der Partnership-Freigabe per E-Mail.',
    approvedStepTwoTitle: 'Wiederkehrender Zugang',
    approvedStepTwoCopy: 'Sobald der Zugang aktiviert ist, kehrt der Partner in späteren Sessions direkt zum privaten Synergi-Login zurück.',
    approvedAreaCta: 'Zum Partner-Login',
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
  const explicitEntry = process.env.NEXT_PUBLIC_PRIVATE_ESTATES_PARTNER_ENTRY_URL
  const fallbackBase = process.env.NEXT_PUBLIC_PRIVATE_ESTATES_URL
  const base = (explicitEntry || fallbackBase || 'https://anclora-private-estates.vercel.app/?open=private-area').trim()
  const url = new URL(base)
  url.searchParams.set('lang', language)
  return url.toString()
}
