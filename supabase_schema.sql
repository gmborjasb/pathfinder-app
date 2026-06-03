-- Habilitar la extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. CREACIÓN DE TABLAS DE USUARIOS Y CONTROL
-- =========================================================================

-- Tabla: Usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dni VARCHAR(8) UNIQUE,
  nombres VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  perfil_detalles JSONB DEFAULT '{"tipo_colegio": "Estatal", "sisfoh": "Pobreza Extrema", "condiciones": {}, "notas": {"gpa": 18.5}, "idiomas": {}}'::jsonb, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Postulaciones
CREATE TABLE IF NOT EXISTS public.postulaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  beca_id VARCHAR(15) NOT NULL, -- Se eliminará la clave foránea estricta a becas si se prefiere, pero dejémosla por integridad referencial
  paso_pipeline INT DEFAULT 1,
  estado_general VARCHAR(100) DEFAULT 'Preparación',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (usuario_id, beca_id)
);

-- Tabla: Documentos
CREATE TABLE IF NOT EXISTS public.documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  postulacion_id UUID NOT NULL REFERENCES public.postulaciones(id) ON DELETE CASCADE,
  nombre_documento VARCHAR(255) NOT NULL,
  estado VARCHAR(50) DEFAULT 'Validado',
  archivo_url TEXT,
  texto_ayuda TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Chat Sesiones
DROP TABLE IF EXISTS public.chat_sesiones CASCADE;
CREATE TABLE IF NOT EXISTS public.chat_sesiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) DEFAULT 'Conversación Nueva',
  mensajes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2. TABLAS DE CATÁLOGO (BECAS, CURSOS, CHARLAS, TALLERES)
-- =========================================================================

-- Limpiar tablas de catálogo para asegurar recreación con columnas actualizadas
DROP TABLE IF EXISTS public.talleres CASCADE;
DROP TABLE IF EXISTS public.charlas CASCADE;
DROP TABLE IF EXISTS public.cursos_capacitacion CASCADE;
DROP TABLE IF EXISTS public.becas CASCADE;

-- Tabla: Becas
CREATE TABLE IF NOT EXISTS public.becas (
  id VARCHAR(15) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  sponsor VARCHAR(255) NOT NULL,
  cobertura TEXT,
  requisitos TEXT,
  fecha_cierre DATE,
  nivel VARCHAR(50),
  icono VARCHAR(50),
  sobre TEXT,
  beneficios JSONB DEFAULT '[]'::jsonb,
  afinidad INT DEFAULT 85,
  documentos_requeridos JSONB DEFAULT '[]'::jsonb
);

