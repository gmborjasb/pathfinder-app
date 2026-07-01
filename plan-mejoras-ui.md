# Plan de Mejoras UI — Sidebar + Buscar Oportunidades

Basado en `analisis-ui.md`, `analisis-buscar-oportunidades.md` y una verificación directa del código actual (`src/components/Sidebar.tsx`, `src/pages/BuscarOportunidades.tsx`, `src/components/catalogo/ScholarshipCard.tsx`).

Este documento **no aplica cambios todavía** — es el plan a aprobar antes de tocar código.

---

## 1. Causa raíz del "ruido visual": el Sidebar es amarillo

**Evidencia:** `src/components/Sidebar.tsx:180`
```
bg-brand-yellow border-r-3 border-text-primary
```
El fondo completo del sidebar (260px de ancho, en las 6 pantallas de la app) es amarillo `#fde047`. Además el footer (`:294`) y el hover de items inactivos (`:176` `hover:bg-yellow-300`) también son amarillos.

**Los 7 mockups de Pencil (sin excepción) muestran el sidebar en azul `#003c90`**, con el amarillo reservado solo como acento puntual (ítem de nav activo, botones CTA). Actualmente en el código es al revés: el amarillo es el color dominante de toda la pantalla (ocupa una franja vertical completa en cada vista) y compite constantemente con los pasteles verdes/azules/rojos de las tarjetas de contenido — eso es exactamente el "ruido visual" que describes.

### Cambio propuesto
- `Sidebar.tsx:180` → `bg-brand-blue` (azul marino) en vez de `bg-brand-yellow`.
- `Sidebar.tsx:294` (footer) → `bg-brand-blue` también.
- Textos e íconos inactivos → pasar a blanco/blanco-opacidad (`text-white/70`) en vez de `text-text-primary/70` (que asume fondo claro).
- Ítem de nav **activo** → mantiener el amarillo aquí (`bg-brand-yellow border-3 shadow-[4px_4px_0_#1e293b]`), igual que en los mockups — el amarillo debe ser la excepción que resalta, no la norma.
- Hover de ítems inactivos → `hover:bg-white/10` en vez de `hover:bg-yellow-300`.
- Revisar contraste: textos/iconos que hoy asumen fondo amarillo (`text-text-primary`) deben pasar a blanco donde el fondo sea azul.

**Impacto esperado:** reduce automáticamente el "ruido" en las 6 pantallas de la app de una sola vez, porque el sidebar aparece en todas.

---

## 2. Buscar Oportunidades: las tarjetas están "muy juntas" y desperdician espacio

**Evidencia:** `src/components/catalogo/ScholarshipCard.tsx:40`
```
w-[335px] h-[320px] ... p-5 flex flex-col mx-auto
```
La tarjeta tiene **ancho y alto fijos en píxeles**, centrada con `mx-auto` dentro de una celda de grid (`src/pages/BuscarOportunidades.tsx:878`: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`). Esto causa dos problemas:

1. **Espaciado desigual**: en pantallas anchas, cada celda del grid mide bastante más de 335px, así que el `mx-auto` dentro de cada celda crea espacios en blanco irregulares entre tarjetas (no es un `gap` uniforme controlado, es "sobra" de cada columna) — se ve como si las cards flotaran juntas en el centro con vacíos alrededor.
2. **Alto fijo de 320px** obliga a cada card a esa altura exacta sin importar cuánto texto tenga (usa `flex-grow` en el bloque de descripción para rellenar), lo que generalmente es más alto de lo necesario — 2 filas de 6 cards (320px × 2 + gap) ocupan casi 660px de puro grid, sin contar título/buscador/tabs arriba.

### Cambio propuesto
- Quitar `w-[335px]` y `mx-auto` de `ScholarshipCard`; usar `w-full` para que la tarjeta llene su celda de grid (el `gap-6` del contenedor ya controla el espaciado real y uniforme).
- Cambiar `h-[320px]` fijo por `h-full` (o quitarlo) dejando que el contenido defina el alto, con un `min-h-[280px]` opcional para evitar cards demasiado bajitas — así cada fila ocupa solo lo que necesita.
- Con esto, 6 cards en `grid-cols-3` deberían ocupar ~2 filas más compactas, liberando espacio vertical.

---

## 3. El paginador queda oculto por exceso de espacio vertical

**Evidencia:** combinación de:
- `BuscarOportunidades.tsx:689`: contenedor principal `gap-8` (32px) entre título, buscador+tabs, grid y paginador.
- `BuscarOportunidades.tsx:687`: `px-6 py-8 md:px-16 md:py-12` de padding de página.
- El alto fijo de las cards (punto 2) que infla el grid más de lo necesario.

La suma de: header (título ~40px) + buscador/tabs (~120px) + grid de 2 filas de 320px+gap (~660px) + los `gap-8` entre cada bloque (32px × 3 = 96px) + padding de página (48-96px arriba/abajo) fácilmente supera los 900-1000px de alto, empujando el paginador fuera del viewport en laptops estándar (~800-900px de alto útil).

### Cambio propuesto
- Reducir el `gap-8` del contenedor principal a `gap-6` (menos aire entre bloques, sin perder la respiración necesaria).
- Con el fix del punto 2 (cards de alto dinámico en vez de 320px fijos), el grid debería bajar su altura total significativamente.
- Opcional: reducir el padding vertical de página en desktop de `md:py-12` a `md:py-8`.

---

## 4. Demasiados colores no relacionados compitiendo entre sí

Además del amarillo del sidebar (punto 1), cada `ScholarshipCard` combina simultáneamente:
- Badge de afinidad: verde/azul/gris pastel (`getAffinityColor`, líneas 25-29)
- Tag de nivel: rojo (`bg-red-50 border-red-500`, línea 105)
- Tag de requisito: azul (`bg-blue-50 border-blue-500`, línea 110)
- Ícono de deadline: rojo (`text-red-600`, línea 128)
- Botón "Postular": amarillo (línea 134)
- Ícono de guardar (❤): rojo si está guardado (línea 67)

Son **6 colores distintos en una sola tarjeta de 335×320px**, sin relación semántica entre ellos (el rojo se usa tanto para "nivel de programa" como para "urgencia de fecha" como para "favorito" — tres significados distintos con el mismo color).

### Cambio propuesto
- Reservar el rojo **solo** para urgencia/alertas reales (deadline próximo, documento rechazado) — no para etiquetas neutras como "nivel de programa".
- Cambiar el tag de "nivel" (`Pregrado`/`Maestría`/etc.) de rojo a un tono neutro (slate/gris) ya que no es una alerta.
- Mantener azul solo para el tag de "requisito" (informativo) y verde/azul/gris solo para afinidad (ya tiene lógica semántica clara).
- Resultado: cada color en la tarjeta pasa a tener un significado único y consistente, reduciendo la sensación de "ruido".

---

## Orden de ejecución sugerido

1. **Sidebar → azul** (punto 1) — el cambio de mayor impacto visual, afecta toda la app de una vez.
2. **Cards de ancho/alto dinámico** (punto 2) — corrige el espaciado y libera espacio vertical.
3. **Reducir gaps de página** (punto 3) — hace visible el paginador sin scroll excesivo.
4. **Simplificar semántica de color en la card** (punto 4) — pulido final, menor impacto estructural pero resuelve el "ruido" percibido.

¿Apruebas este plan tal cual, o quieres que ajuste el alcance de algún punto antes de implementarlo?
