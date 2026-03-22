# Product Spec v0

Fecha: 2026-03-22  
Estado: baseline vigente

## Producto

Anclora Synergi es la aplicación independiente de partners del ecosistema Anclora. Su función es cubrir el ciclo completo de admisión, activación y operación partner sin depender estructuralmente de Anclora Nexus.

## Usuarios

- Candidatos externos que quieren solicitar partnership
- Equipo interno que revisa y decide admisiones
- Partners aprobados que acceden a su workspace privado

## Propuesta de valor

- Separar claramente admisión pública y acceso privado
- Ofrecer un portal premium para colaboración curada
- Convertir el partnership en un flujo operativo trazable, no en un formulario aislado

## Capacidades actuales

- Home pública mixta con admisión + entrada partner
- Login partner base
- reCAPTCHA en la solicitud pública
- Persistencia inicial en Neon para `partner_admissions`
- Backoffice interno inicial de revisión

## Capacidades pendientes prioritarias

- Auth real para partners
- Workspace partner operativo
- Emails transaccionales de confirmación, aceptación y rechazo
- Hardening de auth interna del backoffice
- Auditoría, trazabilidad y analítica operativa

## Restricciones clave

- `Synergi` debe mantenerse desacoplado de `Nexus`
- Neon es la base operativa de datos
- reCAPTCHA se valida en servidor
- Las vistas internas no pueden quedar expuestas sin protección
