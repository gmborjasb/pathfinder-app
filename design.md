# 🚀 Pathfinder: Master Design System & Architecture Plan

Este documento es la especificación técnica y visual definitiva (La "Biblia" del proyecto) para **Pathfinder**. Detalla la estructura completa del proyecto, la paleta de colores, la tipografía, los componentes UI, las funcionalidades y la arquitectura base. Todo desarrollo futuro debe adherirse estrictamente a estas reglas para mantener una uniformidad impecable.

---

## 1. 🌟 Filosofía de Diseño: Playful EdTech (Neo-Brutalismo Gamificado)

Pathfinder no es un gestor de archivos corporativo aburrido; es el "Inventario" y "Centro de Misiones" del estudiante.
- **Táctil y Físico:** Los elementos deben sentirse reales. Los botones no son solo colores planos, son bloques gruesos que reaccionan.
- **Neo-Brutalismo Suave:** Uso de bordes negros sólidos (`2px` a `3px`), sombras duras (`offset-x`, `offset-y` sin desenfoque) y contrastes altos de color.
- **Gamificación Constante:** El progreso no se muestra como un porcentaje frío, sino como "Puntos de Experiencia (XP)", "Niveles" y "Misiones Completadas".
- **Accesibilidad:** Textos grandes, contrastes masivos y llamadas a la acción inconfundibles.

---

## 2. 🎨 Paleta de Colores (Design Tokens)

La paleta se aleja del "Azul Bootstrap" y adopta colores vibrantes, pasteles energéticos y altos contrastes.

### Colores de Marca (Brand)
*   `--color-brand-blue`: `#003C90` (Azul profundo de Pathfinder. Usado en el Sidebar y fondos masivos).
*   `--color-brand-yellow`: `#fde047` (Amarillo brillante. Usado en el logo, destacables y botones de acción principal).
*   `--color-brand-dark`: `#1e293b` (Slate 800. El "Casi negro" usado para todos los textos, bordes estructurales y sombras duras. NUNCA usar `#000000` puro).
*   `--color-brand-light`: `#f8fafc` (Slate 50. Usado para textos sobre fondos oscuros).

### Colores de Estatus y Tarjetas (Pasteles Neo-Brutalistas)
*   **Neutral / Base:** `#ffffff` (Blanco puro para tarjetas por defecto).
*   **Activo / Selección:** `#a7f3d0` (Verde menta. Usado para destacar el ítem de navegación activo).
*   **Completado / Éxito:** `#dcfce7` (Verde pastel. Para documentos validados o misiones completadas).
*   **Pendiente / Inventario:** `#fef9c3` (Amarillo pastel. Para destacar postulaciones activas o advertencias).
*   **IA / Mensajes:** `#eff6ff` (Azul pastel. Usado para métricas de Motibot o notificaciones secundarias).
*   **Urgente / Error:** `#fee2e2` (Rojo pastel. Para documentos faltantes o rechazos).

### Colores IA "Motibot"
*   `--color-ia-bg`: `#fef08a` (Amarillo intenso para el bloque de IA).
*   `--color-ia-text`: `#1e293b` (Slate 800. Alto contraste sobre amarillo).

---

## 3. ✍️ Tipografía y Jerarquía Visual

Todo el proyecto utiliza la fuente **Plus Jakarta Sans**, una tipografía geométrica, moderna y extremadamente legible.

### Tamaños y Pesos (Tailwind Classes)
*   **Display / Título Masivo (H1):** `text-4xl lg:text-5xl font-[900] tracking-tight text-[#1e293b]` (Usado solo para saludos en el Home o títulos de secciones masivas).
*   **Títulos de Sección (H2):** `text-2xl font-[900] text-[#1e293b]` (Para separar bloques en el Dashboard o el título del Asesor).
*   **Títulos de Tarjeta (H3):** `text-lg lg:text-xl font-[900] text-[#1e293b]` (Nombres de becas, títulos de métricas).
*   **Texto Principal (Body):** `text-base font-[700] text-[#334155]` (El grosor base NUNCA es `400` en este diseño. El texto base debe tener peso, usando `font-medium` o `font-bold` para dar un look chunky).
*   **Texto Secundario (Muted):** `text-sm font-[700] text-[#64748b]` (Descripciones cortas, metadatos, fechas).
*   **Micro / Etiquetas:** `text-xs font-[900] uppercase tracking-wider text-[#0f172a]` (Badges, tags de "Recomendación").

