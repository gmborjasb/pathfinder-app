# Funcionalidades de Pathfinder

Plataforma web para centralizar, rastrear y optimizar postulaciones a becas y oportunidades académicas en Perú.
Stack: React 19 + TypeScript 6 + Vite 8 + Tailwind v4 + Supabase.

---

## 1. Autenticación (`/login`)

| Funcionalidad | Detalle |
|---|---|
| Inicio de sesión email/contraseña | `supabase.auth.signInWithPassword` |
| Registro de nueva cuenta | `supabase.auth.signUp` con nombre, email, contraseña; envía email de confirmación si está habilitado |
| Google OAuth | `supabase.auth.signInWithOAuth` con provider `google`, redirect a `/dashboard` |
| Modo simulado (onboarding dev) | Si `VITE_SUPABASE_URL` contiene "placeholder", usa `setTimeout` simulando login exitoso |
| Recuperación de contraseña | Botón "¿Olvidaste tu contraseña?" (UI presente, lógica no implementada) |
| Protección de rutas | `ProtectedRoute` en `App.tsx` — redirige a `/login` si `useAuth().user` es null |
| Persistencia de sesión | Supabase maneja la sesión vía cookies/localStorage; `AuthContext` escucha `onAuthStateChange` |
| Perfil de usuario | Carga automática desde tabla `usuarios` al autenticarse; expone `user`, `session`, `profile`, `refreshProfile` |

## 2. Dashboard / Panel Principal (`/dashboard`)

| Funcionalidad | Detalle |
|---|---|
| Saludo personalizado | Muestra `profile.nombres` (primer nombre); fallback "Camila" |
| Selector de postulación activa | Dropdown que lista todas las `postulaciones` del usuario con su beca asociada; persiste selección en estado local |
| Pipeline visual (4 pasos) | Preparación → Enviada → Evaluación → Resultados; barra de progreso horizontal con círculos; muestra % completado y paso actual |
| Tarjeta oscura de postulación | Fondo `#0F2554` con stats: afinidad %, documentos listos/total, días para cierre |
| Mochila de documentos (widget) | Tabla con documentos requeridos de la beca activa; cada fila muestra nombre, estado (Validado/Rechazado/Pendiente/En Revisión), y acción (Subir o Descargar) |
| Alerta de documento rechazado | Si algún documento tiene estado "Rechazado", muestra tarjeta roja con enlace a `/documentos` |
| Charlas y talleres en vivo | Slider horizontal con snap scroll; dos tabs: Charlas informativas y Talleres prácticos |
| Reserva de cupo | Botón Reservar/Inscribirse; persiste en `localStorage("pathfinder_reservations")` con toggle y notificación toast |
| Indicador "En vivo" | Badge rojo con dot animado si fecha contiene "hoy"/"mañana" |
| Contador regresivo (próximo cierre) | Temporizador en vivo para cierre de Beca 18 (horas:minutos:segundos) |
| Match de afinidad | Top 3 becas ordenadas por `afinidad` descendente (excluye BEC-01); badge verde ≥85%, azul <85% |
| Becas guardadas | Lista de becas favoritas del usuario; enlace "Ver todas" que cambia tab a "guardadas" vía localStorage |
| Toast de notificación | Mensaje emergente superior derecho para reservas/alertas |

## 3. Buscar Oportunidades / Catálogo (`/buscar`)

