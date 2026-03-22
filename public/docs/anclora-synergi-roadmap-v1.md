# Anclora Synergi Roadmap v1

Fecha: 2026-03-22  
Estado: baseline operativo para completar el producto end-to-end

## 1. Estado actual analizado

`Synergi` ya dispone de una base útil:
- portal público mixto con solicitud de partnership y acceso para partners aprobados
- login partner visual ya separado
- validación de reCAPTCHA
- API pública propia para admisión
- persistencia en Neon de `partner_admissions`
- pantalla interna inicial de revisión
- protección básica del backoffice con sesión admin

Sin embargo, todavía no existe un ciclo completo de producto. La app puede captar y revisar solicitudes, pero aún no resuelve aceptación operativa, emisión de acceso partner ni workspace privado funcional.

## 2. North Star

Completar `Synergi` como portal independiente de partners del ecosistema Anclora, con tres capas cerradas:
- admisión pública fiable
- backoffice interno de revisión y decisión
- workspace privado para partners ya aprobados

## 3. Fases del roadmap

### Fase 0. Baseline y gobernanza

Objetivo:
- consolidar SDD, roadmap y estructura multiagente

Entregables:
- `.agent/`
- `sdd/core`
- tablero inicial de tareas
- documento roadmap vigente

### Fase 1. Admisión pública robusta

Objetivo:
- cerrar la solicitud pública de partnership como flujo real

Entregables:
- formulario conectado a Neon
- validación server-side de reCAPTCHA
- consentimiento de privacidad y newsletter
- mensajes de éxito y error consistentes
- trazabilidad mínima de origen, idioma y captcha

### Fase 2. Backoffice interno de revisión

Objetivo:
- convertir la admisión en una cola operable por el equipo

Entregables:
- listado filtrable
- detalle de candidatura
- notas internas
- estados `submitted`, `under_review`, `accepted`, `rejected`
- protección del panel y APIs internas

### Fase 3. Decisión y activación partner

Objetivo:
- transformar la aceptación en un acto operativo

Entregables:
- emisión de email de aceptación/rechazo
- generación de credenciales o token inicial
- registro de fecha de decisión y activación
- modelo de partner aprobado separado del applicant

### Fase 4. Auth partner real

Objetivo:
- cerrar la entrada privada de los partners aprobados

Entregables:
- login real conectado a identidad propia de Synergi
- primer acceso con credenciales iniciales
- transición a contraseña o método estable
- recuperación o reenvío de acceso

### Fase 5. Workspace partner v1

Objetivo:
- abrir la primera zona privada con valor operativo

Entregables:
- overview del partner
- perfil editable
- activos y documentos compartidos
- actividad reciente
- CTA operativos para colaboración y referrals

### Fase 6. Hardening y operación real

Objetivo:
- dejar el producto listo para operación sostenida

Entregables:
- endurecimiento de auth interna y partner
- logs y auditoría
- test plan end-to-end
- despliegue estable
- revisión de observabilidad, errores y privacidad

## 4. Features necesarias

### Bloque público

- `synergi-public-admission-flow`
- `synergi-public-copy-and-premium-ux`
- `synergi-captcha-and-server-validation`

### Bloque interno

- `synergi-admissions-backoffice`
- `synergi-admin-auth-hardening`
- `synergi-review-decision-workflow`

### Bloque partner

- `synergi-partner-auth`
- `synergi-partner-workspace-v1`
- `synergi-credential-lifecycle`

### Bloque plataforma

- `synergi-neon-schema-evolution`
- `synergi-email-transactional-layer`
- `synergi-qa-and-release-hardening`

## 5. Dependencias críticas

- Neon operativo y estable
- variables server-side completas
- contrato claro para emails transaccionales
- decisión sobre estrategia final de auth partner

## 6. Riesgos abiertos

- que el backoffice se quede demasiado tiempo con auth ligera
- que el schema de admisiones no evolucione al ritmo del workspace
- que el login partner se diseñe antes de cerrar la activación real
- que se mezclen responsabilidades entre `Synergi` y `Nexus`

## 7. Criterio de producto finalizado

`Synergi` se considera completado end-to-end cuando:
- un candidato puede solicitar partnership
- el equipo puede revisar, aceptar o rechazar
- el partner aceptado recibe acceso real
- el partner entra a su workspace privado
- el sistema mantiene trazabilidad, seguridad y operación básica sin depender de `Nexus`
