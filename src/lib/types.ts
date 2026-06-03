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
