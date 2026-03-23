# Synergi Partner Workspace v4 Test Plan v1

Fecha: 2026-03-23
Estado: propuesta activa
Feature key: `synergi-partner-workspace-v4`

## 1. Objetivo

Validar que el workspace de Synergi gana profundidad, reporting y lectura 360 sin perder claridad premium ni romper lo ya construido en v1-v3.

## 2. Alcance a validar

- dashboard 360 del partner
- reporting basico
- notificaciones o highlights
- ampliacion de módulos privados
- regresion del activity feed
- coherencia visual premium

## 3. Tipos de validacion

### 3.1. Validacion funcional

- el partner puede entender su estado actual de colaboracion
- las metricas se muestran correctamente
- los highlights ayudan a priorizar
- los modulos siguen siendo navegables

### 3.2. Validacion visual

- el dashboard conserva jerarquia premium
- el reporting no satura la pantalla
- mobile y desktop mantienen legibilidad

### 3.3. Validacion de datos

- los valores de reporting son consistentes con la actividad
- no se pierden eventos previos
- las notificaciones se sincronizan con el estado real

## 4. Escenarios principales

### Escenario A. Entrada al dashboard 360

1. el partner inicia sesion
2. entra al workspace
3. consulta su resumen 360

Resultado esperado:
- la vista resume el estado sin ruido
- el foco operativo queda claro

### Escenario B. Consulta de reporting

1. abrir las metricas del workspace
2. revisar activos, referrals o packs relevantes
3. comparar contexto actual con actividad reciente

Resultado esperado:
- las metricas son legibles y utilitarias
- la informacion coincide con el estado real

### Escenario C. Highlight o notificacion

1. generar un evento relevante
2. comprobar que aparece como highlight o notificacion

Resultado esperado:
- el partner ve el aviso en la zona correcta
- la importancia del evento es clara

### Escenario D. Regresion de modulos existentes

1. navegar por overview, profile, assets, referrals, opportunities y activity
2. comprobar que la nueva capa no rompe nada

Resultado esperado:
- los modulos previos siguen operativos
- la experiencia se mantiene coherente

### Escenario E. Responsive premium

1. abrir el workspace en desktop
2. repetir en viewport reducido

Resultado esperado:
- el layout sigue siendo utilizable
- los bloques de resumen no se deforman

## 5. Casos de seguridad

- metricas sensibles no visibles fuera del workspace correcto
- notificaciones no exponen datos internos no autorizados
- los datos de reporting no permiten inferir informaciones restringidas

## 6. Casos de regresion

- workspace-v1 sigue mostrando perfil y assets
- workspace-v2 sigue aceptando referrals y asset packs
- workspace-v3 sigue resolviendo assets y operaciones internas
- la autenticacion partner sigue funcionando

## 7. Automatizacion recomendada

### Tests unitarios

- calculo de metricas de dashboard
- orden de notificaciones y highlights
- integridad de snapshots o resumenes

### Tests de integracion

- respuesta de APIs de reporting y resumen
- consistencia entre datos de workspace y feed
- navegacion entre modulos y resumen

### Tests E2E

- partner entra y ve dashboard 360
- partner consulta metricas y actividad
- partner navega por modulos existentes sin regresion

## 8. Criterio de cierre

La feature puede considerarse lista cuando:
- el workspace aporta mas lectura y contexto
- el reporting es util y legible
- las notificaciones ayudan de verdad
- la base existente no sufre regresiones