| Funcionalidad | Detalle |
|---|---|
| Catálogo completo de becas | Grid responsivo de tarjetas (1/2/3 columnas según viewport) |
| Motor de recomendaciones por afinidad | Llama RPC `calcular_recomendaciones_becas` que pondera: Académico 40%, Socioeconómico 30%, Extracurricular 20%, Perfil 10% |
| Fallback sin autenticación | `getBecasFallback()` — SELECT simple a tabla `becas` con afinidad neutra |
| 3 tabs: Explorar / Guardadas / Postuladas | Filtran becas según estado; la tab activa tiene `border-b-4 border-text-primary font-black`; cada tab muestra un badge contador |
| Barra de búsqueda | Input con `border-3 border-text-primary shadow-[4px_4px_0_#1e293b] rounded-xl`; filtra por título, sponsor o requisitos (case-insensitive) |
| Botón Filtros Avanzados | Abre el `FilterDrawer`; muestra un badge circular con el número de filtros activos cuando `activeFiltersCount > 0` |
| Panel de filtros avanzados (FilterDrawer) | Panel deslizante desde la derecha (`w-[400px]`, `bg-slate-50`, `border-l-3 border-text-primary`). Cada grupo de filtros es una tarjeta con `border-3 border-text-primary rounded-xl shadow-[4px_4px_0_#1e293b]` y cabecera oscura (`bg-text-primary`) como acordeón. |
| — Tipo de Programa | Checkboxes customizados (div cuadrado azul con check blanco): Universitarias, Técnicas, Postgrado, Idiomas |
| — Financiamiento | Radio buttons customizados (círculo con borde grueso azul): Todos, Beca Integral (100%), Beca Parcial |
| — Gestión | Checkboxes customizados: Pública, Privada |
| — Destino | Checkboxes customizados: Lima, Provincias, Extranjero |
| Acordeones en filtros | Cabecera oscura de cada tarjeta de filtro funciona como toggle (chevron rota 180° cuando está abierto) |
| Botón "Aplicar Filtros" | Botón amarillo fijado al pie del FilterDrawer con `bg-brand-yellow border-3 border-text-primary shadow-[4px_4px_0_#1e293b]`; cierra el drawer al hacer clic |
| Paginación | 6 items por página con controles Anterior/Siguiente y números de página; scroll suave al cambiar |
| Skeleton loading | 6 tarjetas animadas mientras carga |
| Tarjeta de beca (ScholarshipCard) | `border-3 border-text-primary shadow-[4px_4px_0_#1e293b] rounded-2xl bg-white w-[335px]`; badges de afinidad (Alta/Afín/Baja), nivel, título, sponsor, cobertura, etiquetas de destino, fecha cierre |
| Botón guardar (❤️) | Toggle guardado en esquina superior derecha de la tarjeta; persiste en `localStorage("pathfinder_saved_becas")` y tabla `becas_guardadas` en Supabase |
| Botón postular | Botón amarillo en pie de tarjeta; crea registro en `postulaciones` con `paso_pipeline: 1`; muestra toast de confirmación |
| Cancelar postulación | Botón delete con modal de confirmación; elimina registro en Supabase |
| Drawer de detalle (DetailDrawer) | Panel lateral (`w-[560px]` desktop / bottom-sheet 90vh móvil, `bg-white border-l-3 border-text-primary`). Barra superior con botones de cerrar y guardar juntos (ambos `border-2 shadow-[2px_2px_0_#1e293b]`). |
| Badges de estado en detalle | Insignias sólidas con fondo pastel y borde de color semántico: verde para "Match Perfecto", azul para nivel, rojo para "Nacional" |
| Sección "Sobre esta Beca" | Párrafo de descripción libre de la convocatoria |
| Cruce de requisitos vs perfil | Lista vertical de **Tarjetas Semáforo**: fondo + borde verde (`#dcfce7 / #15803d`) para "Cumple", gris (`#f1f5f9 / #334155`) para "Pendiente", rojo (`#fee2e2 / #b91c1c`) para "No Cumple". Cada card muestra el campo del requisito, el valor del perfil, y un ícono de estado. |
| Beneficios de la beca | Grid `grid-cols-2 md:grid-cols-3` de mini-tarjetas cuadradas (`border-2 border-text-primary shadow-[2px_2px_0_#1e293b]`), cada una con un ícono grande descriptivo (school, payments, flight, etc.) y el nombre del beneficio |
| Botón "Postular Ahora" | CTA masivo único en el pie del DetailDrawer (`bg-brand-yellow border-3 border-text-primary shadow-[4px_4px_0_#1e293b]`); se deshabilita si ya postulaste, mostrando "Ya Postulaste" |
| Estados de requisitos | Cumple (verde) / No Cumple (rojo) / Pendiente (gris) según datos del perfil |
| Badge de "Postulado" | Aparece en tarjetas de becas ya postuladas |
| Estados vacíos | Mensajes y CTAs diferenciados para cada tab sin resultados |
| Store de tab activo en localStorage | `pathfinder_search_tab` para mantener consistencia entre Dashboard y Buscar |

## 4. Mis Postulaciones / Pipeline (`/postulaciones`)