-- Tabla: Cursos / Capacitaciones
CREATE TABLE IF NOT EXISTS public.cursos_capacitacion (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  sponsor VARCHAR(255) NOT NULL,
  duracion VARCHAR(50),
  requisitos TEXT,
  estado VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Charlas
CREATE TABLE IF NOT EXISTS public.charlas (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  sponsor VARCHAR(255) NOT NULL,
  modalidad VARCHAR(100),
  fecha_hora VARCHAR(100),
  texto_accion VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Talleres
CREATE TABLE IF NOT EXISTS public.talleres (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  sponsor VARCHAR(255) NOT NULL,
  frecuencia_estado VARCHAR(100),
  enfoque VARCHAR(255),
  texto_accion VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 1b. NUEVAS COLUMNAS — PERFIL EXTENDIDO
-- =========================================================================

-- Tabla usuarios: campos de perfil extendido
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS genero VARCHAR(30);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS merito_academico VARCHAR(20);   -- 'quinto'|'tercio'|'medio'
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS area_interes VARCHAR(50);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS tiene_conadis BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS es_deportista BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS hace_voluntariado BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS hijo_docente BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS acepta_privacidad BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS privacidad_fecha TIMESTAMPTZ;

-- Tabla becas: campos para cálculo dinámico de afinidad
ALTER TABLE public.becas ADD COLUMN IF NOT EXISTS req_edad_maxima INT;
ALTER TABLE public.becas ADD COLUMN IF NOT EXISTS req_nota_minima DECIMAL(4,2);
ALTER TABLE public.becas ADD COLUMN IF NOT EXISTS req_sisfoh VARCHAR(20);            -- 'pobre_extremo'|'pobre'|'cualquiera'
ALTER TABLE public.becas ADD COLUMN IF NOT EXISTS req_merito VARCHAR(20);            -- 'quinto'|'tercio'|'medio'
ALTER TABLE public.becas ADD COLUMN IF NOT EXISTS prioriza_voluntariado BOOLEAN DEFAULT false;
ALTER TABLE public.becas ADD COLUMN IF NOT EXISTS prioriza_deportista BOOLEAN DEFAULT false;

-- =========================================================================

-- Vincular clave foránea en Postulaciones a Becas de manera segura
ALTER TABLE public.postulaciones DROP CONSTRAINT IF EXISTS fk_postulaciones_beca;
ALTER TABLE public.postulaciones 
  ADD CONSTRAINT fk_postulaciones_beca 
  FOREIGN KEY (beca_id) REFERENCES public.becas(id) ON DELETE CASCADE;

-- =========================================================================
-- 3. TRIGGER PARA NUEVOS USUARIOS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombres, correo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombres', new.raw_user_meta_data->>'full_name', 'Nuevo Estudiante'),
    new.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 4. HABILITAR ROW LEVEL SECURITY (RLS) Y CREAR POLÍTICAS
-- =========================================================================

-- Habilitar RLS en las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.becas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos_capacitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charlas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sesiones ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores por si existen
DROP POLICY IF EXISTS "Permitir lectura de perfil propio" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir actualización de perfil propio" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir todo a usuarios en sus postulaciones" ON public.postulaciones;
DROP POLICY IF EXISTS "Permitir lectura de documentos propios" ON public.documentos;
DROP POLICY IF EXISTS "Permitir inserción de documentos propios" ON public.documentos;
DROP POLICY IF EXISTS "Permitir eliminación de documentos propios" ON public.documentos;
DROP POLICY IF EXISTS "Permitir todo a usuarios en sus chats" ON public.chat_sesiones;
DROP POLICY IF EXISTS "Permitir lectura pública de becas" ON public.becas;
DROP POLICY IF EXISTS "Permitir lectura pública de cursos" ON public.cursos_capacitacion;
DROP POLICY IF EXISTS "Permitir lectura pública de charlas" ON public.charlas;
DROP POLICY IF EXISTS "Permitir lectura pública de talleres" ON public.talleres;

-- A. Políticas de lectura pública para catálogos
CREATE POLICY "Permitir lectura pública de becas" ON public.becas FOR SELECT TO public USING (true);
CREATE POLICY "Permitir lectura pública de cursos" ON public.cursos_capacitacion FOR SELECT TO public USING (true);
CREATE POLICY "Permitir lectura pública de charlas" ON public.charlas FOR SELECT TO public USING (true);
CREATE POLICY "Permitir lectura pública de talleres" ON public.talleres FOR SELECT TO public USING (true);

-- B. Políticas para 'usuarios'
CREATE POLICY "Permitir lectura de perfil propio" ON public.usuarios
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Permitir actualización de perfil propio" ON public.usuarios
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- C. Políticas para 'postulaciones'
CREATE POLICY "Permitir todo a usuarios en sus postulaciones" ON public.postulaciones
  FOR ALL TO authenticated USING (auth.uid() = usuario_id);

-- D. Políticas para 'documentos'
CREATE POLICY "Permitir lectura de documentos propios" ON public.documentos
  FOR SELECT TO authenticated
  USING (postulacion_id IN (SELECT id FROM public.postulaciones WHERE usuario_id = auth.uid()));
CREATE POLICY "Permitir inserción de documentos propios" ON public.documentos
  FOR INSERT TO authenticated
  WITH CHECK (postulacion_id IN (SELECT id FROM public.postulaciones WHERE usuario_id = auth.uid()));
CREATE POLICY "Permitir eliminación de documentos propios" ON public.documentos
  FOR DELETE TO authenticated
  USING (postulacion_id IN (SELECT id FROM public.postulaciones WHERE usuario_id = auth.uid()));

-- E. Políticas para 'chat_sesiones'
CREATE POLICY "Permitir todo a usuarios en sus chats" ON public.chat_sesiones
  FOR ALL TO authenticated USING (auth.uid() = usuario_id);

-- =========================================================================
-- 5. CONFIGURACIÓN DE STORAGE (BUCKET 'expedientes')
-- =========================================================================

-- Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('expedientes', 'expedientes', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Acceso público de lectura en expedientes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de archivos propios" ON storage.objects;
DROP POLICY IF EXISTS "Permitir borrado de archivos propios" ON storage.objects;

CREATE POLICY "Acceso público de lectura en expedientes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'expedientes');
CREATE POLICY "Permitir subida a usuarios autenticados" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'expedientes');
CREATE POLICY "Permitir actualización de archivos propios" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'expedientes');
CREATE POLICY "Permitir borrado de archivos propios" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'expedientes');


-- =========================================================================
-- BECAS
-- =========================================================================
INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad, documentos_requeridos)
VALUES ('BEC-01', 'Beca 18 - Convocatoria Ordinaria', 'PRONABEC', '100% Matrícula, Pensión, Laptop y Alimentación', 'SISFOH Pobre o Pobre Extremo, Nota mínima 15', CURRENT_DATE + INTERVAL '45 days', 'Pregrado', 'school', 'Beca 18 es el programa bandera del Estado Peruano para el acceso a la educación superior de jóvenes talentos con alto rendimiento escolar y escasos recursos económicos o en condición de vulnerabilidad.', '["100% de matrícula y pensiones académicas.","Costo de examen de admisión.","Laptop de última generación.","Alimentación, movilidad local y alojamiento (si corresponde)."]'::jsonb, 95, '[
  {"name": "DNI Postulante", "description": "Copia legible por ambos lados.", "es_requerido": true, "category": "Identidad", "id": 1, "documentIcon": "description"},
  {"name": "Certificado de Estudios", "description": "Certificado oficial de 1ero a 5to de secundaria.", "es_requerido": true, "category": "Académicos", "id": 2, "documentIcon": "school"},
  {"name": "Ficha SISFOH", "description": "Documento de clasificación socioeconómica vigente.", "es_requerido": true, "category": "Socioeconómicos", "id": 3, "documentIcon": "account_balance"}
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad, documentos_requeridos = EXCLUDED.documentos_requeridos;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-02', 'Beca Excelencia Académica BCP', 'Patronato BCP', '100% Pensión, Matrícula y Estipendio Mensual', 'Tercio Superior en secundaria, ingreso a U. Aliada', CURRENT_DATE + INTERVAL '60 days', 'Pregrado', 'school', 'El Patronato BCP promueve la educación superior de calidad financiando estudios universitarios completos para los mejores alumnos del país en las universidades más prestigiosas del Perú.', '["Financiamiento completo de matrícula y pensiones.","Estipendio mensual para gastos de manutención.","Programa de mentoría y acompañamiento profesional.","Curso de inglés e inserción laboral asegurada."]'::jsonb, 92)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad, documentos_requeridos)
VALUES ('BEC-03', 'Beca Mujeres en Ciencia', 'PRONABEC', '100% Integral para carreras STEM', 'Mujeres en 5to de secundaria, Nota mínima 16', CURRENT_DATE + INTERVAL '12 days', 'Pregrado', 'science', 'Iniciativa del Estado Peruano destinada a reducir la brecha de género en carreras científicas y tecnológicas, apoyando a mujeres jóvenes con excelente desempeño académico.', '["Cobertura total de la carrera en universidades elegibles.","Laptop y materiales de estudio.","Asesoramiento psicopedagógico y tutorías.","Asistencia de manutención y transporte."]'::jsonb, 89, '[
  {"name": "DNI Postulante", "description": "Copia legible por ambos lados.", "es_requerido": true, "category": "Identidad", "id": 1, "documentIcon": "description"},
  {"name": "DNI Apoderado", "description": "Copia del DNI del padre o tutor.", "es_requerido": true, "category": "Identidad", "id": 10, "documentIcon": "badge"},
  {"name": "Certificado de Estudios", "description": "Certificado oficial de 1ero a 5to de secundaria.", "es_requerido": true, "category": "Académicos", "id": 2, "documentIcon": "school"},
  {"name": "Constancia Tercio", "description": "Constancia de pertenecer al tercio superior.", "es_requerido": true, "category": "Académicos", "id": 11, "documentIcon": "workspace_premium"},
  {"name": "Ficha SISFOH", "description": "Documento de clasificación socioeconómica vigente.", "es_requerido": true, "category": "Socioeconómicos", "id": 3, "documentIcon": "account_balance"},
  {"name": "Decl. Juradas", "description": "Declaraciones juradas requeridas.", "es_requerido": true, "category": "Socioeconómicos", "id": 12, "documentIcon": "description"}
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad, documentos_requeridos = EXCLUDED.documentos_requeridos;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-04', 'Beca Talento PUCP', 'Pontificia Universidad Católica', '100% Exoneración de pensiones y matrícula', 'Egresados de colegios públicos, Tercio Superior', CURRENT_DATE + INTERVAL '25 days', 'Pregrado', 'school', 'La Pontificia Universidad Católica del Perú ofrece becas de exoneración total para alumnos destacados provenientes de colegios nacionales, garantizando una formación académica de primer nivel.', '["Exoneración total de derechos académicos de matrícula.","Subvención para libros y materiales oficiales.","Servicio de comedor gratuito.","Acceso libre a actividades deportivas y talleres culturales."]'::jsonb, 86)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-05', 'Beca Potencia Tu Talento UTEC', 'Universidad de Ingeniería y Tecnología', '80% Cobertura de pensiones de estudio', 'Nota mínima 15 en 5to de secundaria, rendir examen', CURRENT_DATE + INTERVAL '18 days', 'Pregrado', 'engineering', 'UTEC impulsa el talento de los futuros ingenieros y tecnólogos del Perú financiando la mayor parte de sus estudios para cursar carreras con alta demanda global.', '["80% de descuento en escalas de pago y pensiones.","Uso gratuito de laboratorios de última generación.","Oportunidad de realizar proyectos de investigación pagados.","Intercambio internacional preferente."]'::jsonb, 84)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-06', 'Beca Access Program', 'Embajada de EE.UU. / ICPNA', '100% Clases de inglés por 2 años y materiales', 'Escolares de 4to o 5to de secundaria de colegio nacional', CURRENT_DATE + INTERVAL '25 days', 'Idioma', 'language', 'El programa Access proporciona una base sólida de habilidades del idioma inglés a estudiantes talentosos de secundaria a través de clases intensivas extracurriculares.', '["100% de cobertura de clases de inglés por 2 años.","Libros y materiales del curso incluidos.","Campamentos de liderazgo y talleres culturales americanos.","Certificación internacional de suficiencia en inglés."]'::jsonb, 90)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-07', 'Beca Continuidad de Estudios', 'PRONABEC', 'Pago de pensiones por ciclo académico', 'Estudiantes universitarios con afectación económica', CURRENT_DATE + INTERVAL '30 days', 'Pregrado', 'school', 'Esta beca brinda apoyo financiero temporal a estudiantes destacados de universidades públicas y privadas para evitar la deserción universitaria debido a crisis económicas.', '["Pago de pensiones pendientes y vigentes por el año.","Matrícula financiada.","Subvención para alimentos y materiales escolares.","Orientación psicopedagógica personalizada."]'::jsonb, 80)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-08', 'Beca Inclusión Técnico Profesional', 'PRONABEC', '100% Matrícula y herramientas de estudio', 'Personas con discapacidad, secundaria completa', CURRENT_DATE + INTERVAL '50 days', 'Técnico', 'handyman', 'Destinada a promover la inserción laboral y educativa de personas con discapacidad, financiando carreras técnicas cortas con alta tasa de empleabilidad.', '["Pago completo de matrícula y pensiones técnicas.","Financiamiento de herramientas, uniformes y materiales.","Estipendio mensual de movilidad y alimentación.","Acompañamiento especializado en el centro de estudios."]'::jsonb, 76)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-09', 'Beca Excelencia de la Universidad del Pacífico', 'Universidad del Pacífico', '100% Cobertura de pensiones académicas', 'Pertenecer al Quinto Superior del colegio de origen', CURRENT_DATE + INTERVAL '40 days', 'Pregrado', 'payments', 'La Universidad del Pacífico premia a los estudiantes con un récord escolar impecable otorgándoles una beca total para cursar carreras de economía, finanzas y administración.', '["100% de descuento en pensiones de estudio.","Exoneración de matrícula y derechos de examen.","Asignación de tutor y plan curricular personalizado.","Prioridad en convenios de doble titulación con Europa."]'::jsonb, 88)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-10', 'Beca Alianza Estratégica', 'UNI / UNMSM / UNALM', 'Exoneración total de tasas de examen e ingreso', 'Primeros puestos del colegio de procedencia', CURRENT_DATE + INTERVAL '14 days', 'Pregrado', 'account_balance', 'Convenio estratégico entre las tres universidades públicas líderes en ciencia, ingeniería y agricultura del Perú para facilitar el ingreso de los mejores egresados de secundaria.', '["Inscripción gratuita al examen de admisión especial.","Curso de nivelación gratuito previo al ciclo académico.","Acceso directo a residencias estudiantiles si corresponde.","Exoneración de tasas de carné e ingreso."]'::jsonb, 85)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-11', 'Beca Técnico Productiva Repsol', 'Fundación Repsol / SENATI', '100% Matrícula y materiales de seguridad', 'Residir en distritos de Lima Norte (Ventanilla/Ancón)', CURRENT_DATE + INTERVAL '20 days', 'Técnico', 'oil_barrel', 'Programa de responsabilidad social que capacita en carreras técnicas del sector industrial y de mantenimiento a jóvenes residentes en zonas vecinas a la refinería.', '["Pago total de la matrícula y pensiones en SENATI.","Kit de herramientas y materiales de seguridad industrial.","Oportunidad de realizar prácticas pre-profesionales en Repsol.","Subsidio de alimentación en planta."]'::jsonb, 72)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-12', 'Beca Estímulo al Talento Arte', 'Escuela Nacional de Bellas Artes', '100% Exoneración de pagos de taller', 'Aprobar el examen de aptitud artística, nota mínima 14', CURRENT_DATE + INTERVAL '35 days', 'Pregrado', 'palette', 'Bellas Artes del Perú impulsa las artes plásticas y visuales exonerando de pagos académicos a jóvenes promesas con extraordinario talento expresivo.', '["Exoneración total de matrícula y derechos de taller.","Materiales básicos de pintura, escultura y grabado incluidos.","Participación prioritaria en exposiciones de la galería nacional.","Tutoría de artistas plásticos consagrados."]'::jsonb, 75)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-13', 'Beca Líderes del Futuro', 'Universidad de Lima', '50% Cobertura de pensiones de pregrado', 'Nota mínima 16, acreditar participación en voluntariado', CURRENT_DATE + INTERVAL '42 days', 'Pregrado', 'groups', 'Dirigido a escolares que demuestren habilidades sobresalientes de liderazgo y compromiso social a través de proyectos comunitarios o actividades de voluntariado.', '["50% de cobertura en la pensión de estudios.","Talleres exclusivos de desarrollo directivo y coaching.","Financiamiento de proyectos sociales universitarios.","Bolsa de trabajo preferencial en corporaciones aliadas."]'::jsonb, 83)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-14', 'Beca Deporte de Alta Competencia', 'IPD / Universidades Asociadas', '100% Beca de estudios universitarios', 'Deportista calificado acreditado, mantener promedio 13', CURRENT_DATE + INTERVAL '55 days', 'Pregrado', 'sports_soccer', 'Financia estudios universitarios completos a deportistas federados que representan al Perú, permitiéndoles balancear el entrenamiento intensivo con su carrera académica.', '["100% de descuento en pensiones y matrícula.","Justificación de inasistencias por competencias oficiales.","Uso de gimnasio y cuerpo médico deportivo de la universidad.","Asesor nutricional y psicológico deportivo."]'::jsonb, 78)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-15', 'Beca Hijos de Docentes', 'PRONABEC', '100% Matrícula, pensiones y movilidad', 'Hijo de docente de la carrera pública magisterial', CURRENT_DATE + INTERVAL '28 days', 'Pregrado', 'group', 'Beca del Estado en reconocimiento a la labor de los profesores de la educación pública peruana, financiando estudios superiores completos para sus hijos destacados.', '["Pago total de la matrícula y pensiones en universidades aliadas.","Laptop de última generación y útiles.","Estipendio mensual de movilidad y útiles.","Subsidio de titulación profesional."]'::jsonb, 91)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-16', 'Beca Comunidad Nativa Amazónica', 'PRONABEC', '100% Integral (Estudios y residencia)', 'Pertenecer a comunidad nativa acreditada por MINCU', CURRENT_DATE + INTERVAL '65 days', 'Pregrado', 'forest', 'Esta modalidad de beca especial promueve el acceso inclusivo a la educación de jóvenes pertenecientes a pueblos indígenas y comunidades amazónicas.', '["Pensión y matrícula cubierta al 100%.","Hospedaje estudiantil financiado.","Alimentación completa diaria.","Programa de tutorías de inserción urbana y académica."]'::jsonb, 87)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-17', 'Beca VRAEM / Huallaga', 'PRONABEC', '100% Cobertura de estudios superiores', 'Residir en distritos focalizados del VRAEM', CURRENT_DATE + INTERVAL '48 days', 'Pregrado', 'map', 'Dirigida a jóvenes de zonas declaradas en estado de emergencia o con presencia de cultivos alternativos en las cuencas del VRAEM y Huallaga, impulsando su inserción profesional.', '["Pago completo de matrícula y pensiones.","Movilidad local y estipendio de manutención.","Laptop y software de ingeniería requerido.","Acompañamiento tutorial continuo."]'::jsonb, 89)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-18', 'Beca Alianza del Pacífico', 'Ministerio de Relaciones Exteriores', 'Intercambio estudiantil completo por un ciclo', 'Estudiante universitario de 5to ciclo, Tercio Superior', CURRENT_DATE + INTERVAL '90 days', 'Pregrado', 'public', 'Promueve la integración regional a través del intercambio de estudiantes de pregrado entre Perú, Chile, Colombia y México.', '["Pasajes aéreos internacionales completos.","Seguro médico internacional de amplia cobertura.","Estipendio mensual en el país de destino.","Exoneración de tasas de matrícula en la universidad de acogida."]'::jsonb, 74)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-19', 'Beca Idiomas Alianza Francesa', 'Asociación Cultural Peruano Francesa', '100% Costo de módulos de francés hasta nivel B2', 'Nota mínima 15 en secundaria, colegio público', CURRENT_DATE + INTERVAL '16 days', 'Idioma', 'language', 'Financia el aprendizaje del idioma francés para estudiantes talentosos de escasos recursos, abriéndoles las puertas a futuras becas gubernamentales en Francia.', '["Módulos de enseñanza del idioma francés cubiertos al 100%.","Libros oficiales y acceso a biblioteca virtual.","Tasas de examen de certificación DELF exoneradas.","Acceso preferente a eventos culturales de la Alianza."]'::jsonb, 82)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-20', 'Beca Talento Técnico', 'TECSUP', '70% Cobertura en carreras de tecnología', 'Nota mínima 14 en matemática y física en secundaria', CURRENT_DATE + INTERVAL '22 days', 'Técnico', 'bolt', 'Tecsup fomenta el desarrollo de habilidades técnicas en electricidad, mecatrónica y desarrollo de software financiando gran parte del costo académico de los mejores postulantes.', '["70% de subvención en pensiones mensuales.","Prácticas intensivas en talleres con equipos industriales reales.","Acceso a certificaciones corporativas oficiales.","Acceso a la bolsa de trabajo líder en minería y energía."]'::jsonb, 77)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-21', 'Beca Vocación de Maestro', 'PRONABEC', '100% Pensiones, matrícula y titulación', 'Nota mínima 16 en secundaria, postular a Educación', CURRENT_DATE + INTERVAL '15 days', 'Pregrado', 'local_library', 'Subvenciona carreras de Educación en universidades de primer nivel con el fin de profesionalizar la pedagogía y formar a los futuros maestros peruanos de excelencia.', '["100% de matrícula, pensiones de estudio y costos de titulación.","Subvención para libros especializados.","Laptop y estipendio de manutención mensual.","Pasantías internacionales subvencionadas de corta duración."]'::jsonb, 90)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-22', 'Beca Fe y Alegría', 'Patronato Fe y Alegría / UARM', '100% Cobertura en la Univ. Antonio Ruiz de Montoya', 'Egresado de redes de colegios Fe y Alegría', CURRENT_DATE + INTERVAL '33 days', 'Pregrado', 'diversity_1', 'Convenio especial para brindar educación superior humanista e integral a egresados destacados de los colegios de la red Fe y Alegría en la Universidad Jesuita de Lima.', '["Cobertura del 100% de la matrícula y pensiones académicas.","Libros y material educativo cubiertos.","Orientación personalizada y pastoral.","Acompañamiento socioemocional integral."]'::jsonb, 81)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-23', 'Beca Bachillerato Internacional', 'Universidad Cayetano Heredia', '100% Cobertura en carreras de Salud', 'Haber culminado el programa de Bachillerato (IB)', CURRENT_DATE + INTERVAL '19 days', 'Pregrado', 'medical_services', 'UPCH exonera de costos de carrera y matrícula a egresados de secundaria que hayan aprobado satisfactoriamente los exigentes requisitos del Bachillerato Internacional.', '["100% de exoneración de derechos académicos.","Prioridad de inserción en laboratorios de investigación médica.","Convalidación automática de cursos afines del primer ciclo.","Acceso preferencial a rotaciones clínicas internacionales."]'::jsonb, 88)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-24', 'Beca REA (Rendimiento Académico)', 'Universidad Católica Santa María', '50% Descuento en pensiones semestrales', 'Ocupar el primer puesto del semestre anterior', CURRENT_DATE + INTERVAL '60 days', 'Pregrado', 'rewarded_ads', 'Beca semestral renovable dirigida a estudiantes regulares que ocupan el cuadro de honor en sus respectivas escuelas profesionales de la UCSM en Arequipa.', '["50% de descuento en la cuota académica del semestre.","Exoneración de carné e inscripción en talleres deportivos.","Mención de honor en el registro de egresados destacados.","Acceso directo a intercambios estudiantiles aliados."]'::jsonb, 75)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-25', 'Beca Fundación Interbank', 'Grupo Interbank / IPAE', '100% Estudios técnicos en Administración', 'Hijo de colaborador o cliente con perfil pyme', CURRENT_DATE + INTERVAL '41 days', 'Técnico', 'domain', 'Interbank apoya el desarrollo técnico de las familias de emprendedores financiando estudios de administración de negocios y marketing en IPAE.', '["100% del pago de matrícula y pensiones del instituto.","Oportunidad de pasantía y empleo a tiempo parcial en el banco.","Talleres exclusivos de finanzas e innovación digital.","Acceso gratuito a la red de mentoría de negocios Interbank."]'::jsonb, 79)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-26', 'Beca Futuro Minero', 'Sociedad Nacional de Minería / TECSUP', '100% Matrícula y residencia (Carreras mineras)', 'Provenir de regiones con actividad minera directa', CURRENT_DATE + INTERVAL '52 days', 'Técnico', 'construction', 'Subvenciona la formación técnica en operaciones mineras y mantenimiento industrial de jóvenes residentes en zonas con influencia directa de operaciones extractivas.', '["Matrícula y pensiones pagadas al 100% en TECSUP.","Residencia estudiantil en el campus cubierta.","Alimentación completa y uniforme industrial homologado.","Inserción laboral directa en empresas mineras afiliadas al concluir."]'::jsonb, 84)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-27', 'Beca Idiomas Británico', 'Asociación Cultural Peruano Británica', '100% Cobertura de módulos de inglés ciclo regular', 'Estudiante de secundaria con promedio general 17', CURRENT_DATE + INTERVAL '11 days', 'Idioma', 'language', 'El Británico otorga becas totales de inglés para alumnos peruanos sobresalientes, brindándoles herramientas lingüísticas avanzadas para su futuro académico internacional.', '["100% de exoneración en mensualidades de ciclo de inglés.","Libros y accesos virtuales cubiertos.","Derechos de examen para certificación FCE o CAE gratuitos.","Invitación exclusiva a seminarios y eventos de cultura británica."]'::jsonb, 87)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-28', 'Beca Excelencia San Marcos', 'Universidad Nacional Mayor de San Marcos', 'Canasta universitaria, comedor y exoneraciones', 'Primer puesto general en el examen de admisión', CURRENT_DATE + INTERVAL '8 days', 'Pregrado', 'school', 'La Decana de América otorga el máximo reconocimiento estudiantil al primer puesto general de su riguroso proceso de examen de admisión anual.', '["Exoneración total de todos los trámites académicos administrativos.","Alimentación gratuita diaria en el comedor universitario (desayuno/almuerzo/cena).","Canasta estudiantil mensual de víveres.","Uso de residencia estudiantil preferente y carné libre."]'::jsonb, 92)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-29', 'Beca Pronabec Casos Especiales', 'PRONABEC', '100% Integral (Estudios y salud)', 'Población afectada por la violencia (REDEVID)', CURRENT_DATE + INTERVAL '70 days', 'Pregrado', 'local_hospital', 'Esta beca especial busca reparar brechas sociales financiando estudios superiores completos para jóvenes registrados como víctimas o familiares de las víctimas de la violencia social en el Perú.', '["Pago total de la pensión escolar y matrícula.","Estipendio mensual integral de manutención y libros.","Seguro médico integral cubierto por el SIS.","Mentorías de nivelación y desarrollo socioemocional."]'::jsonb, 83)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-30', 'Beca Corriente Alterna Arte Exterior', 'Escuela de Arte Corriente Alterna', '80% Cobertura en la carrera de Artes Visuales', 'Presentación de portafolio y entrevista personal', CURRENT_DATE + INTERVAL '26 days', 'Pregrado', 'palette', 'Escuela de arte líder del Perú financia la mayor parte de la carrera de Artes Visuales a jóvenes con gran visión expresiva, técnica y creatividad conceptual.', '["80% de descuento en pensiones mensuales de la carrera.","Acceso libre a laboratorios digitales, talleres de pintura y hornos de cerámica.","Exposición anual del portafolio del becario.","Tutoría de curadores de arte profesionales."]'::jsonb, 73)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-31', 'Beca Programa Líderes MUNI', 'Municipalidad Metropolitana de Lima', '50% Cobertura en institutos aliados de Lima', 'Residir en Lima Metropolitana, participar en talleres Muni', CURRENT_DATE + INTERVAL '13 days', 'Técnico', 'apartment', 'La Municipalidad de Lima incentiva la profesionalización técnica de jóvenes en distritos vulnerables otorgándoles media beca en reconocidos institutos locales.', '["50% de subvención en pensiones en Cibertec, Certus u otros institutos.","Exoneración del pago del examen de admisión.","Participación en la red juvenil de líderes municipales.","Talleres semanales gratuitos de empleabilidad."]'::jsonb, 81)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-32', 'Beca de Estímulo USMP', 'Universidad de San Martín de Porres', '25% al 50% de descuento en pensiones', 'Mantener promedio ponderado mayor o igual a 16', CURRENT_DATE + INTERVAL '44 days', 'Pregrado', 'rewarded_ads', 'Recompensa el esfuerzo de los estudiantes destacados de la USMP otorgándoles descuentos semestrales escalonados basados en sus altas calificaciones.', '["Descuento del 25% al 50% de pensión dependiendo del puesto en el cuadro de honor.","Acceso libre a la red de bibliotecas virtuales académicas.","Exoneración de aranceles de carné universitario.","Pre-calificación directa para bolsas de intercambio estudiantil."]'::jsonb, 78)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-33', 'Beca Convenio Andrés Bello', 'Ministerio de Educación', 'Exoneración de costos académicos de ingreso', 'Estudiantes procedentes de países del convenio', CURRENT_DATE + INTERVAL '85 days', 'Pregrado', 'language', 'Promueve la integración educativa y científica entre los países andinos firmantes del convenio, exonerando de costos académicos de postulación e ingreso.', '["Exoneración del pago de derechos de inscripción al examen.","Exoneración de tasas de matrícula inicial.","Reconocimiento y convalidación simplificada de certificados escolares.","Servicio médico básico cubierto en el campus."]'::jsonb, 70)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-34', 'Beca Talento Femenino en Tecnología', 'Laboratoria / Alianzas Corporativas', '100% Cobertura del bootcamp de programación', 'Mujeres mayores de 18 años o cursando 5to de sec.', CURRENT_DATE + INTERVAL '31 days', 'Técnico', 'code', 'Laboratoria brinda educación tecnológica inmersiva de clase mundial a mujeres, preparándolas para una exitosa inserción laboral como programadoras web junior.', '["Bootcamp intensivo de programación y desarrollo de habilidades interpersonales cubierto al 100%.","Conexión directa con más de 1,000 empresas de tecnología contratantes.","Mentorías técnicas individuales por programadores seniors.","Modelo de pago diferido (no pagas si no consigues empleo)."]'::jsonb, 86)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)
VALUES ('BEC-35', 'Beca de Movilidad Nacional', 'Red Peruana de Universidades (RPU)', 'Financiamiento de pasajes y hospedaje por un ciclo', 'Pertenecer al tercio superior de una universidad RPU', CURRENT_DATE + INTERVAL '58 days', 'Pregrado', 'train', 'Facilita la experiencia de intercambio entre estudiantes universitarios dentro del país, permitiéndoles cursar un ciclo académico en otra región con financiamiento estatal.', '["Pasajes terrestres o aéreos nacionales de ida y vuelta.","Subsidio mensual para pago de hospedaje y alimentación.","Convalidación directa e integral de asignaturas al ciclo regular.","Uso de todas las instalaciones de la universidad de destino."]'::jsonb, 75)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,
  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;

