# Synergi Partner Workspace v3 Spec v1

Fecha: 2026-03-22  
Estado: propuesta activa alineada con roadmap v1  
Feature key: `synergi-partner-workspace-v3`

Relación explícita:
- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `public/docs/anclora-synergi-roadmap-v1.md`
- `sdd/features/synergi-partner-workspace-v1/synergi-partner-workspace-v1-spec-v1.md`
- `sdd/features/synergi-partner-workspace-v2/synergi-partner-workspace-v2-spec-v1.md`

## 1. Objetivo

Abrir la capa interna de operación necesaria para que `Synergi` gestione referrals y solicitudes de asset packs desde backoffice propio, y para que el equipo entregue activos reales al partner dentro del workspace sin depender de procesos manuales externos.

## 2. Contexto actual

`workspace-v2` cubre la parte partner-facing:
- referrals operativos enviados o gestionados desde el workspace
- solicitudes de asset packs desde `Assets & Documents`
- trazabilidad inicial en activity feed

La brecha pendiente es interna:
- el equipo necesita una cola operativa para gestionar referrals por partner
- las solicitudes de asset packs deben poder revisarse y resolverse
- la entrega de assets debe dejar de ser solo seed o placeholder y pasar a una publicación controlada hacia el workspace del partner

## 3. Objetivo de producto

El sistema debe permitir que el equipo interno de `Synergi`:
- revise referrals generados o asignados a partners
- cambie su estado operativo con trazabilidad
- gestione solicitudes de asset packs
- publique o entregue assets reales al partner a partir de esa gestión

El partner debe percibir el resultado en su workspace:
- estado actualizado de referrals
- solicitudes resueltas o denegadas
- nuevos assets publicados y descargables

## 4. Alcance funcional

### Incluye
- panel interno de gestión de referrals por partner
- panel interno de gestión de asset pack requests
- estados internos y notas operativas
- publicación o entrega de assets reales al workspace partner
- eventos de actividad derivados de gestión interna
- trazabilidad mínima de quién revisó, cuándo y qué se entregó

### No incluye
- workflow completo de CRM comercial
- automatizaciones avanzadas de scoring
- generación automática de documentos por IA
- DAM completo o media library avanzada
- sistema de permisos internos granular por rol corporativo

## 5. Plan primero

### Archivos a crear o modificar

Nivel SDD y coordinación:
- `sdd/features/synergi-partner-workspace-v3/`
- `.agent/team/tasks.json`
- `public/docs/anclora-synergi-roadmap-v1.md`

Previsión para implementación posterior:
- `src/app/partner-referrals/...`
- `src/app/asset-pack-requests/...`
- `src/app/api/admin/partner-referrals/...`
- `src/app/api/admin/asset-pack-requests/...`
- `src/app/api/admin/partner-assets/...`
- `src/lib/partner-workspace-store.ts`
- schema Neon del workspace

### Dependencias

- `synergi-review-decision-workflow`
- `synergi-partner-workspace-v1`
- `synergi-partner-workspace-v2`
- auth interna protegida
- Neon operativo para workspace

### Riesgos

- duplicar paneles internos con lógica solapada respecto al backoffice de admisiones
- no separar claramente gestión de referral y entrega de asset
- introducir entrega de assets sin trazabilidad suficiente
- abrir estados internos no visibles o no coherentes para el partner

### Criterio de salida

La feature queda lista para implementación cuando:
- existe una separación clara entre flujos partner-facing y gestión interna
- el modelo de datos cubre revisión, resolución y entrega
- las dependencias están reflejadas en el tablero
- el roadmap deja clara la fase operativa interna asociada a workspace

## 6. Flujos v3 a habilitar

### 6.1. Gestión interna de referrals

Flujo esperado:
1. un operador interno entra al panel protegido
2. consulta referrals por partner, estado y prioridad
3. revisa contexto, notas del partner y señales internas
4. cambia el estado o añade notas operativas
5. la decisión queda trazada y reflejada en actividad partner cuando aplique

Estados mínimos sugeridos:
- `submitted`
- `qualified`
- `in_conversation`
- `closed`
- `declined`

Campos operativos internos:
- `review_notes`
- `owner_label`
- `priority_label`
- `last_reviewed_at`
- `reviewed_by`

### 6.2. Gestión interna de asset pack requests

Flujo esperado:
1. el equipo interno abre la cola de solicitudes
2. revisa el tipo de pack solicitado y notas del partner
3. decide preparar, entregar o rechazar
4. registra notas internas y resultado
5. el partner ve el estado actualizado en su workspace

Estados mínimos sugeridos:
- `submitted`
- `under_review`
- `fulfilled`
- `rejected`

### 6.3. Entrega real de assets al partner

