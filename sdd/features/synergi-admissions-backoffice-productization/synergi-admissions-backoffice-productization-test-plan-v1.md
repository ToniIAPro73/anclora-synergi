# Synergi Admissions Backoffice Productization Test Plan v1

Fecha: 2026-03-23
Estado: propuesta activa
Feature key: `synergi-admissions-backoffice-productization`

## 1. Objetivo

Validar que el backoffice de admisiones puede operar como una capa productiva real: busca, filtra, decide, comunica y deja listo el handoff a activacion partner.

## 2. Alcance a validar

- cola de candidaturas
- busqueda y filtros
- detalle 360 de solicitud
- notas internas y decision reason
- aceptacion/rechazo con trazabilidad
- emails transaccionales de decision
- handoff hacia activacion partner

## 3. Tipos de validacion

### 3.1. Validacion funcional

- la cola puede trabajarse sin friccion
- el detalle muestra contexto suficiente
- las decisiones se guardan correctamente
- el email de decision se prepara o emite de forma coherente

### 3.2. Validacion de datos

- la decision queda persistida con autor y fecha
- la solicitud puede archivarse o cerrarse
- el handoff a partner auth recibe la informacion esperada

### 3.3. Validacion de seguridad

- solo usuarios internos pueden ver el backoffice
- las notas internas no se exponen
- los emails no filtran informacion sensible de mas

## 4. Escenarios principales

### Escenario A. Triage y busqueda

1. entrar al panel interno
2. buscar una solicitud por nombre o empresa
3. aplicar filtro por estado

Resultado esperado:
- la cola responde con contexto util
- el operador encuentra la solicitud rapidamente

### Escenario B. Revision completa

1. abrir una candidatura
2. revisar toda la informacion visible
3. añadir notas internas

Resultado esperado:
- el contexto es suficiente para decidir
- las notas quedan guardadas

### Escenario C. Aprobacion operativa

1. marcar la solicitud como aceptada
2. registrar motivo
3. disparar la comunicacion de aprobacion

Resultado esperado:
- la decision queda trazada
- la comunicacion se prepara o se emite
- el flujo queda listo para activacion partner

### Escenario D. Rechazo operativo

1. marcar la solicitud como rechazada
2. registrar motivo
3. disparar la comunicacion correspondiente

Resultado esperado:
- la solicitud queda cerrada correctamente
- la comunicacion mantiene tono premium y claro

### Escenario E. Handoff a activacion

1. aceptar una solicitud
2. verificar el estado de handoff
3. comprobar que el siguiente flujo puede continuar

Resultado esperado:
- el partner queda preparado para activacion
- no se rompe la trazabilidad del candidato

## 5. Casos de seguridad

- acceso no autorizado al backoffice -> denegado
- notas internas visibles para usuario externo -> no permitido
- estado invalido en decision -> rechazado
- email transaccional con datos de mas -> no permitido

## 6. Casos de regresion

- la admision publica sigue registrandose
- el panel interno sigue siendo util para revisar candidaturas
- el workspace partner no se ve afectado
- la autenticacion interna conserva compatibilidad con el flujo actual

## 7. Automatizacion recomendada

### Tests unitarios

- transiciones de estado
- persistencia de decision reason y metadata
- generacion de payloads de email

### Tests de integracion

- busqueda y filtrado en APIs admin
- update de estado y notas
- handoff de aceptacion hacia el siguiente flujo

### Tests E2E

- revisar y aceptar una solicitud
- revisar y rechazar una solicitud
- comprobar el paso posterior hacia activacion partner

## 8. Criterio de cierre

La feature puede considerarse lista cuando:
- la cola es productiva
- la decision queda completamente trazada
- el equipo puede comunicar la resolucion
- el handoff a activacion funciona sin ambiguedad
