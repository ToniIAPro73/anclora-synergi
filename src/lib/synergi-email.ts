import { buildSynergiAbsoluteUrl } from '@/lib/app-url'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

type PartnerDecisionEmailInput = {
  partnerName: string
  email: string
  companyName?: string | null
  inviteCode: string
  launchUrl: string
}

type PartnerRejectedEmailInput = {
  partnerName: string
  email: string
}

type PartnerReissueEmailInput = {
  partnerName: string
  email: string
  inviteCode: string
  launchUrl: string
}

function getConfiguredSupportEmail() {
  return process.env.SYNERGI_SUPPORT_EMAIL?.trim() || 'synergi@anclora.com'
}

function getEmailSender() {
  const from = process.env.SYNERGI_EMAIL_FROM?.trim()
  if (!from) {
    throw new Error('Missing SYNERGI_EMAIL_FROM in server environment.')
  }
  return from
}

function getEmailReplyTo() {
  return process.env.SYNERGI_EMAIL_REPLY_TO?.trim() || getConfiguredSupportEmail()
}

async function sendViaResend(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY in server environment.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getEmailSender(),
      to: [input.to],
      reply_to: getEmailReplyTo(),
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Resend email delivery failed: ${body || response.statusText}`)
  }
}

async function sendNoop() {
  return
}

async function deliverEmail(input: SendEmailInput) {
  const provider = process.env.SYNERGI_EMAIL_PROVIDER?.trim().toLowerCase() || 'noop'

  if (provider === 'resend') {
    await sendViaResend(input)
    return
  }

  await sendNoop()
}

function wrapEmailHtml(content: string) {
  return `
    <div style="margin:0;padding:32px;background:#081a26;color:#f7f1e7;font-family:Georgia,serif;">
      <div style="max-width:680px;margin:0 auto;padding:32px;border-radius:24px;border:1px solid rgba(212,175,55,0.28);background:linear-gradient(180deg,#0c2b36 0%,#09202a 100%);">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#d4af37;">Anclora Synergi</p>
        ${content}
        <p style="margin:28px 0 0;color:#b9c8cd;font-size:14px;line-height:1.8;">
          Si necesitas ayuda adicional, puedes responder a este correo o escribir a ${getConfiguredSupportEmail()}.
        </p>
      </div>
    </div>
  `
}

export async function sendPartnerAcceptedEmail(input: PartnerDecisionEmailInput) {
  const absoluteLaunchUrl = input.launchUrl.startsWith('http')
    ? input.launchUrl
    : buildSynergiAbsoluteUrl(input.launchUrl)

  await deliverEmail({
    to: input.email,
    subject: 'Anclora Synergi | Partnership aprobado y acceso activado',
    text: [
      `Hola ${input.partnerName},`,
      '',
      'Tu solicitud de partnership ha sido aprobada.',
      `Codigo inicial: ${input.inviteCode}`,
      `Acceso a Synergi: ${absoluteLaunchUrl}`,
      '',
      'Al entrar por primera vez podras activar tu password estable para posteriores sesiones.',
    ].join('\n'),
    html: wrapEmailHtml(`
      <h1 style="margin:0;font-size:34px;line-height:1.1;">Tu partnership con Synergi ha sido aprobado</h1>
      <p style="margin:18px 0 0;color:#d7dfdf;font-size:16px;line-height:1.8;">
        Hola ${input.partnerName}, tu acceso al portal privado de Anclora Synergi ya ha sido habilitado.
      </p>
      <div style="margin:24px 0;padding:22px;border-radius:18px;background:rgba(8,31,40,0.68);border:1px solid rgba(212,175,55,0.22);">
        <p style="margin:0 0 10px;color:#d4af37;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;">Codigo inicial</p>
        <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.12em;">${input.inviteCode}</p>
      </div>
      <p style="margin:0 0 14px;color:#d7dfdf;font-size:16px;line-height:1.8;">
        Usa el email <strong>${input.email}</strong> y este codigo en tu primer acceso para activar tu password estable.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${absoluteLaunchUrl}" style="display:inline-block;padding:16px 28px;border-radius:999px;background:linear-gradient(135deg,#bf953f 0%,#fcf6ba 45%,#b38728 50%,#fbf5b7 55%,#aa771c 100%);color:#08212a;text-decoration:none;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;font-size:12px;">
          Entrar en Synergi
        </a>
      </p>
      <p style="margin:0;color:#b9c8cd;font-size:14px;line-height:1.8;">
        ${input.companyName ? `Empresa o marca asociada: ${input.companyName}.<br />` : ''}
        Si el codigo caduca o no localizas este correo, podras solicitar una nueva emision desde la pantalla de login.
      </p>
    `),
  })
}

export async function sendPartnerRejectedEmail(input: PartnerRejectedEmailInput) {
  await deliverEmail({
    to: input.email,
    subject: 'Anclora Synergi | Resultado de tu solicitud de partnership',
    text: [
      `Hola ${input.partnerName},`,
      '',
      'Gracias por tu interes en colaborar con Anclora Synergi.',
      'Tras revisar tu solicitud, en este momento no vamos a activar el partnership.',
      '',
      `Si quieres ampliar contexto o resolver dudas, puedes escribir a ${getConfiguredSupportEmail()}.`,
    ].join('\n'),
    html: wrapEmailHtml(`
      <h1 style="margin:0;font-size:34px;line-height:1.1;">Actualizacion sobre tu solicitud de partnership</h1>
      <p style="margin:18px 0 0;color:#d7dfdf;font-size:16px;line-height:1.8;">
        Hola ${input.partnerName}, gracias por tu interes en colaborar con Anclora Synergi.
      </p>
      <p style="margin:18px 0 0;color:#d7dfdf;font-size:16px;line-height:1.8;">
        Tras revisar tu candidatura, en este momento no vamos a activar el partnership. Si en el futuro se abre un encaje mejor con el ecosistema, podremos retomar la conversacion.
      </p>
    `),
  })
}

export async function sendPartnerReissueEmail(input: PartnerReissueEmailInput) {
  const absoluteLaunchUrl = input.launchUrl.startsWith('http')
    ? input.launchUrl
    : buildSynergiAbsoluteUrl(input.launchUrl)

  await deliverEmail({
    to: input.email,
    subject: 'Anclora Synergi | Nueva emision de credenciales',
    text: [
      `Hola ${input.partnerName},`,
      '',
      'Hemos generado una nueva emision de credenciales para tu acceso a Synergi.',
      `Codigo inicial: ${input.inviteCode}`,
      `Acceso a Synergi: ${absoluteLaunchUrl}`,
      '',
      'Si ya tienes un password activo, este codigo te permitira volver a la ruta de activacion y definir uno nuevo.',
    ].join('\n'),
    html: wrapEmailHtml(`
      <h1 style="margin:0;font-size:34px;line-height:1.1;">Nueva emision de credenciales</h1>
      <p style="margin:18px 0 0;color:#d7dfdf;font-size:16px;line-height:1.8;">
        Hola ${input.partnerName}, hemos preparado una nueva emision de acceso para tu cuenta partner en Synergi.
      </p>
      <div style="margin:24px 0;padding:22px;border-radius:18px;background:rgba(8,31,40,0.68);border:1px solid rgba(212,175,55,0.22);">
        <p style="margin:0 0 10px;color:#d4af37;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;">Codigo inicial</p>
        <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.12em;">${input.inviteCode}</p>
      </div>
      <p style="margin:0 0 24px;">
        <a href="${absoluteLaunchUrl}" style="display:inline-block;padding:16px 28px;border-radius:999px;background:linear-gradient(135deg,#bf953f 0%,#fcf6ba 45%,#b38728 50%,#fbf5b7 55%,#aa771c 100%);color:#08212a;text-decoration:none;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;font-size:12px;">
          Recuperar acceso
        </a>
      </p>
      <p style="margin:0;color:#b9c8cd;font-size:14px;line-height:1.8;">
        Este codigo te permitira validar de nuevo tu identidad y establecer un password estable para sesiones posteriores.
      </p>
    `),
  })
}
