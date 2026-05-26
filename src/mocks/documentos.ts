export const progressData = {
  percentage: 65,
  processed: 13,
  total: 20,
};

export const alertBox = {
  message: "Atención inmediata",
  description:
    "Tienes un documento rechazado que requiere tu acción para no perder elegibilidad.",
};

export const categories = [
  {
    title: "Identidad",
    icon: "badge",
    hasError: false,
    items: [
      { name: "DNI Postulante", status: "LISTO" },
      { name: "DNI Apoderado", status: "PENDIENTE" },
    ],
  },
  {
    title: "Académicos",
    icon: "school",
    hasError: true,
    items: [
      { name: "Certificado de Estudios", status: "Reemplazar" },
      { name: "Constancia Tercio", status: "LISTO" },
    ],
  },
  {
    title: "Socioeconómicos",
    icon: "account_balance",
    hasError: false,
    items: [
      { name: "Ficha SISFOH", status: "PENDIENTE" },
      { name: "Decl. Juradas", status: "PENDIENTE" },
    ],
  },
];

export const detailedDocuments = [
  {
    id: 1,
    name: "DNI Postulante",
    fileText: "PDF • 1.2 MB",
    documentIcon: "description",
    documentIconColor: "text-muted-slate",
    description: "Copia legible por ambos lados.",
    status: {
      estado: "Validado",
      color: "text-tertiary",
      icon: "check_circle",
      badgeClass: "",
    },
    actionType: "options", // Use actions menu
  },
  {
    id: 2,
    name: "Certificado de Estudios",
    fileText: "Firma no visible",
    fileTextColor: "text-error",
    documentIcon: "warning",
    documentIconColor: "text-error",
    description: "Certificado oficial de 1ero a 5to de secundaria.",
    status: {
      estado: "Rechazado",
      badgeClass:
        "bg-error-container text-on-error-container font-body-bold text-[12px] rounded",
    },
    actionType: "button",
    actionText: "Reemplazar",
    actionClass:
      "bg-primary-container text-white px-4 py-2 rounded-xl text-body-sm font-body-bold hover:opacity-90 transition-opacity",
  },
  {
    id: 3,
    name: "Ficha SISFOH",
    fileText: "Requerido para socioeconómico",
    documentIcon: "upload_file",
    documentIconColor: "text-muted-slate",
    description: "Documento de clasificación socioeconómica vigente.",
    status: {
      estado: "Pendiente",
      badgeClass:
        "bg-surface-container text-on-surface-variant font-body-bold text-[12px] rounded",
    },
    actionType: "button",
    actionText: "Subir",
    actionClass:
      "border border-border-subtle text-on-surface-variant px-4 py-2 rounded-xl text-body-sm font-body-bold hover:bg-surface-container-low transition-colors",
  },
];