-- =========================================================================
-- CHARLAS
-- =========================================================================
INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-01', 'Orientación Vocacional: Ciencia de Datos vs. Ingeniería', 'UTEC', 'Google Meet', 'Jueves 28, 16:00 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-02', 'Todo sobre la postulación a Beca 18 etapa selección', 'PRONABEC', 'Facebook Live', 'Mañana, 18:30 h', 'Recordatorio')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-03', 'Carreras del futuro con alta demanda laboral en el Perú', 'Ministerio de Trabajo', 'Zoom', 'Viernes 29, 15:00 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-04', 'Conoce los beneficios de la Beca Excelencia Académica BCP', 'Patronato BCP', 'YouTube', 'Sábado 30, 11:00 h', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-05', 'Guía paso a paso para el Examen de Admisión San Marcos', 'UNMSM', 'Presencial (Auditorio)', 'Lunes 01, 10:00 h', 'Reservar Asiento')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-06', 'Carreras de Diseño y Arte: Mercado laboral actual', 'Toulouse Lautrec', 'Zoom', 'Martes 02, 17:00 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-07', 'Cómo financiar tus estudios en la Universidad del Pacífico', 'Universidad del Pacífico', 'Google Meet', 'Miércoles 03, 16:00 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-08', 'Estudiar y trabajar: Conoce las carreras técnicas de SENATI', 'SENATI', 'Presencial (Sede Independencia)', 'Jueves 04, 09:00 h', 'Reservar Asiento')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-09', 'Mitos y verdades sobre la carrera de Medicina Humana', 'UPCH', 'Zoom', 'Viernes 05, 18:00 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-10', 'Introducción a las carreras de Gestión y Alta Dirección', 'PUCP', 'Google Meet', 'Sábado 06, 15:00 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-11', 'Oportunidades de becas parciales para universidades privadas', 'Municipalidad de Ate', 'Presencial (Palacio Municipal)', 'Lunes 08, 11:00 h', 'Reservar Asiento')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-12', 'Requisitos y beneficios de las becas del Británico', 'Asociación Peruano Británica', 'Zoom', 'Martes 09, 16:30 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-13', 'Charla Vocacional: ¿Por qué estudiar Ingeniería Civil?', 'UNI', 'YouTube', 'Miércoles 10, 15:00 h', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-14', 'Todo sobre la acreditación de idiomas ante el PRONABEC', 'ICPNA', 'Google Meet', 'Jueves 11, 17:00 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-15', 'Beneficios de estudiar una carrera técnica de alta tecnología', 'TECSUP', 'Zoom', 'Viernes 12, 16:00 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-16', 'Cómo redactar el perfil personal para la postulación universitaria', 'Universidad de Lima', 'Google Meet', 'Sábado 13, 10:30 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-17', 'Carreras STEM: Oportunidades para mujeres en tecnología', 'Red de Científicas Peruanas', 'Zoom', 'Lunes 15, 18:00 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-18', 'Conoce el campus y laboratorios de la Universidad de Piura', 'UDEP', 'Presencial (Sede Miraflores)', 'Martes 16, 14:30 h', 'Reservar Asiento')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-19', 'Consejos psicológicos para manejar la ansiedad del examen', 'Centro de Salud Mental Minsa', 'Zoom', 'Miércoles 17, 17:00 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-20', 'Charla Informativa: Beca Hijos de Docentes convocatoria actual', 'PRONABEC', 'Microsoft Teams', 'Jueves 18, 15:30 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-21', 'Emprendimiento e Innovación desde las aulas universitarias', 'Universidad San Ignacio de Loyola', 'Google Meet', 'Viernes 19, 16:00 h', 'Separar Cupo')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-22', 'Convenios internacionales y programas de doble titulación', 'UPC', 'Zoom', 'Sábado 20, 11:00 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-23', 'Estudiar Agronomía y Ciencias Forestales en el Perú', 'UNALM', 'YouTube', 'Lunes 22, 12:00 h', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-24', 'Charlas de becas de estudios en Europa (Erasmus+)', 'Delegación de la Unión Europea', 'Presencial (San Isidro)', 'Martes 23, 10:00 h', 'Reservar Asiento')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)
VALUES ('CHA-25', 'Cómo postular con éxito a las becas de la Municipalidad de Lima', 'MUNI LIMA', 'Google Meet', 'Miércoles 24, 15:00 h', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;

-- =========================================================================
-- TALLERES
-- =========================================================================
INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-01', 'Cómo armar tu ensayo de motivación para Beca 18', 'Pathfinder', 'Hoy, 17:00 h', 'Redacción y estructura de cartas', 'Unirse al Taller')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-02', 'Simulación de entrevista personal del Patronato BCP', 'Asesores Universitarios', 'Sábado, 10:00 h', 'Práctica de oratoria y preguntas clave', 'Separar Vacante')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-03', 'Llenado correcto de la ficha socioeconómica SISFOH', 'Municipalidad de Ate', 'Mañana, 15:00 h', 'Trámite documentario presencial', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-04', 'Uso de la plataforma digital Minedu para certificados', 'Especialistas TIC', 'Jueves, 16:00 h', 'Descarga de documentos firmados', 'Unirse al Taller')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-05', 'Taller de Razonamiento Matemático para Admisión', 'Academia Aduni', 'Interdiario, 08:00 h', 'Resolución de problemas tipo examen', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-06', 'Comprensión lectora y análisis de textos académicos', 'Cepre-PUCP', 'Sábados, 09:00 h', 'Estrategias para pruebas de aptitud', 'Separar Vacante')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-07', 'Formulación de currículum vitae básico para escolares', 'Ministerio de Trabajo', 'Martes, 14:00 h', 'Estructuración de logros académicos', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-08', 'Preparación de portafolio para carreras de Arquitectura', 'Facultad de Arquitectura UNI', 'Miércoles, 17:00 h', 'Selección y presentación de dibujos', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-09', 'Taller de ensayos argumentativos en inglés para becas', 'ICPNA', 'Jueves, 18:00 h', 'Estructura formal de redacción', 'Separar Vacante')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-10', 'Cómo solicitar cartas de recomendación efectivas', 'Orientadores Educativos', 'Viernes, 15:30 h', 'Plantillas de comunicación con directores', 'Unirse al Taller')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-11', 'Finanzas personales básicas para futuros universitarios', 'Fundación Romero', 'Curso grabado', 'Gestión de estipendios y presupuestos', 'Iniciar Clase')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-12', 'Introducción al Pensamiento Lógico y Algorítmico', 'UTEC', 'Sábado, 14:00 h', 'Fundamento para ingenierías', 'Separar Vacante')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-13', 'Taller práctico de física: Cinemática y Dinámica', 'Academia Vallejo', 'Lunes, 16:00 h', 'Ejercicios avanzados para ingeniería', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-14', 'Técnicas de estudio eficientes y mapas mentales', 'Centro Psicopedagógico', 'Martes, 17:00 h', 'Optimización del tiempo de aprendizaje', 'Unirse al Taller')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-15', 'Búsqueda avanzada de fuentes confiables de información', 'Biblioteca Nacional', 'Miércoles, 11:00 h', 'Uso de Google Académico y repositorios', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-16', 'Taller práctico de química: Estequiometría paso a paso', 'Cepre-UNMSM', 'Jueves, 15:00 h', 'Problemas de nivel de admisión', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-17', 'Herramientas de Excel básico para control de proyectos', 'Fundación Telefónica', 'Curso grabado', 'Creación de tablas y uso de fórmulas', 'Iniciar Clase')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-18', 'Expresión corporal y manejo de nervios en público', 'Escuela de Teatro de Lima', 'Viernes, 16:30 h', 'Control de lenguaje corporal en jurados', 'Separar Vacante')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-19', 'Cómo legalizar y apostillar documentos educativos', 'Relaciones Exteriores', 'Sábado, 12:00 h', 'Trámite para becas internacionales', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-20', 'Taller de Razonamiento Verbal: Analogías y Precisión', 'Centro Pre UNI', 'Lunes, 14:00 h', 'Métodos de descarte en opciones múltiples', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-21', 'Creación de portafolios digitales en Behance y Notion', 'Toulouse Lautrec', 'Martes, 18:00 h', 'Organización de proyectos visuales', 'Separar Vacante')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-22', 'Llenado del formulario electrónico de PRONABEC', 'Asesoría Pathfinder', 'Miércoles, 16:00 h', 'Revisión de casillas del SIBEC', 'Unirse al Taller')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-23', 'Taller de Historia del Perú: Temas clave de examen', 'Historiadores UNMSM', 'Jueves, 17:00 h', 'Resumen analítico de la República', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-24', 'Fundamentos de diseño gráfico básico con Canva', 'Municipalidad de Lima', 'Viernes, 15:00 h', 'Presentación de proyectos escolares', 'Ver detalles')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)
VALUES ('TAL-25', 'Taller de Geometría y Trigonometría del examen de admisión', 'Profesores UNI', 'Sábado, 08:30 h', 'Resolución de triángulos y sólidos', 'Inscribirme')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;

