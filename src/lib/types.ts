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
  tipoColegio: string;
  sisfoh: string;
  departamento: string;
  provincia: string;
  distrito: string;
  condiciones: Record<string, boolean>;
  institucionActual: string;
  notas: {
    año3: number;
    año4: number;
    año5: number;
  };
  idiomas: {
    nivelIngles: string;
    instituto: string;
  };
}
