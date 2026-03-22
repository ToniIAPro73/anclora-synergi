# Synergi Partner Workspace v2 Spec v1

Fecha: 2026-03-22  
Estado: propuesta activa alineada con roadmap v1  
Feature key: `synergi-partner-workspace-v2`

## 1. Objetivo

Extender el workspace privado de `Synergi` con una segunda capa operativa centrada en referrals reales aportados por el partner y solicitudes curatoriales de asset packs, de modo que el workspace pase de ser un repositorio de contexto a una herramienta bidireccional de colaboración.

## 2. Contexto actual

`workspace-v1` ya resuelve:
- overview del partner
- perfil editable
- assets descargables con trazabilidad
- oportunidades con respuesta y notas
- actividad reciente

Todavía falta una vía directa para que el partner:
- aporte oportunidades al ecosistema
- pida packs o activos específicos al equipo de Synergi
- vea el estado operativo de esas interacciones

## 3. Objetivo de producto

El workspace debe permitir que un partner activo:
- registre referrals estructurados desde su zona privada
- consulte el estado de esos referrals
- solicite packs curatoriales o materiales operativos
- vea la evolución mínima de esas solicitudes sin salir del workspace

## 4. Alcance funcional

### Incluye
- módulo privado de `Referrals`
- formulario de referral estructurado
- listado de referrals enviados por el partner
- modelo de estados para referrals
- formulario de `Asset Pack Request`
- listado de solicitudes de packs dentro de `Assets & Documents`
- actividad registrada por referral y asset request
- priorización del módulo según tipo de partner

### No incluye
- matching automático con buyers o sellers
- mensajería interna con hilos
- uploads binarios por parte del partner
- workflow interno de cierre comercial avanzado
- panel interno específico de gestión de referrals

## 5. Flujos cubiertos

### 5.1 Referral outbound del partner
1. El partner entra en su workspace.
2. Abre el módulo `Referrals`.
3. Completa un referral con contacto, región, tipo y contexto.
4. `Synergi` persiste el referral y registra actividad.
5. El partner ve el referral en su cola privada con estado inicial.

### 5.2 Solicitud de asset pack
1. El partner entra en `Assets & Documents`.
2. Solicita un pack específico o material adicional.
3. La app persiste la request y registra actividad.
4. El partner ve la request con estado operativo inicial.

## 6. Nuevas entidades sugeridas

### `partner_referrals`
- `id`
- `partner_account_id`
- `referral_name`
- `company_name`
- `email`
- `phone`
- `region_label`
- `referral_type`
- `notes`
- `status`
- `priority_label`
- `created_at`
- `updated_at`

### `partner_asset_requests`
- `id`
- `partner_account_id`
- `request_title`
- `request_details`
- `status`
- `created_at`
- `updated_at`

## 7. Estados sugeridos

### Referrals
- `submitted`
- `qualified`
- `in_conversation`
- `closed`
- `declined`

### Asset pack requests
- `submitted`
- `in_preparation`
- `fulfilled`

## 8. Reglas por perfil

### `referral-partner`
El módulo `Referrals` debe subir en prioridad y tener mayor protagonismo en la navegación.

### `service-premium`
Debe convivir `Assets & Documents` con `Referrals`, sin desplazar el perfil operativo.

### `market-intelligence`
El peso sigue en assets, pero debe poder aportar leads o señales mediante referrals.

### `project-collaboration`
Debe poder abrir referrals vinculados a proyectos y pedir packs curatoriales específicos.

## 9. Requisitos funcionales

### RF-PW2-01. Referral persistido
El workspace debe permitir registrar referrals reales del partner en Neon.

### RF-PW2-02. Cola privada de referrals
El partner debe ver sus referrals con estado operativo y contexto básico.

### RF-PW2-03. Solicitud de packs
El módulo de assets debe permitir solicitar nuevos materiales o packs curatoriales.

### RF-PW2-04. Trazabilidad
Cada referral y cada asset request debe generar actividad en el workspace.

### RF-PW2-05. UX premium
La experiencia debe mantenerse premium, clara y usable en desktop y móvil.

## 10. Criterios de aceptación

- Existe un módulo `Referrals` accesible desde el workspace
- El partner puede enviar un referral y verlo persistido
- El partner puede solicitar un asset pack desde `Assets & Documents`
- Referral y asset request generan actividad
- La navegación del workspace se adapta a la nueva capa
- El build, lint y test del proyecto pasan con la feature integrada

## 11. Relación con roadmap

Esta feature profundiza la **Fase 5b. Workspace partner v2** y prepara la transición hacia operación comercial más rica sin esperar a un `workspace-v3`.
