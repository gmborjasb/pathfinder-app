# Plan: Recuperar el Neo-Brutalismo y Consolidar la Paleta de Colores

Auditoría del código real (no del diseño) que explica por qué la app "no se ve nada neo brutalista" y por qué la paleta se siente descontrolada. Este documento **no aplica cambios** — es el plan a aprobar.

---

## 1. Hallazgo principal: 3 piezas centrales de la app NO tienen Neo-Brutalismo

Conteo de `border-3` / `shadow-[...]` (los dos rasgos que definen el estilo, según `design.md`) por archivo:

| Archivo | Ocurrencias | Diagnóstico |
|---|---|---|
| `src/pages/Login.tsx` | **0** | 100% estilo "corporativo suave": `shadow-2xl`, `rounded-[16px]`, `border border-[#e2e8f0]` (1px). Es lo primero que ve cualquier usuario y no comunica la identidad de marca. |
| `src/pages/Perfil.tsx` | **0** | Mismo problema: `shadow-xs`, bordes de 1px, todo `rounded-2xl` suave. |
| `src/components/MobileNav.tsx` | **0** | Usa `style={{}}` inline, `border-top: 1px solid`, sin sombra, colores hardcodeados (`#0F2554`, ya obsoleto). En viewport móvil (donde probablemente estás probando) **no se ve ningún rasgo Neo-Brutalista** — parece una app genérica. |

**Esto probablemente explica gran parte de "no se ve nada neo brutalista":** si estás mirando el Login, el Perfil, o la app en el celular, literalmente no hay bordes gruesos ni sombras duras en pantalla.

En contraste, `Dashboard.tsx` (28), `BuscarOportunidades.tsx` (25) y los componentes de `catalogo/`, `postulaciones/`, `mochila/`, `asesor/` (12–25 cada uno) sí cumplen el estilo. El problema no es "toda la app", es que **3 puntos de entrada críticos quedaron afuera**.

### Cambio propuesto
- **Login.tsx**: convertir la tarjeta de auth a `border-3 border-text-primary shadow-[6px_6px_0_#1e293b]`, los botones a `border-2` + sombra dura con estado `:active` (translate + sin sombra), inputs con `border-2` en vez de `border`.
- **Perfil.tsx**: convertir las 4 tarjetas de sección (Datos personales, Académico, Socioeconómico, Extracurriculares) a `border-3 shadow-[4px_4px_0_#1e293b] rounded-2xl` en vez de `border border-slate-200 shadow-xs`.
- **MobileNav.tsx**: reescribir con Tailwind (no inline styles), `border-t-3 border-text-primary`, ítem activo con fondo `bg-brand-yellow` + `border-2` (como el sidebar desktop), reemplazar `#0F2554` por el token `brand-blue`.

---

## 2. Hallazgo de paleta: 50 hex distintos para lo que deberían ser ~10 tokens

```
grep -rohE "#[0-9a-fA-F]{6}" src --include="*.tsx" | sort -u | wc -l
→ 50
```

Ejemplos de **grupos que deberían ser un solo color** pero están fragmentados:

| Significado semántico | Hex distintos usados hoy |
|---|---|
| Verde "éxito/completado" | `#dcfce7`, `#166534`, `#15803d`, `#16a34a`, `#065f46`, `#064e3b` (6 variantes) |
| Rojo "error/urgente" | `#fee2e2`, `#b91c1c`, `#991b1b`, `#7f1d1d`, `#dc2626`, `#ef4444` (6 variantes) |
| Azul "informativo" | `#dbeafe`, `#1e40af`, `#1d4ed8`, `#eff6ff` (4 variantes, aparte del brand-blue) |
| Gris "texto secundario" | `#64748b`, `#475569`, `#334155`, `#94a3b8` (4 variantes sin criterio de cuándo usar cada uno) |
| Gris "fondo/borde neutro" | `#e2e8f0`, `#f1f5f9`, `#cbd5e1`, `#f8fafc`, `#F3F4F6`, `#F1F5F9` (2 de estos son el mismo color con distinta capitalización) |

`index.css` **ya define** tokens para esto (`--color-success-bg/text`, `--color-danger-bg/text`, `--color-warning-bg/text`, `--color-info-bg/text`, `--color-text-secondary/tertiary`) pero casi ningún componente los usa — cada archivo eligió su propio hex "parecido" en vez de reusar el token. Por eso, aunque cada componente individualmente se ve bien, **la app entera se siente sin criterio de color** cuando se navega de una pantalla a otra.

### Cambio propuesto
- Definir explícitamente en `index.css` (ya existen la mayoría, solo falta consolidar valores):
  - `--color-success-text` único para todo verde de texto (hoy 3 variantes de verde-oscuro compiten).
  - `--color-danger-text` único para todo rojo de texto/borde de alerta.
  - `--color-text-secondary` (#475569) para texto de énfasis medio, `--color-text-tertiary` (#64748b) para metadatos/timestamps — y **documentar la regla** de cuándo usar cada uno (evita que seis archivos elijan seis grises "similares").
- Pasada de reemplazo por archivo: sustituir cada hex "casi igual" por el token correspondiente. Empezar por los grupos de mayor repetición (verde: 13+5+... apariciones, gris `#64748b`: 25 apariciones).
- `MobileNav.tsx` reemplaza sus 3 usos de `#0F2554` por `brand-blue` (ya identificado en el punto 1).

---

## 3. Recordatorio: el sidebar amarillo sigue sin corregir

El plan anterior (`plan-mejoras-ui.md`, punto 1) ya identificó que `Sidebar.tsx:180` usa `bg-brand-yellow` de fondo completo cuando los 7 mockups lo definen azul. **Ese cambio todavía no se aplicó.** Sigue siendo, junto con el punto 1 de este documento, la explicación más directa de "no se ve neo brutalista" — el color dominante de cada pantalla (sidebar + mobile nav) es amarillo/blanco plano en vez de azul marino con acentos puntuales.

---

## Orden de ejecución sugerido (consolidado con el plan anterior)

1. **Sidebar → azul** (`plan-mejoras-ui.md`, pendiente).
2. **MobileNav → reescribir con Tailwind + Neo-Brutalismo + brand-blue** (nuevo, alto impacto si pruebas en móvil).
3. **Login.tsx y Perfil.tsx → agregar border-3/shadow duro** a las tarjetas principales (nuevo).
4. **Consolidar los 50 hex a los tokens de `index.css`**, empezando por verdes/rojos/grises repetidos (nuevo).
5. **Cards de Buscar Oportunidades** (ancho/alto dinámico, gaps, paginador visible) — plan anterior, pendiente.
6. **Semántica de color en `ScholarshipCard`** (rojo solo para urgencia real) — plan anterior, pendiente.

¿Apruebas este plan (puntos 1-6, combinando lo nuevo con lo pendiente del plan anterior), o prefieres que ataquemos primero solo el Sidebar + MobileNav (los de mayor impacto visual inmediato) y dejamos la consolidación de color para una segunda pasada?
