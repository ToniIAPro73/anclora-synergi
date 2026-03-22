# Synergi Partner Workspace v1 Test Plan v1

Fecha: 2026-03-22  
Estado: propuesta activa  
Feature key: `synergi-partner-workspace-v1`

## 1. Objetivo

Definir la validación funcional, visual y técnica de la primera versión del workspace partner de `Synergi`.

## 2. Alcance a validar

- acceso autenticado al workspace
- render del overview partner
- segmentación por perfil
- navegación entre módulos
- módulos iniciales de perfil, assets, oportunidades y actividad
- estados vacíos premium
- protección de acceso

## 3. Tipos de validación

### 3.1. Validación funcional
- un partner autenticado llega a `/workspace`
- un usuario sin sesión es redirigido a `/login`
- un usuario con sesión `invited` es redirigido a `/activate`
- el workspace muestra el estado correcto de la cuenta
- la configuración del perfil partner modifica la composición o prioridad de módulos

### 3.2. Validación visual
- la UI mantiene identidad premium `Synergi`
- no hay regresiones en responsive
- los estados vacíos conservan claridad y valor narrativo
- la jerarquía visual de módulos es consistente

### 3.3. Validación de datos
- el perfil partner se carga desde Neon
- los módulos muestran datasets reales o placeholders controlados
- no se exponen datos de otro partner
- las actualizaciones de perfil persisten correctamente

## 4. Escenarios principales

### Escenario A. Partner `service-premium`
1. iniciar sesión con cuenta activa
2. entrar a `/workspace`
3. verificar orden de módulos orientado a perfil premium
4. revisar perfil operativo
5. revisar assets iniciales

Resultado esperado:
- el workspace prioriza `Overview`, `Partner Profile`, `Assets & Documents`, `Opportunities`

### Escenario B. Partner `referral-partner`
1. iniciar sesión con cuenta activa
2. entrar a `/workspace`
3. comprobar foco en oportunidades y actividad

Resultado esperado:
- el workspace prioriza `Opportunities` y `Activity`

### Escenario C. Partner `market-intelligence`
1. iniciar sesión
2. abrir workspace
3. validar foco en assets curatoriales y actividad

Resultado esperado:
- el workspace prioriza contenido documental e inteligencia

### Escenario D. Partner `project-collaboration`
1. iniciar sesión
2. abrir workspace
3. validar foco mixto entre oportunidades y assets

Resultado esperado:
- el workspace ofrece visión operativa útil para proyectos concretos

## 5. Casos de seguridad

- acceso sin cookie partner -> redirección a `/login`
- acceso con cookie manipulada -> sesión inválida
- acceso a datos de perfil de otro partner -> denegado
- módulos privados no visibles fuera de sesión válida

## 6. Casos de estados vacíos

- partner sin assets
- partner sin oportunidades
- partner sin actividad previa
- partner con perfil aún incompleto

Resultado esperado:
- cada módulo muestra un estado vacío premium con siguiente paso claro

## 7. Casos de edición de perfil

- actualización correcta de headline
- actualización de tags o regiones
- validación de campos opcionales
- persistencia tras recarga

## 8. Casos de regresión

- login partner sigue funcionando
- activación inicial sigue redirigiendo a workspace
- logout sigue cerrando sesión correctamente
- backoffice interno no se ve afectado por los cambios de workspace

## 9. Automatización recomendada

### Tests unitarios
- normalización de perfiles partner
- resolución de módulos por perfil
- helpers de navegación interna

### Tests de integración
- carga de workspace autenticado
- redirecciones por sesión
- persistencia de perfil partner

### Tests E2E
- login -> workspace
- activación -> workspace
- edición de perfil -> persistencia

## 10. Criterio de cierre

La feature puede considerarse lista cuando:
- el workspace ya no es una landing vacía
- al menos tres módulos privados son operativos
- existe segmentación por perfil partner
- la ruta `/workspace` mantiene seguridad, consistencia visual y persistencia mínima real
