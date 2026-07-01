export interface Beca {
  id: string;
  title: string;
  sponsor: string;
  coverage: string;
  requirement: string;
  deadline: string;
  level: "Pregrado" | "Idioma" | "Maestría" | "Técnico";
  affinity: number;
  icon: string;
  sobre: string;
  beneficios: string[];
  // Criterios de la beca — vienen del RPC calcular_recomendaciones_becas
  reqNotaMinima?: number | null;
  reqSisfoh?: string | null;
  reqMerito?: string | null;
  reqTipoColegio?: string | null;
  requiereMujeres?: boolean;
  priorizaVoluntariado?: boolean;
  priorizaDeportista?: boolean;
}

export type Oportunidad = Beca;

export interface Charla {
  id: string;
  title: string;
  sponsor: string;
  modality: string;
  dateTime: string;
  actionText: string;
}

export interface Taller {
  id: string;
  title: string;
  sponsor: string;
  statusFrequency: string;
  focus: string;
  actionText: string;
}

export interface Curso {
  id: string;
  title: string;
  sponsor: string;
  duration: string;
  requirement: string;
  status: string;
}

export interface PostulacionRow {
  id: string;
  usuario_id: string;
  beca_id: string;
  paso_pipeline: number;
  estado_general: string;
  created_at: string;
}

export interface DocumentoRow {
  id: string;
  postulacion_id: string;
  nombre_documento: string;
  estado: string;
  archivo_url: string | null;
  texto_ayuda: string | null;
  created_at: string;
}

export interface DocumentoRequerido {
  id: number;
  name: string;
  description: string;
  es_requerido: boolean;
  category: string;
  documentIcon: string;
}

export interface DocumentoDisplay {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: "validado" | "pendiente" | "rechazado" | "faltante";
  archivo_url: string | null;
  icon: string;
  es_requerido: boolean;
}

export interface PipelineStep {
  label: string;
  icon: string;
  status: "completed" | "active" | "pending";
}

export interface PostulacionConBeca {
  postulacion: PostulacionRow;
  beca_titulo: string;
  beca_sponsor: string;
  beca_afinidad: number;
  beca_fecha_cierre: string;
  documentos_requeridos: DocumentoRequerido[];
}

export interface CursoRow {
  id: string;
  titulo: string;
  sponsor: string;
  duracion: string | null;
  requisitos: string | null;
  estado: string | null;
}

export interface PerfilData {
  nivelPerfil: number;
  nombres: string;
  dni: string;
  correo: string;
  // Sección A — nuevos
  fechaNacimiento?: string;
  genero?: string;
  // Sección B
  tipoColegio: string;
  anoEgreso?: string;
  meritoAcademico?: string;   // 'quinto' | 'tercio' | 'medio'
  areaInteres?: string;
  // Sección C
  sisfoh: string;
  sisfohFechaVencimiento?: string;
  departamento: string;
  provincia: string;
  distrito: string;
  condiciones: Record<string, boolean>;
  tieneConadis?: boolean;
  hijoDocente?: boolean;
  // Sección D
  haceVoluntariado?: boolean;
  esDeportista?: boolean;
  tieneLiderazgo?: boolean;
  tieneEmprendimiento?: boolean;
  // General
  institucionActual: string;
  notas: {
    año3: number;
    año4: number;
    año5: number;
  };
  idiomas: {
    nivelIngles: string;
    instituto: string;
    certificacionOficial?: boolean;
  };
  aceptaPrivacidad?: boolean;
}
