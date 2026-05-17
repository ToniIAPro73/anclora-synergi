import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos del Servicio — Anclora Synergi',
  description: 'Condiciones de uso del portal de partners Anclora Synergi.',
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(140, 90, 180, 0.18)' }}>
      <h2 style={{ color: 'var(--synergi-ink)', fontSize: '1.05rem', fontWeight: 700, marginTop: 0, marginBottom: '0.75rem' }}>
        {n}. {title}
      </h2>
      <div style={{ color: 'var(--synergi-muted)', lineHeight: 1.8, fontSize: '0.9375rem' }}>{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--synergi-navy)', color: 'var(--synergi-ink)', padding: '4rem 1.5rem 6rem' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--synergi-champagne)', marginBottom: '0.75rem' }}>
            Anclora Synergi — Legal
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Términos del Servicio
          </h1>
          <p style={{ color: 'var(--synergi-subtle)', fontSize: '0.875rem', margin: 0, opacity: 0.8 }}>
            Última actualización: mayo de 2026
          </p>
          <div style={{ marginTop: '2rem', height: '1px', background: 'rgba(140, 90, 180, 0.2)' }} />
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Section n={1} title="Objeto del servicio">
            <p>
              Anclora Synergi es el portal de colaboración B2B de Anclora Group, destinado a gestionar relaciones con
              partners, agentes, colaboradores y proveedores del ecosistema. Facilita el intercambio controlado de
              oportunidades, referidos y recursos entre partes autorizadas.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Anclora Synergi forma parte del ecosistema colaborativo de Anclora Group.
            </p>
          </Section>

          <Section n={2} title="Condiciones de uso">
            <ul style={{ margin: '0 0 0 1.25rem', padding: 0, lineHeight: 1.9 }}>
              <li>El acceso al portal es personal e intransferible y está restringido a partners autorizados.</li>
              <li>El usuario debe actuar conforme a las reglas de colaboración establecidas en su acuerdo de partner.</li>
              <li>Está prohibido usar la plataforma para fines contrarios a la ley, la ética o las normas de Anclora Group.</li>
              <li>El acceso no autorizado o el abuso de la plataforma puede resultar en la revocación inmediata del acceso.</li>
            </ul>
          </Section>

          <Section n={3} title="Confidencialidad">
            <p>
              Toda la información de oportunidades, leads, datos de negocio y comunicaciones intercambiadas
              en la plataforma tiene carácter confidencial. Los partners se comprometen a:
            </p>
            <ul style={{ margin: '0.75rem 0 0 1.25rem', padding: 0, lineHeight: 1.9 }}>
              <li>No divulgar información de oportunidades a terceros no involucrados.</li>
              <li>Usar los datos de leads únicamente para los fines acordados en el marco de la colaboración.</li>
              <li>Mantener la confidencialidad incluso tras la finalización del acuerdo de partner.</li>
            </ul>
          </Section>

          <Section n={4} title="No circumvention">
            <p>
              Los partners se comprometen a no eludir los mecanismos de atribución y gestión de la plataforma para
              establecer relaciones comerciales directas derivadas de oportunidades originadas a través de Anclora Synergi,
              salvo acuerdo expreso con Anclora Group.
            </p>
          </Section>

          <Section n={5} title="Responsabilidades del partner">
            <p>El partner es responsable de:</p>
            <ul style={{ margin: '0.75rem 0 0 1.25rem', padding: 0, lineHeight: 1.9 }}>
              <li>La exactitud y legitimidad de los datos de oportunidades y leads que introduce en la plataforma.</li>
              <li>Contar con las autorizaciones necesarias para compartir datos de terceros.</li>
              <li>Actuar con diligencia profesional y ética en todas las interacciones.</li>
              <li>Notificar cualquier incidencia o uso indebido que detecte.</li>
            </ul>
          </Section>

          <Section n={6} title="Limitaciones del servicio">
            <p>
              Anclora Synergi facilita la gestión de colaboraciones pero no garantiza el éxito de ninguna oportunidad
              ni resultado económico concreto. La plataforma no constituye asesoramiento legal, fiscal, financiero ni
              de inversión. Anclora Group no actúa como intermediario financiero ni gestor de inversiones.
            </p>
          </Section>

          <Section n={7} title="Propiedad intelectual">
            <p>
              La plataforma Anclora Synergi, incluyendo su código, diseño, flujos y lógica de negocio, es propiedad
              de Anclora Group. Los datos e información aportados por cada partner pertenecen al partner o a su
              titular legítimo.
            </p>
          </Section>

          <Section n={8} title="Exclusión de garantías">
            <p>
              La plataforma se presta en las condiciones técnicas disponibles. Anclora Group no garantiza disponibilidad
              continua ni exactitud absoluta de los datos de mercado o de oportunidades.
            </p>
          </Section>

          <Section n={9} title="Modificaciones">
            <p>
              Anclora Group puede actualizar estos términos con notificación previa. El uso continuado de la plataforma
              tras la notificación implica aceptación de los nuevos términos.
            </p>
          </Section>

          <Section n={10} title="Contacto">
            <p>
              Para cuestiones sobre estos términos:{' '}
              <a href="mailto:hola@anclora.com" style={{ color: 'var(--synergi-champagne)' }}>hola@anclora.com</a>.
            </p>
          </Section>
        </div>

        <div style={{ marginTop: '3rem', padding: '1.25rem 1.5rem', border: '1px solid rgba(140, 90, 180, 0.22)', borderRadius: '12px', background: 'var(--synergi-surface)' }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--synergi-ink)' }}>Contacto legal</p>
          <a href="mailto:hola@anclora.com" style={{ color: 'var(--synergi-champagne)', display: 'block', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            hola@anclora.com
          </a>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--synergi-muted)', fontSize: '0.875rem', opacity: 0.8 }}>
            Anclora Synergi forma parte del ecosistema colaborativo de Anclora Group.
          </p>
        </div>

        <nav style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.2)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-muted)', textDecoration: 'none' }}>Privacidad</Link>
          <Link href="/legal" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.2)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-muted)', textDecoration: 'none' }}>Aviso legal</Link>
          <Link href="/" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.3)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-champagne)', textDecoration: 'none' }}>← Volver</Link>
        </nav>
      </article>
    </main>
  )
}
