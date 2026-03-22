# Synergi Partner Auth Spec v1

Fecha: 2026-03-22  
Estado: propuesta alineada con roadmap v1  
Feature key: `synergi-partner-auth`

## 1. Objetivo

Definir la autenticación real de partners aprobados en `Synergi` como una capacidad independiente de `Nexus`, con recorrido completo desde el primer acceso tras aprobación hasta el acceso recurrente al workspace privado.

## 2. Contexto actual

`Synergi` ya dispone de:
- una home pública mixta con acceso partner
- una pantalla visual de login partner
- persistencia de admisiones en Neon
- revisión interna inicial de solicitudes
- protección básica del backoffice

Todavía no existe:
- identidad partner propia y persistente
- emisión formal de credenciales
- recuperación de acceso
- transición clara entre primer acceso y acceso recurrente
- sesión partner robusta para workspace privado

## 3. Alcance funcional

### Incluye
- login de partner autenticado contra identidad propia de `Synergi`
- primer acceso con credenciales iniciales emitidas tras aprobación
- cambio de credenciales iniciales a credenciales estables
- acceso recurrente con sesión válida
- recuperación o reenvío de acceso cuando el partner no localice sus datos
- redirección al workspace privado una vez autenticado
- cierre de sesión y expiración segura

### No incluye
- admisión pública de nuevos partners
- backoffice de revisión interna
- lógica de aprobación/rechazo
- workspace completo con contenidos operativos
- analítica avanzada o auditoría regulatoria completa

## 4. Estado de producto esperado

La feature se considera completa cuando un partner aprobado puede:
1. recibir credenciales iniciales por email
2. entrar por primera vez a `Synergi`
3. confirmar o sustituir credenciales iniciales según la política definida
4. volver a entrar en sesiones posteriores con un login estable
5. recuperar el acceso de forma controlada si pierde el correo o la contraseña

## 5. Requisitos funcionales

### RF-PA-01. Identidad partner propia
`Synergi` debe autenticar a partners aprobados con una identidad propia, desacoplada de la autenticación de `Nexus`.

### RF-PA-02. Primer acceso
El primer acceso debe poder realizarse con credenciales iniciales emitidas tras la aprobación del partnership.

### RF-PA-03. Acceso recurrente
Una vez completado el primer acceso, el partner debe poder entrar de forma recurrente con su método estable de autenticación.

### RF-PA-04. Redirección post-login
Una vez validado el login, el usuario debe aterrizar en el workspace privado o en una landing intermedia de bienvenida si el workspace aún no está activo.

### RF-PA-05. Recuperación de acceso
Debe existir un mecanismo para reemitir o recuperar acceso cuando el partner no disponga de sus credenciales iniciales.

### RF-PA-06. Cierre de sesión
La sesión debe poder cerrarse de forma explícita y expirar de manera controlada.

## 6. Requisitos no funcionales

- Seguridad: las credenciales iniciales no deben exponerse en cliente ni en logs
- Trazabilidad: debe quedar registro del primer acceso y del estado de la cuenta
- UX: el mensaje de acceso debe ser claro, premium y coherente con la identidad visual de `Synergi`
- Separación: no debe reutilizarse el login operativo de `Nexus`
- Compatibilidad: el flujo debe funcionar en desktop y móvil

## 7. Estados sugeridos

- `invited`
- `first_login_pending`
- `active`
- `password_reset_requested`
- `locked`

## 8. Dependencias

- partner ya aprobado en el workflow de admisión
- email transaccional para entrega inicial de acceso
- backend propio de `Synergi` para persistencia y validación
- workspace mínimo o landing post-auth

## 9. Criterios de aceptación

- Un partner aprobado puede iniciar sesión con las credenciales iniciales recibidas
- Tras el primer acceso, la cuenta queda marcada como activa
- El acceso recurrente usa la identidad propia de `Synergi`
- La recuperación de acceso está disponible y no depende de `Nexus`
- La sesión se mantiene protegida y expira de forma controlada

## 10. Relación con el roadmap

Esta feature implementa la **Fase 4. Auth partner real** del roadmap vigente:
- login real conectado a identidad propia
- primer acceso con credenciales iniciales
- transición a contraseña o método estable
- recuperación o reenvío de acceso

