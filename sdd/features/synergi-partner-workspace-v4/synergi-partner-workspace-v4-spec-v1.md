# Synergi Partner Workspace v4 Spec v1

Fecha: 2026-03-23
Estado: propuesta activa alineada con roadmap v1
Feature key: `synergi-partner-workspace-v4`

Relacion explicita:
- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `public/docs/anclora-synergi-roadmap-v1.md`
- `sdd/features/synergi-partner-workspace-v1/synergi-partner-workspace-v1-spec-v1.md`
- `sdd/features/synergi-partner-workspace-v2/synergi-partner-workspace-v2-spec-v1.md`
- `sdd/features/synergi-partner-workspace-v3/synergi-partner-workspace-v3-spec-v1.md`

## 1. Objetivo

Profundizar el workspace de `Synergi` para que el partner disponga de una capa privada mas rica: dashboard 360, reporting util, notificaciones, estructuras de contenido mas profundas y una vision operativa madura de su colaboracion.

## 2. Contexto actual

`workspace-v3` ya cubre:
- referrals operativos
- asset pack requests
- entrega real de assets
- trazabilidad entre operacion interna y partner

La brecha pendiente es de profundidad de producto:
- falta una vista 360 del partner mas accionable
- faltan reporting cards y metricas comprensibles
- faltan notificaciones internas o del workspace mejor estructuradas
- faltan módulos privados con mas densidad informativa
- falta un lenguaje de seguimiento mas cercano a una colaboracion madura

## 3. Objetivo de producto

El sistema debe permitir que el partner vea:
- un workspace mas informativo y personal
- el estado de su colaboracion con indicadores utiles
- actividad y notificaciones con mejor jerarquia
- reporting basico de uso, assets, referrals y packs
- módulos privados mas profundos sin caer en un CRM pesado

## 4. Alcance funcional

### Incluye
- dashboard 360 del partner
- metricas y reporting visibles
- notificaciones o highlights operativos
- ampliacion de módulos privados existentes
- mejor jerarquia para activos, referrals y actividad
- paneles de resumen y progreso
- visión de colaboración mas madura y accionable

### No incluye
- CRM comercial completo
- BI enterprise complejo
- automatizaciones de reporting avanzadas
- soporte de equipos o tickets
- DAM completo de assets multimedia

## 5. Plan primero

### Archivos a crear o modificar

Nivel SDD y coordinacion:
- `sdd/features/synergi-partner-workspace-v4/`
- `.agent/team/tasks.json`
- `public/docs/anclora-synergi-roadmap-v1.md`

Prevision para implementacion posterior:
- `src/app/workspace/...`
- `src/components/synergi/SynergiWorkspacePage.tsx`
- `src/lib/partner-workspace-store.ts`
- `src/app/api/partner/...`
- `src/app/api/admin/...` si hubiera reporting interno

### Dependencias

- `synergi-partner-workspace-v3`
- `synergi-admissions-backoffice-productization`
- `synergi-security-operations-hardening`
- Neon operativo para datos de workspace

### Riesgos

- convertir el workspace en un CRM prematuro
- saturar la UI con demasiadas metricas
- mezclar reporting interno y partner-facing sin frontera clara
- añadir notificaciones sin una politica de relevancia

### Criterio de salida

La feature queda lista para implementacion cuando:
- el workspace ofrece una lectura 360 clara del partner
- existen metricas y reporting comprensibles
- la jerarquia visual sigue siendo premium y legible
- la operacion partner puede crecer sin rehacer la base

## 6. Flujos a habilitar

### 6.1. Dashboard 360

Flujo esperado:
1. el partner entra al workspace
2. ve un resumen de colaboracion, actividad y estado
3. identifica rapidamente su foco operativo actual

### 6.2. Reporting util

Flujo esperado:
1. el partner consulta metricas basicas de uso y colaboracion
2. entiende actividad, descargas, referrals o packs relevantes
3. puede seguir su progreso sin salir del workspace

### 6.3. Notificaciones y highlights

Flujo esperado:
1. el workspace resalta cambios y eventos importantes
2. el partner recibe una capa de seguimiento clara
3. los elementos prioritarios no se pierden en la actividad general

### 6.4. Módulos profundos

Flujo esperado:
1. el partner accede a módulos mas densos de su colaboración
2. la navegacion mantiene la coherencia premium
3. la informacion sigue siendo util y no invasiva

## 7. Modelo de datos sugerido

### Entidades o extensiones posibles
- `partner_workspace_metrics`
- `partner_workspace_notifications`
- `partner_workspace_snapshots`
- `partner_workspace_highlights`

### Campos relevantes
- metricas de actividad
- metricas de assets y downloads
- metricas de referrals y packs
- estado de notificacion
- prioridad de highlight
- snapshot temporal

## 8. Requisitos funcionales

### RF-WV4-01. Dashboard 360
El partner debe ver una vision compacta pero rica de su colaboracion.

### RF-WV4-02. Reporting basico
El workspace debe mostrar metricas utiles y entendibles para seguimiento.

### RF-WV4-03. Notificaciones
Los eventos relevantes deben destacarse con jerarquia clara.

### RF-WV4-04. Modularidad
Los modulos deben seguir siendo extensibles sin romper el orden visual premium.

### RF-WV4-05. Trazabilidad
Los eventos de uso y colaboracion deben seguir siendo coherentes con el activity feed.

## 9. Requisitos no funcionales

- mantener el estilo premium ya consolidado
- no convertir la home privada en una consola pesada
- mobile-first razonable en bloques de resumen y reporting
- consistencia con workspace-v1/v2/v3
- preparacion para metricas futuras sin rehacer la base

## 10. Criterios de aceptacion

- el partner ve un resumen 360 mas util
- el workspace ofrece reporting basico sin ruido
- las notificaciones aportan contexto real
- la estructura de modulos sigue siendo clara
- el espacio privado sigue sintiendose premium y coherente

## 11. Relacion con el roadmap

Esta feature representa la siguiente evolucion natural del workspace: mas profundidad, mas lectura operativa y mas capacidad de seguimiento sin entrar aun en un CRM completo.
