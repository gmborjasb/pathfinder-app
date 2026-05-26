export const summaryStats = {
  enPreparacion: 2,
  enviadas: 1,
  cerradas: 0,
};

export const activeApplication = {
  title: "Beca 18 - Convocatoria 2026",
  organization: "Programa Nacional de Becas y Crédito Educativo (PRONABEC)",
  logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBciyI5Ku20i-WnPGAf07a_idMcYQLzPoJp2j83Zwh7D4z_HoU5bzeGgM23CIRG4rSr5jrIXY2DrCUOtwBuluHxVq71dPWcCD7FVGDBEhrF7YYZQxKcayhoYsDQB7DjTyporzoh_C44EDm4j5yiGX56jt3iwurpzkJCrNR1lVCnjftya1ke21_4pmSZSdVqo2IKiW5TORKuJXJnqp-rG-0IwO6ausK-qWaFpeQ2tpxDyZXGebUtyItif1plmh-oQl_RKwNJQsRsXw",
  affinity: 95,
  milestoneAlert: {
    title: "Próximo hito:",
    event: "Examen Nacional del Pronabec",
    date: "Domingo 14 de Junio",
  },
  pipeline: [
    { label: "Preparación", status: "completed", icon: "check" },
    { label: "Enviada", status: "completed", icon: "check" },
    { label: "Evaluación", status: "active", icon: "hourglass_empty" },
    { label: "Resultados", status: "pending", icon: "flag" },
  ],
  recommendedTasks: [
    {
      title: "Ver Temarios del Examen",
      icon: "description",
      url: "#",
    },
    {
      title: "Simulacro de Aptitud Académica",
      icon: "quiz",
      url: "#",
    },
  ],
  iaBanner: {
    badge: "IA Ready",
    title: "Asesor de Postulación",
    description:
      "He analizado tu perfil y los exámenes pasados. ¿Quieres practicar las secciones de Razonamiento Lógico?",
    buttonText: "Practicar con IA",
  },
};

export const historyConvocatorias = [
  {
    program: "Beca Continuidad 2024",
    statusBadge: "No Seleccionado",
    statusVariant: "error", // to map classes in component
    date: "Nov 2024",
    actionText: "Ver Feedback",
  },
  {
    program: "Beca OEA - Digital Transformation",
    statusBadge: "Culminado",
    statusVariant: "success", // to map classes in component
    date: "Ago 2024",
    actionText: "Certificado",
  },
];

export const criticalDates = [
  {
    month: "May",
    day: "20",
    title: "Cierre de Inscripción",
    subtitle: "Beca Mujeres en Ciencia",
    timeLeftInfo: "Faltan 2 días",
    timeLeftIcon: "timer",
    active: false,
    past: false,
  },
  {
    month: "Jun",
    day: "14",
    title: "Examen Nacional",
    subtitle: "Beca 18 (Convocatoria 2026)",
    priorityInfo: "Tu prioridad #1",
    priorityIcon: "stars",
    active: true,
    past: false,
  },
  {
    month: "Jul",
    day: "02",
    title: "Entrevista Personal",
    subtitle: "Líderes del Futuro",
    active: false,
    past: false,
  },
];