| Funcionalidad | Detalle |
|---|---|
| Layout 3-columnas responsivo | CSS Grid: sidebar izquierdo (3 cols), workspace central (6 cols), sidebar derecho (3 cols); reorden automático mobile |
| Contadores dinámicos | Activas / En curso / Cerradas basados en `paso_pipeline` y `estado_general` |
| Lista de convocatorias activas | Tarjetas seleccionables con badge de afinidad y estado; highlight de selección activa |
| Indicador "ACTIVA" | Badge en esquina superior derecha de la tarjeta seleccionada |
| Pipeline visual individual | Barra de progreso horizontal con 4 pasos y estados (completado/activo/pendiente) |
| Lista de control (checklist) | 3 documentos clave: identificación, constancia académica, ficha SISFOH; cada uno con checkbox |
| Estados de documento en checklist | Aprobado (check azul), En revisión (reloj ámbar), Faltante (checkbox vacío) |
| Confirmación de marcado sin archivo | Modal de advertencia: "No hay archivo subido. ¿Marcar como completada?" |
| Auto-actualización de pipeline | Cuando los 3 docs están aprobados, el pipeline avanza automáticamente |
| Timeline de fechas críticas | 3 hitos con nodos visuales y línea conectora; estados completado/actual/futuro |
| Estado de mochila (widget) | Progreso "X de Y documentos listos" con barra de progreso |
| Documentos pendientes clickeables | Cada ítem pendiente lleva a `/documentos` |
| Sincronización rápida | Botón que refresca datos desde Supabase; muestra timestamp de última sincronización |
| Banner IA | Tarjeta oscura con badge "IA ready" y botón "Consultar con IA" que navega a `/asesor` |
| Modal selector de beca | Lista completa de convocatorias con búsqueda; selección cambia el contexto |
| Skeleton loading | Animación de carga para los 3 paneles |
| Estado vacío | Mensaje y CTA "Explorar becas →" cuando no hay postulaciones |
| Tip del día | Sugerencia sobre PDFs y tamaño máximo para PRONABEC |
| Toast de notificación | Mensajes de confirmación/error |
| Auto-limpieza de postulaciones fantasma | Elimina registros en `postulaciones` cuya `beca_id` ya no existe en `becas` |

## 5. Mochila de Documentos (`/documentos`)

| Funcionalidad | Detalle |
|---|---|
| Selector de beca/meta activa | Dropdown que lista todas las becas postuladas; cambia contexto de documentos requeridos |
| Progreso del expediente | Porcentaje y contador "X de Y documentos listos" con barra de progreso |
| Alerta de documento rechazado | Tarjeta naranja con botón "Reemplazar ahora" |
| Categorías de documentos | 3 categorías visuales: Identidad, Académicos, Socioeconómicos; cada una muestra conteo y estado |
| Estados por ítem en categorías | Validado (verde), Validando (ámbar), Rechazado (rojo), Pendiente (gris) |
| Tabla detallada de documentos | Columnas: Documento (con ícono), Ayuda/descripción, Estado, Acciones |
| Documentos requeridos vs complementarios | Separados por sección en la tabla |
| Subida de archivo real (Supabase Storage) | Selector de archivo (PDF/imagen), sube a bucket `expedientes`, crea registro en `documentos` con estado "En Revisión" |
| Verificación simulada con IA | 3 segundos después de subir, cambia estado a "Validado" automáticamente |
| Subida simulada (sin Supabase) | Simulación local con `localStorage("pathfinder_uploaded_docs")` y animación de verificación |
| Menú de opciones por documento | Modificar (re-subir) y Eliminar (borra de Supabase + localStorage) |
| Vista previa / descarga | Botón visibility que abre `archivo_url` en nueva pestaña o simula descarga |
| Drop zone | Área de upload con icono cloud, texto "Subir nuevos documentos", pills de formatos (PDF, JPG/PNG) |
| Capacitaciones / Cursos | Sección de cursos cortos con certificados digitales |
| Tabs de capacitaciones | Disponibles / Obtenidas con contadores |
| Inscripción a curso | Botón "Iniciar clase" → cambia a "Descargar certificado" → luego "Certificado en mochila" |
| Certificados en mochila | Se agregan como documento con ID `CERT-{courseId}`; se pueden eliminar |
| Paginación de cursos | 3 por página con controles |
| Badge de afinidad en barra de contexto | Muestra % de afinidad de la beca seleccionada |
| Indicador de urgencia (reloj) | Color del icono alarm según días restantes: rojo ≤7, ámbar ≤30, verde >30 |
| Fecha de cierre formateada | Locale `es-PE` con día, mes y año |
| Toast de éxito | Notificación para uploads, inscripciones, eliminaciones |
| Modal de subida | Diálogo con campo file (real) o muestra de archivo simulado PDF firmado digitalmente |

