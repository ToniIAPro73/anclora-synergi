# Synergi Observability And Admin Roles Test Plan v1

Fecha: 2026-03-23
Feature key: `synergi-observability-and-admin-roles`

## Escenarios

1. Un usuario `viewer` no puede ejecutar acciones reservadas a `operator` o `admin`.
2. Un evento de acceso denegado queda registrado en la auditoria.
3. Un intento rate-limited genera una señal visible en observabilidad.
4. El dashboard interno muestra eventos sensibles recientes con contexto util.
5. Un smoke check de release puede ser representado y consultado internamente.
6. Las vistas administrativas siguen funcionando con los roles adecuados.
