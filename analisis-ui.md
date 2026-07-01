# Análisis UI — Pathfinder (Mockups .pen vs Codebase)

Basado en los 7 mockups del archivo pencil-welcome.pen.

---

## 1. Dashboard Gamificado (`EUZq5`)

### Layout
- **Sidebar fijo** de 300px, azul `#003C90`, borde derecho `#1e293b` 2px
- **Main content** flexible con padding 40px, fondo `#F3F4F6`
- La cabecera tiene saludo + subtítulo en columna vertical

### Componentes analizados
| Elemento | Diseño (.pen) | Observación |
|---|---|---|
| Logo Pathfinder | Frame amarillo `#fde047` con icono rocket + texto | Coincide con `.card-chunky-dark` invertido |
| Nav activo | Verde `#a7f3d0` con shadow, border-3 | Ícono + label en fila |
| Nav inactivo | Transparente, texto blanco opaco `#f8fafc` | Mismo patrón que el código |
| User card | Frame `#1e293b` border `#0f172a`, shadow `#000000` | Avatar amarillo + nombre + nivel + botón Salir rojo |
| Misión Urgente | Rojo `#fee2e2` border `#b91c1c`, shadow `#b91c1c` 6×6 | Botón "Resolver Ahora" rojo oscuro |
| 3 métricas | Cards 330px, colores pastel (yellow/green/blue) | Ícono en cuadrado blanco + número grande + label |
| Accesos Rápidos | 3 cards: dark (Explorar), white (Motibot), white (Subir) | Todos con shadow 4×4 |
| Recomendación | Teal `#f0fdfa` border `#0f766e`, shadow 6×6 | Badge + título + descripción + botón |

### Hallazgos
- **Layout general coincide** con `MainLayout.tsx` salvo que el diseño usa 300px de sidebar vs 260px en código
- Las métricas del diseño incluyen íconos **Lucide** (target, briefcase, message-square) → el código usa **Material Symbols Outlined**
- Las tarjetas de acceso rápido usan el mismo patrón que los botones masivos de `design.md`

---

## 2. Filtros Avanzados (`DxGUm`)

### Layout
- Drawer de 400px, ancho completo, fondo `#f8fafc`, border-left 3px `#1e293b`
- Shadow exterior izquierdo: `blur: 16, offset: (-8, 0), color: #1e293b22`

### Componentes analizados
| Elemento | Diseño (.pen) | Observación |
|---|---|---|
| Header | "Filtros Avanzados" + "Limpiar" link | Separador inferior `strokeWidth: bottom 2` |
| Grupo: Tipo de Programa | Checkboxes: 4 opciones, 1 seleccionada (azul `#3b82f6`) | Checkbox checked: blue bg + blue border |
| Grupo: Financiamiento | Radios: 3 opciones, "Todos" seleccionado (borde 6px azul) | Radio selected: `strokeWidth: 6, stroke: #3b82f6` |
| Grupo: Gestión | Checkboxes: 2 opciones, "Pública" seleccionada | Mismo patrón |
| Grupo: Destino | Checkboxes: 3 opciones, "Lima" seleccionada | Mismo patrón |
| Botón Aplicar | Amarillo `#fde047` border-3 `#1e293b`, shadow 4×4 | Footer pegado al fondo |
| Acordeón | Header oscuro `#1e293b` con texto blanco + chevron | Chevron rota 180° al abrir |

### Hallazgos
- **Checkboxes**: El diseño usa `#3b82f6` (azul brillante) en lugar de `--color-brand-blue: #003c90` para el estado checked. Diferencia de tono.
- **Radios**: Usa `strokeWidth: 6` para el anillo seleccionado — el código usa `border-[6px]`. Coincide conceptualmente.
- El diseño usa **Lucide** (icons: chevron-down) → código usa Material Symbols
- El grupo "Tipo de Programa" está expandido, los demás colapsados. No hay indicador visual de colapso en el diseño.

---

## 3. Detalles de Beca (`G32Ft`)

### Layout
- Drawer de 560px, fondo blanco, border-left 3px `#1e293b`
- Shadow exterior izquierdo: `blur: 16, offset: (-8, 0), color: #1e293b22`