## 6. Perfil del Postulante (`/perfil`)

| Funcionalidad | Detalle |
|---|---|
| Barra de completitud | Porcentaje general + 3 badges (Personal, Académico, Extras) con estado Completo/Incompleto |
| Lista de campos faltantes | Texto dinámico: "Faltan: Mérito académico, Extracurriculares..." |
| Sección A — Datos personales | Nombres, DNI, email, fecha nacimiento, género, departamento, provincia |
| Sección B — Perfil académico | Colegio (nombre, tipo gestión, año egreso), notas 3°-5° año (escala 0-20), mérito académico (Quinto/Tercio/Medio Superior), área de interés vocacional |
| Sección C — Perfil socioeconómico | Clasificación SISFOH (Pobre Extremo/Pobre/No Pobre), fecha vencimiento SISFOH |
| Alerta de vencimiento SISFOH | Si vence en ≤180 días, muestra aviso ámbar |
| Condiciones especiales | Checkboxes: REDEPED, Comunidad Nativa, VRAEM, Licenciado FF.AA., CONADIS, Hijo de docente |
| Sección D — Extracurriculares | Voluntariado, Deportista IPD, Liderazgo escolar, Emprendimiento |
| Idiomas | Selector de idioma, nivel (Ninguno→Avanzado), instituto, certificación TOEFL/Cambridge |
| Aviso de certificación oficial | Si marcó certificación, muestra mensaje verde sobre afinidad con becas de idiomas |
| Privacidad (Ley 29733) | Checkbox de aceptación de tratamiento de datos personales |
| Guardado dual | Persiste en `localStorage("pathfinder_profile")` y en tabla `usuarios` en Supabase vía `refreshProfile` |
| Botones Guardar / Cancelar | Footer con acciones; toast de confirmación "Perfil guardado" |
| Cálculo de GPA | Promedio enviado al RPC de recomendaciones para scoring |

## 7. Asesor IA / Motibot (`/asesor`)

| Funcionalidad | Detalle |
|---|---|
| Chat contextual con IA | Nombre "Motibot", especializado en becas peruanas |
| 3 proveedores de IA con fallback progresivo | Groq API (`VITE_AI_API_KEY`) → Ollama (URL configurable) → Simulador local |
| Contexto activo en sidebar | Beca objetivo, promedio GPA, días para cierre, documentos rechazados |
| Historial de conversaciones | Sidebar con lista de sesiones, fecha relativa (Hoy/Ayer/Hace N días) |
| Crear nueva conversación | Botón "Nueva conversación" |
| Renombrar conversación | Menú de 3 puntos → "Renombrar" con input inline |
| Eliminar conversación | Menú de 3 puntos → "Eliminar" con actualización inmediata |
| Persistencia de sesiones | Almacena en tabla `chat_sesiones` (Supabase) o `localStorage("pathfinder_chat_sessions")` |
| Título automático de sesión | Se genera a partir de las primeras 5 palabras del primer mensaje del usuario |
| Mensajes de bienvenida personalizados | Saluda con `profile.nombres` y menciona la beca activa |
| Acciones rápidas (pills) | 4 botones: Revisar carta motivación, Practicar entrevista, Entender requisitos, Explorar carreras |
| Burbujas de chat con formato | Renderiza **negritas**; estilos diferenciados usuario (azul) vs IA (blanco) |
| Indicador de escritura (typing) | 3 dots animados con bounce |
| Alerta de urgencia | Barra ámbar que aparece si hay docs rechazados o cierre ≤10 días |
| Sugerencias rápidas persistentes | Pills horizontales debajo del chat |
| Input con textarea | Soporta Enter para enviar, Shift+Enter para nueva línea; iconos attach y mic |
| Simulador local de respuestas | Reconocimiento de palabras clave (carta, entrevista, requisitos, carrera) con respuestas predefinidas |
| Integración Ollama | POST a `/api/chat` con modelo `llama3.2:3b`; URL configurable desde settings |
| Integración Groq | POST a `api.groq.com/openai/v1/chat/completions` con `llama-3.1-8b-instant` |
| System prompt enriquecido | Incluye perfil completo del estudiante (GPA, SISFOH, colegio, mérito, voluntariado, deporte, inglés) |
| Contexto de beca en prompt | Nombre, sponsor, días restantes, alerta de documentos rechazados |
| Recomendaciones en prompt | Top 5 becas más afines incluidas en el system prompt para sugerencias contextuales |
| Settings modal | Configuración de URL de Ollama persistida en `pathfinder_ollama_url` |
| Sidebar responsive | Drawer deslizable en móvil con overlay backdrop |
| Avatar de usuario/IA | Inicial del nombre vs "IA" en círculos de color |
| Disclaimer | Texto: "La IA puede cometer errores. Verifica siempre la información crítica con PRONABEC." |
| Fallback offline | Si falla Groq y no hay Ollama, cae en simulador local sin pérdida de mensajes |

