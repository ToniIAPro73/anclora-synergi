# Synergi Security Operations Hardening Spec v1

Fecha: 2026-03-23
Estado: propuesta activa alineada con roadmap v1
Feature key: `synergi-security-operations-hardening`

Relacion explicita:
- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `public/docs/anclora-synergi-roadmap-v1.md`
- `sdd/features/synergi-review-decision-workflow/synergi-review-decision-workflow-spec-v1.md`
- `sdd/features/synergi-partner-auth/synergi-partner-auth-spec-v1.md`
- `sdd/features/synergi-partner-workspace-v3/synergi-partner-workspace-v3-spec-v1.md`

## 1. Objetivo

Endurecer la capa de seguridad y operacion de `Synergi` para que las superficies internas y partner-facing queden protegidas con un modelo minimo robusto: sesiones mas solidas, accesos por rol, limitacion de abuso, trazabilidad y observabilidad basica.

## 2. Contexto actual

`Synergi` ya dispone de:
- admision publica y backoffice interno funcionales
- auth partner separada del flujo de `Nexus`
- workspace partner operativo
- APIs que tocan datos sensibles en Neon

La brecha actual no es funcional sino operativa:
- la auth interna sigue siendo ligera
- los endpoints sensibles necesitan politicas mas claras
- faltan limites y trazabilidad de acciones criticas
- la operacion diaria necesita señales mas fuertes de auditoria y release safety

## 3. Objetivo de producto

El sistema debe permitir que `Synergi` opere con:
- sesiones internas mas resistentes
- permisos minimos por tipo de operador
- proteccion de rutas y APIs sensibles
- limites de abuso en login, admision, reenvio y decisiones
- trazabilidad auditable de acciones criticas
- guardrails basicos de release y observabilidad

## 4. Alcance funcional

### Incluye
- endurecimiento de sesion admin y partner
- roles internos minimos para operar admisiones y workspace
- rate limiting en endpoints sensibles
- auditoria de acciones criticas
- trazabilidad de intentos de acceso
- señales operativas basicas de salud y error
- checklist de release y smoke tests minimos

### No incluye
- SSO enterprise completo
- RBAC corporativo granular con decenas de permisos
- SIEM o observabilidad avanzada de plataforma
- compliance formal tipo SOC2
- automatizaciones complejas de seguridad o fraude

## 5. Plan primero

### Archivos a crear o modificar

Nivel SDD y coordinacion:
- `sdd/features/synergi-security-operations-hardening/`
- `.agent/team/tasks.json`
- `public/docs/anclora-synergi-roadmap-v1.md`

Prevision para implementacion posterior:
- `src/lib/admin-auth.ts`
- `src/lib/partner-auth.ts`
- `src/app/api/admin/...`
- `src/app/api/partner/...`
- `src/lib/audit-log.ts`
- `src/lib/rate-limit.ts`

### Dependencias

- `synergi-review-decision-workflow`
- `synergi-partner-auth`
- `synergi-partner-workspace-v3`
- Neon operativo

### Riesgos

- introducir friccion excesiva en el acceso del equipo interno
- bloquear endpoints legitimos por un rate limit demasiado agresivo
- duplicar logica de seguridad entre auth admin y partner
- registrar demasiada trazabilidad tecnica y poca trazabilidad accionable

### Criterio de salida

La feature queda lista para implementacion cuando:
- los accesos criticos tienen politica de proteccion clara
- las acciones sensibles quedan trazadas
- existen limites basicos de abuso
- la operacion diaria puede auditar quien hizo que y cuando
- el roadmap refleja esta capa como bloque independiente

## 6. Flujos a habilitar

### 6.1. Acceso interno protegido

Flujo esperado:
1. un operador interno intenta acceder a una zona protegida
2. el sistema valida sesion, rol y entorno
3. el acceso se concede o se deniega con respuesta consistente

### 6.2. Acceso partner y reintentos

Flujo esperado:
1. un partner intenta acceder a login, activacion o workspace
2. el sistema limita abuso y registra intentos fallidos
3. el acceso exitoso queda trazado sin exponer detalles sensibles

### 6.3. Acciones criticas

Flujo esperado:
1. una accion sensible se ejecuta en admision, review o workspace
2. se registra audit trail operativo
3. se conserva contexto minimo de actor, recurso y resultado

### 6.4. Salud y release

Flujo esperado:
1. el equipo valida un release con smoke tests basicos
2. se monitorizan errores y trazas criticas
3. la operacion puede detectar rapidamente regresiones de acceso o permisos

## 7. Modelo de seguridad sugerido

### Roles internos minimos
- `admin`
- `reviewer`
- `operator`
- `viewer`

### Eventos de auditoria sugeridos
- `admin_session_created`
- `admin_session_denied`
- `partner_session_created`
- `partner_login_failed`
- `sensitive_action_executed`
- `sensitive_action_denied`
- `rate_limit_triggered`
- `release_smoke_test_passed`

### Contexto minimo por evento
- actor
- recurso
- accion
- resultado
- timestamp
- origen de la peticion

## 8. Requisitos funcionales

### RF-SOH-01. Sesiones robustas
El acceso interno y partner debe estar protegido con sesiones consistentes y trazables.

### RF-SOH-02. Permisos minimos
Las vistas y APIs sensibles deben responder segun rol y contexto de acceso.

### RF-SOH-03. Rate limiting
Los endpoints sensibles deben resistir abuso basico sin comprometer el flujo normal.

### RF-SOH-04. Auditoria
Las acciones criticas deben dejar registro util para operacion y soporte.

### RF-SOH-05. Observabilidad basica
El equipo debe poder detectar errores de acceso, decisiones y operaciones sensibles con rapidez.

## 9. Requisitos no funcionales

- no romper el flujo actual de admision, review o workspace
- no exponer detalles internos a partners
- mantener coherencia premium en mensajes de error y acceso
- minimizar falsos positivos en rate limiting
- permitir evolucion futura hacia RBAC completo

## 10. Criterios de aceptacion

- un acceso no autorizado queda bloqueado sin fugas de informacion
- un acceso autorizado sigue funcionando sin friccion innecesaria
- las acciones criticas quedan trazadas
- los intentos anomalias de acceso se pueden detectar
- el equipo dispone de una base de hardening clara para siguiente iteracion

## 11. Relacion con el roadmap

Esta feature agrupa la parte de `seguridad/operacion` y la parte de `calidad/hardening` del bloque siguiente de Synergi.
Es la capa que permite que las features posteriores operen sobre una base mas confiable y observable.
