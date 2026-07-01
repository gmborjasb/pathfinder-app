# Análisis: Buscar Oportunidades — Mockup vs Código

Pantalla analizada: `xr4IL` "Buscar Oportunidades Final Compacto" (1440×1066)
Archivo código: `src/pages/BuscarOportunidades.tsx` (1065 líneas)
Componentes: `ScholarshipCard.tsx`, `FilterDrawer.tsx`, `DetailDrawer.tsx`
Sidebar: `Sidebar.tsx`

---

## 1. Sidebar — DIFERENCIA CRÍTICA

### Color de fondo
| Aspecto | Mockup | Código |
|---|---|---|
| **Fondo sidebar** | `#003c90` (azul brand-blue) | `bg-brand-yellow` (#fde047, amarillo) |
| Borde derecho | `#1e293b` 3px | `border-r-3 border-text-primary` ✅ |
| Ancho | 260px | w-[260px] ✅ |

**Conclusión:** El mockup muestra sidebar azul. El código la tiene amarilla. Es la diferencia visual más grande de toda la pantalla.

### Logo
| Aspecto | Mockup | Código |
|---|---|---|
| Estilo | Frame verde `#bbf7d0` con "🚀 Pathfinder" | "P" en cuadro oscuro + "Pathfinder" + "Portal postulante" |
| Sombra | 4×4 #1e293b | shadow-[2px_2px_0_#ffffff] |
| Borde | 3px #1e293b | ❌ Sin borde en el logo |

**Nota:** El color del logo en el mockup de Buscar (`#bbf7d0` verde claro) **no coincide** con el mockup del Dashboard (`#fde047` amarillo). Inconsistencia interna del diseño.

### Items de navegación
| Aspecto | Mockup | Código |
|---|---|---|
| **Items** | Dashboard, Convocatorias, Mis Postulaciones, Mochila, Asesor IA | Inicio/Mi panel, Perfil, Mis postulaciones, Buscar becas, Mochila Docs, Asesor IA |
| **Item activo** | Fondo `#fde047`, border-3 `#1e293b`, shadow 4×4 | Fondo blanco (`bg-bg-card`), border-2, shadow-[2px_2px_0] |
| **Item inactivo** | Fondo `#003c90` (mismo que sidebar), texto blanco | Fondo transparente, texto `text-text-primary/70` |
| **Iconos** | Lucide: layout-dashboard, search, file-text, briefcase, bot | Material Symbols: home, search, assignment, backpack, smart_toy |
| **Altura item** | 52px fijo | padding dinámico (px-4 py-3) |
| **Perfil** | ❌ No existe en mockup | ✅ Presente en código |

**Conclusión:** Estilo completamente diferente. El diseño usa amarillo para activo sobre fondo azul. El código usa blanco para activo sobre fondo amarillo. También falta "Perfil" en el mockup.

### Footer / Usuario
| Aspecto | Mockup | Código |
|---|---|---|
| Avatar | Círculo gris `#e2e8f0` 40px con iniciales "AC" | Ícono `person` en cuadro blanco 40px |
| Nombre | "Alex C." | Nombre dinámico desde perfil |
| Info | "Nivel 4" | "Estudiante" + barra de completitud de perfil |
| Menú | ❌ Sin menú adicional | Menú de 3 puntos con "Ver mi perfil" y "Cerrar sesión" |

---

## 2. Layout General

| Aspecto | Mockup | Código |
|---|---|---|
| Ancho total | 1440px | 100% viewport |
| Main area | 1180px | `max-w-[1180px]` ✅ |
| Padding main | 48px top/bottom, 64px left/right | `px-6 py-8 md:px-16 md:py-12` ⚠️ (mobile: 24/32, desktop: 64/48) |
| Fondo página | `#f8fafc` | `bg-slate-50` ✅ (mismo color) |
| Sidebar presente | ✅ Sí, 260px azul | ✅ Sí, 260px amarilla ❌ color |

---

## 3. Título

| Aspecto | Mockup | Código |
|---|---|---|
| Texto | "Explorar Becas" | "Explorar Becas" ✅ |
| Font size | 32px | `text-[32px]` ✅ |
| Weight | 900 (Extrabold/Black) | `font-black` ✅ |
| Color | `#003c90` | `text-brand-blue` ✅ |

---

## 4. Barra de Búsqueda

| Aspecto | Mockup | Código |
|---|---|---|
| Ancho | 400px | `w-full md:w-[400px]` ✅ |
| Fondo | `#ffffff` | `bg-white` ✅ |
| Borde | 3px `#1e293b` | `border-3 border-text-primary` ✅ |
| Shadow | 4×4 #1e293b | `shadow-[4px_4px_0_#1e293b]` ✅ |
| Icono | Lucide `search` (izquierda) | Material Symbols `search` (izquierda) ❌ icono |
| Placeholder | "Buscar becas o programas..." | "Buscar becas o programas..." ✅ |
| Padding | 16px 24px | `pl-12 pr-4 py-4` ⚠️ (distinto) |
| Input font | 14px, weight 800 | `text-[14px] font-extrabold` ✅ |

---

## 5. Botón "Filtros Avanzados"

| Aspecto | Mockup | Código |
|---|---|---|
| Ancho | Auto (junto al search) | `w-full md:w-auto` ✅ responsive |
| Fondo | `#ffffff` | `bg-white` ✅ |
| Borde | 3px `#1e293b` | `border-3 border-text-primary` ✅ |
| Shadow | 4×4 #1e293b | `shadow-[4px_4px_0_#1e293b]` ✅ |
| Icono | Lucide `list` | Material Symbols `list` ❌ icono |
| Texto | "Filtros Avanzados" 14px 900 | "Filtros Avanzados" ✅ |
| Badge count | Círculo amarillo `#fde047` con borde `#1e293b` | `bg-brand-yellow border-2 border-text-primary` ✅ |
| Hover | `-translate-y-1` `shadow-[6px_6px_0]` | ✅ implementado |
| Active | translate + shadow none | ✅ implementado |

---

## 6. Tabs (Explorar / Guardadas / Postuladas)

| Aspecto | Mockup | Código |
|---|---|---|
| **Tab activo** | | |
| Label style | `#1e293b`, font-black, 15px | `text-text-primary`, font-black, 15px ✅ |
| Badge activo | `#fde047`, border `#1e293b` | `bg-brand-yellow border-text-primary` ✅ |
| Indicador activo | `border-bottom: 3px solid #1e293b` | `h-1 bg-text-primary` (4px) ⚠️ (3px vs 4px) |
| **Tab inactivo** | | |
| Label style | `#64748b`, font-black | `text-slate-500`, font-black ✅ |
| Badge inactivo | `#e2e8f0`, sin borde | `bg-slate-200 border-transparent` ⚠️ (bg sutilmente diferente) |
| **Layout tabs** | gap 24px | `gap-6` ✅ |
| **Underline row** | `#cbd5e1` | `border-slate-300` ⚠️ (#cbd5e1 ≠ slate-300=#d1d5db) |

---

## 7. Scholarship Cards

| Aspecto | Mockup | Código |
|---|---|---|
| Dimensiones | 335×320px fijo | `w-[335px] h-[320px]` ✅ |
| Borde | 3px `#1e293b` | `border-3 border-text-primary` ✅ |
| Shadow | 4×4 #1e293b | `shadow-[4px_4px_0_#1e293b]` ✅ |
| Rounded | 16px | `rounded-2xl` ✅ |
| Hover | ❌ No especificado | `hover:-translate-y-1` ✅ |
| Padding interno | 20px 24px | `p-5` (20px) ⚠️ (sin padding horizontal extra) |

### Header de tarjeta
| Aspecto | Mockup | Código |
|---|---|---|
| Sponsor | Texto uppercase 10px | ✅ |
| Affinity badge | Pill con bg semántico | ✅ |
| Heart icon | Lucide `heart` | Material Symbols `favorite` ❌ icono |
| Filled heart | Lucide fill | `fontVariationSettings: "'FILL' 1"` |

### Affinity badge — colores
| Nivel | Mockup | Código |
|---|---|---|
| Alto (≥80%) | `#dcfce7` bg, `#166534` text, label ⚠️ (no visible en data) | `bg-green-100 text-green-800`, label "N% Match" |
| Medio (≥60%) | ❌ No visible | `bg-blue-100 text-blue-800`, label "N% Afín" |
| Bajo (<60%) | ❌ No visible | `bg-slate-100 text-slate-800`, label "N% Compatibilidad" |

**Nota:** Los datos del mockup no muestran el contenido interno del header de la card a profundidad. La estructura es similar.

### Cuerpo
| Aspecto | Mockup | Código |
|---|---|---|
| Título | 18px font-black | `text-[18px] font-black` ✅ |
| Descripción | 12px font-bold, line-clamp | ✅ |
| Tags | 2 pills: level (red) + requirement (blue) | `px-2.5 py-1` con bg red-50/blue-50 ✅ |
| Separador | `#e2e8f0` 2px | `bg-slate-200 h-[2px]` ✅ |

### Footer
| Aspecto | Mockup | Código |
|---|---|---|
| Label | "Cierra en" 10px uppercase | ✅ |
| Deadline | 16px font-black + icono hourglass | ✅ |
| "Postular" btn | Amarillo `#fde047` border-2, shadow 3×3 | ✅ |
| Active state | translate + shadow none | ✅ |

---

## 8. Grid de Resultados

| Aspecto | Mockup | Código |
|---|---|---|
| **Columnas** | 2 columnas (335px × 2 ≈ 670px) | 1 col (mobile) / 2 cols (md) / 3 cols (lg) |
| Gap | 24px | `gap-6` ✅ |
| Layout | En filas verticales (3 filas × 2 cols = 6 cards) | Grid responsivo |
| Alineación | Cards centradas en columna | `mx-auto` por card ⚠️ |

**Hallazgo importante:** El mockup muestra 2 columnas fijas. El código tiene 3 columnas en lg. Con 6 cards por página y 3 columnas, quedan 2 filas. Con 2 columnas, quedan 3 filas. El diseño visual es diferente.

---

## 9. Paginación

| Aspecto | Mockup | Código |
|---|---|---|
| Botón "← Anterior" | ✅ | ✅ |
| Página activa | Fondo `#1e293b`, texto blanco, border-2 | `bg-text-primary text-white border-2 border-text-primary` ✅ |
| Página inactiva | Fondo blanco, border `#cbd5e1` | `bg-white border-slate-300` ⚠️ (cbd5e1 ≠ slate-300) |
| Botón "Siguiente →" | ✅ | ✅ |
| Gap entre números | 8px | `gap-2` ✅ |
| Dimensiones botones | w-10 h-10 | `w-10 h-10` ✅ |
| Disabled state | ❌ No especificado | `disabled:opacity-40 cursor-not-allowed` ✅ |

---

## 10. FilterDrawer

| Aspecto | Mockup | Código |
|---|---|---|
| Ancho | 400px | `w-full sm:w-[400px]` ✅ |
| Fondo | `#f8fafc` | `bg-slate-50` ✅ |
| Border left | 3px `#1e293b` | `border-l-3 border-text-primary` ✅ |
| Shadow | blur:16, offset:(-8,0), color:#1e293b22 | `shadow-[-8px_0_16px_rgba(30,41,59,0.1)]` ⚠️ (sutil diferencia) |
| Header | "Filtros Avanzados" + "Limpiar" | ✅ |
| **Checkbox checked** | `#3b82f6` (blue-500) | `bg-brand-blue border-brand-blue` (#003c90) ❌ **diferencia de color** |
| **Radio selected** | `strokeWidth: 6, stroke: #3b82f6` | `border-[6px] border-brand-blue` ❌ **diferencia de color** |
| Acordeón | Chevron rota 180° | `rotate-180` ✅ |
| Botón Aplicar | Amarillo `#fde047` border-3, shadow 4×4 | ✅ |

**Hallazgo crítico:** Los checkboxes y radios en el mockup usan `#3b82f6` (azul brillante, blue-500). El código usa `#003c90` (brand-blue, azul oscuro). Son tonos diferentes.

### Estado de acordeones
| Grupo | Mockup | Código |
|---|---|---|
| Tipo de Programa | ✅ Expandido | `accordionOpen.programa: true` ✅ |
| Financiamiento | ❌ Colapsado | `accordionOpen.financiamiento: true` ❌ **diferente** |
| Gestión | ❌ Colapsado | `accordionOpen.gestion: true` ❌ **diferente** |
| Destino | ❌ Colapsado | `accordionOpen.destino: true` ❌ **diferente** |

**Hallazgo:** El mockup solo muestra el primer grupo expandido. El código tiene todos expandidos por defecto.

---

## 11. DetailDrawer

| Aspecto | Mockup | Código |
|---|---|---|
| Ancho desktop | 560px | `lg:w-[560px]` ✅ |
| Ancho mobile | ❌ No diseñado | `h-[90vh] rounded-t-3xl` desde abajo ⚠️ |
| Fondo | `#ffffff` | `bg-white` ✅ |
| Border-left | 3px `#1e293b` | ✅ |
| Shadow | blur:16, offset:(-8,0) | ✅ |

### Header
| Aspecto | Mockup | Código |
|---|---|---|
| Título | "Detalles de la Beca" | ✅ |
| Botón corazón | Border-2, shadow 2×2 | ✅ |
| Botón cerrar (X) | Border-2, shadow 2×2 | ✅ |
| Icon heart | Lucide `heart` | Material Symbols `favorite` ❌ |
| Icon close | Lucide `x` | Material Symbols `close` ❌ |

### Badges (pills)
| Badge | Mockup | Código |
|---|---|---|
| Match | "92% Match" verde `#dcfce7` | "Match Perfecto" si affinity≥80 ❌ **etiqueta diferente** |
| Nivel | "Nacional" azul `#eff6ff` | ✅ (hardcoded "Nacional") |
| Tipo | "Pregrado" rojo `#fef2f2` | ✅ (dinámico según `oportunidad.level`) |

### Cruce de Requisitos
| Aspecto | Mockup | Código |
|---|---|---|
| Estilo | Status cards: bg semántico + border del mismo tono | ✅ |
| Check icon | Lucide `check` (green) | Material Symbols `check_circle` ❌ |
| Hourglass icon | Lucide `hourglass` (gray) | Material Symbols `pending` ❌ |
| X icon | Lucide `x` (red) | Material Symbols `cancel` ❌ |
| Badge "Cumple" | Pill blanco con border del color | ❌ **No existe en código** (solo icono y label) |

**Hallazgo:** El mockup incluye un badge pequeño (e.g. "Cumple", "Pendiente", "No Cumple") dentro de cada status card, como una pill blanca con border del color semántico. El código no tiene ese badge — solo muestra el campo + valor + icono.

### Beneficios
| Aspecto | Mockup | Código |
|---|---|---|
| Grid | Grid de 3 mini-cards por fila | `grid-cols-2 md:grid-cols-3` ✅ |
| Iconos | Lucide: book-open, wallet, laptop | Material Symbols: school, payments, laptop_mac ❌ |
| Color icono | `#3b82f6` (blue-500) | `text-text-primary` (#1e293b) ❌ |
| Shadow | 2×2 | `shadow-[2px_2px_0_#1e293b]` ✅ |

### CTA Footer
| Aspecto | Mockup | Código |
|---|---|---|
| Texto | "Postular Ahora" | ✅ |
| Icono | Lucide `arrow-right` | Material Symbols `arrow_forward` ❌ |
| Borde | 3px `#1e293b` | ✅ |
| Shadow | 4×4 | ✅ |
| Disabled state | ❌ No diseñado | `bg-slate-300` con "Ya Postulaste" |

---

## 12. Estados Vacíos

| Estado | Mockup | Código |
|---|---|---|
| Sin resultados | ❌ No diseñado | ✅ Implementado con 3 variantes |
| Sin guardadas | ❌ No diseñado | ✅ Implementado |
| Sin postuladas | ❌ No diseñado | ✅ Implementado |

**Hallazgo:** El mockup no incluye estados vacíos. El código los implementa.

---

## 13. Skeleton Loading

| Aspecto | Mockup | Código |
|---|---|---|
| Estados de carga | ❌ No diseñado | ✅ 6 tarjetas skeleton animadas |

**Hallazgo:** El mockup no incluye skeleton. El código sí.

---

## 14. Iconos — Resumen General

| Icono | Mockup (Lucide) | Código (Material Symbols) |
|---|---|---|
| Sidebar: Dashboard | `layout-dashboard` | `home` |
| Sidebar: Buscar | `search` | `search` (coincide) |
| Sidebar: Postulaciones | `file-text` | `assignment` |
| Sidebar: Mochila | `briefcase` | `backpack` |
| Sidebar: Asesor IA | `bot` | `smart_toy` |
| Search bar | `search` | `search` |
| Filtros | `list` | `list` |
| Heart | `heart` | `favorite` |
| Close | `x` | `close` |
| Check | `check` | `check` (coincide en checkbox) |
| Check (status) | `check` (green) | `check_circle` (green) |
| Hourglass | `hourglass` | `pending` |
| Cancel | `x` | `cancel` |
| Arrow right | `arrow-right` | `arrow_forward` |
| Chevron down | `chevron-down` | `expand_more` |
| Book | `book-open` | variado según beneficio |
| Wallet | `wallet` | `payments` |
| Laptop | `laptop` | `laptop_mac` |

---

## 15. Resumen de Inconsistencias

### Críticas (afectan la identidad visual)
| # | Inconsistencia | Mockup | Código | Impacto |
|---|---|---|---|---|
| 1 | **Color sidebar** | Azul `#003c90` | Amarillo `#fde047` | 🔴 Máximo |
| 2 | **Sistema iconos** | Lucide (46+ icons) | Material Symbols | 🔴 Alto |
| 3 | **Estilo nav activo** | Amarillo bg + border-3 + shadow 4×4 | Blanco bg + border-2 + shadow 2×2 | 🔴 Alto |
| 4 | **Color checkbox/radio checked** | `#3b82f6` (blue-500) | `#003c90` (brand-blue) | 🔴 Alto |

### Medias (afectan consistencia)
| # | Inconsistencia | Mockup | Código |
|---|---|---|---|
| 5 | **Columnas del grid** | 2 columnas fijas | 1/2/3 columnas responsive |
| 6 | **Acordeones abiertos** | Solo "Tipo de Programa" | Todos abiertos |
| 7 | **Ícono beneficios color** | `#3b82f6` | `text-text-primary` |
| 8 | **Status badge en requisitos** | Pill "Cumple/Pendiente/No Cumple" | ❌ No existe |
| 9 | **Etiqueta match** | "92% Match" | "Match Perfecto" (solo ≥80) |
| 10 | **Border-bottom tab activo** | 3px | 4px |
| 11 | **Logo color** | `#bbf7d0` (verde claro) | "P" en cuadro oscuro |
| 12 | **Nav items** | 5 items, sin "Perfil" | 6 items, con "Perfil" |

### Menores (detalles finos)
| # | Inconsistencia | Mockup | Código |
|---|---|---|---|
| 13 | Underline tabs color | `#cbd5e1` | `border-slate-300` (#d1d5db) |
| 14 | Badge inactivo tabs | `#e2e8f0` | `bg-slate-200` |
| 15 | Drawer shadow | `rgba(30,41,59,0.13)` | `rgba(30,41,59,0.1)` |
| 16 | Padding main | 48/64px | 48/64px md, 24/32px mobile |
| 17 | Item nav altura | 52px fijo | padding dinámico |
| 18 | Search padding | 16px 24px | `pl-12 pr-4 py-4` |
| 19 | Footer usuario | Avatar + nombre + nivel | Avatar + nombre + "Estudiante" + barra perfil |
| 20 | Página inactiva border | `#cbd5e1` | `border-slate-300` |

### No cubiertas por el mockup (código tiene extras)
| Feature | Estado |
|---|---|
| Skeleton loading | ✅ Solo en código |
| Estados vacíos (3 variantes) | ✅ Solo en código |
| Modal de confirmación eliminar postulación | ✅ Solo en código |
| Toast de notificación | ✅ Solo en código |
| Responsive mobile (breakpoints) | ✅ Solo en código |
| Bottom sheet DetailDrawer en móvil | ✅ Solo en código |
| Backdrop blur en drawers | ✅ Solo en código |
