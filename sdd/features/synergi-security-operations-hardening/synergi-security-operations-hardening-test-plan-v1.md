# Synergi Security Operations Hardening Test Plan v1

Fecha: 2026-03-23
Estado: propuesta activa
Feature key: `synergi-security-operations-hardening`

## 1. Objetivo

Validar que `Synergi` puede operar con una capa minima robusta de seguridad, control de acceso, auditoria y observabilidad sin romper el flujo actual de producto.

## 2. Alcance a validar

- sesiones internas y partner
- proteccion de rutas y APIs sensibles
- rate limiting en operaciones criticas
- registro de auditoria
- señales basicas de salud y error
- regresion sobre admision, review y workspace

## 3. Tipos de validacion

### 3.1. Validacion funcional

- el acceso autorizado sigue funcionando
- el acceso no autorizado queda bloqueado
- los endpoints sensibles respetan limites basicos
- las acciones criticas dejan trazabilidad

### 3.2. Validacion de seguridad

- no se exponen detalles internos en respuestas de error
- no se puede saltar la proteccion por rutas directas
- los intentos repetidos activan limitacion de abuso

### 3.3. Validacion operativa

- los eventos de auditoria son consultables
- los errores sensibles dejan contexto suficiente
- la operacion puede distinguir denegacion, fallo y exito

## 4. Escenarios principales

### Escenario A. Acceso interno autorizado

1. iniciar sesion con credenciales validas
2. acceder a una ruta interna protegida
3. ejecutar una accion administrativa permitida

Resultado esperado:
- la sesion se valida
- la ruta responde correctamente
- la accion queda trazada

### Escenario B. Acceso interno denegado

1. intentar entrar sin sesion
2. intentar ejecutar una API interna

Resultado esperado:
- el acceso queda denegado
- no se revelan detalles innecesarios

### Escenario C. Abuso basico en login o reintento

1. repetir intentos fallidos de acceso
2. observar comportamiento de limitacion

Resultado esperado:
- el sistema aplica limite basico
- queda registro del evento

### Escenario D. Auditoria de accion sensible

1. ejecutar una accion critica en admision, review o workspace
2. revisar el trail operativo

Resultado esperado:
- el evento queda registrado con actor y recurso
- el equipo puede auditar la accion

### Escenario E. Señales de release

1. desplegar una build de validacion
2. ejecutar smoke tests minimos
3. revisar que el release no rompe acceso ni permisos

Resultado esperado:
- el release se considera operativo
- no hay regresiones en flujos principales

## 5. Casos de seguridad

- acceso sin sesion a paneles internos -> denegado
- intento de reutilizar sesion expirada -> denegado
- demasiados reintentos -> rate limit
- accion sensible sin permiso -> denegada
- respuesta de error sin filtrado de datos internos

## 6. Casos de regresion

- la admision publica sigue funcionando
- el backoffice de review sigue operando
- el login partner sigue entrando
- el workspace sigue cargando sus modulos

## 7. Automatizacion recomendada

### Tests unitarios

- validacion de roles y acceso
- generacion de eventos de auditoria
- reglas de rate limiting

### Tests de integracion

- rutas protegidas devuelven `401` o redireccion segun contexto
- acciones sensibles generan audit trail
- denegaciones no exponen informacion

### Tests E2E

- login interno correcto e incorrecto
- accion sensible con y sin permiso
- reintentos de acceso y comportamiento de limite

## 8. Criterio de cierre

La feature puede considerarse lista cuando:
- el acceso critico esta protegido
- el abuso basico esta limitado
- la auditoria operativa existe y es util
- la experiencia no se degrada para usuarios validos
