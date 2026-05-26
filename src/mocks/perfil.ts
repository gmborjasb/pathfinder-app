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

export const mockPerfil: PerfilData = {
  nivelPerfil: 65,
  nombres: "Camila Fernanda López Ruiz",
  dni: "72345678",
  correo: "camila.lopez@estudiante.edu.pe",
  tipoColegio: "Público",
  sisfoh: "No Pobre",
  departamento: "Lima",
  provincia: "Lima",
  distrito: "Miraflores",
  condiciones: {
    vraem: false,
    nativa: false,
    licenciado: false,
    redeped: false,
  },
  institucionActual: "I.E. Mercedes Cabello de Carbonera",
  notas: {
    año3: 18.5,
    año4: 19.2,
    año5: 17.0,
  },
  idiomas: {
    nivelIngles: "Ninguno",
    instituto: "",
  },
};