## 8. Motor de Recomendaciones (`recomendaciones.ts`)

| Funcionalidad | Detalle |
|---|---|
| RPC `calcular_recomendaciones_becas` | Función PostgreSQL que calcula afinidad ponderada |
| Pesos del scoring | Académico 40%, Socioeconómico 30%, Extracurricular 20%, Perfil 10% |
| Fallback sin auth | `getBecasFallback()` — SELECT directo a `becas` con afinidad estática |
| Tipos exportados | `BecaRecomendada` (con criterios RPC) y `BecaRaw` (SELECT directo) |
| Manejo de errores de schema cache | Logs con sugerencia: `NOTIFY pgrst, 'reload schema';` |

## 9. Layout y Navegación

| Funcionalidad | Detalle |
|---|---|
| MainLayout | Layout principal que envuelve todas las páginas protegidas |
| Sidebar (desktop) | Navegación lateral con iconos y labels |
| MobileNav (bottom) | Barra de navegación inferior en móvil |
| Responsivo | Sidebar visible en desktop, oculta en mobile; bottom nav visible solo en mobile |
| ProtectedRoute | Wrapper que redirige a `/login` si no hay sesión |
| SPA routing | `react-router-dom v7` con `BrowserRouter`; `vercel.json` rewrites todo a `/index.html` |

## 10. Supabase — Base de Datos

| Funcionalidad | Detalle |
|---|---|
| Tabla `usuarios` | Perfiles de usuario con columnas directas (dni, nombres, fecha_nacimiento, genero, etc.) + `perfil_detalles` (JSONB) |
| Tabla `becas` | Catálogo de becas con título, sponsor, nivel, cobertura, requisitos, fecha_cierre, afinidad, beneficios, documentos_requeridos |
| Tabla `postulaciones` | Postulaciones de usuario con `beca_id`, `paso_pipeline`, `estado_general` |
| Tabla `documentos` | Documentos por postulación con nombre, estado, `archivo_url` |
| Tabla `charlas` | Charlas informativas con fecha, modalidad, sponsor |
| Tabla `talleres` | Talleres prácticos con frecuencia, enfoque, sponsor |
| Tabla `cursos_capacitacion` | Cursos cortos con duración, requisitos, estado |
| Tabla `becas_guardadas` | Favoritos (usuario_id, beca_id) |
| Tabla `chat_sesiones` | Sesiones de chat IA con título y mensajes (JSONB) |
| Bucket de storage `expedientes` | Almacenamiento de archivos subidos por usuario |
| RLS (Row Level Security) | Políticas de seguridad por fila en tablas |
| RPC `calcular_recomendaciones_becas` | Función SQL de scoring ponderado |

## 11. Persistencia Local (localStorage)

| Clave | Propósito |
|---|---|
| `pathfinder_active_meta` | Beca/meta activa seleccionada en Documentos |
| `pathfinder_reservations` | IDs de charlas/talleres con cupo reservado |
| `pathfinder_saved_becas` | IDs de becas guardadas como favoritas |
| `pathfinder_applied_becas` | IDs de becas postuladas |
| `pathfinder_search_tab` | Tab activo en BuscarOportunidades (explorar/guardadas/postuladas) |
| `pathfinder_uploaded_docs` | IDs de documentos subidos (simulación) |
| `pathfinder_enrolled_courses` | IDs de cursos en los que el usuario se matriculó |
| `pathfinder_ollama_url` | URL del servidor Ollama para el Asesor IA |
| `pathfinder_chat_sessions` | Sesiones de chat (fallback local sin Supabase) |
| `pathfinder_profile` | Datos del perfil (copia local para modo simulado) |
