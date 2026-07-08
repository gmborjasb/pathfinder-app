import { supabase } from "../lib/supabaseClient";
import type {
  PostulacionRow,
  DocumentoRow,
  DocumentoRequerido,
  DocumentoDisplay,
  CursoRow,
} from "../lib/types";

const STORAGE_BUCKET = "expedientes";
const UPLOADED_KEY = "pathfinder_uploaded_docs";
const ENROLLED_KEY = "pathfinder_enrolled_courses";
const ACTIVE_META_KEY = "pathfinder_active_meta";

// ---------------------------------------------------------------------------
// Mock detection
// ---------------------------------------------------------------------------

function isMockMode(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  return url.includes("placeholder");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Postulaciones
// ---------------------------------------------------------------------------

const MOCK_POSTULACIONES: PostulacionRow[] = [
  {
    id: "mock-post-1",
    usuario_id: "mock-user",
    beca_id: "BEC-01",
    paso_pipeline: 1,
    estado_general: "Preparación",
    created_at: new Date().toISOString(),
  },
];

export async function getPostulaciones(
  usuarioId: string,
): Promise<PostulacionRow[]> {
  if (isMockMode()) {
    return MOCK_POSTULACIONES.map((p) => ({ ...p, usuario_id: usuarioId }));
  }

  const { data, error } = await supabase
    .from("postulaciones")
    .select("*")
    .eq("usuario_id", usuarioId);

  if (error) {
    console.warn("[Documentos] Error fetching postulaciones:", error.message);
    return [];
  }
  return (data ?? []) as PostulacionRow[];
}

const MOCK_BECAS_RECORD: Record<string, { titulo: string; sponsor: string; afinidad: number; fecha_cierre: string; documentos_requeridos: DocumentoRequerido[] }> = {
  "BEC-01": {
    titulo: "Beca 18 - Objetivo",
    sponsor: "PRONABEC",
    afinidad: 89,
    fecha_cierre: new Date(Date.now() + 22 * 86400000).toISOString(),
    documentos_requeridos: [
      { id: 1, name: "DNI Postulante", description: "Copia legible por ambos lados.", es_requerido: true, category: "Identidad", documentIcon: "badge" },
      { id: 2, name: "Certificado de Estudios", description: "Certificado oficial de 1ero a 5to.", es_requerido: true, category: "Académico", documentIcon: "school" },
      { id: 3, name: "Ficha SISFOH", description: "Clasificación socioeconómica vigente.", es_requerido: true, category: "Socioeconómico", documentIcon: "account_balance" },
      { id: 4, name: "Carta de Motivación", description: "Ensayo personal.", es_requerido: true, category: "Académico", documentIcon: "description" },
      { id: 5, name: "Constancia de Voluntariado", description: "Opcional pero valorado.", es_requerido: false, category: "Extracurricular", documentIcon: "volunteer_activism" },
    ],
  },
};

export async function getBecaInfo(becaId: string) {
  if (isMockMode()) {
    return MOCK_BECAS_RECORD[becaId] ?? null;
  }

  const { data, error } = await supabase
    .from("becas")
    .select("titulo, sponsor, afinidad, fecha_cierre, documentos_requeridos")
    .eq("id", becaId)
    .single();

  if (error) {
    console.warn("[Documentos] Error fetching beca:", error.message);
    return null;
  }
  return data as unknown as {
    titulo: string;
    sponsor: string;
    afinidad: number;
    fecha_cierre: string;
    documentos_requeridos: DocumentoRequerido[];
  };
}

// ---------------------------------------------------------------------------
// Documentos universales — siempre visibles sin importar la beca
// ---------------------------------------------------------------------------

const UNIVERSAL_DOCS: DocumentoRequerido[] = [
  {
    id: 9998,
    name: "Partida de Nacimiento",
    description: "Copia legalizada o fedateada emitida por RENIEC.",
    es_requerido: true,
    category: "Identidad",
    documentIcon: "badge",
  },
  {
    id: 9999,
    name: "Ficha de Notas Escolar",
    description: "Historial académico de 1ero a 5to de secundaria.",
    es_requerido: true,
    category: "Académico",
    documentIcon: "school",
  },
];

// ---------------------------------------------------------------------------
// Documentos — merge required + uploaded
// ---------------------------------------------------------------------------

interface UploadedDocRecord {
  id: string;
  postulacion_id: string;
  nombre_documento: string;
  archivo_url: string;
  uploadedAt: string;
}

function getUploadedDocsFallback(postulacionId: string): UploadedDocRecord[] {
  try {
    const raw = localStorage.getItem(UPLOADED_KEY);
    if (!raw) return [];
    const all: UploadedDocRecord[] = JSON.parse(raw);
    return all.filter((d) => d.postulacion_id === postulacionId);
  } catch {
    return [];
  }
}

function saveUploadedDocFallback(doc: UploadedDocRecord) {
  try {
    const raw = localStorage.getItem(UPLOADED_KEY);
    const all: UploadedDocRecord[] = raw ? JSON.parse(raw) : [];
    all.push(doc);
    localStorage.setItem(UPLOADED_KEY, JSON.stringify(all));
  } catch {
    /* no op */
  }
}

function deleteUploadedDocFallback(docId: string) {
  try {
    const raw = localStorage.getItem(UPLOADED_KEY);
    if (!raw) return;
    const all: UploadedDocRecord[] = JSON.parse(raw);
    localStorage.setItem(
      UPLOADED_KEY,
      JSON.stringify(all.filter((d) => d.id !== docId)),
    );
  } catch {
    /* no op */
  }
}

const MOCK_UPLOADED: Record<string, DocumentoRow[]> = {
  "mock-post-1": [
    {
      id: "mock-doc-1",
      postulacion_id: "mock-post-1",
      nombre_documento: "DNI Postulante",
      estado: "Validado",
      archivo_url: null,
      texto_ayuda: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-doc-2",
      postulacion_id: "mock-post-1",
      nombre_documento: "Certificado de Estudios",
      estado: "Validado",
      archivo_url: null,
      texto_ayuda: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-doc-3",
      postulacion_id: "mock-post-1",
      nombre_documento: "Carta de Motivación",
      estado: "Rechazado",
      archivo_url: null,
      texto_ayuda: "El formato no es PDF",
      created_at: new Date().toISOString(),
    },
  ],
};

async function getDocumentosFromDB(
  postulacionId: string,
): Promise<DocumentoRow[]> {
  if (isMockMode()) {
    return MOCK_UPLOADED[postulacionId] ?? [];
  }

  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("postulacion_id", postulacionId);

  if (error) {
    console.warn("[Documentos] Error fetching documentos:", error.message);
    return [];
  }
  return (data ?? []) as DocumentoRow[];
}

export async function getDocumentosDisplay(
  postulacionId: string,
  becaId: string,
): Promise<DocumentoDisplay[]> {
  const [beca, dbDocs] = await Promise.all([
    getBecaInfo(becaId),
    getDocumentosFromDB(postulacionId),
  ]);

  const fallbackDocs = getUploadedDocsFallback(postulacionId);
  const allUploaded = [
    ...dbDocs.map((d) => ({ nombre: d.nombre_documento, estado: d.estado, archivo_url: d.archivo_url, id: d.id })),
    ...fallbackDocs.map((d) => ({ nombre: d.nombre_documento, estado: "Validado" as const, archivo_url: d.archivo_url, id: d.id })),
  ];

  const becaReqs = beca?.documentos_requeridos ?? [];
  // Merge universales + beca, sin duplicar por nombre
  const knownNames = new Set<string>();
  const requeridos: DocumentoRequerido[] = [];
  for (const doc of [...UNIVERSAL_DOCS, ...becaReqs]) {
    if (!knownNames.has(doc.name.toLowerCase())) {
      knownNames.add(doc.name.toLowerCase());
      requeridos.push(doc);
    }
  }

  const matchedNames = new Set<string>();
  const result: DocumentoDisplay[] = requeridos.map((req) => {
    const uploaded = allUploaded.find(
      (u) => u.nombre.toLowerCase() === req.name.toLowerCase(),
    );

    if (uploaded) matchedNames.add(uploaded.nombre.toLowerCase());

    if (!uploaded) {
      return {
        id: `req-${req.id}`,
        nombre: req.name,
        descripcion: req.description,
        categoria: req.category,
        estado: "faltante" as const,
        archivo_url: null,
        icon: req.documentIcon,
        es_requerido: req.es_requerido,
      };
    }

    const status = uploaded.estado.toLowerCase();
    let estado: DocumentoDisplay["estado"] = "pendiente";
    if (status === "validado" || status === "listo" || status === "aprobado") {
      estado = "validado";
    } else if (status === "rechazado") {
      estado = "rechazado";
    }

    return {
      id: uploaded.id,
      nombre: req.name,
      descripcion: req.description,
      categoria: req.category,
      estado,
      archivo_url: uploaded.archivo_url,
      icon: req.documentIcon,
      es_requerido: req.es_requerido,
    };
  });

  // Append uploaded docs not matched to any required doc
  for (const uploaded of allUploaded) {
    if (!matchedNames.has(uploaded.nombre.toLowerCase())) {
      const status = uploaded.estado.toLowerCase();
      let estado: DocumentoDisplay["estado"] = "pendiente";
      if (status === "validado" || status === "listo" || status === "aprobado") {
        estado = "validado";
      } else if (status === "rechazado") {
        estado = "rechazado";
      }
      result.push({
        id: uploaded.id,
        nombre: uploaded.nombre,
        descripcion: "",
        categoria: "Otros",
        estado,
        archivo_url: uploaded.archivo_url,
        icon: "description",
        es_requerido: false,
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export async function uploadDocumento(
  postulacionId: string,
  nombreDocumento: string,
  file: File,
): Promise<boolean> {
  if (isMockMode()) {
    saveUploadedDocFallback({
      id: generateId(),
      postulacion_id: postulacionId,
      nombre_documento: nombreDocumento,
      archivo_url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    });
    return true;
  }

  try {
    // 1. Verificar si ya existe un documento previo para reemplazarlo
    const { data: existingDocs } = await supabase
      .from("documentos")
      .select("id, archivo_url")
      .eq("postulacion_id", postulacionId)
      .eq("nombre_documento", nombreDocumento);

    const existingDoc = existingDocs && existingDocs.length > 0 ? existingDocs[0] : null;

    // 2. Si existía, limpiar el archivo viejo del Storage
    if (existingDoc && existingDoc.archivo_url) {
      const oldPath = existingDoc.archivo_url.split(`${STORAGE_BUCKET}/`)[1];
      if (oldPath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
      }
    }

    // 3. Subir el nuevo archivo
    const filePath = `${postulacionId}/${generateId()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // 4. Actualizar o Insertar el registro en la base de datos
    if (existingDoc) {
      const { error: updateError } = await supabase
        .from("documentos")
        .update({
          estado: "En Revisión",
          archivo_url: urlData?.publicUrl ?? null,
          texto_ayuda: null, // Limpiamos el motivo de rechazo si lo hubiera
        })
        .eq("id", existingDoc.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("documentos").insert({
        postulacion_id: postulacionId,
        nombre_documento: nombreDocumento,
        estado: "En Revisión",
        archivo_url: urlData?.publicUrl ?? null,
      });

      if (insertError) throw insertError;
    }

    return true;
  } catch (err) {
    console.error("[Documentos] Upload error:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteDocumento(
  docId: string,
  archivoUrl: string | null,
): Promise<boolean> {
  if (isMockMode()) {
    deleteUploadedDocFallback(docId);
    return true;
  }

  try {
    if (archivoUrl) {
      const path = archivoUrl.split(`${STORAGE_BUCKET}/`)[1];
      if (path) {
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      }
    }

    const { error } = await supabase
      .from("documentos")
      .delete()
      .eq("id", docId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[Documentos] Delete error:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Cursos / Capacitaciones
// ---------------------------------------------------------------------------

const MOCK_CURSOS: CursoRow[] = [
  { id: "CUR-01", titulo: "Taller de Entrevistas", sponsor: "PRONABEC", duracion: "2h", requisitos: "Ninguno", estado: "Disponible" },
  { id: "CUR-02", titulo: "Redacción de Ensayos", sponsor: "PRONABEC", duracion: "4h", requisitos: "Ninguno", estado: "Disponible" },
  { id: "CUR-03", titulo: "Liderazgo Efectivo", sponsor: "PRONABEC", duracion: "1.5h", requisitos: "Ninguno", estado: "Disponible" },
  { id: "CUR-04", titulo: "Finanzas Personales", sponsor: "BCP", duracion: "3h", requisitos: "Mayor de 18", estado: "Disponible" },
  { id: "CUR-05", titulo: "Oratoria y Comunicación", sponsor: "USIL", duracion: "6h", requisitos: "Ninguno", estado: "Obtenido" },
];

export async function getCursos(): Promise<CursoRow[]> {
  if (isMockMode()) return MOCK_CURSOS;

  const { data, error } = await supabase
    .from("cursos_capacitacion")
    .select("*")
    .order("id");

  if (error) {
    console.warn("[Documentos] Error fetching cursos:", error.message);
    return [];
  }
  return (data ?? []) as CursoRow[];
}

export function getEnrolledCourses(): string[] {
  try {
    const raw = localStorage.getItem(ENROLLED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleEnrollCurso(cursoId: string): string[] {
  const enrolled = getEnrolledCourses();
  const idx = enrolled.indexOf(cursoId);
  if (idx === -1) {
    enrolled.push(cursoId);
  } else {
    enrolled.splice(idx, 1);
  }
  localStorage.setItem(ENROLLED_KEY, JSON.stringify(enrolled));
  return enrolled;
}

export function getActiveBecaId(): string | null {
  return localStorage.getItem(ACTIVE_META_KEY);
}

export function setActiveBecaId(becaId: string) {
  localStorage.setItem(ACTIVE_META_KEY, becaId);
}