### Componentes analizados
| Elemento | Diseño (.pen) | Observación |
|---|---|---|
| Header | "Detalles de la Beca" + heart icon + close X | Ambos botones con shadow 2×2, border 2 |
| Badges | 3 pills: Match 92% (green), Nacional (blue), Pregrado (red) | Match con `badge-status-*` clases |
| Info | Título 24px 900 + sponsor 14px 700 | Separador gris |
| Sobre esta Beca | Párrafo descriptivo 14px 700 | Texto `#475569` |
| Cruce de Requisitos | 5 status cards: 3 green, 1 gray, 1 red | Ícono + label + badge "Cumple/Pendiente/No Cumple" |
| Beneficios | Grid 3 mini-cards con icon + label | Shadow 2×2, border 2 |
| CTA | "Postular Ahora" amarillo con arrow | Footer pegado al fondo |

### Hallazgos
- Las **status cards** (semáforo) tienen: ícono Lucide check/x/hourglass + texto requisito + badge de estado
- Los badges de estado ("Cumple") tienen bg blanco con border del color semántico
- Las mini-cards de beneficios tienen **Lucide icons** (book-open, wallet, laptop) — todos con `#3b82f6` (no brand-blue)
- El CTA incluye icono arrow-right → código usaría `arrow_forward`

---

## 4. Mis Postulaciones (`jW0X3`)

### Layout
- **4 columnas**: Sidebar 260px + Lista (300px) + Pipeline (520px) + Timeline (260px)
- Fondo `#f8fafc`, gap 32px entre secciones

### Componentes analizados
| Elemento | Diseño (.pen) | Observación |
|---|---|---|
| Sidebar | Nav items azul `#003c90`, activo "Mis Postulaciones" en amarillo | Misma estructura que Dashboard |
| Filter pills | "Activas (2)" activo (blanco con shadow) / "En curso (1)" inactivo | Toggle pills estilo segmented control |
| Card activa | Beca 18: azul claro `#dbeafe`, shadow 6×6, badge "ACTIVA" + "89% Match" | Border-3 negro |
| Card inactiva | Beca Fulbright: blanca, border gris `#94a3b8`, opaca | Sin shadow |
| Pipeline | 4 pasos (Preparación→Enviada→Evaluación→Resultados) con círculos + barra | Círculo activo amarillo 44px, completados verde, pendientes blanco |
| Document Missions | 3 cards con colores semáforo + check/hora/x | "1 de 3 documentos listos" + barra de progreso |
| Timeline | 3 hitos con nodos circulares + fechas + descripción | Nodo activo amarillo, pendientes gris |
| Alarma | "Faltan 5 días para entrevista" — fondo rojo `#fee2e2` | Alerta contextual |

### Hallazgos
- El **pipeline visual** usa posiciones absolutas (`layoutPosition: absolute`) para posicionar los círculos — frágil al redimensionar
- Los **document missions** usan 3 cards con colores pastel y shadow, mismo patrón que `DetailDrawer` status cards
- El diseño usa "Preparación → Enviada → Evaluación → Resultados" — el código en Dashboard usa "Preparación → Enviada → Evaluación → Resultados" (coincide)
- **Lucide icons** (file-text, briefcase, layout-dashboard) en sidebar vs Material Symbols en código

---

## 5. Mochila / Documentos (`YfVdg`)

### Layout
- 1440×1100, sidebar 260px + main content 1140px
- Main tiene: columna izquierda (340px) + columna derecha (640px) + capacitaciones abajo

### Componentes analizados
| Elemento | Diseño (.pen) | Observación |
|---|---|---|
| Header | "Mochila" 32px 900 + selector de contexto | Coincide con diseño actual |
| Progreso | Card con selector + indicador de progreso | Shadow 4×4 |
| Alerta DNI | Naranja `#ffedd5` border `#ea580c`, shadow 4×4 | "DNI Frontal fue rechazado. Actualízalo." + botón |
| Categorías | Pills: Identidad (activo), Académico, Socioeconómico | Segmented control tipo píldora |
| Documentos | 2 columnas con items: check verde + hourglass ámbar + X rojo | Cada item con ícono + label |
| Drop zone | Área punteada `#cbd5e1` con icono + texto | "⛁ Arrástralo aquí" |
| Capacitaciones | Tabs Disponibles/Obtenidas + 3 cards curso | Card: badge azul + título + duración + botón Iniciar |

### Hallazgos
- Los **documentos** en columna izquierda/derecha no están en el código actual (usa tabla)
- La **drop zone** es conceptual — el código actual tiene modal de subida
- Las tarjetas de **capacitaciones** tienen badge `#dbeafe` con texto azul oscuro
- El diseño usa Naranja (`#ffedd5`, `#ea580c`) para warnings — el código usa `#fee2e2` (rojo pastel) para errores
- **Layout asimétrico** (340px + 640px) es intencional pero no está implementado en el código actual

---

## 6. Asesor IA / Motibot (`HwBin`)

