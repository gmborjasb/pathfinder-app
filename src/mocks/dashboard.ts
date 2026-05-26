export const pipelineSteps = [
  { id: 1, label: "Beca Elegida", icon: "check", status: "completed" },
  { id: 2, label: "Papeles Listos", icon: "description", status: "current" },
  { id: 3, label: "Postulación Enviada", icon: "send", status: "pending" },
  { id: 4, label: "En Evaluación", icon: "rule", status: "pending" },
];

export const documents = [
  {
    id: 1,
    name: "Certificado de Estudios Digital",
    origin: "Trámite Minedu",
    status: "valid",
    statusText: "Ver archivo_firmado.pdf",
    actionType: "download",
  },
  {
    id: 2,
    name: "Constancia de Primeros Puestos",
    origin: "Colegio Secundario",
    status: "valid",
    statusText: "Ver constancia_director.pdf",
    actionType: "download",
  },
  {
    id: 3,
    name: "Declaración Jurada de Ingresos",
    origin: "Formato Pronabec",
    status: "warning",
    statusText: "Falta firmar por tus padres",
    actionType: "upload_signature",
  },
  {
    id: 4,
    name: "Certificado de Inglés",
    origin: "Británico / ICPNA",
    status: "error",
    statusText: "Pendiente de subir",
    actionType: "upload_certificate",
  },
];

export const talks = [
  {
    id: 1,
    title: "Taller: Cómo armar tu ensayo para Beca 18",
    type: "live",
    date: "Hoy, 5:00 PM",
    badgeLabel: "HOY / EN VIVO",
    icon: "videocam",
    timeIcon: "schedule",
    buttonText: "Unirse al Taller",
    buttonIcon: "play_circle",
  },
  {
    id: 2,
    title: "Charla Vocacional: ¿Ciencia de Datos o Ingeniería?",
    type: "scheduled",
    date: "Jueves 28, 4:00 PM",
    badgeLabel: "PRÓXIMO / AGENDADO",
    icon: "explore",
    timeIcon: "calendar_today",
    buttonText: "Separar Cupo",
    buttonIcon: "event_available",
  },
];

export const matches = [
  {
    id: 1,
    name: "Beca Mujeres en Ciencia",
    matchPercentage: 95,
    coverage: "100%",
    requirementIcon: "school",
    requirementLabel: "Promedio >= 15",
  },
  {
    id: 2,
    name: "Beca Talento PUCP",
    matchPercentage: 78,
    coverage: "80%",
    requirementIcon: "school",
    requirementLabel: "Ranking: Tercio",
  },
  {
    id: 3,
    name: "Líderes del Futuro",
    matchPercentage: 62,
    coverage: "50%",
    requirementIcon: "group",
    requirementLabel: "Liderazgo: Requerido",
  },
];
