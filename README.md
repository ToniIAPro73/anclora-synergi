# Anclora Synergi

Independent partner portal for the curated Anclora ecosystem.

Current scope:
- Next.js app scaffold
- Public mixed entry screen with partnership request plus approved-partner access
- Real partner login with first-access activation and private workspace entry
- Visual language derived from Private Estates, with a distinct Synergi identity
- Server-side partner admission route with reCAPTCHA verification and Neon persistence
- Internal review panel with decision workflow, invite-code generation and admin protection
- Transactional email layer for acceptance, rejection and credential reissue

Next steps:
- expand the private workspace with partner-facing assets and referrals
- harden the internal review area with richer audit and role controls
- point Private Estates Partner Portal to the public Synergi root URL

Required environment variables:
- `NEXT_PUBLIC_PRIVATE_ESTATES_PARTNER_ENTRY_URL`
- `NEXT_PUBLIC_PRIVATE_ESTATES_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_VERIFY_URL`
- `DATABASE_URL`
- `SYNERGI_ADMIN_USERNAME`
- `SYNERGI_ADMIN_PASSWORD`
- `SYNERGI_ADMIN_SESSION_SECRET`
- `SYNERGI_PARTNER_SESSION_SECRET`
- `USER_TEXT`
- `PASS_TEXT`
- `UTILIZAR_USER_TEXT`
- `SYNERGI_EMAIL_PROVIDER`
- `RESEND_API_KEY`
- `SYNERGI_EMAIL_FROM`
- `SYNERGI_EMAIL_REPLY_TO`
- `SYNERGI_SUPPORT_EMAIL`

## UX/UI contracts

Read these before changing interface components:

1. `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
2. `docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md`
3. `docs/standards/UI_MOTION_CONTRACT.md`
4. `docs/standards/MODAL_CONTRACT.md`
5. `docs/standards/LOCALIZATION_CONTRACT.md`

## Branding canónico

- Familia: `Premium`
- Tipografía base: `DM Sans`
- Accent principal: `#8C5AB4`
- Borde de icono: cobre `#C07860`
- Interior de icono: `#1C162A`
- Favicon esperado: prefijo `synergi_`
- Estado de activos finales: pendientes de sustitución por parte del usuario

El repo ya queda preparado estructuralmente para el branding premium. Cuando lleguen los activos finales, solo habrá que reemplazar los archivos de marca sin rehacer el wiring.
