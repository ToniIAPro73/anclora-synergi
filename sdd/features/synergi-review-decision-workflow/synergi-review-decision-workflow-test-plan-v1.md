# Synergi Review Decision Workflow Test Plan v1

Fecha: 2026-03-22  
Feature key: `synergi-review-decision-workflow`

## 1. Objetivo

Verificar que el equipo interno puede revisar solicitudes de partnership, tomar decisiones y dejar trazabilidad operativa sin romper el flujo de admisión.

## 2. Alcance de pruebas

### Incluido
- listado de solicitudes
- filtrado por estado
- detalle de candidatura
- notas internas
- cambio de estado
- aceptación y rechazo
- protección de panel y APIs

### Excluido
- autenticación partner final
- workspace privado
- emails transaccionales completos si aún no están integrados

## 3. Preparación

### Datos de prueba
- varias solicitudes en `submitted`
- una solicitud en `under_review`
- una solicitud ya `accepted`
- una solicitud `rejected`

### Entorno
- app `anclora-synergi` local o preview
- Neon de pruebas o schema aislado
- sesión admin válida para el panel

## 4. Casos de prueba funcionales

### RD-T01. Listado de solicitudes
Pasos:
1. Entrar al panel interno.
2. Abrir la cola de solicitudes.

Resultado esperado:
- se muestran las solicitudes disponibles
- cada fila refleja el estado correcto

### RD-T02. Filtrado por estado
Pasos:
1. Seleccionar un filtro de estado.
2. Observar el listado.

Resultado esperado:
- solo aparecen las solicitudes del estado elegido

### RD-T03. Detalle de candidatura
Pasos:
1. Abrir una solicitud concreta.

Resultado esperado:
- se muestran todos los datos relevantes
- las notas internas, si existen, se ven en el panel de revisión

### RD-T04. Cambio a `under_review`
Pasos:
1. Abrir una solicitud en `submitted`.
2. Marcarla como en revisión.

Resultado esperado:
- el estado se actualiza
- el listado refleja el cambio
- queda traza de revisión

### RD-T05. Aceptar solicitud
Pasos:
1. Abrir una solicitud revisable.
2. Marcarla como aceptada.
3. Añadir notas si procede.

Resultado esperado:
- el estado pasa a `accepted`
- queda registrada la decisión
- la candidatura queda lista para la fase de activación

### RD-T06. Rechazar solicitud
Pasos:
1. Abrir una solicitud revisable.
2. Marcarla como rechazada.
3. Guardar motivo o nota.

Resultado esperado:
- el estado pasa a `rejected`
- queda trazabilidad del motivo

### RD-T07. Persistencia de notas
Pasos:
1. Añadir una nota interna.
2. Guardar.
3. Reabrir la solicitud.

Resultado esperado:
- la nota persiste
- no es visible en el flujo público

## 5. Casos de seguridad

### RD-S01. Acceso sin sesión
- verificar que el panel redirige al login interno si no hay sesión válida

### RD-S02. APIs internas protegidas
- verificar que `GET` y `PATCH` no responden sin la cookie o credencial esperada

### RD-S03. Integridad de decisión
- verificar que una solicitud no pueda quedar en un estado inválido

## 6. Casos de integración

### RD-I01. Persistencia Neon
- verificar que el cambio de estado se guarda en la tabla de admisiones

### RD-I02. Puente a activación
- verificar que una solicitud aceptada queda preparada para el siguiente paso de activación partner

### RD-I03. Trazabilidad
- verificar que se registran fecha y referencia de revisión

## 7. Criterios de salida

- listado estable
- detalle completo
- estados operativos
- notas persistidas
- panel protegido
- decisión trazable