---

## 4. 📐 Sistema de Espaciado, Grid y Bordes

### Sombras Duras (Hard Shadows)
La identidad gráfica depende de estas sombras sin desenfoque (blur: 0).
*   **Tarjetas Grandes (Chunky):** `shadow-[6px_6px_0px_0px_#1e293b]` (Sombra muy desplazada).
*   **Tarjetas Regulares y Botones:** `shadow-[4px_4px_0px_0px_#1e293b]`.
*   **Interacción (Active State):** Al hacer clic (`:active`), la sombra se reduce a `shadow-[0px_0px_0px_0px_#1e293b]` y el elemento se traslada `translate-x-[4px] translate-y-[4px]` para dar el efecto de ser presionado físicamente.

### Bordes Estructurales
*   `border-2` o `border-3` (`strokeWidth: 2` / `3`).
*   Color: `border-[#1e293b]`.
*   Radios (Corner Radius): `rounded-xl` (12px) o `rounded-2xl` (16px). Los bordes completamente cuadrados no se usan; el estilo es grueso pero amigable.

### Fondos de Página vs. Fondos de Tarjeta
*   **Páginas / Paneles principales:** `bg-slate-50` (`#f8fafc`) o el token `bg-bg-base`. Nunca usar `bg-gray-100` u otros grises genéricos.
*   **Tarjetas / Superficies:** `bg-white` (`#ffffff`) puro. Las tarjetas siempre flotan sobre el fondo de página con su sombra dura.
*   **Paneles Laterales (Drawers):** `bg-slate-50` para el FilterDrawer; `bg-white` para el DetailDrawer.

### Layout Global (App Shell)
*   **Contenedor Padre:** `flex h-screen w-full bg-[#f3f4f6]`.
*   **Sidebar:** Ancho fijo `w-[300px] flex-shrink-0 border-r-2 border-[#1e293b] bg-[#003c90]`.
*   **Main Content:** `flex-1 h-full overflow-y-auto p-6 lg:p-10`.
*   **Max Width:** El contenido interior del Main debe estar centrado con un `max-w-7xl` para pantallas ultra anchas.

---

## 5. 🧩 Componentes Core (UI Kit)

La aplicación se construirá a partir de estos componentes atómicos reutilizables:

### 5.1. Sidebar Gamificado (Navegación)
*   **Logo Cartucho:** Un div con `bg-[#fde047] border-2 border-[#1e293b] shadow-[4px_4px_0px_#1e293b] rounded-xl flex items-center gap-3 p-4`.
*   **Nav Item Activo ("Tú estás aquí"):** `bg-[#a7f3d0] border-2 border-[#1e293b] shadow-[4px_4px_0px_#1e293b] text-[#1e293b] rounded-xl font-black`.
*   **Nav Item Inactivo:** `bg-transparent text-[#f8fafc] opacity-80 hover:opacity-100 font-extrabold`.
*   **User Card Inferior:** Un módulo en la parte inferior (`bg-[#1e293b] rounded-2xl p-5 border-2 border-[#0f172a] shadow-[4px_4px_0px_#000000]`) que contiene el avatar del usuario y un botón masivo rojo para "Salir".

