import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Anclora Synergi',
  description: 'Información sobre el tratamiento de datos personales en Anclora Synergi.',
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

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--synergi-navy)', color: 'var(--synergi-ink)', padding: '4rem 1.5rem 6rem' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--synergi-champagne)', marginBottom: '0.75rem' }}>
            Anclora Synergi — Legal
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Política de Privacidad
          </h1>
          <p style={{ color: 'var(--synergi-subtle)', fontSize: '0.875rem', margin: 0, opacity: 0.8 }}>
            Última actualización: mayo de 2026
          </p>
          <div style={{ marginTop: '2rem', height: '1px', background: 'rgba(140, 90, 180, 0.2)' }} />
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Section n={1} title="Responsable del tratamiento">
            <p>
              El responsable del tratamiento es <strong style={{ color: 'var(--synergi-ink)' }}>Anclora Group</strong>,
              operador de Anclora Synergi. Contacto:{' '}
              <a href="mailto:hola@anclora.com" style={{ color: 'var(--synergi-champagne)' }}>hola@anclora.com</a>.
            </p>
          </Section>

          <Section n={2} title="Datos que tratamos">
            <p>Anclora Synergi puede tratar las siguientes categorías de datos:</p>
            <ul style={{ margin: '0.75rem 0 0 1.25rem', padding: 0, lineHeight: 1.9 }}>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Datos de identificación profesional:</strong> nombre, apellidos, correo electrónico, teléfono, empresa u organización, rol o posición.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Datos de actividad en la plataforma:</strong> oportunidades enviadas o recibidas, historial de referidos, actividad de colaboración.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Comunicaciones internas:</strong> mensajes e intercambios relativos a oportunidades concretas dentro de la plataforma.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Datos de autenticación:</strong> correo electrónico, contraseña cifrada, token de sesión.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Datos de leads o contactos:</strong> información facilitada voluntariamente por el partner sobre oportunidades de negocio compartidas.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Los datos de contactos o leads facilitados por el partner son responsabilidad del partner en cuanto a su obtención
              y legitimación. Anclora Synergi actúa como plataforma de gestión, no como titular de dichos datos.
            </p>
          </Section>

          <Section n={3} title="Finalidades del tratamiento">
            <ul style={{ margin: '0 0 0 1.25rem', padding: 0, lineHeight: 1.9 }}>
              <li>Gestión y autenticación de acceso al portal de partners.</li>
              <li>Gestión de oportunidades, referidos y colaboraciones entre Anclora Group y sus partners.</li>
              <li>Seguimiento y atribución de leads y referidos.</li>
              <li>Comunicación entre partners y el equipo de Anclora Group en el contexto de oportunidades concretas.</li>
              <li>Auditoría y trazabilidad de operaciones dentro de la plataforma.</li>
            </ul>
          </Section>

          <Section n={4} title="Base jurídica">
            <p>
              El tratamiento se basa en la <strong style={{ color: 'var(--synergi-ink)' }}>ejecución del acuerdo de colaboración</strong> (art. 6.1.b RGPD)
              para la gestión operativa del portal, y en el <strong style={{ color: 'var(--synergi-ink)' }}>interés legítimo</strong> (art. 6.1.f RGPD)
              para la seguridad, auditoría y mejora del servicio.
            </p>
          </Section>

          <Section n={5} title="Conservación de los datos">
            <ul style={{ margin: '0 0 0 1.25rem', padding: 0, lineHeight: 1.9 }}>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Datos de acceso y sesión:</strong> durante la vigencia del acuerdo de colaboración y hasta su finalización o solicitud de supresión.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Datos de oportunidades con transacción:</strong> hasta 5 años desde el cierre, a efectos de auditoría y atribución.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Logs técnicos:</strong> eliminados transcurrido el período mínimo operativo necesario.</li>
            </ul>
          </Section>

          <Section n={6} title="Destinatarios y confidencialidad">
            <p>
              Los datos de oportunidades y leads compartidos en la plataforma son accesibles únicamente a los partners
              involucrados en cada oportunidad concreta. No se comparten datos con terceros fuera de la relación de colaboración
              establecida, salvo obligación legal.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Todos los participantes en la plataforma están sujetos a obligaciones de confidencialidad respecto a la
              información de leads, oportunidades y datos de negocio compartidos.
            </p>
          </Section>

          <Section n={7} title="Seguridad">
            <p>
              Anclora Synergi aplica medidas técnicas y organizativas adecuadas, incluyendo comunicaciones cifradas mediante
              HTTPS, control de acceso por roles y gestión de sesiones. La confidencialidad de los datos de negocio es
              un principio fundamental de la plataforma.
            </p>
          </Section>

          <Section n={8} title="Derechos del interesado">
            <p>Conforme al RGPD (UE) 2016/679 y la LOPDGDD, puedes ejercer los derechos de:</p>
            <ul style={{ margin: '0.75rem 0 0 1.25rem', padding: 0, lineHeight: 1.9 }}>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Acceso:</strong> conocer qué datos se tratan sobre ti.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Rectificación:</strong> corregir datos inexactos.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Supresión:</strong> solicitar la eliminación cuando proceda.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
              <li><strong style={{ color: 'var(--synergi-ink)' }}>Oposición y limitación:</strong> en los casos previstos por la normativa.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Solicitudes a <a href="mailto:hola@anclora.com" style={{ color: 'var(--synergi-champagne)' }}>hola@anclora.com</a>.
              También puedes reclamar ante la AEPD en{' '}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--synergi-champagne)' }}>www.aepd.es</a>.
            </p>
          </Section>

          <Section n={9} title="Contacto">
            <p>
              Para cualquier cuestión sobre privacidad:{' '}
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
          <Link href="/terms" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.2)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-muted)', textDecoration: 'none' }}>Términos</Link>
          <Link href="/legal" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.2)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-muted)', textDecoration: 'none' }}>Aviso legal</Link>
          <Link href="/" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.3)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-champagne)', textDecoration: 'none' }}>← Volver</Link>
        </nav>
      </article>
    </main>
  )
}
