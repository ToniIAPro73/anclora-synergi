# Anclora Synergi

Independent partner portal for the curated Anclora ecosystem.

Current scope:
- Next.js app scaffold
- Public mixed entry screen with partnership request plus approved-partner access
- Real partner login with first-access activation and private workspace entry
- Visual language derived from Private Estates, with a distinct Synergi identity
- Server-side partner admission route with reCAPTCHA verification and Neon persistence
- Internal review panel with decision workflow, invite-code generation and admin protection

Next steps:
- connect transactional emails for acceptance, rejection and credential reissue
- expand the private workspace with partner-facing assets and referrals
- harden the internal review area with richer audit and role controls
- point Private Estates Partner Portal to the public Synergi root URL

Required environment variables:
- `NEXT_PUBLIC_PRIVATE_ESTATES_PARTNER_ENTRY_URL`
- `NEXT_PUBLIC_PRIVATE_ESTATES_URL`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_VERIFY_URL`
- `DATABASE_URL`
- `SYNERGI_ADMIN_USERNAME`
- `SYNERGI_ADMIN_PASSWORD`
- `SYNERGI_ADMIN_SESSION_SECRET`
- `SYNERGI_PARTNER_SESSION_SECRET`
