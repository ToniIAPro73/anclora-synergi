# Synergi Admissions Backoffice Productization Spec v1

Fecha: 2026-03-23
Estado: propuesta activa alineada con roadmap v1
Feature key: `synergi-admissions-backoffice-productization`

Relacion explicita:
- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `public/docs/anclora-synergi-roadmap-v1.md`
- `sdd/features/synergi-review-decision-workflow/synergi-review-decision-workflow-spec-v1.md`
- `sdd/features/synergi-partner-auth/synergi-partner-auth-spec-v1.md`

## 1. Objetivo

Convertir el backoffice interno de admisiones en una capa productiva completa: busqueda, filtrado, asignacion, decision, activacion y emision transaccional de correos para que el flujo candidate-to-partner quede realmente operable.

## 2. Contexto actual

`Synergi` ya dispone de:
- captura publica de solicitudes
- review interno inicial
- estados y notas basicas
- proteccion ligera del panel

La brecha pendiente es de producto:
- falta una cola mas operable
- faltan herramientas para revisar y priorizar
- falta una decision formal con trazabilidad util
- faltan emails y handoff claros para activar al partner
- falta una vision 360 del candidato durante el proceso

## 3. Objetivo de producto

El sistema debe permitir que el equipo interno:
- encuentre y filtre candidaturas con rapidez
- asigne y priorice solicitudes
- revise el detalle con contexto completo
- tome decisiones con razon y trazabilidad
- active el siguiente paso de acceso partner
- dispare comunicaciones transaccionales coherentes

## 4. Alcance funcional

### Incluye
- busqueda y filtrado avanzado en la cola
- asignacion o ownership interno
- detalle 360 de la candidatura
- notas internas y decision reason
- estados ampliados de trabajo y decision
- plantillas de email de aprobacion, rechazo y reenvio
- handoff hacia activacion partner
- archivado o cierre operativo de solicitudes

### No incluye
- CRM comercial completo
- scoring automatizado complejo
- automatizaciones sin supervison
- analitica avanzada de funnel de pago

## 5. Plan primero

### Archivos a crear o modificar

Nivel SDD y coordinacion:
- `sdd/features/synergi-admissions-backoffice-productization/`
- `.agent/team/tasks.json`
- `public/docs/anclora-synergi-roadmap-v1.md`

Prevision para implementacion posterior:
- `src/app/partner-admissions/...`
- `src/app/api/admin/...`
- `src/lib/partner-admissions-store.ts`
- `src/lib/email/...`
- `src/lib/admin-auth.ts`

### Dependencias

- `synergi-review-decision-workflow`
- `synergi-security-operations-hardening`
- Neon operativo
- capa transaccional de email

### Riesgos

- duplicar logica entre review decision workflow y productizacion
- perder claridad entre candidato y partner aprobado
- exponer demasiada informacion interna en la vista de cola
- introducir email flow sin control de errores o reintentos

### Criterio de salida

La feature queda lista para implementacion cuando:
- la cola es realmente operable
- la decision queda trazada con contexto
- la aceptacion produce el siguiente paso operativo
- el rechazo queda comunicado de forma consistente
- el roadmap refleja este bloque como etapa independiente

## 6. Flujos a habilitar

### 6.1. Triage de solicitudes

Flujo esperado:
1. entra una solicitud nueva
2. el equipo la filtra o busca por criterio operativo
3. se asigna o prioriza
4. se mueve a revision o se archiva

### 6.2. Revision y decision

Flujo esperado:
1. se abre el detalle completo
2. se revisan notas, contexto y señales del candidato
3. se toma una decision con razon y fecha
4. la decision queda trazada

### 6.3. Activacion partner

Flujo esperado:
1. una solicitud aceptada pasa a activacion
2. se preparan credenciales o token inicial
3. el partner recibe email de aprobacion o rechazo
4. el flujo deja listo el acceso partner

### 6.4. 360 de candidatura

Flujo esperado:
1. el equipo consulta una vista mas rica de la candidatura
2. ve historial, estado, decision y handoff
3. puede navegar rapidamente sin perder contexto

## 7. Modelo de datos sugerido

### Extensiones de `partner_admissions`
- `decision_reason`
- `decision_source`
- `assigned_to`
- `priority_label`
- `archived_at`

### Extensiones de `partner_admission_decisions`
- `decision_channel`
- `decision_summary`
- `email_template_key`
- `activation_state`

### Entidades auxiliares
- cola de emails transaccionales
- registros de reenvio o reemision
- banderas de handoff a partner auth

## 8. Requisitos funcionales

### RF-ABP-01. Cola operable
El equipo debe poder buscar, filtrar y priorizar solicitudes con rapidez.

### RF-ABP-02. Vista 360
Cada candidatura debe mostrar el contexto necesario para decidir sin saltos.

### RF-ABP-03. Decision trazable
Cada aceptacion o rechazo debe guardar autor, fecha y motivo.

### RF-ABP-04. Comunicacion transaccional
La decision debe poder disparar emails coherentes y repetibles.

### RF-ABP-05. Handoff a activacion
La aceptacion debe dejar la candidatura lista para el flujo de acceso partner.

## 9. Requisitos no funcionales

- respuesta rapida en cola y filtros
- coherencia premium en la UI interna
- trazabilidad completa sin filtrar campos sensibles
- tolerancia a fallos de email sin perder la decision
- compatibilidad con el flujo actual de admision

## 10. Criterios de aceptacion

- una solicitud se puede buscar y priorizar
- el equipo ve contexto suficiente para decidir
- la decision queda trazada y fechada
- se puede emitir la comunicacion correspondiente
- la aceptacion prepara el siguiente paso de activacion partner

## 11. Relacion con el roadmap

Esta feature agrupa la evolucion productiva de la admision y el backoffice.
Es la capa que convierte el flujo actual en una operacion repetible, medible y lista para escalar.
