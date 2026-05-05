# Anclora Synergi Premium App Contract

Fecha: `2026-05-05`
Estado: `ACTIVE`
Ámbito: `anclora-synergi`, solicitudes de acceso, invitación, onboarding y UX de partner workspace

## Objetivo

Establecer el contrato SDD de referencia para Anclora Synergi como aplicación **PREMIUM**, alineada con la bóveda (`ToniIAPro73/boveda-anclora`) y con `anclora-design-system`.

Este contrato aplica a cualquier cambio de UI/UX, branding, onboarding, acceso, formularios, modales, workspace privado o flujos de partner admission dentro del repo `anclora-synergi`.

## Autoridad

Fuentes obligatorias:

```text
1. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md
2. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md
3. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md
4. ToniIAPro73/anclora-design-system/docs/design-system-audit-and-target-architecture.md
5. docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md
6. docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md
7. docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md
8. docs/standards/MODAL_CONTRACT.md
9. docs/standards/LOCALIZATION_CONTRACT.md
10. docs/standards/UI_MOTION_CONTRACT.md
```

## Clasificación

```text
Aplicación: anclora-synergi
Grupo: Premium
Dominio: real estate / partner network
Idiomas objetivo: es / en / de
Tema objetivo: tema editorial único permitido si es deliberado y consistente
Uso: red premium de partners, colaboración curada, acceso selectivo
```

## Branding Premium aplicado a Synergi

Según el branding maestro de la bóveda:

```text
Grupo: Premium
Borde de icono: cobre rosado
Tipografía: DM Sans
Accent de app: #8C5AB4
Hue: 280°
Símbolo fundacional: círculo + tres ondas horizontales
```

## Gramática visual

Synergi debe sentirse como una experiencia premium editorial de red y colaboración, no como un dashboard interno.

Prioridades:

```text
confianza curada > criterio profesional > claridad de acceso > acabado editorial
```

Permitido:

- superficies premium con profundidad contenida
- glass, gradientes y overlays si no sacrifican legibilidad
- framing editorial
- copy selectivo y orientado a colaboración cualificada

No permitido:

- parecer Nexus con decoración premium añadida
- usar exceso de ornamento que dificulte lectura
- adoptar estética ultra premium inmobiliaria de Private Estates
- redefinir botones/cards/modales fuera del design system sin excepción documentada

## Botones y acciones

Deben existir las familias semánticas:

```text
primary
secondary
ghost
destructive
```

Reglas:

- un solo CTA dominante por viewport principal
- el CTA principal puede usar el acento Synergi, pero debe conservar contraste y foreground estable
- acciones secundarias deben sentirse premium, no utilitarias sin acabado
- acciones destructivas no pueden competir visualmente con la primaria

## Cards y surfaces

Las cards premium deben tener:

- padding estable
- jerarquía clara
- separación perceptible
- hover medido
- cero desplazamientos bruscos
- texto largo contenido dentro del layout

Si la card base premium existe o se promueve en `anclora-design-system`, debe consumirse desde allí.

## Modales y onboarding

Se aplica `MODAL_CONTRACT.md` y `ANCLORA_PREMIUM_APP_CONTRACT.md`.

Para flujos de acceso:

- explicar claramente qué se solicita
- explicar qué recibirá el usuario tras aprobación
- mantener cierre claro
- footer accionable
- evitar scroll evitable
- mantener lenguaje selectivo, no masivo

## Localización

Synergi debe mantener `es/en/de`.

No se permite mezclar idiomas en una misma vista. El selector de idioma debe sentirse integrado en la marca premium.

## Relación con Nexus

Nexus aprueba o rechaza solicitudes. Synergi consume invitaciones o estados de acceso.

Nexus no debe imponer su gramática INTERNAL a las pantallas públicas o autenticadas de Synergi. Solo debe emitir decisiones/invitaciones; la experiencia final debe respetar este contrato.

## Gate de aceptación

Una feature de Synergi no está lista si:

- trata Synergi como app interna
- usa acentos o tipografía que contradicen el branding premium
- añade formularios o modales sin acabado premium
- mezcla el lenguaje visual de Private Estates con Synergi
- ignora `ANCLORA_PREMIUM_APP_CONTRACT`
- ignora el rol de Nexus como gestor de decisión, no como UI final de Synergi
