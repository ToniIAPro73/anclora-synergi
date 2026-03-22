# Synergi Partner Auth Test Plan v1

Fecha: 2026-03-22  
Feature key: `synergi-partner-auth`

## 1. Objetivo

Verificar que la autenticación de partners funciona de extremo a extremo para primer acceso, acceso recurrente y recuperación de acceso, sin depender de `Nexus`.

## 2. Alcance de pruebas

### Incluido
- login con credenciales iniciales
- activación de cuenta tras primer acceso
- acceso recurrente
- redirección al workspace o landing post-auth
- cierre de sesión
- recuperación o reenvío de acceso

### Excluido
- aprobación interna de solicitudes
- flujo de admisión pública
- auditoría avanzada
- workspace completo

## 3. Preparación

### Datos de prueba
- partner aprobado con estado `active` o `first_login_pending`
- credenciales iniciales válidas
- partner con credenciales inválidas
- partner sin sesión

### Entorno
- entorno local `anclora-synergi`
- entorno Vercel preview si existe
- base de datos Neon de pruebas o schema aislado

## 4. Casos de prueba funcionales

### PA-T01. Primer acceso válido
Pasos:
1. Abrir pantalla de login partner.
2. Introducir email válido y credenciales iniciales.
3. Enviar formulario.

Resultado esperado:
- el sistema autentica al partner
- la cuenta pasa a estado activo o equivalente
- el usuario es redirigido al destino post-auth definido

### PA-T02. Acceso recurrente válido
Pasos:
1. Cerrar sesión.
2. Volver a abrir la pantalla de login.
3. Entrar con credenciales estables.

Resultado esperado:
- la autenticación es correcta
- el usuario entra sin pasar por el proceso de activación inicial

### PA-T03. Credenciales iniciales inválidas
Pasos:
1. Introducir email válido.
2. Introducir contraseña o código incorrecto.
3. Enviar formulario.

Resultado esperado:
- el acceso se rechaza
- se muestra un error claro
- no se altera el estado de la cuenta

### PA-T04. Recuperación de acceso
Pasos:
1. Abrir el flujo de recuperación.
2. Solicitar reenvío o reset.
3. Confirmar recepción de instrucción.

Resultado esperado:
- se genera una respuesta segura
- no se revela información sensible
- el flujo queda registrado

### PA-T05. Cierre de sesión
Pasos:
1. Iniciar sesión correctamente.
2. Cerrar sesión.
3. Intentar volver al workspace.

Resultado esperado:
- la sesión se invalida
- el workspace deja de ser accesible

## 5. Casos de seguridad

### PA-S01. Sesión expirada
- verificar que una sesión caducada no permite acceso al workspace

### PA-S02. Acceso sin autorización
- verificar que una ruta privada no se abre sin sesión válida

### PA-S03. Reutilización de credenciales iniciales
- verificar que la política definida impide o controla el abuso de credenciales iniciales según el estado de la cuenta

## 6. Casos de integración

### PA-I01. Persistencia de estado
- el login debe actualizar el estado en Neon o en la capa de identidad definida

### PA-I02. Reenvío de acceso
- la acción de recuperación debe dejar traza y activar el mecanismo previsto

### PA-I03. Redirección post-login
- tras autenticación válida, la app debe abrir el destino privado correcto

## 7. Criterios de salida

- primer acceso validado
- acceso recurrente validado
- recuperación de acceso validada
- sesión y redirección seguras
- sin dependencia funcional de `Nexus`
