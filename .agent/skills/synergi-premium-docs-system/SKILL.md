---
name: synergi-premium-docs-system
description: Crear o actualizar documentación pública de Anclora Synergi en `public/docs`, especialmente guías premium para partners y manuales de usuario. Usar cuando haya que producir entregables documentales claros y estructurados en Markdown y una versión PDF premium lista para descarga desde la aplicación.
---

# Skill: Synergi Premium Docs System

Crear documentación de `Synergi` pensada para usuario final, con una doble salida:
- Markdown editable y mantenible en `public/docs`
- PDF premium de presentación para descarga pública

## Flujo

1. Revisar el estado actual del producto y las rutas reales de la app antes de escribir.
2. Redactar primero la versión Markdown fuente en `public/docs`.
3. Mantener una estructura clara:
   - propósito
   - flujo paso a paso
   - qué ocurre en cada estado
   - qué acciones debe hacer el usuario
   - buenas prácticas y soporte
4. Para la guía pública partner, actualizar también el HTML premium en `assets/partner-guide-premium.html`.
5. Generar el PDF final con `scripts/render-premium-pdf.ps1`.

## Entregables esperados

- `public/docs/Guía_del_Partner.pdf`
- `public/docs/Manual_Anclora_Synergy.md`

## Estilo editorial

- Escribir en español claro y profesional.
- Mantener el tono premium de Anclora: sobrio, preciso y elegante.
- Priorizar comprensión rápida: títulos breves, bloques cortos y listas solo cuando aporten claridad.
- Evitar tecnicismos internos que el partner no necesite.

## Regla de consistencia

- El PDF premium debe cubrir el proceso completo para convertirse en partner.
- El manual de usuario debe centrarse en el uso de la aplicación una vez que el partner ya dispone de acceso.
- Si cambia el flujo del producto, actualizar primero el Markdown y luego regenerar el PDF.

## Recursos

- Plantilla premium del PDF: `assets/partner-guide-premium.html`
- Script de render: `scripts/render-premium-pdf.ps1`

## Generación del PDF

Usar:

```powershell
powershell -ExecutionPolicy Bypass -File .agent/skills/synergi-premium-docs-system/scripts/render-premium-pdf.ps1 -InputHtml .agent/skills/synergi-premium-docs-system/assets/partner-guide-premium.html -OutputPdf public/docs/Guía_del_Partner.pdf
```

## Criterio de cierre

- Los dos documentos existen en `public/docs`
- La guía PDF se abre correctamente
- El contenido refleja el flujo real de `Synergi` y `Private Estates`
