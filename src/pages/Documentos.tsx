import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MochilaSelectorCard } from "../components/mochila/MochilaSelectorCard";
import { RejectedDocAlert } from "../components/mochila/RejectedDocAlert";
import { MotibotHintCard } from "../components/mochila/MotibotHintCard";
import { DocumentCategoryFilters } from "../components/mochila/DocumentCategoryFilters";
import type { CategoryFilter } from "../components/mochila/DocumentCategoryFilters";
import { DocumentItemCard } from "../components/mochila/DocumentItemCard";
import { DropZoneCard } from "../components/mochila/DropZoneCard";
import { CapacitacionesHeader } from "../components/mochila/CapacitacionesHeader";
import { CourseCard } from "../components/mochila/CourseCard";
import {
  getPostulaciones,
  getBecaInfo,
  getDocumentosDisplay,
  uploadDocumento,
  getCursos,
  getEnrolledCourses,
  toggleEnrollCurso,
  setActiveBecaId,
} from "../services/documentos";
import type {
  PostulacionRow,
  DocumentoDisplay,
  CursoRow,
} from "../lib/types";

export default function Documentos() {
  const { user } = useAuth();

  // ── Postulaciones & Beca ──────────────────────────────────────────────
  const [postulaciones, setPostulaciones] = useState<PostulacionRow[]>([]);
  const [activePostulacionId, setActivePostulacionId] = useState<string | null>(null);
  const [becaInfo, setBecaInfo] = useState<{
    titulo: string;
    sponsor: string;
    afinidad: number;
    fecha_cierre: string;
  } | null>(null);

  // ── Documentos ────────────────────────────────────────────────────────
  const [documentos, setDocumentos] = useState<DocumentoDisplay[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Todos");

  // ── Cursos ────────────────────────────────────────────────────────────
  const [cursos, setCursos] = useState<CursoRow[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [cursosTab, setCursosTab] = useState<"disponibles" | "obtenidas">("disponibles");

  // ── Load initial data ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    (async () => {
      const posts = await getPostulaciones(user.id);
      setPostulaciones(posts);

      if (posts.length > 0) {
        const saved = localStorage.getItem("pathfinder_active_meta");
        const initial = saved && posts.find((p) => p.beca_id === saved || p.id === saved)
          ? posts.find((p) => p.beca_id === saved || p.id === saved)!
          : posts[0];
        setActivePostulacionId(initial.id);
      }
    })();

    getCursos().then(setCursos);
    setEnrolledCourses(getEnrolledCourses());
  }, [user]);

  // ── When postulacion changes → load beca info + docs ─────────────────
  useEffect(() => {
    if (!activePostulacionId) return;

    const postulacion = postulaciones.find((p) => p.id === activePostulacionId);
    if (!postulacion) return;

    setActiveBecaId(postulacion.beca_id);

    getBecaInfo(postulacion.beca_id).then((info) => setBecaInfo(info));
    getDocumentosDisplay(activePostulacionId, postulacion.beca_id).then(
      setDocumentos,
    );
  }, [activePostulacionId, postulaciones]);

  // ── Derived state ────────────────────────────────────────────────────
  const readyCount = documentos.filter((d) => d.estado === "validado").length;
  const totalCount = documentos.filter((d) => d.es_requerido).length;

  const categories = useMemo(() => {
    const set = new Set(documentos.map((d) => d.categoria));
    return ["Todos", ...Array.from(set)];
  }, [documentos]);

  const filters: CategoryFilter[] = categories.map((cat) => ({
    label: cat,
    active: cat === activeFilter,
  }));

  const filteredDocs =
    activeFilter === "Todos"
      ? documentos
      : documentos.filter((d) => d.categoria === activeFilter);

  const rejectedDocs = documentos.filter((d) => d.estado === "rechazado");
  const matchLabel = becaInfo ? `${becaInfo.afinidad}% Match` : "--";
  const deadlineLabel = becaInfo
    ? `Cierra en ${Math.ceil(
        (new Date(becaInfo.fecha_cierre).getTime() - Date.now()) /
          86400000,
      )}d`
    : "--";

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleSelectPostulacion = (id: string) => {
    setActivePostulacionId(id);
  };

  const handleUpload = async (file: File, nombre?: string) => {
    if (!activePostulacionId) return;
    setIsUploading(true);
    const docName =
      nombre || file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    await uploadDocumento(activePostulacionId, docName, file);

    const postulacion = postulaciones.find(
      (p) => p.id === activePostulacionId,
    );
    if (postulacion) {
      const updated = await getDocumentosDisplay(
        activePostulacionId,
        postulacion.beca_id,
      );
      setDocumentos(updated);
    }
    setIsUploading(false);
  };

  const availableCursos = cursos.filter(
    (c) =>
      (c.estado?.toLowerCase() === "disponible" || !c.estado) &&
      !enrolledCourses.includes(c.id) &&
      !cursos.find(
        (cc) => cc.id === c.id && cc.estado?.toLowerCase() === "obtenido",
      ),
  );
  const obtainedCursos = cursos.filter(
    (c) =>
      c.estado?.toLowerCase() === "obtenido" ||
      enrolledCourses.includes(c.id),
  );
  const displayedCursos =
    cursosTab === "disponibles" ? availableCursos : obtainedCursos;

  const handleToggleEnroll = (cursoId: string) => {
    const updated = toggleEnrollCurso(cursoId);
    setEnrolledCourses([...updated]);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full flex-1 pb-16">
      {/* ── Fila 1: Mochila ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        {/* Columna izquierda */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
          <h1 className="text-2xl sm:text-[32px] font-black text-text-primary">
            Mochila
          </h1>

          <MochilaSelectorCard
            postulaciones={postulaciones}
            activePostulacionId={activePostulacionId}
            onSelectPostulacion={handleSelectPostulacion}
            readyCount={readyCount}
            total={totalCount}
            matchLabel={matchLabel}
            deadlineLabel={deadlineLabel}
          />

          {rejectedDocs.length > 0 && (
            <RejectedDocAlert
              message={`${rejectedDocs.map((d) => d.nombre).join(", ")} ${
                rejectedDocs.length === 1 ? "fue" : "fueron"
              } rechazado${
                rejectedDocs.length > 1 ? "s" : ""
              }. Actualízalos.`}
              buttonLabel="Reemplazar →"
              onClick={() => {
                const first = rejectedDocs[0];
                if (first) handleUpload(new File([], first.nombre));
              }}
            />
          )}

          <MotibotHintCard
            message="¿Dudas con tu Ficha SISFOH? Pregúntame."
            buttonLabel="Abrir Motibot"
          />
        </div>

        {/* Columna derecha */}
        <div className="w-full flex flex-col gap-6">
          <DocumentCategoryFilters
            filters={filters}
            onFilterChange={setActiveFilter}
          />

          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-text-tertiary">
              <span className="material-symbols-outlined text-5xl">
                folder_off
              </span>
              <p className="text-sm font-bold">
                No hay documentos en esta categoría
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredDocs.map((doc) => (
                <DocumentItemCard
                  key={doc.id}
                  variant={doc.estado}
                  title={doc.nombre}
                  icon={doc.icon}
                  onUpload={(file) => handleUpload(file, doc.nombre)}
                  onView={doc.archivo_url ? () => window.open(doc.archivo_url!, "_blank") : undefined}
                  isUploading={isUploading}
                />
              ))}
            </div>
          )}

          <DropZoneCard
            label="Arrástralo aquí"
            formats={["PDF", "JPG/PNG"]}
            onUpload={(file) => handleUpload(file)}
            isUploading={isUploading}
          />
        </div>
      </div>

      {/* ── Fila 2: Capacitaciones ──────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <CapacitacionesHeader
          title="Capacitaciones"
          activeTab={cursosTab}
          disponiblesCount={availableCursos.length}
          obtenidasCount={obtainedCursos.length}
          onTabChange={setCursosTab}
        />

        {displayedCursos.length === 0 ? (
          <p className="text-sm font-bold text-text-tertiary py-8 text-center">
            {cursosTab === "disponibles"
              ? "No hay capacitaciones disponibles actualmente."
              : "Aún no has obtenido ninguna capacitación."}
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6">
            {displayedCursos.map((curso) => (
              <CourseCard
                key={curso.id}
                tag="Certificado"
                title={curso.titulo}
                duration={
                  curso.duracion
                    ? `Duración: ${curso.duracion}`
                    : "Duración variable"
                }
                buttonLabel={cursosTab === "disponibles" ? "Iniciar →" : "Ver certificado"}
                isEnrolled={enrolledCourses.includes(curso.id)}
                onClick={() => handleToggleEnroll(curso.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