### 5.2. Top Bar Global (Cabecera de Jugador)
En todas las pantallas (excepto en el layout de Login), la esquina superior derecha debe renderizar el **Player Header**.
*   **Estructura:** Tarjeta flotante horizontal `bg-white border-2 border-[#1e293b] shadow-[4px_4px_0px_#1e293b] rounded-2xl p-4 flex items-center gap-4`.
*   **Avatar:** Círculo amarillo con texto marrón.
*   **Información:** "Nivel X: Rango" y una pequeña barra de progreso interna (`w-32 h-2 bg-slate-200` con un relleno `bg-emerald-500`).

### 5.3. Misiones Urgentes (Alert Cards)
*   **Uso:** Notificar sobre un documento faltante o fecha límite de postulación.
*   **Estilo:** `bg-red-100 border-2 border-red-700 shadow-[6px_6px_0px_#b91c1c] text-red-900 rounded-2xl p-6 flex justify-between items-center`.
*   **Botón Interno:** Un botón rojo sólido `bg-red-700 text-white` con su propia sombra oscura.

### 5.4. Botones Masivos (Shortcuts)
*   Botones de 100% de ancho (o en grid flex) de gran tamaño (`p-5`).
*   Tienen íconos masivos a la izquierda y el texto de acción.
*   Al pasar el mouse (`hover`), pueden tener una micro-animación (e.g. `hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1e293b]`).

### 5.5. Tarjetas "Chunky" de Becas
*   El card principal para el listado de becas.
*   Fondo blanco, borde de 2px negro, sombra dura offset.
*   Contiene **Píldoras de Tags** (`bg-blue-100 text-blue-800 border border-blue-800 rounded-full text-xs px-3 py-1 font-bold`).
*   Botón "Postular" flotante abajo a la derecha en color amarillo brillante.

### 5.6. Drawers Gamificados (Paneles Laterales)
*   Paneles deslizantes montados sobre `position: fixed`, con alto `z-index` (60) y un backdrop semitransparente (z-index 50).
*   **FilterDrawer (Filtros Avanzados):**
    *   Dimensiones: `w-[400px]`, altura completa de pantalla (`h-screen`).
    *   Fondo: `bg-slate-50`, borde izquierdo: `border-l-3 border-text-primary`.
    *   Cada grupo de filtros es una tarjeta: `border-3 border-text-primary rounded-xl shadow-[4px_4px_0_#1e293b] overflow-hidden`.
    *   Cabecera de cada tarjeta: `bg-text-primary p-4` con texto blanco extrabold y chevron giratorio.
    *   Botón de acción (footer anclado): `bg-brand-yellow border-3 border-text-primary rounded-xl shadow-[4px_4px_0_#1e293b] py-4 w-full font-black`.
*   **DetailDrawer (Detalle de Beca):**
    *   Dimensiones desktop: `w-[560px]`, h-screen. En móvil: `h-[90vh] rounded-t-3xl` desde el pie de pantalla.
    *   Fondo: `bg-white`, borde izquierdo: `border-l-3 border-text-primary`.
    *   Barra de cabecera: `bg-slate-50 border-b-2 border-slate-200`, contiene texto del título y dos botones pequeños (corazón + cierre) juntos a la derecha, ambos con `border-2 shadow-[2px_2px_0_#1e293b]`.
    *   Botón de acción (footer): `bg-brand-yellow border-3 border-text-primary rounded-xl shadow-[4px_4px_0_#1e293b] py-4 w-full` con icono `arrow_forward`.

### 5.7. Inputs Neo-Brutalistas (Checkboxes y Radios)
Nunca se deben usar inputs de formulario nativos como elemento visible. Siempre ocultar el `<input>` con `className="hidden"` y renderizar un `<div>` custom.
*   **Checkbox cuadrado:** `w-[20px] h-[20px] rounded flex items-center justify-center flex-shrink-0`. Cuando seleccionado: `bg-brand-blue border-2 border-brand-blue`. Cuando no: `bg-white border-2 border-slate-300`. Al seleccionarse muestra icono `check` de `material-symbols-outlined` en blanco (`text-[14px] text-white`).
*   **Radio circular:** `w-[20px] h-[20px] rounded-full flex items-center justify-center`. Cuando seleccionado: `border-[6px] border-brand-blue bg-white`. Cuando no: `border-2 border-slate-300 bg-white`. Sin icono interno.