Flujo esperado:
1. una solicitud de asset pack se marca como resuelta o el equipo decide publicar un asset directamente
2. se crea un registro de asset asociado al partner
3. se define `asset_url`, tipo, nivel de acceso y copy contextual
4. el nuevo asset aparece en `Assets & Documents`
5. el partner puede descargarlo desde el workspace
6. la actividad registra publicación y descarga

La entrega real puede cubrir:
- assets públicos internos bajo `public/partner-assets`
- ficheros externos controlados
- assets vinculados a un pack o a un referral concreto

## 7. Evolución de vistas internas

### 7.1. Panel interno de referrals

Debe ofrecer:
- lista filtrable por partner, estado y prioridad
- detalle con notas del partner
- notas internas del equipo
- cambio de estado
- owner interno visible

### 7.2. Panel interno de asset pack requests

Debe ofrecer:
- cola de solicitudes
- filtro por estado
- detalle de la petición
- notas internas
- acción de `fulfilled` o `rejected`

### 7.3. Entrega/publicación de assets

Debe ofrecer:
- alta manual de asset para un partner
- opción de vincularlo a una solicitud o referral
- metadata mínima para render del workspace
- control básico de publicación

## 8. Requisitos funcionales

### RF-PW3-01. Gestión interna de referrals

El equipo interno debe poder revisar y actualizar referrals de partner desde un panel protegido.

### RF-PW3-02. Gestión interna de asset pack requests

El equipo interno debe poder revisar y resolver solicitudes de asset packs.

### RF-PW3-03. Entrega real de assets

La resolución de una solicitud o una decisión interna debe poder convertirse en un asset publicado y descargable para el partner.

### RF-PW3-04. Trazabilidad bidireccional

Las acciones internas relevantes deben reflejarse en actividad operativa, con visibilidad adecuada para partner o equipo interno según corresponda.

### RF-PW3-05. Seguridad

Los paneles internos y APIs asociadas deben estar protegidos y no ser accesibles por partners.

## 9. Requisitos no funcionales

- coherencia premium con el sistema visual de `Synergi`
- i18n completo en vistas partner-facing y, cuando aplique, internas
- persistencia en Neon consistente con el modelo ya activo
- APIs internas y privadas claramente separadas
- sin dependencia estructural de `Nexus`

## 10. Modelo de datos sugerido

### Extensión de `partner_referrals`

Nuevos campos sugeridos:
- `review_notes`
- `reviewed_by`
- `last_reviewed_at`
- `owner_label`

### Extensión de `partner_asset_pack_requests`

Nuevos campos sugeridos:
- `review_notes`
- `reviewed_by`
- `reviewed_at`
- `fulfilled_asset_id`

### Extensión o uso más profundo de `partner_assets`

Campos relevantes:
- `source_type` (`manual`, `asset-pack-request`, `referral-support`)
- `source_id`
- `published_by`
- `published_at`
- `asset_url`
- `access_level`

### `partner_activity_events`

Nuevos `event_type` sugeridos:
- `referral_reviewed`
- `asset_pack_request_reviewed`
- `asset_published`
- `asset_pack_fulfilled`
- `asset_pack_rejected`

## 11. API y rutas sugeridas

### Internas

- `GET /api/admin/partner-referrals`
- `PATCH /api/admin/partner-referrals/[id]`
- `GET /api/admin/asset-pack-requests`
- `PATCH /api/admin/asset-pack-requests/[id]`
- `POST /api/admin/partner-assets`

### Partner-facing impactadas

- `GET /api/partner/referrals`
- `GET /api/partner/asset-pack-requests`
- `GET /api/partner/assets/[id]/download`

## 12. Dependencias activas

- `SYNERGI-WORKSPACE-004` como cierre de v2
- auth interna operativa
- esquema Neon de workspace v2
- soporte de descarga real de assets en workspace

## 13. Riesgos abiertos

- mezclar panel de admisiones con operación post-admisión
- no distinguir bien visibilidad interna vs visibilidad partner
- publicar assets sin política mínima de naming y acceso
- inflar la actividad con eventos redundantes

## 14. Criterios de aceptación

- existe un panel interno de referrals por partner
- existe un panel interno de asset pack requests
- el equipo puede resolver solicitudes y registrar notas
- pueden publicarse assets reales al workspace del partner
- el partner ve los estados y assets resultantes en su workspace
- la trazabilidad es coherente entre gestión interna y experiencia partner

## 15. Relación con el roadmap

Esta feature amplía la operación del workspace y abre una capa interna posterior a `workspace-v2`:
- gestión interna de referrals
- gestión interna de solicitudes de asset packs
- entrega real de assets al partner

Representa la transición desde colaboración básica hacia operación privada sostenida.
