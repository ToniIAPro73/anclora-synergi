# Synergi Analytics And Funnel Reporting Spec v1

Fecha: 2026-03-23
Estado: propuesta activa alineada con roadmap v1
Feature key: `synergi-analytics-and-funnel-reporting`

Relacion explicita:
- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `public/docs/anclora-synergi-roadmap-v1.md`
- `sdd/features/synergi-admissions-backoffice-productization/synergi-admissions-backoffice-productization-spec-v1.md`
- `sdd/features/synergi-partner-workspace-v4/synergi-partner-workspace-v4-spec-v1.md`

## 1. Objetivo

Construir una capa de analytics y funnel reporting para `Synergi` que muestre el recorrido de admision, aceptacion, activacion y uso del workspace con KPIs claros y utiles para el equipo interno.

## 2. Contexto actual

`Synergi` ya dispone de:
- admisiones registradas en Neon
- decision workflow con trazabilidad
- activacion partner
- workspace con actividad y uso

La brecha actual es de lectura:
- falta visualizar el funnel completo
- faltan KPIs de acceptance y activation
- falta una lectura agregada de uso del workspace
- faltan metricas consolidadas para referrals y asset packs

## 3. Objetivo de producto

El equipo debe poder:
- medir solicitudes, aceptacion y activacion
- leer el uso del workspace sin entrar en cada cuenta
- observar referrals, asset packs y actividad de forma agregada
- entender conversion y salud operativa del funnel

## 4. Alcance funcional

### Incluye
- funnel de admisiones
- acceptance rate y activation rate
- uso agregado del workspace
- metrics de referrals, packs y actividad
- dashboard interno de KPIs
- series basicas o snapshots de reporting si aportan valor

### No incluye
- BI enterprise completo
- modelos predictivos
- analitica marketing multi-canal
- dashboards para clientes externos

## 5. Plan primero

### Archivos a crear o modificar

- `sdd/features/synergi-analytics-and-funnel-reporting/`
- `.agent/team/tasks.json`
- `public/docs/anclora-synergi-roadmap-v1.md`

Prevision de implementacion:
- `src/lib/partner-admissions-store.ts`
- `src/lib/partner-workspace-store.ts`
- `src/app/api/admin/**`
- `src/app/partner-admissions/**`
- `src/components/synergi/**`
- `src/lib/i18n.tsx`

### Dependencias

- `synergi-admissions-backoffice-productization`
- `synergi-partner-workspace-v5`
- `synergi-observability-and-admin-roles`

### Riesgos

- confundir analytics con observability
- inflar KPIs sin que aporten lectura real
- mezclar datos de partner y admin sin frontera

### Criterio de salida

La feature queda lista cuando:
- el funnel se puede leer de inicio a fin
- acceptance y activation son visibles
- el uso del workspace se resume con KPIs utiles
- el equipo interno obtiene una lectura clara del negocio

## 6. Flujos a habilitar

### 6.1. Funnel de admisiones

Flujo esperado:
1. entra una solicitud
2. se revisa y decide
3. el partner se activa
4. se mide la conversion en cada fase

### 6.2. Uso del workspace

Flujo esperado:
1. el partner interactua con assets, referrals y packs
2. el sistema resume uso y actividad
3. el equipo interno ve la salud global del workspace

### 6.3. Dashboard interno de KPIs

Flujo esperado:
1. el equipo entra al panel de analytics
2. consulta datos agregados
3. identifica conversiones, cuellos de botella y actividad

## 7. Modelo de datos sugerido

- `synergi_funnel_snapshots`
- `synergi_workspace_kpis`
- `synergi_reporting_events`

## 8. Requisitos funcionales

### RF-AFR-01. Funnel
El sistema debe mostrar el recorrido de solicitud a activacion.

### RF-AFR-02. KPIs
El sistema debe exponer metricas de acceptance, activation y uso.

### RF-AFR-03. Workspace usage
El sistema debe resumir actividad de referrals, assets, packs y oportunidades.

### RF-AFR-04. Reportability
El equipo debe poder leer el estado del producto con rapidez.

## 9. Requisitos no funcionales

- legible de un vistazo
- sin ruido excesivo
- consistente con la capa premium
- estable aunque algunos datos sean escasos

## 10. Criterios de aceptacion

- el funnel de admisiones se puede leer de forma agregada
- el equipo ve acceptance y activation con claridad
- el uso del workspace se refleja en KPIs utiles
- analytics y observability quedan separados
