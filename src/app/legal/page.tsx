import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aviso Legal — Anclora Synergi',
  description: 'Aviso legal e información corporativa de Anclora Synergi.',
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

export default function LegalPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--synergi-navy)', color: 'var(--synergi-ink)', padding: '4rem 1.5rem 6rem' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--synergi-champagne)', marginBottom: '0.75rem' }}>
            Anclora Synergi — Legal
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Aviso Legal
          </h1>
          <p style={{ color: 'var(--synergi-subtle)', fontSize: '0.875rem', margin: 0, opacity: 0.8 }}>
            Última actualización: mayo de 2026
          </p>
          <div style={{ marginTop: '2rem', height: '1px', background: 'rgba(140, 90, 180, 0.2)' }} />
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Section n={1} title="Titularidad y operador">
            <p>
              Anclora Synergi es operado por <strong style={{ color: 'var(--synergi-ink)' }}>Anclora Group</strong>.
              Anclora Synergi forma parte del ecosistema colaborativo de Anclora Group.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Contacto: <a href="mailto:hola@anclora.com" style={{ color: 'var(--synergi-champagne)' }}>hola@anclora.com</a>
            </p>
          </Section>

          <Section n={2} title="Naturaleza del servicio">
            <p>
              Anclora Synergi es una plataforma de gestión de colaboraciones B2B, accesible exclusivamente a partners,
              agentes y colaboradores autorizados por Anclora Group. No es un servicio público ni abierto al público general.
            </p>
          </Section>

          <Section n={3} title="Condiciones de acceso">
            <p>
              El acceso requiere autorización previa de Anclora Group. Los usuarios no autorizados no deben intentar
              acceder a la plataforma. El acceso indebido puede dar lugar a acciones legales conforme a la legislación
              española y europea aplicable.
            </p>
          </Section>

          <Section n={4} title="Propiedad intelectual e industrial">
            <p>
              La plataforma Anclora Synergi, su código, diseño, lógica de negocio y todos los elementos que la integran
              son propiedad de Anclora Group o están licenciados a su favor. Queda prohibida su reproducción, distribución
              o uso fuera del ámbito del servicio sin autorización expresa.
            </p>
          </Section>

          <Section n={5} title="Responsabilidad sobre contenidos">
            <p>
              Los datos e información introducidos en la plataforma por los partners son responsabilidad de los propios
              partners. Anclora Group no valida la exactitud de los datos de oportunidades ni garantiza el éxito de ninguna
              colaboración.
            </p>
          </Section>

          <Section n={6} title="Marca Anclora Synergi">
            <p>
              Anclora Synergi forma parte del ecosistema colaborativo de Anclora Group. Las marcas, nombres comerciales
              y logotipos de Anclora son propiedad de Anclora Group y no pueden usarse sin autorización expresa.
            </p>
          </Section>

          <Section n={7} title="Legislación aplicable">
            <p>
              Este aviso legal se rige por la legislación española y de la Unión Europea. Las partes se someten a los
              juzgados y tribunales competentes conforme a la normativa aplicable.
            </p>
          </Section>

          <Section n={8} title="Contacto">
            <p>
              Para cuestiones legales:{' '}
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
          <Link href="/terms" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.2)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-muted)', textDecoration: 'none' }}>Términos</Link>
          <Link href="/" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(140, 90, 180, 0.3)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--synergi-champagne)', textDecoration: 'none' }}>← Volver</Link>
        </nav>
      </article>
    </main>
  )
}
