import { NextRequest, NextResponse } from 'next/server'
import { createPartnerAdmission } from '@/lib/partner-admissions-store'

type PartnerAdmissionPayload = {
  name?: string
  brand?: string
  email?: string
  speciality?: string
  vision?: string
  privacyAccepted?: boolean
  newsletterOptIn?: boolean
  submissionLanguage?: string
  captchaToken?: string
}

type RecaptchaVerificationResponse = {
  success?: boolean
  hostname?: string
  'error-codes'?: string[]
}

const RECAPTCHA_VERIFY_URL =
  process.env.RECAPTCHA_VERIFY_URL?.trim() || 'https://www.google.com/recaptcha/api/siteverify'

function getClientIp(request: NextRequest): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || undefined
  }

  return request.headers.get('x-real-ip')?.trim() || undefined
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY?.trim()
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Missing RECAPTCHA_SECRET_KEY in server environment.' },
      { status: 500 }
    )
  }

  let payload: PartnerAdmissionPayload

  try {
    payload = (await request.json()) as PartnerAdmissionPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const name = payload.name?.trim() || ''
  const email = payload.email?.trim() || ''
  const vision = payload.vision?.trim() || ''
  const speciality = payload.speciality?.trim() || ''
  const captchaToken = payload.captchaToken?.trim() || ''
  const submissionLanguage = payload.submissionLanguage?.trim() || 'es'

  if (!name || !email || !vision || !captchaToken) {
    return NextResponse.json(
      { error: 'Name, email, vision and captcha token are required.' },
      { status: 400 }
    )
  }

  const verificationBody = new URLSearchParams({
    secret: secretKey,
    response: captchaToken,
  })

  const remoteIp = getClientIp(request)
  if (remoteIp) {
    verificationBody.set('remoteip', remoteIp)
  }

  let verification: RecaptchaVerificationResponse

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationBody.toString(),
      cache: 'no-store',
    })

    verification = (await response.json()) as RecaptchaVerificationResponse
  } catch {
    return NextResponse.json(
      { error: 'Unable to verify reCAPTCHA with Google.' },
      { status: 502 }
    )
  }

  if (!verification.success) {
    return NextResponse.json(
      {
        error: 'reCAPTCHA verification failed.',
        details: verification['error-codes'] || [],
      },
      { status: 400 }
    )
  }

  if (payload.privacyAccepted !== true) {
    return NextResponse.json(
      { error: 'Privacy policy must be accepted.' },
      { status: 400 }
    )
  }

  const serviceSummary = [speciality, vision].filter(Boolean).join(' | ').slice(0, 3000)
  let admission: { id: string; status: string; created_at: string }

  try {
    admission = await createPartnerAdmission({
      fullName: name,
      email,
      companyName: payload.brand?.trim() || undefined,
      serviceCategory: 'professional',
      serviceSummary: serviceSummary || vision,
      collaborationPitch: vision,
      coverageAreas: [],
      languages: [],
      sustainabilityFocus: false,
      privacyAccepted: true,
      newsletterOptIn: payload.newsletterOptIn === true,
      captchaProvider: 'recaptcha',
      captchaHostname: verification.hostname,
      submissionLanguage,
      submissionSource: 'synergi',
    })
  } catch {
    return NextResponse.json(
      { error: 'Unable to persist partner admission in Neon.' },
      { status: 502 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: 'Partner admission submitted',
    admission_id: admission.id,
    status: admission.status,
    created_at: admission.created_at,
  })
}
