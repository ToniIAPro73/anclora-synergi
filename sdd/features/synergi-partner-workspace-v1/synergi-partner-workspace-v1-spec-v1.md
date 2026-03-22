# Synergi Partner Workspace v1 Spec v1

Fecha: 2026-03-22  
Estado: propuesta activa alineada con roadmap v1  
Feature key: `synergi-partner-workspace-v1`

## 1. Objetivo

Definir la primera versión operativa del workspace privado de `Synergi`, con estructura suficiente para dar valor real a distintos perfiles de partners aprobados desde el primer acceso, sin esperar a una plataforma completa de referrals y operación avanzada.

## 2. Contexto actual

`Synergi` ya dispone de:
- auth partner real con primer acceso y activación
- workspace privado mínimo accesible en `/workspace`
- identidad partner persistida en Neon
- base de backoffice y decisión de admisión
- emails transaccionales de aceptación, rechazo y reemisión

El workspace actual todavía es una landing básica. No diferencia perfiles partner ni contiene módulos privados operativos.

## 3. Objetivo de producto

El partner, una vez autenticado, debe aterrizar en un entorno privado que:
- explique claramente su rol dentro del ecosistema
- muestre el estado de su cuenta y de su colaboración
- habilite primeras acciones reales
- organice el contenido según el tipo de partner

## 4. Alcance funcional

### Incluye
- overview del partner con contexto operativo
- modelado inicial de perfiles partner
- navegación modular del workspace
- primeros módulos privados reales
- estados vacíos premium y mensajes orientados a activación
- permisos iniciales por perfil partner

### No incluye
- CRM completo
- referrals transaccionales avanzados
- mensajería interna compleja
- billing o contratos
- analítica avanzada por tenant

## 5. Perfiles partner a soportar

La v1 debe contemplar, como mínimo, estos perfiles:

### 5.1. `service-premium`
Partners que ofrecen servicios premium al ecosistema:
- interiorismo
- arquitectura
- legal/fiscal
- relocation
- concierge
- family office support
- jardinería premium
- asset management complementario

### 5.2. `referral-partner`
Perfiles centrados en referrals y generación de oportunidades:
- brokers
- advisors
- introducers
- colaboradores de captación

### 5.3. `market-intelligence`
Perfiles enfocados en conocimiento, signals o inteligencia:
- analistas territoriales
- investigadores
- consultores especializados
- perfiles puente con Data Lab

### 5.4. `project-collaboration`
Partners que colaboran en proyectos concretos:
- project managers
- operadores especializados
- firmas boutique con colaboración selectiva

## 6. Modelo de segmentación sugerido

Cada partner debe tener, al menos:
- `partner_profile_type`
- `collaboration_scope`
- `service_tags`
- `primary_regions`
- `languages`
- `visibility_level`
- `workspace_status`

## 7. Primeros módulos privados reales

### Módulo 1. `Overview`
Debe mostrar:
- estado del partnership
- tipo de partner
- siguiente paso sugerido
- resumen de activación
- CTA principales

### Módulo 2. `Partner Profile`
Debe permitir:
- ver perfil operativo
- editar datos base autorizados
- revisar especialidad, cobertura y propuesta de valor
- actualizar enlaces o datos públicos de colaboración

### Módulo 3. `Assets & Documents`
Debe ofrecer:
- acceso a activos privados iniciales
- documentos curatoriales
- piezas de onboarding
- materiales operativos o de colaboración

### Módulo 4. `Opportunities`
Debe presentar:
- referrals o oportunidades asignadas
- estado resumido de cada una
- información de contexto mínima
- CTA a detalle o respuesta futura

### Módulo 5. `Activity`
Debe recoger:
- últimos movimientos relevantes
- cambios de estado
- activación de cuenta
- emisiones de credenciales
- nuevas oportunidades o assets publicados

## 8. Reglas por perfil

### `service-premium`
Prioridad de módulos:
1. Overview
2. Partner Profile
3. Assets & Documents
4. Opportunities

### `referral-partner`
Prioridad de módulos:
1. Overview
2. Opportunities
3. Activity
4. Partner Profile

### `market-intelligence`
Prioridad de módulos:
1. Overview
2. Assets & Documents
3. Activity
4. Partner Profile

### `project-collaboration`
Prioridad de módulos:
1. Overview
2. Opportunities
3. Assets & Documents
4. Activity

## 9. Requisitos funcionales

### RF-PW-01. Landing privada útil
El workspace no debe ser solo una pantalla de confirmación; debe contener módulos operativos reales desde la primera versión.

### RF-PW-02. Perfil partner persistido
La app debe persistir el tipo de partner y su configuración operativa base.

### RF-PW-03. Modularidad
Los módulos deben poder activarse, ocultarse o cambiar de prioridad según el perfil partner.

### RF-PW-04. Navegación interna
Debe existir una navegación clara entre módulos del workspace.

### RF-PW-05. Estados vacíos premium
Cuando no haya datos reales en un módulo, debe mostrarse un estado vacío útil, elegante y orientado a siguiente paso.

### RF-PW-06. Seguridad
Todo el workspace debe seguir protegido por auth partner real y no ser accesible sin sesión activa.

## 10. Requisitos no funcionales

- UX premium coherente con `Private Estates`, pero con identidad propia `Synergi`
- mobile-first razonable
- i18n completo en `es`, `en`, `de`
- datos modelados para evolucionar a tenant real
- arquitectura compatible con Neon

## 11. Modelo de datos sugerido

Entidades mínimas nuevas:
- `partner_profiles`
- `partner_profile_modules`
- `partner_assets`
- `partner_opportunities`
- `partner_activity_events`

Campos iniciales recomendados para `partner_profiles`:
- `partner_account_id`
- `partner_profile_type`
- `headline`
- `service_tags`
- `primary_regions`
- `languages`
- `website_url`
- `linkedin_url`
- `instagram_url`
- `profile_visibility`
- `created_at`
- `updated_at`

## 12. Dependencias

- `synergi-partner-auth`
- `synergi-review-decision-workflow`
- Neon operativo
- modelo `partner_accounts` y `partner_workspaces`
- capa i18n ya activa

## 13. Criterios de aceptación

- Un partner autenticado aterriza en un workspace con módulos reales
- El workspace distingue al menos entre perfiles partner base
- Existe un perfil partner persistido y editable en alcance v1
- Se muestran activos, oportunidades y actividad aunque sea con datasets iniciales o vacíos controlados
- La experiencia sigue siendo privada, premium y coherente en desktop y móvil

## 14. Relación con el roadmap

Esta feature implementa el núcleo de la **Fase 5. Workspace partner v1** del roadmap:
- overview del partner
- perfil editable
- activos y documentos compartidos
- actividad reciente
- CTAs operativos para colaboración y referrals