### Layout
- 1440×817, **4 columnas**: Sidebar (260px) + Chats (240px) + Chat Main (660px) + Info (280px)
- Context bar amarillo en la parte superior del chat

### Componentes analizados
| Elemento | Diseño (.pen) | Observación |
|---|---|---|
| Sidebar | Nav items, activo "Asesor IA" en amarillo | Misma estructura |
| Chat list | "Conversaciones" + online badge + "+ Nueva Misión" btn | Lista con items: icon + título + fecha |
| Chat item activo | Fondo azul `#eff6ff`, borde izquierdo azul 4px | Icon pen + "Ensayo Beca 18" + "Hace 2h" |
| Welcome card | Avatar "M" + "¡Hola Alex! ¿En qué misión trabajamos hoy?" | Shadow 4×4, border 2 |
| Mensaje IA | Blanco, shadow 4×4, border-3 | Texto 14px 700, interlineado |
| Mensaje usuario | Azul `#003c90`, shadow 4×4, texto blanco | Posicionado absolute a la derecha |
| Context bar | "🎯 Contexto: Beca 18 · 22 días para cierre · 3 docs pendientes" | Fondo amarillo `#fde047`, texto bold |
| Quick actions | 3 pills: Revisar carta, Entrevista, Requisitos | Shadow 2×2, border 2 |
| Input | Placeholder + paperclip + send button | Border-3, shadow 4×4 |
| Right panel | "Misión Activa" + "Estado del Expediente" + "Herramientas de Sesión" | 3 secciones apiladas |

### Hallazgos
- El diseño tiene **layout de 4 columnas** — el código actual usa una sola columna con sidebar secundario
- El **mensaje del usuario** está posicionado con `layoutPosition: absolute` (x:260, y:360) — frágil
- Las **quick actions** usan `#cbd5e1` (slate-300) como color de border y shadow
- El diseño incluye **3 herramientas de sesión**: Exportar, Copiar, Guardar — no implementadas en el código actual
- **Disclaimer** presente: "La IA puede cometer errores..." — también en el código

---

## 7. Buscar Oportunidades (`xr4IL`)

### Layout
- 1440×1066, sidebar 260px + main 1180px
- Main tiene: título + search/filtros + tabs + grid (2 cols) + paginación

### Componentes analizados
| Elemento | Diseño (.pen) | Observación |
|---|---|---|
| Search bar | Input 400px con icono search + placeholder | Border-3, shadow 4×4 |
| Filtros button | "Filtros Avanzados" + icon + badge count | Mismo que FilterDrawer trigger |
| Tabs | Explorar (activo, border-bottom 3px), Guardadas, Postuladas | Badge contador en cada tab |
| Scholarship cards | 335×320px, border-3, shadow 4×4 | 2 columnas, 6 cards visibles |
| Paginación | "← Anterior" + números + "Siguiente →" | Pág 1 activa (fondo negro) |

### Hallazgos
- Las **scholarship cards** tienen estructura consistente: header (badge + heart) → sponsor → título → tags → fecha → divider → botón Postular
- Los **tabs** con border-bottom 3px en el activo — el código usa `border-b-4`
- La **paginación** tiene botones con shadow 2×2 — el código actual puede no tener paginación implementada
- El diseño usa **Lucide icons** (search, list, heart) vs Material Symbols en código

---

## 8. Discrepancias Críticas Diseño ↔ Código

### 8.1 Sistema de Iconos
| Aspecto | Diseño (.pen) | Código | Impacto |
|---|---|---|---|
| Librería | **Lucide** (un/icons) | **Material Symbols Outlined** | Diferencia total — 69 instancias en 18 archivos vs ~100+ en diseño |
| Íconos comunes | search, home, file-text, briefcase, bot, heart | search, home, description, work, smart_toy, favorite | Nombres diferentes |
| Íconos sidebar | layout-dashboard → Dashboard | grid_view → Dashboard | Mapping distinto |

### 8.2 Tokens de Color
| Token | Diseño | Código (`index.css` `@theme`) | Diferencia |
|---|---|---|---|
| brand-blue | `#003c90` | `#003c90` | ✅ Igual |
| brand-yellow | `#fde047` | `#fde047` | ✅ Igual |
| brand-dark | `#1e293b` | `--color-text-primary: #1e293b` | ✅ Igual |
| Checkbox checked | `#3b82f6` (blue-500) | `--color-brand-blue: #003c90` | ❌ Diferente |
| Error bg | `#fee2e2` | `--color-danger-bg: #fee2e2` | ✅ Igual |
| Warning bg | `#fef9c3` | `--color-warning-bg: #fef08a` | ⚠️ Leve diferencia |
| Success bg | `#dcfce7` | `--color-success-bg: #dcfce7` | ✅ Igual |
| Fondo página | `#f8fafc` (slate-50) | `--color-bg-base: #f8fafc` | ✅ Igual |

