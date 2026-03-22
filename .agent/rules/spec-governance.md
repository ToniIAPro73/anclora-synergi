# Synergi Spec Governance

## Principios

- Todo desarrollo relevante nace en `sdd/features/<feature>/<feature>-spec-v1.md`.
- `sdd/core/product-spec-v0.md` define el baseline de producto vigente.
- `sdd/core/spec-core-v1.md` define arquitectura, decisiones y restricciones activas.
- El roadmap maestro vive en `public/docs/anclora-synergi-roadmap-v1.md`.

## Reglas operativas

- No abrir nuevas features sin encaje explícito en el roadmap vigente.
- Cada feature debe declarar objetivo, alcance, dependencias, riesgos y criterio de aceptación.
- Backend público, auth, admisiones y workspace partner deben evolucionar como un sistema único, no como piezas aisladas.
- Cambios que afecten a admisión, login o datos partner deben mantener coherencia entre UI, API y modelo Neon.

## Restricciones vigentes

- `Synergi` es una app independiente de `Nexus`, aunque pueda reutilizar contratos temporalmente.
- La persistencia operativa se apoya en `Neon`.
- La validación de reCAPTCHA debe hacerse en servidor.
- El backoffice interno no puede permanecer público: toda feature de revisión interna debe nacer autenticada o protegida.
