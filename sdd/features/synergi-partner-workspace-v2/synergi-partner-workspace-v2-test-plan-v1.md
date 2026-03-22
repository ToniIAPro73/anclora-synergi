# Synergi Partner Workspace v2 Test Plan v1

Fecha: 2026-03-22  
Feature key: `synergi-partner-workspace-v2`

## 1. Objetivo

Validar que `workspace-v2` introduce referrals operativos y asset pack requests sin romper auth partner, navegación modular ni consistencia premium.

## 2. Cobertura

### Funcional
- creación de referral desde workspace
- listado de referrals del partner
- creación de asset request
- listado de asset requests
- actividad generada por ambas acciones
- navegación del nuevo módulo `Referrals`

### Integración
- persistencia en Neon
- routes privadas protegidas por sesión partner activa
- render del workspace con bundle ampliado

### Regresión
- perfil editable
- descarga y revisión de assets
- respuestas sobre oportunidades
- logout y reentrada al workspace

## 3. Casos principales

### Caso 1. Crear referral válido
- Dado un partner con sesión activa
- Cuando envía un referral completo
- Entonces recibe confirmación
- Y el referral aparece en su lista con estado `submitted`

### Caso 2. Rechazo por payload inválido
- Dado un partner con sesión activa
- Cuando intenta enviar un referral sin nombre o sin contexto mínimo
- Entonces la route responde error 400

### Caso 3. Crear asset request válida
- Dado un partner con sesión activa
- Cuando solicita un pack adicional
- Entonces la solicitud queda persistida con estado `submitted`

### Caso 4. Actividad generada
- Dado un referral o asset request recién enviados
- Entonces aparecen eventos recientes en el módulo `Activity`

### Caso 5. Protección de APIs
- Dado un usuario sin sesión o con sesión no activa
- Cuando llama a las routes privadas de referrals o asset requests
- Entonces recibe 401/403

## 4. Validación técnica

- `npm run lint`
- `npm run test`
- `npm run build`

## 5. Riesgos a vigilar

- colisión entre el nuevo módulo y el orden de módulos por perfil
- errores de tipado por ampliación del bundle del workspace
- activity feed sin nuevos tipos de evento
- formularios demasiado densos en móvil
