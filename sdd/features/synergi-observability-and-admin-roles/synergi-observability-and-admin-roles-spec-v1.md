# Synergi Observability And Admin Roles Spec v1

Fecha: 2026-03-23
Estado: propuesta activa alineada con roadmap v1
Feature key: `synergi-observability-and-admin-roles`

Relacion explicita:
- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `public/docs/anclora-synergi-roadmap-v1.md`
- `sdd/features/synergi-security-operations-hardening/synergi-security-operations-hardening-spec-v1.md`
- `sdd/features/synergi-admissions-backoffice-productization/synergi-admissions-backoffice-productization-spec-v1.md`

## 1. Objetivo

Reforzar la operacion interna de `Synergi` con un modelo de roles mas claro y una capa de observabilidad util para seguridad, salud operativa y release guardrails.

## 2. Contexto actual

`Synergi` ya dispone de:
- auth interna y partner separadas
- rate limiting basico
- auditoria tecnica en Neon
- backoffice operativo de admisiones y workspace

La brecha actual es de operacion:
- falta una vista clara de eventos sensibles
- falta un panel de seguridad y salud interna
- faltan roles internos mas expresivos para operar con menos friccion
- faltan señales simples para release y diagnostico

## 3. Objetivo de producto

El sistema debe permitir que el equipo interno:
- vea actividad relevante y eventos sensibles
- distinga permisos minimos por rol
- detecte problemas de acceso y operacion
- revise salud basica de la plataforma
- ejecute releases con control minimo

## 4. Alcance funcional

### Incluye
- roles internos `admin`, `reviewer`, `operator`, `viewer`
- proteccion de rutas y APIs por rol
- dashboard interno de observabilidad
- listado o resumen de eventos de auditoria
- señales de salud y error basicas
- guardrails de release y smoke checks

### No incluye
- RBAC enterprise completo
- SIEM avanzado
- observabilidad distribuida compleja
- automatizaciones de alerta multi-canal

## 5. Plan primero

### Archivos a crear o modificar

- `sdd/features/synergi-observability-and-admin-roles/`
- `.agent/team/tasks.json`
- `public/docs/anclora-synergi-roadmap-v1.md`

Prevision de implementacion:
- `src/lib/admin-auth.ts`
- `src/lib/synergi-security.ts`
- `src/app/api/admin/**`
- `src/app/partner-admissions/**`
- `src/components/synergi/**`
- `src/lib/i18n.tsx`

### Dependencias

- `synergi-security-operations-hardening`
- `synergi-admissions-backoffice-productization`
- Neon operativo

### Riesgos

- sobrecargar la operacion interna con demasiados datos
- bloquear a operadores validos por permisos mal definidos
- duplicar capacidad entre observabilidad y analytics

### Criterio de salida

La feature queda lista cuando:
- las rutas sensibles respetan rol
- existe una lectura interna de auditoria y eventos
- la operacion puede diagnosticar accesos y fallos
- el release tiene guardrails minimos

## 6. Flujos a habilitar

### 6.1. Acceso por rol

Flujo esperado:
1. un usuario interno entra al sistema
2. el rol limita lo que puede hacer o ver
3. la sesion queda trazada de forma util

### 6.2. Observabilidad interna

Flujo esperado:
1. el equipo revisa eventos sensibles
2. identifica errores o rate limits
3. puede entender rapidamente que paso y cuando

### 6.3. Guardrails de release

Flujo esperado:
1. un release se valida con smoke checks minimos
2. los fallos criticos quedan visibles
3. el equipo reduce riesgo operativo

## 7. Modelo de datos sugerido

- `synergi_audit_events`
- `synergi_release_checks`
- `synergi_security_signals`

## 8. Requisitos funcionales

### RF-OAR-01. Roles minimos
El sistema debe distinguir acceso y visibilidad por rol interno.

### RF-OAR-02. Audit dashboard
El equipo debe poder revisar eventos sensibles y su contexto.

### RF-OAR-03. Health signals
Las superficies criticas deben dejar señales de salud simples.

### RF-OAR-04. Release guardrails
Los releases deben disponer de un check minimo antes de considerarse validos.

## 9. Requisitos no funcionales

- no romper admisiones ni workspace
- mantener mensajes y UI premium
- evitar exceso de ruido operacional
- trazabilidad util, no solo tecnica

## 10. Criterios de aceptacion

- un rol menos privilegiado no accede a lo que no debe
- la observabilidad interna muestra eventos utiles
- los errores y rate limits son detectables
- la operacion dispone de guardrails minimos
