import { supabase } from "../lib/supabaseClient";
import type {
  PostulacionRow,
  PostulacionConBeca,
  DocumentoRow,
  DocumentoRequerido,
  PipelineStep,
} from "../lib/types";

// ---------------------------------------------------------------------------
// Mock detection
// ---------------------------------------------------------------------------

function isMockMode(): boolean {
  return (import.meta.env.VITE_SUPABASE_URL || "").includes("placeholder");
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_POSTULACIONES: PostulacionRow[] = [
  {
    id: "mock-post-1",
    usuario_id: "mock-user",
    beca_id: "BEC-01",
    paso_pipeline: 2,
    estado_general: "Enviada",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "mock-post-2",
    usuario_id: "mock-user",
    beca_id: "BEC-03",
    paso_pipeline: 1,
    estado_general: "Preparación",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const MOCK_BECAS_RECORD: Record<
  string,
  {
    titulo: string;
    sponsor: string;
    afinidad: number;
    fecha_cierre: string;
    documentos_requeridos: DocumentoRequerido[];
  }
> = {
  "BEC-01": {
    titulo: "Beca 18 — 2025",
    sponsor: "PRONABEC",
    afinidad: 89,
    fecha_cierre: new Date(Date.now() + 22 * 86400000).toISOString(),
    documentos_requeridos: [
      { id: 1, name: "DNI Postulante", description: "Copia legible.", es_requerido: true, category: "Identidad", documentIcon: "badge" },
      { id: 2, name: "Certificado de Estudios", description: "1ero a 5to.", es_requerido: true, category: "Académico", documentIcon: "school" },
      { id: 3, name: "Ficha SISFOH", description: "Vigente.", es_requerido: true, category: "Socioeconómico", documentIcon: "account_balance" },
    ],
  },
  "BEC-03": {
    titulo: "Beca Hijos de Docentes",
    sponsor: "PRONABEC",
    afinidad: 72,
    fecha_cierre: new Date(Date.now() + 45 * 86400000).toISOString(),
    documentos_requeridos: [
      { id: 1, name: "DNI Postulante", description: "Copia legible.", es_requerido: true, category: "Identidad", documentIcon: "badge" },
      { id: 2, name: "Partida de Nacimiento", description: "Original o copia.", es_requerido: true, category: "Identidad", documentIcon: "badge" },
    ],
  },
};

const MOCK_DOCS_RECORD: Record<string, DocumentoRow[]> = {
  "mock-post-1": [
    { id: "md-1", postulacion_id: "mock-post-1", nombre_documento: "DNI Postulante", estado: "Validado", archivo_url: null, texto_ayuda: null, created_at: new Date().toISOString() },
    { id: "md-2", postulacion_id: "mock-post-1", nombre_documento: "Certificado de Estudios", estado: "En Revisión", archivo_url: null, texto_ayuda: null, created_at: new Date().toISOString() },
    { id: "md-3", postulacion_id: "mock-post-1", nombre_documento: "Ficha SISFOH", estado: "Rechazado", archivo_url: null, texto_ayuda: "El formato no es PDF", created_at: new Date().toISOString() },
  ],
  "mock-post-2": [],
};

const TIPS: string[] = [
  "Recuerda que los PDFs para PRONABEC no deben superar los 2MB de peso.",
  "Verifica que tu Ficha SISFOH esté vigente antes de postular.",
  "La carta de motivación es clave: sé auténtico y específico.",
  "Revisa las fechas de cierre: muchas becas cierran en enero y julio.",
  "Si tienes didas sobre los requisitos, consulta con Motibot.",
  "Mantén tus documentos organizados en carpetas por categoría.",
  "El promedio ponderado mínimo suele ser 14 para la mayoría de becas.",
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getPostulacionesConBeca(
  usuarioId: string,
): Promise<PostulacionConBeca[]> {
  if (isMockMode()) {
    return MOCK_POSTULACIONES.filter((p) => p.usuario_id === usuarioId)
      .map((p) => {
        const beca = MOCK_BECAS_RECORD[p.beca_id];
        if (!beca) return null;
        return {
          postulacion: p,
          beca_titulo: beca.titulo,
          beca_sponsor: beca.sponsor,
          beca_afinidad: beca.afinidad,
          beca_fecha_cierre: beca.fecha_cierre,
          documentos_requeridos: beca.documentos_requeridos,
        };
      })
      .filter(Boolean) as PostulacionConBeca[];
  }

  const { data: posts, error } = await supabase
    .from("postulaciones")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false });

  if (error || !posts) {
    console.warn("[Postulaciones] Error:", error?.message);
    return [];
  }

  const becaIds = [...new Set(posts.map((p: PostulacionRow) => p.beca_id))];

  const { data: becas } = await supabase
    .from("becas")
    .select("id, titulo, sponsor, afinidad, fecha_cierre, documentos_requeridos")
    .in("id", becaIds);

  const becaMap = new Map(
    (becas ?? []).map((b: Record<string, unknown>) => [b.id, b]),
  );

  return (posts as PostulacionRow[])
    .map((p) => {
      const b = becaMap.get(p.beca_id) as Record<string, unknown> | undefined;
      if (!b) return null;
      return {
        postulacion: p,
        beca_titulo: (b.titulo as string) || p.beca_id,
        beca_sponsor: (b.sponsor as string) || "",
        beca_afinidad: (b.afinidad as number) || 0,
        beca_fecha_cierre: (b.fecha_cierre as string) || "",
        documentos_requeridos: (b.documentos_requeridos as DocumentoRequerido[]) || [],
      };
    })
    .filter(Boolean) as PostulacionConBeca[];
}

export async function getDocumentosForPostulacion(
  postulacionId: string,
): Promise<DocumentoRow[]> {
  if (isMockMode()) {
    return MOCK_DOCS_RECORD[postulacionId] ?? [];
  }

  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("postulacion_id", postulacionId);

  if (error) {
    console.warn("[Postulaciones] Docs error:", error.message);
    return [];
  }
  return (data ?? []) as DocumentoRow[];
}

export function getPipelineSteps(paso: number): PipelineStep[] {
  const steps: { label: string; icon: string }[] = [
    { label: "Preparación", icon: "edit_document" },
    { label: "Enviada", icon: "send" },
    { label: "Evaluación", icon: "fact_check" },
    { label: "Resultados", icon: "emoji_events" },
  ];

  return steps.map((s, idx) => {
    const stepNum = idx + 1;
    let status: PipelineStep["status"] = "pending";
    if (paso > stepNum) status = "completed";
    else if (paso === stepNum) status = "active";
    return { ...s, status };
  });
}

export function computeDocumentMissions(
  documentos: DocumentoRow[],
  requeridos: DocumentoRequerido[],
): { variant: "success" | "warning" | "danger"; icon: string; title: string; statusLabel: string }[] {
  return requeridos.map((req) => {
    const doc = documentos.find(
      (d) => d.nombre_documento.toLowerCase() === req.name.toLowerCase(),
    );
    if (!doc) {
      return {
        variant: "danger" as const,
        icon: "cancel",
        title: req.name,
        statusLabel: "Faltante",
      };
    }
    const est = doc.estado.toLowerCase();
    if (est === "validado" || est === "listo" || est === "aprobado") {
      return {
        variant: "success" as const,
        icon: "check_circle",
        title: doc.nombre_documento,
        statusLabel: "Aprobado",
      };
    }
    if (est === "rechazado") {
      return {
        variant: "danger" as const,
        icon: "cancel",
        title: doc.nombre_documento,
        statusLabel: "Rechazado",
      };
    }
    return {
      variant: "warning" as const,
      icon: "schedule",
      title: doc.nombre_documento,
      statusLabel: "En revisión",
    };
  });
}

export function computeCriticalDates(fechaCierre: string) {
  const cierre = new Date(fechaCierre);
  if (Number.isNaN(cierre.getTime())) {
    return { milestones: [], alertText: "" };
  }

  const now = Date.now();
  const diff = cierre.getTime() - now;

  const milestones: { date: string; title: string; completed: boolean; isCurrent: boolean }[] = [
    {
      date: formatDate(new Date(now + diff * 0.8)),
      title: "Revisión Docs",
      completed: diff < 0,
      isCurrent: diff > 0 && diff < diff * 0.3,
    },
    {
      date: formatDate(new Date(now + diff * 0.5)),
      title: "Entrevista",
      completed: diff < 0,
      isCurrent: diff > 0 && diff >= diff * 0.3 && diff < diff * 0.6,
    },
    {
      date: formatDate(cierre),
      title: "Resultados",
      completed: diff < 0,
      isCurrent: diff > 0 && diff >= diff * 0.6,
    },
  ];

  const daysLeft = Math.ceil((cierre.getTime() - now) / 86400000);
  const alertText =
    daysLeft <= 10
      ? `⚠️ Faltan ${daysLeft} días para el cierre.`
      : `Próximo hito: ${milestones[1]?.title ?? "Entrevista"}`;

  return { milestones, alertText };
}

export function getRandomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}

export function formatDate(date: Date): string {
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${date.getDate()} ${meses[date.getMonth()]}`;
}