-- =========================================================================
-- CURSOS / CAPACITACIONES
-- =========================================================================
INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-01', 'Fundamentos de Programación Web Front-End', 'Laboratorio de Software UTEC', '6 semanas', 'Estudiante de 5to de secundaria o egresado', 'Cierra en 10 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-02', 'Inglés Técnico Acelerado para Ciencias', 'Centro de Idiomas UNI', '4 semanas', 'Conocimiento básico de inglés elemental', 'Inscripciones abiertas')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-03', 'Introducción al Diseño Digital y Modelado 3D', 'SENATI', '8 semanas', 'Acceso a computadora con Windows 10', 'Cierra en 5 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-04', 'Habilidades Digitales para Entornos Universitarios', 'Fundación Telefónica', '3 semanas', 'Sin requisitos previos (100% online)', 'Curso permanente')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-05', 'Liderazgo y Trabajo en Equipo en el Siglo XXI', 'Campus Romero', '2 semanas', 'Cuenta de correo electrónico activa', 'Curso permanente')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-06', 'Redacción Académica y Normas APA', 'Biblioteca PUCP', '3 semanas', 'Cursando el último año de secundaria', 'Cierra en 12 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-07', 'Fundamentos de Analítica de Datos con Python', 'Tecsup', '4 semanas', 'Conocimientos básicos de álgebra escolar', 'Inscripciones abiertas')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-08', 'Introducción al Marketing Digital y Redes Sociales', 'Municipalidad de Lima', '5 semanas', 'Residir en Lima Metropolitana, mayor de 15 años', 'Cierra en 3 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-09', 'Principios de Contabilidad para Microempresas', 'Cámara de Comercio de Lima', '4 semanas', 'Manejo básico de operaciones matemáticas', 'Cierra en 15 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-10', 'Gestión de Proyectos Escolares con Metodologías Ágiles', 'Innova Schools (Abierto)', '3 semanas', 'Estudiantes de secundaria de cualquier red', 'Inscripciones abiertas')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-11', 'Programación Básica de Videojuegos en Scratch', 'Instituto de Informática San Marcos', '6 semanas', 'No requiere experiencia previa en código', 'Cierra en 8 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-12', 'Introducción a la Biología Celular y Ciencias de la Salud', 'Cepre Cayetano Heredia', '4 semanas', 'Estudiantes orientados a carreras médicas', 'Cierra en 20 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-13', 'Oratoria Líder: Comunicación de Impacto', 'Escuela de Oratoria de Lima', '4 semanas', 'Disponibilidad para sesiones los sábados', 'Inscripciones abiertas')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-14', 'Fundamentos de Redes y Conectividad (CCNA Básico)', 'CISCO Networking Academy Perú', '8 semanas', 'Acceso a internet y computadora de escritorio', 'Cierra en 14 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;

INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)
VALUES ('CUR-15', 'Introducción a la Economía y Realidad Nacional', 'Universidad del Pacífico', '3 semanas', 'Haber aprobado el curso escolar de Ciencias Sociales', 'Cierra en 18 días')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;
