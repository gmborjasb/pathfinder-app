import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_MAP = ["Preparación", "Enviada", "Evaluación", "Resultados"];

/** Human-readable label for a document status (lenguaje de usuario, no técnico) */
function docStatusLabel(status: "aprobado" | "en_revision" | "faltante") {
  if (status === "aprobado") return "Documento listo ✓";
  if (status === "en_revision") return "En revisión por la plataforma";
  return "Falta subir este documento";
}

function toSentenceCase(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Skeleton placeholder for loading states */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MisPostulaciones() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const incomingBecaId = (location.state as any)?.becaId as string | undefined;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbPostulations, setDbPostulations] = useState<any[]>([]);
  const [becas, setBecas] = useState<any[]>([]);
  const [appDocs, setAppDocs] = useState<any[]>([]);
  const [isBecaModalOpen, setIsBecaModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Modals & toasts
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmDocName, setConfirmDocName] = useState("");
  const [confirmKeywords, setConfirmKeywords] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [recentOrder, setRecentOrder] = useState<string[]>([]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchDbPostulations = useCallback(async () => {
    if (!user) return;
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) return;

      const [postRes, becasRes] = await Promise.all([
        supabase.from("postulaciones").select("*").eq("usuario_id", user.id),
        supabase.from("becas").select("*").order("id", { ascending: true }),
      ]);

      let validBecaIds = new Set<string>();
      if (becasRes.data) {
        const mappedBecas = becasRes.data.map((row: any) => ({
          id: row.id,
          title: row.titulo,
          sponsor: row.sponsor,
          coverage: row.cobertura,
          requirement: row.requisitos,
          deadline: row.fecha_cierre,
          level: row.nivel,
          icon: row.icono || "school",
          sobre: row.sobre || "",
          beneficios: Array.isArray(row.beneficios) ? row.beneficios : [],
          affinity: row.afinidad || 85,
        }));
        setBecas(mappedBecas);
        validBecaIds = new Set(mappedBecas.map((b: any) => b.id));
      }

      if (postRes.error) {
        console.error("Error loading postulations:", postRes.error);
        return;
      }

      let currentDbData = postRes.data || [];

      // Auto-cleanup: remove ghost postulations
      if (validBecaIds.size > 0) {
        const ghosts = currentDbData.filter((p: any) => !validBecaIds.has(p.beca_id));
        if (ghosts.length > 0) {
          const ghostIds = ghosts.map((p: any) => p.id);
          await supabase.from("postulaciones").delete().in("id", ghostIds);
          currentDbData = currentDbData.filter((p: any) => validBecaIds.has(p.beca_id));
        }
      }

      setDbPostulations(currentDbData);

      if (currentDbData.length > 0) {
        setSelectedAppId((prev) => {
          let chosen: string;
          if (incomingBecaId && currentDbData.some((p: any) => p.beca_id === incomingBecaId)) {
            chosen = incomingBecaId;
          } else {
            const isValid = currentDbData.some((p: any) => p.beca_id === prev);
            chosen = isValid ? prev : currentDbData[0].beca_id;
          }
          setRecentOrder((prevOrder) => [chosen, ...prevOrder.filter((id) => id !== chosen)]);
          return chosen;
        });
      } else {
        setSelectedAppId("");
      }
    } catch (err) {
      console.error("Unexpected error loading postulations:", err);
    } finally {
      setLoading(false);
    }
  }, [user, incomingBecaId]);

  const fetchAppDocuments = useCallback(async () => {
    if (!user || !selectedAppId || dbPostulations.length === 0) return;
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) return;

      const post = dbPostulations.find((p) => p.beca_id === selectedAppId);
      if (!post) { setAppDocs([]); return; }

      const { data, error } = await supabase.from("documentos").select("*").eq("postulacion_id", post.id);
      if (!error && data) setAppDocs(data);
    } catch (err) {
      console.error("Error loading app documents:", err);
    }
  }, [user, selectedAppId, dbPostulations]);

  useEffect(() => { fetchDbPostulations(); }, [fetchDbPostulations]);
  useEffect(() => { fetchAppDocuments(); }, [fetchAppDocuments]);
  useEffect(() => {
    localStorage.removeItem("pathfinder_applied_becas");
    setTimeout(() => setMounted(true), 50);
  }, []);

  // ── Step update ────────────────────────────────────────────────────────────

  const handleUpdateStep = async (becaId: string, step: number) => {
    if (!user) return;
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) return;

      const newStatus = STATUS_MAP[step - 1] || "Preparación";
      const { error } = await supabase
        .from("postulaciones")
        .update({ paso_pipeline: step, estado_general: newStatus })
        .eq("usuario_id", user.id)
        .eq("beca_id", becaId);

      if (error) { console.error("Error updating step:", error); return; }

      setDbPostulations((prev) =>
        prev.map((p) => (p.beca_id === becaId ? { ...p, paso_pipeline: step, estado_general: newStatus } : p))
      );
    } catch (err) {
      console.error("Unexpected error updating step:", err);
    }
  };

  // ── Document helpers ───────────────────────────────────────────────────────

  const getDocumentStatus = (docNameKeywords: string[]): "aprobado" | "en_revision" | "faltante" => {
    if (appDocs.length === 0) return "faltante";
    const doc = appDocs.find((d) =>
      docNameKeywords.some((kw) => d.nombre_documento.toLowerCase().includes(kw.toLowerCase()))
    );
    if (!doc) return "faltante";
    if (["Validado", "Listo", "Aprobado"].includes(doc.estado)) return "aprobado";
    if (["En Revisión", "Pendiente", "En revision"].includes(doc.estado)) return "en_revision";
    return "faltante";
  };

  const handleCheckboxClick = (keywords: string[], docName: string, status: "aprobado" | "en_revision" | "faltante") => {
    if (status === "aprobado") {
      triggerToast("No se puede desmarcar un requisito que ya ha sido aprobado.");
      return;
    }
    if (status === "faltante") {
      setConfirmDocName(docName);
      setConfirmKeywords(keywords);
      setShowConfirmModal(true);
      return;
    }
    handleToggleDocStatus(keywords, docName, status);
  };

  const handleViewClick = (status: "aprobado" | "en_revision" | "faltante") => {
    if (status === "faltante") {
      triggerToast("¡Documento no subido! Súbelo primero desde la Mochila.");
    } else {
      navigate("/documentos");
    }
  };

  const handleToggleDocStatus = async (
    keywords: string[],
    docName: string,
    currentStatus: "aprobado" | "en_revision" | "faltante"
  ) => {
    if (!user || !selectedAppId || dbPostulations.length === 0) return;
    const post = dbPostulations.find((p) => p.beca_id === selectedAppId);
    if (!post) return;

    const isCurrentlyValid = currentStatus === "aprobado";
    const newStatus = isCurrentlyValid ? "Pendiente" : "Validado";

    const existingDoc = appDocs.find((d) =>
      keywords.some((kw) => d.nombre_documento.toLowerCase().includes(kw.toLowerCase()))
    );

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
      if (existingDoc) {
        setAppDocs((prev) => prev.map((d) => (d.id === existingDoc.id ? { ...d, estado: newStatus } : d)));
      } else {
        setAppDocs((prev) => [...prev, { id: Math.random().toString(), postulacion_id: post.id, nombre_documento: docName, estado: newStatus, archivo_url: "" }]);
      }
      return;
    }

    try {
      if (existingDoc) {
        const { error } = await supabase.from("documentos").update({ estado: newStatus }).eq("id", existingDoc.id);
        if (error) { console.error("Error updating doc:", error); return; }
        setAppDocs((prev) => prev.map((d) => (d.id === existingDoc.id ? { ...d, estado: newStatus } : d)));
      } else {
        const { data, error } = await supabase.from("documentos").insert([{ postulacion_id: post.id, nombre_documento: docName, estado: newStatus, archivo_url: "" }]).select("*");
        if (error) { console.error("Error inserting doc:", error); return; }
        if (data?.length) setAppDocs((prev) => [...prev, data[0]]);
      }
    } catch (err) {
      console.error("Error toggling doc status:", err);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    await fetchDbPostulations();
    await fetchAppDocuments();
    setLastSync(new Date());
    setSyncing(false);
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const handleSelectBeca = (becaId: string) => {
    setSelectedAppId(becaId);
    setRecentOrder((prev) => [becaId, ...prev.filter((id) => id !== becaId)]);
  };

  const savedBecas = (() => {
    const list = dbPostulations.map((post) => {
      const found = becas.find((b) => b.id === post.beca_id);
      return found || { id: post.beca_id, title: "Beca", sponsor: "Organización", affinity: 80, icon: "school" };
    });
    return list.sort((a, b) => {
      const aIdx = recentOrder.indexOf(a.id);
      const bIdx = recentOrder.indexOf(b.id);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  })();

  // FIX #1: Contadores dinámicos con lógica clara
  const dynamicSummaryStats = (() => {
    let activas = 0;
    let enCurso = 0;
    let cerradas = 0;

    dbPostulations.forEach((p) => {
      const paso = p.paso_pipeline || 1;
      if (p.estado_general === "Cerrada" || p.estado_general === "Cerrado") {
        cerradas++;
      } else if (paso === 1) {
        activas++;
      } else if (paso === 2 || paso === 3) {
        enCurso++;
      } else if (paso === 4) {
        enCurso++;
      }
    });

    return { activas, enCurso, cerradas };
  })();

  const getAppDetail = (id: string) => {
    const dbPost = dbPostulations.find((p) => p.beca_id === id);
    const paso = dbPost?.paso_pipeline || 1;
    const estado = dbPost?.estado_general || "Preparación";

    const connectorWidths = ["w-[10%]", "w-[45%]", "w-[75%]", "w-[100%]"];
    const connectorWidth = connectorWidths[paso - 1] || "w-[10%]";

    // FIX #3: Pipeline — paso activo tiene estilo diferente al completado
    const steps = [
      { label: "Preparación", status: "pending", icon: "edit_document" },
      { label: "Enviada",     status: "pending", icon: "send" },
      { label: "Evaluación",  status: "pending", icon: "fact_check" },
      { label: "Resultados",  status: "pending", icon: "emoji_events" },
    ];
    for (let i = 0; i < 4; i++) {
      const stepIdx = i + 1;
      if (stepIdx < paso)       steps[i].status = "completed";
      else if (stepIdx === paso) steps[i].status = "active";
      else                       steps[i].status = "pending";
    }

    // Totalmente dinámico — sin hardcoding de BEC-01/02
    const realBeca = becas.find((b) => b.id === id);
    const becaTitle   = realBeca?.title   ?? "Beca en Seguimiento";
    const becaSponsor = realBeca?.sponsor ?? "Organización";
    const becaAffinity = realBeca?.affinity ?? 80;
    const becaDeadline = realBeca?.deadline;

    const criticalDates = [
      {
        month: "Jun", day: "30",
        title: "Cierre de postulación",
        subtitle: `Portal oficial – ${becaSponsor}`,
        completed: paso > 1,   // ya pasó este hito
        isCurrent: paso === 1,
        active: paso >= 1,
      },
      {
        month: "Jul", day: "15",
        title: "Evaluación de perfil",
        subtitle: "Revisión de documentos enviados",
        completed: paso > 3,
        isCurrent: paso === 2 || paso === 3,
        active: paso >= 2,
      },
      {
        month: "Ago", day: "01",
        title: "Resultados",
        subtitle: "Publicación de seleccionados",
        completed: false,
        isCurrent: paso === 4,
        active: paso >= 4,
      },
    ];

    return {
      title: `${becaTitle} – Convocatoria 2026`,
      fullTitle: becaTitle,
      organization: becaSponsor,
      status: estado,
      affinity: becaAffinity,
      connectorWidth,
      milestoneAlert: {
        title: "Próximo hito:",
        event: becaDeadline ? `Cierre: ${becaDeadline}` : "Revisión de documentos",
        date: "Consulta el portal oficial",
      },
      pipeline: steps,
      criticalDates,
      iaBanner: {
        badge: "IA ready",
        title: "Asesor de postulación",
        description: `¿Tienes dudas sobre tu postulación a ${becaTitle}? Nuestra IA está lista para ayudarte.`,
        buttonText: "Consultar con IA",
      },
    };
  };

  const selectedAppDetail = selectedAppId ? getAppDetail(selectedAppId) : null;

  // ── Document statuses ──────────────────────────────────────────────────────

  const identityStatus  = getDocumentStatus(["dni"]);
  const academicStatus  = getDocumentStatus(["certificado", "constancia", "estudios"]);
  const socioStatus     = getDocumentStatus(["sisfoh", "socioeconómico"]);

  // Auto-update pipeline step based on approved docs
  useEffect(() => {
    if (!user || dbPostulations.length === 0 || !selectedAppId) return;
    const post = dbPostulations.find((p) => p.beca_id === selectedAppId);
    if (!post) return;

    const currentPaso = post.paso_pipeline || 1;
    let count = 0;
    if (identityStatus === "aprobado") count++;
    if (academicStatus === "aprobado") count++;
    if (socioStatus    === "aprobado") count++;
    const computedStep = Math.min(count + 1, 4);

    if (currentPaso !== computedStep) handleUpdateStep(selectedAppId, computedStep);
  }, [identityStatus, academicStatus, socioStatus, selectedAppId, dbPostulations, user]);

  // Mochila widget docs
  const mochilaDocs = [
    { name: "DNI Digitalizado",   status: getDocumentStatus(["dni"]) },
    { name: "Certificado notas",  status: getDocumentStatus(["certificado", "estudios"]) },
    { name: "Constancia logros",  status: getDocumentStatus(["logros", "constancia"]) },
    { name: "Recomendación",      status: getDocumentStatus(["recomendación"]) },
  ];
  const loadedCount       = mochilaDocs.filter((d) => d.status === "aprobado").length;
  const mochilaPercentage = Math.round((loadedCount / mochilaDocs.length) * 100);

  // ── Last sync label helper ─────────────────────────────────────────────────

  const lastSyncLabel = (() => {
    if (!lastSync) return null;
    const mins = Math.floor((Date.now() - lastSync.getTime()) / 60000);
    if (mins < 1) return "Sincronizado ahora";
    return `Última sincronización: hace ${mins} min`;
  })();

  // ── Loading skeleton (FIX #13) ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-6 w-full font-['Plus_Jakarta_Sans'] pb-16">
      <section className="col-span-12 lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
          <div className="grid grid-cols-3 gap-2">
            {[0,1,2].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </section>
        <section className="col-span-12 lg:col-span-6 flex flex-col gap-4 bg-white p-6 rounded-2xl border border-gray-100 order-1 lg:order-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-16" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </section>
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-4 order-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-52" />
        </section>
      </div>
    );
  }

  // ── Empty state (FIX #12) ──────────────────────────────────────────────────

  if (mounted && savedBecas.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-6 font-['Plus_Jakarta_Sans']"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s" }}
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-5xl">school</span>
        </div>
        <div className="text-center">
          <h2 className="font-bold text-primary text-xl mb-2">No tienes convocatorias guardadas</h2>
          <p className="text-sm text-muted-slate max-w-sm">
            Guarda becas desde la sección <strong>Explorar</strong> para hacer seguimiento de tus postulaciones aquí.
          </p>
        </div>
        <button
          onClick={() => navigate("/buscar")}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md cursor-pointer"
        >
          Explorar becas →
        </button>
      </div>
    );
  }

  if (!selectedAppDetail) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="grid grid-cols-12 gap-6 w-full select-none pb-16"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0px)" : "translateY(10px)",
        transition: "opacity 0.4s, transform 0.4s",
      }}
    >
      {/* ── Column 1: Left sidebar (3 cols) ─────────────────────────────────── */}
      <section className="contents lg:col-span-3 lg:flex lg:flex-col lg:gap-6 lg:order-1">

        {/* FIX #1: Contadores 100% dinámicos */}
        <div className="grid grid-cols-3 gap-sm col-span-12 order-2 lg:order-none lg:mb-lg">
          {[
            { icon: "edit_note",  value: dynamicSummaryStats.activas,  label: "Activas",   color: "text-secondary" },
            { icon: "send",       value: dynamicSummaryStats.enCurso,  label: "En curso",  color: "text-[#1a3a7c]" },
            { icon: "archive",    value: dynamicSummaryStats.cerradas, label: "Cerradas",  color: "text-[#94a3b8]", dim: true },
          ].map(({ icon, value, label, color, dim }) => (
            <div key={label} className={`bg-white px-1.5 py-3 rounded-[12px] flex flex-col items-center justify-center text-center border border-[#e2e8f0] shadow-sm hover:border-[#1a3a7c]/20 transition-all min-w-0 ${dim ? "opacity-60" : ""}`}>
              <span className={`material-symbols-outlined ${color} mb-1 text-xl`}>{icon}</span>
              <div className="t-md bold leading-none">{value}</div>
              <div className="t-xs bold uppercase tracking-tight text-center w-full mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Convocatorias activas */}
        <div className="flex flex-col gap-4 col-span-12 order-1 lg:order-none">
          <h3 className="t-sm bold px-1 mb-2 text-navy-2">Tus convocatorias activas</h3>

          <div className="flex flex-col gap-md">
            {savedBecas.map((beca, index) => {
              const isSelected = beca.id === selectedAppId;
              const details = getAppDetail(beca.id);
              const affinityClass = beca.affinity >= 85 ? "badge b-green" : "badge b-amber";
              
              const showOnMobile = isSelected;
              const showOnDesktop = index < 3;

              if (!showOnMobile && !showOnDesktop) return null;

              return (
                <div
                  key={beca.id}
                  onClick={() => handleSelectBeca(beca.id)}
                  className={`card p-4 relative group hover:shadow-lg transition-all cursor-pointer border ${
                    isSelected
                      ? "border-2 border-[#1a3a7c]"
                      : "border border-[#e2e8f0]"
                  } ${showOnMobile && showOnDesktop ? "" : showOnMobile ? "lg:hidden" : "hidden lg:block"}`}
                  style={{ borderRadius: "var(--r-md)" }}
                >
                  {isSelected && (
                    <div className="absolute -top-2.5 -right-1.5 bg-[#0F2554] text-white text-[9px] px-2.5 py-0.5 font-bold rounded-bl-lg rounded-tr-lg z-10 shadow-sm">
                      ACTIVA
                    </div>
                  )}
                  {/* FIX #2: title completo en tooltip */}
                  <h4
                    className="t-sm bold trunc pr-10"
                    title={beca.title}
                  >
                    {beca.title}
                  </h4>
                  <p className="t-xs mt-1 trunc">{beca.sponsor}</p>
                  <div className="flex items-center justify-between pr-4 mt-2">
                    <span className={`${affinityClass}`}>
                      Afinidad: {beca.affinity}%
                    </span>
                    <span className="t-xs bold">
                      {toSentenceCase(details.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FIX #14: CTA limpio con verbo único */}
          <button
            onClick={() => setIsBecaModalOpen(true)}
            className="w-full py-2 text-navy-2 t-xs bold flex items-center justify-center gap-1 hover:bg-[#e8eef8] transition-colors rounded-[8px] border border-dashed border-[#1a3a7c]/40 mt-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            Ver todas mis postulaciones ({savedBecas.length})
          </button>
        </div>

        {/* IA Banner */}
        <div className="card flex flex-col gap-3 relative overflow-hidden select-none border-none text-white col-span-12 order-7 lg:order-none lg:mt-6" style={{ backgroundColor: "#0F2554" }}>
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[100px] text-white">smart_toy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg text-white">smart_toy</span>
            </div>
            <div>
              <span className="badge" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", color: "white" }}>
                {selectedAppDetail.iaBanner.badge}
              </span>
              <h4 className="bold mt-0.5" style={{ color: "white", fontWeight: "bold", fontSize: "11px" }}>{selectedAppDetail.iaBanner.title}</h4>
            </div>
          </div>
          <p style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "10px", lineHeight: "1.4" }}>{selectedAppDetail.iaBanner.description}</p>
          <button
            onClick={() => navigate("/asesor")}
            className="w-full py-2 rounded-[8px] bold flex items-center justify-center gap-1 hover:opacity-90 border-none cursor-pointer mt-2 transition-all shadow-sm"
            style={{
              backgroundColor: "#ffdf94", // Yellow from palette
              color: "#0F2554",           // Navy text
              fontWeight: "bold",
              fontSize: "11px",
            }}
          >
            {selectedAppDetail.iaBanner.buttonText}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* ── Column 2: Main workspace (6 cols) ────────────────────────────────── */}
      <section className="contents lg:col-span-6 lg:flex lg:flex-col lg:gap-6 lg:min-w-0 lg:h-fit lg:order-2">

        {/* STANDALONE PIPELINE CARD - Matches the design template */}
        <div className="card p-6 flex flex-col gap-4 bg-white shadow-sm border border-[#e2e8f0] col-span-12 order-3 lg:order-none" style={{ borderRadius: "var(--r-lg)" }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="t-md bold text-navy" style={{ fontSize: "15px" }}>Pipeline de postulación</h3>
              <p className="t-xs mt-1" style={{ color: "var(--slate)" }}>
                Proceso actual para <span className="bold text-navy-2 pr-10">{selectedAppDetail.fullTitle}</span>
              </p>
            </div>
            <span className="badge b-amber" style={{ fontSize: "11px", padding: "4px 12px" }}>
              {toSentenceCase(selectedAppDetail.status)}
            </span>
          </div>

          <div className="relative py-4 mt-2">
            {/* Horizontal progress lines - Vertically center-aligned to circles */}
            <div className="absolute top-[36px] left-[5%] right-[5%] h-[2px] bg-[#f1f5f9] -translate-y-1/2 z-0 rounded-[99px]" />
            <div className={`absolute top-[36px] left-[5%] ${selectedAppDetail.connectorWidth} h-[2px] bg-[#1a3a7c] -translate-y-1/2 z-0 transition-all duration-700 rounded-[99px]`} />

            <div className="relative z-10 flex justify-between px-xs">
              {selectedAppDetail.pipeline.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2" style={{ width: "22%" }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md relative z-10 ring-4 ring-white ${
                    step.status === "completed"
                      ? "bg-[#1a3a7c] text-white"
                      : step.status === "active"
                        ? "bg-white border-2 border-[#1a3a7c] text-[#1a3a7c] shadow-lg ring-4 ring-[#e8eef8]"
                        : "bg-[#f1f5f9] text-[#94a3b8]"
                  }`}>
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={step.status === "completed" ? { fontVariationSettings: '"FILL" 1' } : {}}
                    >
                      {step.icon}
                    </span>
                  </div>
                  <span className={`t-xs bold text-center leading-tight ${
                    step.status === "active" ? "text-[#1a3a7c]" :
                    step.status === "completed" ? "text-[#1a3a7c]" : "text-[#94a3b8]"
                  }`}>
                    {step.label}
                  </span>
                  {step.status === "active" && (
                    <span className="badge b-blue mt-0.5">
                      Actual
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STANDALONE CHECKLIST CARD */}
        <div className="card p-6 flex flex-col gap-4 bg-white shadow-sm border border-[#e2e8f0] col-span-12 order-4 lg:order-none" style={{ borderRadius: "var(--r-lg)" }}>
          {/* Header */}
          <div className="flex items-end justify-between mb-2 gap-md border-b border-[#e2e8f0] pb-3">
            <div className="min-w-0">
              <h3 className="t-md bold text-navy" style={{ fontSize: "15px" }}>Lista de control (metas)</h3>
              <p className="t-xs mt-1" style={{ color: "var(--slate)" }}>
                Documentos requeridos para: <span className="bold text-navy-2 pr-10">{selectedAppDetail.fullTitle}</span>
              </p>
            </div>
            <div className="badge b-green shrink-0">
              <span className="material-symbols-outlined text-sm">verified</span>
              Perfil verificado
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            {[
              {
                label: "Identificación oficial",
                status: identityStatus,
                keywords: ["dni"],
                docName: "DNI Digitalizado",
              },
              {
                label: "Constancia de primeros puestos",
                status: academicStatus,
                keywords: ["certificado", "constancia", "estudios"],
                docName: "Certificado de Estudios",
              },
              {
                label: "Ficha SISFOH",
                status: socioStatus,
                keywords: ["sisfoh", "socioeconómico"],
                docName: "Ficha SISFOH",
              },
            ].map(({ label, status, keywords, docName }) => (
              <label
                key={label}
                className="card p-3 flex items-start gap-3 justify-between group hover:border-[#1a3a7c]/20 transition-all cursor-pointer bg-white"
                style={{ borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0 bg-transparent">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={status === "aprobado"}
                    onChange={() => handleCheckboxClick(keywords, docName, status)}
                  />
                  {status === "faltante" ? (
                    <div className="w-5 h-5 border border-border rounded bg-white flex items-center justify-center shrink-0 mt-0.5" />
                  ) : (
                    <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      status === "aprobado"    ? "bg-[#1a3a7c] border-[#1a3a7c]" :
                                                "border-amber-500 bg-amber-50"
                    }`}>
                      {status === "aprobado" && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status === "en_revision" && (
                        <span className="material-symbols-outlined text-[12px] text-amber-600">pending</span>
                      )}
                    </div>
                  )}

                  <div className="min-w-0 bg-transparent">
                    <h4 className="t-sm bold text-navy">{label}</h4>
                    {status === "faltante" ? (
                      <p className="t-xs mt-0.5" style={{ color: "var(--slate)" }}>
                        Aún no subido — usa el botón para agregarlo
                      </p>
                    ) : (
                      <p className={`t-xs bold mt-0.5 flex items-center gap-1 ${
                        status === "aprobado"    ? "text-green-700" : "text-amber-600"
                      }`}>
                        <span className="material-symbols-outlined text-xs">
                          {status === "aprobado" ? "check_circle" : "hourglass_empty"}
                        </span>
                        {docStatusLabel(status)}
                      </p>
                    )}
                  </div>
                </div>

                {status === "aprobado" || status === "en_revision" ? (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewClick(status); }}
                    className="btn-ico"
                    title="Ver documento en Mochila"
                    aria-label="Ver documento en Mochila"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate("/documentos"); }}
                    className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform"
                  >
                    Subir →
                  </button>
                )}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ── Column 3: Right sidebar (3 cols) ─────────────────────────────────── */}
      <section className="contents lg:col-span-3 lg:flex lg:flex-col lg:gap-6 lg:pb-8 lg:order-3">

        {/* Fechas Críticas */}
        <div className="card flex flex-col gap-3 col-span-12 order-5 lg:order-none">
          <h3 className="t-sm bold mb-2 flex items-center gap-sm text-navy-2">
            <span className="material-symbols-outlined text-lg">event</span>
            Fechas críticas
          </h3>

          <div className="relative space-y-xl pl-8 pb-2">
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-200 z-0" />

            {selectedAppDetail.criticalDates.map((date, idx) => {
              const isFuture = !date.active;
              return (
                <div key={idx} className={`relative ${isFuture ? "opacity-35" : ""}`}>
                  {/* Nodo del timeline */}
                  <div className={`absolute -left-[28px] top-1 w-4 h-4 rounded-full border z-10 ring-4 ring-white flex items-center justify-center ${
                    date.completed
                      ? "bg-[#1a3a7c] border-[#1a3a7c]"
                      : date.isCurrent
                        ? "bg-white border-[#1a3a7c]"
                        : "bg-white border-[#e2e8f0]"
                  }`}>
                    {date.completed && (
                      <span className="material-symbols-outlined text-white text-[10px]" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
                    )}
                  </div>

                  <div className={`t-xs ${date.completed ? "line-through text-slate-2" : ""}`}>
                    <strong style={{ fontWeight: "bold", color: "var(--navy)" }}>
                      {date.month}/{date.day}
                    </strong>
                    <span style={{ color: "var(--navy-2)", marginLeft: "4px" }}>
                      : {date.title}
                    </span>
                  </div>
                  <p className="t-xs mt-0.5 leading-tight">
                    {date.subtitle}
                  </p>

                  {date.isCurrent && (
                    <span className="badge b-blue mt-1 inline-block">
                      En curso
                    </span>
                  )}
                  {isFuture && (
                    <span className="badge b-slate mt-1 inline-block">
                      Próximamente
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FIX #8: Estado de la mochila — "X de Y listos" */}
        <div className="card flex flex-col gap-3 col-span-12 order-6 lg:order-none">
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="t-sm bold text-navy-2 flex items-center gap-sm">
                <span className="material-symbols-outlined shrink-0 text-base">work_outline</span>
                <span>Documentos</span>
              </h3>
              <span className="badge b-blue">
                {loadedCount} de {mochilaDocs.length} listos
              </span>
            </div>
            {mochilaPercentage === 0 ? (
              <p className="t-xs mt-1">
                Sube tu primer documento para comenzar
              </p>
            ) : (
              <div className="prog-track mt-1">
                <div className="prog-fill" style={{ width: `${mochilaPercentage}%` }} />
              </div>
            )}
          </div>

          <div className="space-y-sm mb-4 pr-1">
            {mochilaDocs.map((doc, idx) => (
              /* FIX #9: cada ítem pendiente es clickeable */
              <button
                key={idx}
                onClick={() => doc.status !== "aprobado" && navigate("/documentos")}
                className={`w-full flex items-center justify-between t-xs text-left group ${
                  doc.status === "aprobado" ? "cursor-default" : "cursor-pointer hover:bg-[#e8eef8] rounded-[8px] p-1.5 transition-colors border-none bg-transparent"
                }`}
                disabled={doc.status === "aprobado"}
                title={doc.status !== "aprobado" ? "Subir en Mochila" : undefined}
              >
                <span className="t-xs bold trunc text-navy break-words flex-1 pr-2">{doc.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {doc.status === "aprobado" ? (
                    <span className="material-symbols-outlined text-green-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  ) : doc.status === "en_revision" ? (
                    <span className="material-symbols-outlined text-amber-500 text-lg">
                      hourglass_empty
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-red-500 text-lg">
                        warning
                      </span>
                      <span className="t-xs bold text-navy-2 group-hover:underline">Subir →</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* FIX #10: Botón sincronización con estado */}
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="btn-sub w-full py-2 t-xs bold"
            style={{ border: "1px solid var(--navy-2)" }}
          >
            {syncing ? "Sincronizando..." : "Sincronización rápida"}
          </button>
          <p className="t-xs text-center mt-1">
            {lastSyncLabel ?? "Datos cargados al abrir la página"}
          </p>
        </div>

        {/* Tip del día */}
        <div className="bg-[#e8eef8] p-3 rounded-[8px] border border-dashed border-[#1a3a7c]/20 hidden lg:block">
          <p className="t-xs leading-relaxed">
            <span className="bold text-navy-2">Tip de hoy:</span> Asegúrate de que tus escaneos sean en PDF y no superen los 2 MB para evitar errores de carga en PRONABEC.
          </p>
        </div>
      </section>

      {/* ── Modal: Selector de beca ──────────────────────────────────────────── */}
      {isBecaModalOpen && (
        <div className="fixed inset-0 bg-[#0F2554]/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="card max-w-md w-full shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[80vh] overflow-y-auto">
            <div className="row mb-3">
              <h3 className="t-md bold">Mis convocatorias guardadas</h3>
              <button
                onClick={() => { setIsBecaModalOpen(false); setSearchTerm(""); }}
                className="btn-ico"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative mb-3">
              <input
                type="search"
                placeholder="Buscar convocatorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] pl-8 pr-3 py-1.5 t-xs outline-none focus:border-[#1a3a7c] transition-all"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-2 text-[14px]">
                search
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-xs divide-y divide-[#e2e8f0] max-h-[350px] custom-scrollbar">
              {savedBecas.filter(b =>
                b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
                <div className="p-3 text-center t-xs">
                  No se encontraron convocatorias guardadas.
                </div>
              ) : (
                savedBecas.filter(b =>
                  b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  b.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((beca) => {
                  const isSelected = beca.id === selectedAppId;
                  return (
                    <div
                      key={beca.id}
                      onClick={() => {
                        handleSelectBeca(beca.id);
                        setIsBecaModalOpen(false);
                        setSearchTerm("");
                      }}
                      className={`flex justify-between items-center p-2 hover:bg-[#e8eef8] rounded-[8px] cursor-pointer transition-colors ${
                        isSelected ? "bg-[#e8eef8] bold" : ""
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <p className="t-xs bold trunc" title={beca.title}>{beca.title}</p>
                        <p className="t-xs mt-0.5 trunc">{beca.sponsor}</p>
                      </div>
                      <span className="badge b-blue shrink-0">
                        {beca.affinity}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmación de documento sin archivo ──────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#0F2554]/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-sm w-full shadow-2xl border border-[#e2e8f0] text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px] font-bold">warning</span>
            </div>
            <h3 className="t-md bold">Documento no subido</h3>
            <p className="t-xs mt-1 leading-relaxed">
              No hay ningún archivo subido para <strong>{confirmDocName}</strong>. ¿Estás seguro de marcar esta meta como completada?
            </p>
            <div className="flex gap-sm w-full justify-center">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleToggleDocStatus(confirmKeywords, confirmDocName, "faltante");
                }}
                className="bg-[#1a3a7c] text-white px-4 py-2 rounded-[8px] t-xs bold hover:opacity-90 shadow-md transition-all cursor-pointer flex-1 border-none"
              >
                Sí, completar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="border border-[#e2e8f0] text-slate px-4 py-2 rounded-[8px] t-xs bold hover:bg-[#f1f5f9] transition-all cursor-pointer flex-1 bg-transparent"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notification ────────────────────────────────────────────────── */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#0F2554] text-white px-4 py-2.5 rounded-[8px] shadow-xl flex items-center gap-sm animate-in slide-in-from-bottom-5 duration-300 font-bold t-xs select-none">
          <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
