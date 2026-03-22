# Core Spec v1

Fecha: 2026-03-22  
Owner: Anclorabot

## Arquitectura vigente

- Frontend: Next.js 16 + React 19 + TypeScript
- UI: CSS propia premium derivada de Private Estates
- Persistencia: Neon PostgreSQL
- Backend: API routes de Next.js
- Protección interna: sesión admin ligera por cookie firmada
- Captcha: Google reCAPTCHA verificado en servidor

## Decisiones vigentes

1. `Synergi` evoluciona como producto independiente.
2. Las solicitudes públicas se persisten en Neon, no en Nexus.
3. El flujo mínimo completo es: solicitud -> revisión interna -> aceptación/rechazo -> acceso partner.
4. El backoffice interno puede arrancar con auth ligera, pero debe evolucionar a un modelo más robusto.
5. El roadmap maestro vive fuera de `sdd`, en `public/docs`, para ser consultable como documento de producto.

## Riesgos conocidos

- La auth interna actual es funcional pero básica.
- El login partner aún no está conectado a identidad real.
- No existe todavía pipeline de emails transaccionales.
- El schema Neon de admisiones es inicial y aún no cubre el workspace completo.

## Criterios de aceptación para la siguiente fase

- El partner admission flow debe quedar operativo de extremo a extremo
- Debe existir trazabilidad de estados internos
- Debe poder emitirse o preparar credenciales de acceso partner
- El workspace partner debe abrir una fase nueva con operaciones reales
