# Synergi Partner Workspace v5 Spec v1

Fecha: 2026-03-23
Estado: propuesta activa alineada con roadmap v1
Feature key: `synergi-partner-workspace-v5`

Relacion explicita:
- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `public/docs/anclora-synergi-roadmap-v1.md`
- `sdd/features/synergi-partner-workspace-v4/synergi-partner-workspace-v4-spec-v1.md`
- `sdd/features/synergi-security-operations-hardening/synergi-security-operations-hardening-spec-v1.md`

## 1. Objetivo

Convertir el workspace partner de `Synergi` en una capa operativa mas madura: ownership comercial de referrals, estados comerciales mas ricos, panel de activos publicados con versionado basico, seguimiento mas real de asset packs y notificaciones mas accionables.

## 2. Contexto actual

`workspace-v4` ya cubre:
- dashboard 360
- reporting basico
- highlights y notificaciones
- vista madura de colaboracion

La brecha pendiente es operativa:
- referrals con ownership comercial y siguiente paso
- activos publicados con ciclo de vida mas claro
- asset packs con seguimiento de entrega mas util
- notificaciones mas accionables
- reporting 360 con lectura operativa real

## 3. Objetivo de producto

El partner debe poder:
- entender rapidamente quien lleva cada referral
- ver el estado comercial real de su actividad
- distinguir versiones activas, retiradas o nuevas de un asset
- seguir el progreso de asset packs con mas contexto
- recibir notificaciones que indiquen accion real

## 4. Alcance funcional

### Incluye
- ownership comercial por referral
- pipeline comercial mas rico
- versionado basico de assets publicados
- edicion, retirada y republicacion de activos
- seguimiento mas claro de asset packs
- highlights y notificaciones mas accionables
- 360 con foco en colaboracion operativa

### No incluye
- CRM completo
- DAM multimedia enterprise
- workflow comercial con decenas de estados
- automatizaciones complejas de follow-up

## 5. Plan primero

### Archivos a crear o modificar

- `sdd/features/synergi-partner-workspace-v5/`
- `.agent/team/tasks.json`
- `public/docs/anclora-synergi-roadmap-v1.md`

Prevision de implementacion:
- `src/lib/partner-workspace-store.ts`
- `src/app/workspace/page.tsx`
- `src/components/synergi/SynergiWorkspacePage.tsx`
- `src/components/synergi/PartnerOperationsConsole.tsx`
- `src/app/api/admin/partner-assets/**`
- `src/app/api/admin/partner-referrals/**`
- `src/app/api/admin/asset-pack-requests/**`
- `src/lib/i18n.tsx`
- `src/app/globals.css`

### Dependencias

- `synergi-partner-workspace-v4`
- `synergi-security-operations-hardening`
- `synergi-admissions-backoffice-productization`
- Neon operativo

### Riesgos

- convertir el workspace en un CRM pesado
- exponer demasiada operativa interna al partner
- romper la jerarquia premium de la UI
- duplicar estados entre referrals, assets y packs

### Criterio de salida

La feature queda lista cuando:
- los referrals muestran ownership y pipeline real
- los assets pueden versionarse y retirarse
- los asset packs se siguen con mas claridad
- el reporting refleja la nueva profundidad operativa

## 6. Flujos a habilitar

### 6.1. Referral ownership

Flujo esperado:
1. entra o se actualiza un referral
2. se asigna ownership comercial
3. el partner y el equipo ven siguiente paso y estado

### 6.2. Asset lifecycle

Flujo esperado:
1. un asset se publica o versiona
2. la version activa se distingue claramente
3. una retirada deja trazabilidad operativa

### 6.3. Asset pack delivery

Flujo esperado:
1. un pack se solicita
2. la entrega se gestiona con mas contexto
3. el partner ve mejor el seguimiento y la resolucion

### 6.4. Actionable notifications

Flujo esperado:
1. el workspace detecta cambios relevantes
2. destaca aquello que requiere accion
3. el partner entiende su foco operativo actual

## 7. Modelo de datos sugerido

- `commercial_owner`
- `commercial_stage`
- `next_action`
- `asset_group_key`
- `version_number`
- `retired_at`
- `delivery_method`
- `delivery_reference`
- `delivery_notes`

## 8. Requisitos funcionales

### RF-WV5-01. Ownership comercial
Cada referral debe poder asignarse y seguirse con un responsable claro.

### RF-WV5-02. Assets versionables
Los assets publicados deben poder versionarse, editarse y retirarse.

### RF-WV5-03. Asset packs traceables
Las solicitudes de packs deben mostrar progreso y entrega con mas contexto.

### RF-WV5-04. Notifications utiles
Las notificaciones deben orientar la accion, no solo informar.

### RF-WV5-05. 360 operativo
El dashboard debe reflejar la nueva capa operativa sin perder claridad.

## 9. Requisitos no funcionales

- mantener coherencia premium
- no saturar el workspace
- responsive en desktop y mobile
- trazabilidad clara sin ruido
- compatibilidad con v1-v4

## 10. Criterios de aceptacion

- un referral puede mostrar owner y pipeline
- un asset puede verse como actual, versionado o retirado
- un asset pack se puede seguir con mas contexto
- el dashboard 360 sigue siendo claro y accionable
- la UI continua sintiendose premium