### 5.8. Tarjetas Semáforo (Status Cards)
Pequeñas tarjetas de validación de estado. Reemplazan completamente las tablas de requisitos.
*   **Estructura:** `flex items-center justify-between p-4 rounded-xl border-2`.
*   **Éxito (Cumple):** `bg-[#dcfce7] border-[#15803d]`. Icono `check_circle` color `text-[#15803d]`.
*   **Error (No Cumple):** `bg-[#fee2e2] border-[#b91c1c]`. Icono `cancel` color `text-[#b91c1c]`.
*   **Neutro (Pendiente):** `bg-[#f1f5f9] border-[#334155]`. Icono `pending` color `text-[#334155]`.
*   Cada card muestra el nombre del campo (pequeño, bold, color del semáforo), el valor del perfil (grande, font-black, text-primary), y el ícono de estado a la derecha (en círculo de 24px con borde del mismo color).

---

## 6. 🗺️ Mapa de Vistas y Funcionalidades (Estructura de la App)

La aplicación tiene las siguientes rutas principales bajo `react-router-dom`:

### 6.1. `/` -> Dashboard Gamificado (Centro de Comando)
*   **Objetivo:** Resumen del progreso general del usuario.
*   **Elementos:**
    *   Saludo de bienvenida masivo.
    *   Tarjeta de Misión Urgente (si faltan documentos para una postulación activa).
    *   Fila de Métricas Chunky (Amarillo: Postulaciones activas. Verde: Documentos validados. Azul: Mensajes IA).
    *   Accesos Rápidos Masivos (Explorar, IA, Subir).
    *   Recomendación del día (La beca de mayor afinidad sugerida).

### 6.2. `/oportunidades` -> Buscar Oportunidades (El Catálogo)
*   **Objetivo:** Filtrar y listar becas y cursos disponibles.
*   **Elementos:**
    *   Barra de búsqueda superior (gruesa, blanca, con borde).
    *   Botón de "Filtros Avanzados".
    *   Grid responsivo (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) de Tarjetas Chunky de becas.
    *   Modal de Detalles de Beca (aparece desde un lado o como overlay flotante Neo-brutalista).

### 6.3. `/postulaciones` -> Mis Postulaciones (El Pipeline)
*   **Objetivo:** Seguimiento tipo Kanban/Tracker del estado de aplicación.
*   **Elementos:**
    *   Columna izquierda: Menú de selección (tabs verticales) para elegir a cuál beca estás aplicando actualmente.
    *   Bloque Central Superior: **Nivel de Postulación** (Progreso visual de pasos: Preparación -> Enviado -> Resultados).
    *   Bloque Central Inferior: **Quest Log (Fechas Críticas)**. Listado de hitos y fechas límite estilo "checklist de misiones".
    *   Bloque Derecho: **Misiones (Docs)**. Los documentos específicos requeridos para *esta* beca (Carta de motivación, Ensayo, etc.).
    *   Bloque Motibot: Card amarillo intenso invitándote a "Consultar con IA" cómo mejorar tu ensayo para esta beca en específico.

### 6.4. `/mochila` -> Mochila de Documentos (El Inventario)
*   **Objetivo:** Repositorio central de archivos PDF/JPG.
*   **Elementos:**
    *   Selector maestro superior ("Beca 18", "Documentos Generales") para filtrar qué documentos se requieren.
    *   Barra de "Progreso del Expediente" (ej. "3 de 5 completados" con una barra de progreso gruesa amarilla).
    *   Filtros horizontales: "Identidad", "Académico", "Socioeconómico".
    *   Lista de "Tus Ítems Requeridos":
        *   Archivos **Validados:** Fondo verde menta pastel, check mark oscuro.
        *   Archivos **Faltantes:** Fondo amarillo pastel, botón azul "Subir Archivo".
    *   Bandeja de Entrada General abajo.