### 8.3 Sidebar Width
| Aspecto | Diseño | Código |
|---|---|---|
| Ancho sidebar | 300px | `lg:ml-[260px]` (260px, medido en `Sidebar.tsx`) |
| Padding lateral | 32px | variable |
| Layout | `justifyContent: space_between` + `layout: vertical` | Flex column con spacing |

### 8.4 Layout Differences
| Screen | Diseño | Código actual |
|---|---|---|
| Postulaciones | 4 columnas (sidebar + lista + pipeline + timeline) | CSS Grid 3 columnas |
| Asesor | 4 columnas (sidebar + chats + chat + info) | Una columna con sidebar secundario |
| Mochila | 2 columnas asimétricas (340+640) | Layout diferente (con tabla) |
| Buscar | 2 columnas de cards (335px c/u) | Grid responsivo (1/2/3 cols) |

### 8.5 Sombras y Bordes
| Elemento | Diseño | Código |
|---|---|---|
| Shadow estándar | `offset: (4,4), blur: 0, color: #1e293b` | `shadow-[4px_4px_0px_0px_#1e293b]` ✅ |
| Shadow grande | `offset: (6,6)` | `shadow-[6px_6px_0px_0px_#1e293b]` ✅ |
| Shadow chica | `offset: (2,2)` | `shadow-[2px_2px_0px_0px_#1e293b]` ✅ |
| Drawer shadow | `blur: 16, offset: (-8, 0)` | `box-shadow: -8px 0px 16px rgba(...)` en `.drawer-chunky` ✅ |
| Border checkbox checked | `#3b82f6` | `border-brand-blue` (#003c90) ❌ |

---

## 9. Oportunidades de Mejora

### Prioridad Alta
1. **Unificar sistema de iconos**: El diseño usa Lucide, el código Material Symbols. Decidir uno y migrar.
2. **Checkbox checked color**: Diseño usa `#3b82f6` (blue-500), código usa `#003c90` (brand-blue). Elegir uno.
3. **Sidebar width**: 300px en diseño vs 260px en código. Ajustar para coincidir.

### Prioridad Media
4. **Warning color**: Diseño usa `#fef9c3`, código usa `#fef08a`. Diferencia sutil pero presente.
5. **Layout Postulaciones**: Diseño de 4 columnas vs 3 columnas en código. Evaluar si el diseño más fragmentado mejora UX.
6. **Layout Asesor**: Diseño de 4 columnas vs código actual. El diseño separa chat list + chat + info panel.
7. **Postulation card badge**: "ACTIVA" + "% Match" ambos en la misma fila del header — implementación actual puede diferir.

### Prioridad Baja
8. **Pipeline absoluto**: Los círculos usan posiciones absolutas en el diseño — frágil. El código debería usar flexbox.
9. **Card heights fijas**: Scholarship cards tienen 320px fijos en diseño — mejor usar altura dinámica.
10. **Dark mode**: Hay variables de tema definidas (Light/Dark) pero ningún mockup usa dark mode. Potencial futuro.
11. **Drop zone**: Diseño conceptual de área de arrastrar archivos — no implementada en el código actual (usa modal).

---

## 10. Resumen de Patrones Consolidados

| Patrón | Especificación |
|---|---|
| Sidebar | 260–300px, bg `#003c90`, nav items con gap 12px |
| Nav activo | bg `#fde047`, border-3 `#1e293b`, shadow 4×4 |
| Nav inactivo | bg transparent, texto `#f8fafc` opacity, hover: opacity-100 |
| Card chunky | bg white, border-3 `#1e293b`, shadow 4×4, rounded-xl |
| Status card | bg pastel semántico, border del mismo tono ±2, shadow 4×4 |
| Badge pill | rounded-full, px-3 py-1, font-black, border 1px del color |
| Drawer | 400px (filtros) / 560px (detalle), shadow izquierdo, border-left 3px |
| CTA button | bg `#fde047`, border-3 `#1e293b`, shadow 4×4, font-black |
| Input search | bg white, border-3 `#1e293b`, shadow 4×4, rounded-xl |
| Tab activo | border-bottom 3–4px `#1e293b`, font-black |
| Pipeline step | Círculo 32–44px, border-3, completed=green, active=yellow, pending=white |
