import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PostulacionesHeader } from "../components/postulaciones/PostulacionesHeader";
import { PostulacionCard } from "../components/postulaciones/PostulacionCard";
import { MissionProgressCard } from "../components/postulaciones/MissionProgressCard";
import { SyncStatusPill } from "../components/postulaciones/SyncStatusPill";
import { CriticalDatesCard } from "../components/postulaciones/CriticalDatesCard";
import { IAReadyBanner } from "../components/postulaciones/IAReadyBanner";
import { TipOfTheDayCard } from "../components/postulaciones/TipOfTheDayCard";
import {
  getPostulacionesConBeca,
  getDocumentosForPostulacion,
  getPipelineSteps,
  computeDocumentMissions,
  computeCriticalDates,
  getRandomTip,
} from "../services/postulaciones";
import type { PostulacionConBeca, DocumentoRow } from "../lib/types";

type FilterTab = "activas" | "curso" | "cerradas";

function filterPostulacion(p: PostulacionConBeca, tab: FilterTab): boolean {
  const paso = p.postulacion.paso_pipeline;
  if (tab === "activas") return paso <= 2;
  if (tab === "curso") return paso === 3;
  return paso === 4;
}

function getPasoLabel(paso: number, estadoGeneral: string): string {
  const labels: Record<number, string> = {
    1: "Preparación",
    2: "Enviada",
    3: "Evaluación",
    4: "Resultados",
  };
  return estadoGeneral || labels[paso] || `Paso ${paso}`;
}

export default function MisPostulaciones() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [postulaciones, setPostulaciones] = useState<PostulacionConBeca[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoRow[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("activas");
  const [lastSync, setLastSync] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tip, setTip] = useState("");

  // ── Load data ─────────────────────────────────────────────────────────
  const load = async (userId: string) => {
    const data = await getPostulacionesConBeca(userId);
    setPostulaciones(data);
    setLastSync(
      `Última sync: ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`,
    );
    return data;
  };

  useEffect(() => {
    if (!user) return;
    load(user.id).then((data) => {
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].postulacion.id);
      }
    });
    setTip(getRandomTip());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── When selected postulacion changes → load docs ────────────────────
  useEffect(() => {
    if (!selectedId) return;
    getDocumentosForPostulacion(selectedId).then(setDocumentos);
  }, [selectedId]);

  // ── Derived ───────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => postulaciones.filter((p) => filterPostulacion(p, activeTab)),
    [postulaciones, activeTab],
  );

  const selectedPostulacion = postulaciones.find(
    (p) => p.postulacion.id === selectedId,
  );

  // If selected is not in current filter, pick first of filter
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((p) => p.postulacion.id === selectedId)) {
      setSelectedId(filtered[0].postulacion.id);
    }
  }, [filtered, selectedId]);

  const counts = useMemo(
    () => ({
      activas: postulaciones.filter((p) => filterPostulacion(p, "activas")).length,
      curso: postulaciones.filter((p) => filterPostulacion(p, "curso")).length,
      cerradas: postulaciones.filter((p) => filterPostulacion(p, "cerradas")).length,
    }),
    [postulaciones],
  );

  const selectedPipeline = selectedPostulacion
    ? getPipelineSteps(selectedPostulacion.postulacion.paso_pipeline)
    : [];

  const selectedDocs = selectedPostulacion
    ? computeDocumentMissions(
        documentos,
        selectedPostulacion.documentos_requeridos,
      )
    : [];

  const docsReady = selectedDocs.filter((d) => d.variant === "success").length;
  const docsTotal = selectedDocs.length;

  const criticalDates = selectedPostulacion
    ? computeCriticalDates(selectedPostulacion.beca_fecha_cierre)
    : { milestones: [], alertText: "" };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!user || isRefreshing) return;
    setIsRefreshing(true);
    await load(user.id);
    if (selectedId) {
      getDocumentosForPostulacion(selectedId).then(setDocumentos);
    }
    setTip(getRandomTip());
    setIsRefreshing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20 text-text-tertiary">
        <p className="text-sm font-bold">Inicia sesión para ver tus postulaciones.</p>
      </div>
    );
  }

  if (postulaciones.length === 0) {
    return (
      <div className="flex flex-col gap-8 w-full pb-16">
        <PostulacionesHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activasCount={0}
          cursoCount={0}
          cerradasCount={0}
        />
        <div className="flex flex-col items-center gap-4 py-16 text-text-tertiary">
          <span className="material-symbols-outlined text-5xl">work_history</span>
          <p className="text-sm font-bold">
            Aún no tienes postulaciones.
          </p>
          <p className="text-xs font-bold">
            Explora becas y postula desde la sección Buscar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full flex-1 pb-16">
      {/* Col 1: lista de postulaciones */}
      <div className="w-full xl:w-[300px] xl:shrink-0 flex flex-col gap-4 min-w-0">
        <PostulacionesHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activasCount={counts.activas}
          cursoCount={counts.curso}
          cerradasCount={counts.cerradas}
        />

        <div className="flex flex-col gap-2">
          {filtered.length > 0 ? (
            filtered.map((p) => {
              const isSelected = p.postulacion.id === selectedId;
              const paso = p.postulacion.paso_pipeline;
              const hasBadge = p.postulacion.estado_general !== "Preparación";
              return (
                <PostulacionCard
                  key={p.postulacion.id}
                  variant={isSelected ? "active" : "inactive"}
                  title={p.beca_titulo}
                  statusLabel={`Paso ${paso}/4: ${getPasoLabel(paso, p.postulacion.estado_general)}`}
                  badge={hasBadge ? p.postulacion.estado_general : undefined}
                  matchLabel={`${p.beca_afinidad}% Match`}
                  onClick={() => setSelectedId(p.postulacion.id)}
                  isSelected={isSelected}
                />
              );
            })
          ) : (
            <p className="text-xs font-bold text-text-tertiary py-4 text-center">
              No tienes postulaciones en esta categoría.
            </p>
          )}
        </div>
      </div>

      {/* Col 2: progreso de misión */}
      <div className="w-full xl:flex-1 min-w-0">
        {selectedPostulacion ? (
          <MissionProgressCard
            pipelineSteps={selectedPipeline}
            documentMissions={selectedDocs}
            readyCount={docsReady}
            totalDocuments={docsTotal}
            footerButtonLabel="Subir documentos"
            onFooterClick={() => navigate("/documentos")}
          />
        ) : (
          <div className="flex items-center justify-center py-20 text-text-tertiary">
            <p className="text-sm font-bold">Selecciona una postulación.</p>
          </div>
        )}
      </div>

      {/* Col 3: fechas críticas e IA */}
      <div className="w-full xl:w-[260px] xl:shrink-0 flex flex-col gap-4 min-w-0">
        <SyncStatusPill
          label={lastSync || "Sincronizar"}
          onClick={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {selectedPostulacion && criticalDates.milestones.length > 0 && (
          <CriticalDatesCard
            dates={criticalDates.milestones}
            alertText={criticalDates.alertText}
          />
        )}

        <IAReadyBanner
          buttonLabel="Consultar con Motibot"
          onClick={() => navigate("/asesor")}
        />

        <TipOfTheDayCard text={tip} />
      </div>
    </div>
  );
}