### 6.5. `/asesoria` -> Asesor IA (Motibot Chat)
*   **Objetivo:** Un espacio de chat inmersivo con el asistente de IA entrenado en becas.
*   **Elementos:**
    *   Sidebar secundario izquierdo: Historial de chats y configuración del "Contexto Activo" (e.g., IA configurada para responder sobre "Beca 18").
    *   Ventana principal: Burbujas de chat gruesas. Los mensajes de la IA tienen fondo blanco, borde negro, sombra. Los mensajes del usuario tienen fondo Azul Marino (`#003C90`), sin borde negro, con texto blanco.
    *   Input inferior: Barra masiva para escribir, con pastillas de "Prompts predefinidos" encima.

---

## 7. ⚙️ Reglas de Implementación en Código (Arquitectura Técnica)

### 7.1. Tailwind v4 y `@theme`
Todo este sistema se implementará sin ensuciar el HTML con colores Hex. En `src/index.css`:
```css
@theme {
  --color-brand-blue: #003c90;
  --color-brand-yellow: #fde047;
  --color-brand-dark: #1e293b;
  --color-brand-light: #f8fafc;
  
  --color-status-success: #dcfce7;
  --color-status-warning: #fef9c3;
  --color-status-error: #fee2e2;

  --shadow-chunky: 6px 6px 0px 0px #1e293b;
  --shadow-chunky-sm: 4px 4px 0px 0px #1e293b;
}
```

### 7.2. Componentes Funcionales Puros (`.tsx`)
Debemos crear componentes base en `src/components/ui/` para evitar reescribir las clases Neo-brutalistas 100 veces:
*   `<CardChunky>`: Contenedor con `bg-white border-2 border-brand-dark shadow-chunky-sm rounded-2xl p-6`.
*   `<ButtonChunky>`: Botón interactivo con el estado `:active`.
*   `<Badge>`: Pastilla de etiquetas.

### 7.3. Integración con Supabase
El frontend debe consumir y mutar datos del backend existente:
*   Autenticación gestionada en el `AuthContext`. Todo el `MainLayout` (Dashboard, Explorar, etc.) está envuelto en rutas protegidas.
*   Archivos (Mochila) se subirán usando `supabase.storage.from('documents')`.
*   El Chatbot IA consultará las "RPCs" o funciones Edge para obtener la respuesta.

### 7.4. Rutas y Layout
La aplicación usará un Layout Maestro (`MainLayout.tsx`) que renderiza:
1.  El `<Sidebar>` siempre fijo a la izquierda.
2.  Un contenedor `<main>` que contiene el `<Outlet />` de `react-router-dom`.
3.  El `<TopBar>` (Player Header) posicionado en modo sticky o fijo en la parte superior del `<main>`.

---

## 8. 🏁 Lista de Verificación Final (Unificación)

Antes de cualquier pull request o finalización de pantalla, la IA o el desarrollador debe verificar:
- [ ] ¿Los botones tienen borde negro grueso y sombra offset sin blur?
- [ ] ¿El texto es legible, oscuro (`#1e293b`) y de familia `Plus Jakarta Sans` en peso Bold/Extrabold?
- [ ] ¿El Sidebar es el diseño gamificado amarillo/verde y resalta la pantalla correcta?
- [ ] ¿Aparece el "Player Header" en la esquina superior derecha?
- [ ] ¿No se están usando colores Bootstrap genéricos (ej. azul o rojo estándar sin contexto táctil)?
- [ ] ¿Se adapta bien a Mobile usando `flex-col` y quitando el Sidebar a favor de un Bottom Nav o Hamburger menu?

Esta estructura asegura que **Pathfinder** sea el producto digital de gestión educativa más hermoso, dinámico y robusto del mercado.
