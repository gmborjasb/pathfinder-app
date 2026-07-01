# Plan: Arreglar bugs reales de ScholarshipCard y FilterDrawer

## Contexto

El usuario compartió capturas reales de la app corriendo (no simuladas). Al revisarlas contra el código actual encontré **bugs concretos de layout y estilos faltantes**, no una simple falta de "sensación Neo-Brutalista":

1. En la tarjeta de beca "Beca Comunidad Nativa", el título y la descripción se **pisan/superponen visualmente** — texto cortado a mitad de palabra ("promueve" cortado), líneas encimadas.
2. El badge "89% Match" no tiene ningún borde, se ve como una píldora plana suave en medio de una tarjeta con bordes negros gruesos por todos lados.
3. Los checkboxes de "Tipo de Programa" / "Gestión" / "Destino" en el drawer de Filtros son casi invisibles (borde gris clarísimo) justo debajo de cabeceras de acordeón en negro sólido.

## Hallazgos (evidencia en código)

**1. `ScholarshipCard.tsx` — superposición de texto (bug de layout, no de estilo)**
- La tarjeta es `h-[250px]` fijo + `overflow-hidden` (línea ~50).
- El bloque de íconos "Pregrado / cobertura / destino" (línea ~87) usa `flex-wrap gap-x-4 gap-y-1` sin truncar el texto de cobertura. Cuando el texto de cobertura es largo (ej. "100% Integral (Estudios y residencia)"), ocupa una fila completa por sí solo y empuja a "Lima" a una tercera fila — el bloque de íconos termina siendo mucho más alto de lo previsto.
- El único contenedor flexible es el de título+descripción (`flex-1 min-h-0 justify-center`, línea ~77). Cuando el resto del contenido (sponsor+badge, íconos de 3 filas, footer) ya casi llena los 250px, este bloque se comprime a casi cero, pero como `title`/`sobre` usan `line-clamp-2` (que sí recorta cada uno individualmente) el conjunto centrado igual desborda verticalmente fuera de su caja — y como el `overflow-hidden` está solo en la tarjeta exterior, el texto que se sale de esa cajita centrada termina pintándose encima de la fila de íconos.
- **Fix**: cambiar `h-[250px]` por `min-h-[250px]` (deja crecer la tarjeta si el contenido lo necesita, en vez de forzar un recorte que causa la superposición) y agregar `truncate` + `max-w` al texto de cobertura para que no fuerce un salto de línea completo por sí solo.

**2. `ScholarshipCard.tsx` — badge de afinidad sin borde**
- `getAffinityColor()` (línea ~18) devuelve solo `bg-success-bg text-success-text` / `bg-info-bg text-info-text` / `bg-warning-bg text-warning-text` — ninguna variante incluye `border`.
- Todo lo demás en la tarjeta (borde exterior, botón Postular) usa borde negro/oscuro grueso. Este es el único elemento "flotando" sin borde.
- **Fix**: agregar `border border-success-text` / `border border-info-text` / `border border-warning-text` a cada variante (mismo patrón que ya usan los badges de `DetailDrawer.tsx`, que sí llevan borde).

**3. `FilterDrawer.tsx` — checkboxes/radios sin marcar casi invisibles**
- Estado sin marcar: `bg-white border-2 border-slate-300` (checkbox, líneas ~78, ~160, ~201) y `border-2 border-slate-300` (radio, línea ~124).
- `slate-300` es un gris muy claro; contra un fondo blanco y justo debajo de las cabeceras de acordeón en `bg-text-primary` (negro sólido), el contraste es tan bajo que el control casi no se percibe — rompe la sensación "chunky" consistente del resto del panel.
- **Fix**: cambiar `border-slate-300` → `border-text-primary` (borde negro de 2px, igual de oscuro que el resto de bordes del panel) en los 4 controles (3 checkboxes + 1 radio) del archivo.

**4. Íconos "delgados"/genéricos en toda la app (hallazgo nuevo)**
- `index.html:13` carga Material Symbols Outlined con el eje de peso variable completo: `wght,FILL@100..700,0..1`.
- Pero **no existe ninguna regla base** en `index.css` que fije un peso por defecto para `.material-symbols-outlined` — cada ícono renderiza al peso 400 (delgado/regular) de la fuente, mientras que todo el texto de la app es `font-black` (900). Ese contraste de grosor entre íconos delgados y texto ultra-pesado es exactamente lo que se percibe como "no es del estilo Neo-Brutalista".
- **Fix (un solo punto, no hace falta tocar cada ícono uno por uno)**: agregar en `index.css` una regla base que suba el peso por defecto de todos los `.material-symbols-outlined` a algo más chunky (ej. 500-600), consistente con el resto de la tipografía pesada de la app.

## Archivos a modificar
- `src/components/catalogo/ScholarshipCard.tsx` (altura de tarjeta, truncado de cobertura, borde del badge de afinidad)
- `src/components/catalogo/FilterDrawer.tsx` (color de borde de checkboxes/radio sin marcar)
- `src/index.css` (peso base de íconos Material Symbols)

## Verificación
1. `npx tsc -b` y `npx eslint` sobre ambos archivos.
2. Levantar `npm run dev`, abrir `/buscar` en pestaña nueva, y confirmar en una tarjeta con descripción/cobertura larga que el título y la descripción ya no se superponen ni se cortan a mitad de palabra.
3. Confirmar visualmente que el badge de afinidad ahora tiene un borde visible del mismo color que su texto.
4. Abrir el drawer de Filtros y confirmar que los checkboxes/radio sin marcar ahora se ven con borde negro definido, igual de "chunky" que las cabeceras de acordeón.
