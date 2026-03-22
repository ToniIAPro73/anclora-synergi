# Synergi Partner Workspace v3 Test Plan v1

Fecha: 2026-03-22  
Estado: propuesta activa  
Feature key: `synergi-partner-workspace-v3`

## 1. Objetivo

Validar la capa interna de `workspace-v3`, centrada en gestión interna de referrals, gestión interna de asset pack requests y entrega real de assets al partner dentro del workspace.

## 2. Alcance a validar

- panel interno de referrals
- panel interno de asset pack requests
- publicación/entrega de assets al partner
- sincronización con el workspace partner
- protección de acceso y visibilidad por actor
- regresión sobre `workspace-v1` y `workspace-v2`

## 3. Tipos de validación

### 3.1. Validación funcional

- el equipo interno puede listar y filtrar referrals
- puede actualizar estado y notas internas
- puede listar y gestionar asset pack requests
- puede resolver solicitudes con entrega o rechazo
- puede publicar assets reales para un partner
- el partner ve el resultado en su workspace

### 3.2. Validación visual

- los paneles internos mantienen claridad operativa
- la UI partner no se contamina con detalle interno irrelevante
- la publicación de assets no rompe la jerarquía premium del workspace

### 3.3. Validación de datos

- las acciones internas persisten en Neon
- los estados visibles al partner son coherentes con el workflow interno
- la entrega de assets crea registros válidos en `partner_assets`
- la actividad registra eventos correctos sin duplicidades

## 4. Escenarios principales

### Escenario A. Gestión interna de referral

1. iniciar sesión interna
2. abrir panel de referrals
3. filtrar por estado `submitted`
4. abrir detalle de un referral
5. añadir nota interna
6. marcar como `qualified`

Resultado esperado:
- el cambio persiste
- el panel refleja el nuevo estado
- la actividad asociada se actualiza cuando aplique

### Escenario B. Gestión interna de asset pack request

1. iniciar sesión interna
2. abrir cola de solicitudes
3. seleccionar una request
4. añadir nota de revisión
5. marcar como `under_review`

Resultado esperado:
- la solicitud conserva notas y estado
- el equipo puede recuperarla después con contexto completo

### Escenario C. Fulfillment con entrega de asset

1. iniciar sesión interna
2. abrir una asset pack request
3. resolverla como `fulfilled`
4. publicar un asset asociado al partner

Resultado esperado:
- se crea o vincula un asset real
- el partner ve el asset en `Assets & Documents`
- el estado de la solicitud cambia a resuelta

### Escenario D. Rechazo de solicitud

1. iniciar sesión interna
2. abrir solicitud de asset pack
3. marcar como `rejected`
4. guardar nota interna

Resultado esperado:
- la solicitud queda rechazada
- el partner ve el estado actualizado sin detalle interno sensible

### Escenario E. Descarga partner tras entrega

1. el equipo entrega un asset
2. el partner entra a su workspace
3. descarga el nuevo asset

Resultado esperado:
- el asset es visible y descargable
- el contador de descargas se actualiza
- la actividad refleja publicación y descarga

## 5. Casos de seguridad

- acceso de partner a APIs internas -> denegado
- acceso sin sesión interna a paneles internos -> redirección o `401`
- intento de publicar asset para partner incorrecto -> denegado o validación fallida
- notas internas no visibles desde la UI partner

## 6. Casos de regresión

- login partner sigue funcionando
- referrals y asset pack requests partner-facing siguen operativos
- assets ya publicados siguen descargándose correctamente
- activity feed del partner no pierde eventos existentes
- backoffice de admisiones no se rompe por coexistencia con paneles operativos

## 7. Automatización recomendada

### Tests unitarios

- transición de estados internos
- reglas de visibilidad de notas y eventos
- mapeo de eventos de publicación/fulfillment

### Tests de integración

- `GET/PATCH /api/admin/partner-referrals`
- `GET/PATCH /api/admin/asset-pack-requests`
- `POST /api/admin/partner-assets`
- sincronización posterior en `GET /api/partner/assets`

### Tests E2E

- flujo interno: gestionar referral
- flujo interno: resolver asset pack request y publicar asset
- flujo combinado: partner recibe y descarga asset entregado

## 8. Riesgos a vigilar en QA

- exposición accidental de campos internos al partner
- divergencia entre estado interno y estado visible en workspace
- assets publicados con URLs inválidas o sin metadata suficiente
- timeline saturado por eventos técnicos

## 9. Criterio de cierre

La feature puede considerarse lista cuando:
- la operación interna de referrals está protegida y es usable
- las asset pack requests pueden revisarse y resolverse internamente
- la resolución puede desembocar en entrega real de assets
- el partner recibe el resultado dentro de su workspace sin regresiones
