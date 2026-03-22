# Synergi Review Decision Workflow Spec v1

Fecha: 2026-03-22  
Estado: propuesta alineada con roadmap v1  
Feature key: `synergi-review-decision-workflow`

## 1. Objetivo

Definir el flujo interno de revisión y decisión sobre solicitudes de partnership en `Synergi`, desde la cola de candidaturas hasta la aceptación o rechazo operativo.

## 2. Contexto actual

`Synergi` ya dispone de:
- API pública para admisión
- persistencia inicial en Neon
- panel interno de revisión
- listado y detalle de solicitudes
- cambios básicos de estado
- notas internas
- protección ligera del backoffice

Todavía no existe un workflow completo que conecte:
- revisión
- decisión formal
- emisión o preparación de credenciales
- notificación al candidato
- trazabilidad de la decisión

## 3. Alcance funcional

### Incluye
- cola de solicitudes revisables
- filtrado por estado
- cambio de estado de candidatura
- notas internas de revisión
- registro de fecha de revisión y decisión
- decisión `accepted` / `rejected`
- preparación de la siguiente fase de activación partner
- puente con la feature de auth partner

### No incluye
- login partner final
- workspace privado
- analítica avanzada de negocio
- automatización completa de emails si aún no existe la capa transaccional final

## 4. Estados de workflow

Estados mínimos:
- `submitted`
- `under_review`
- `accepted`
- `rejected`

Estados opcionales de apoyo:
- `needs_more_info`
- `decision_ready`
- `activated`

## 5. Requisitos funcionales

### RF-RD-01. Cola operable
El equipo interno debe poder ver todas las solicitudes y filtrarlas por estado.

### RF-RD-02. Revisión de detalle
Cada solicitud debe mostrar información suficiente para decidir:
- identidad
- empresa o marca
- especialidad
- propuesta de valor
- cobertura
- idiomas
- enlaces de contacto
- notas internas

### RF-RD-03. Cambio de estado
El revisor debe poder mover una solicitud entre estados de trabajo y decisión.

### RF-RD-04. Notas internas
El equipo debe poder añadir notas internas sin exponerlas públicamente.

### RF-RD-05. Trazabilidad
Debe registrarse quién revisó, cuándo revisó y cuál fue la decisión.

### RF-RD-06. Puente a activación
Cuando una solicitud se acepta, el workflow debe dejarla lista para la emisión de credenciales o para la transición al flujo de `synergi-partner-auth`.

## 6. Requisitos no funcionales

- Seguridad: el panel y las APIs internas deben permanecer protegidos
- Trazabilidad: toda decisión debe dejar huella
- UX: la cola debe ser clara, rápida y operable
- Integridad: el cambio de estado no debe corromper la candidatura
- Escalabilidad: debe permitir futuras reglas de negocio sin rehacer el modelo base

## 7. Modelo de decisión sugerido

Campos mínimos:
- `status`
- `review_notes`
- `reviewed_at`
- `reviewed_by`
- `decision_reason`
- `decision_source`

## 8. Dependencias

- admisión pública persistida en Neon
- backoffice protegido
- esquema de datos para review auditado
- feature `synergi-partner-auth` para la fase posterior de activación

## 9. Criterios de aceptación

- una solicitud puede pasar de `submitted` a `under_review`
- una solicitud puede ser aceptada o rechazada
- las notas internas quedan guardadas
- la decisión queda trazada con fecha y autor
- la aceptación deja la candidatura lista para activar el acceso partner

## 10. Relación con el roadmap

Esta feature implementa la **Fase 3. Decisión y activación partner** y consolida parte de la **Fase 2. Backoffice interno de revisión** del roadmap vigente:
- emisión de email de aceptación o rechazo
- generación de credenciales o token inicial
- registro de fecha de decisión y activación
- modelo de partner aprobado separado del applicant

