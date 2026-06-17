import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState(47 * 3600 + 12 * 60 + 8);
  const [activeTab, setActiveTab] = useState<"charlas" | "talleres">("charlas");
  
  const [becas, setBecas] = useState<any[]>([]);
  const [charlas, setCharlas] = useState<any[]>([]);
  const [talleres, setTalleres] = useState<any[]>([]);
  const [dbDocs, setDbDocs] = useState<any[]>([]);
  const [postulation, setPostulation] = useState<any>(null);

  const [reservations, setReservations] = useState<string[]>(() => {
    const storedRes = localStorage.getItem("pathfinder_reservations");
    if (storedRes) {
      try {
        return JSON.parse(storedRes);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  const [activeDot, setActiveDot] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postDocsMap, setPostDocsMap] = useState<Record<string, any[]>>({});
  const [showBecaDD, setShowBecaDD] = useState(false);
  const becaDDRef = useRef<HTMLDivElement>(null);

  const [savedBecaIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("pathfinder_saved_becas");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
          return;
        }

        const [becasRes, charlasRes, talleresRes] = await Promise.all([
          supabase.from("becas").select("*").order("id", { ascending: true }),
          supabase.from("charlas").select("*").order("id", { ascending: true }),
          supabase.from("talleres").select("*").order("id", { ascending: true })
        ]);

        if (becasRes.data) setBecas(becasRes.data);
        if (charlasRes.data) setCharlas(charlasRes.data);
        if (talleresRes.data) setTalleres(talleresRes.data);

        if (user) {
          const { data: posts } = await supabase
            .from("postulaciones")
            .select("*")
            .eq("usuario_id", user.id)
            .order("created_at", { ascending: false });

          if (posts && posts.length > 0) {
            setPostulaciones(posts);
            setPostulation(posts[0]);
            setSelectedPostId(posts[0].id);

            const map: Record<string, any[]> = {};
            for (const p of posts) {
              const { data: docs } = await supabase
                .from("documentos")
                .select("*")
                .eq("postulacion_id", p.id);
              if (docs) map[p.id] = docs;
            }
            setPostDocsMap(map);
            setDbDocs(map[posts[0].id] || []);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data from Supabase:", err);
      }
    };

    loadDashboardData();
  }, [user]);

  const savedBecas = savedBecaIds
    .map((id) => becas.find((b) => b.id === id))
    .filter((b) => !!b)
    .map((row) => ({
      id: row.id,
      title: row.titulo,
      sponsor: row.sponsor,
      coverage: row.cobertura,
      requirement: row.requisitos,
      deadline: row.fecha_cierre,
      level: row.nivel,
      affinity: row.afinidad || 85,
      icon: row.icono || "school"
    }));

  const savedBecasCount = savedBecaIds.length;

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;
      const percentage = scrollLeft / maxScroll;
      const dotIndex = Math.min(Math.round(percentage * 4), 4);
      setActiveDot(dotIndex);
    }
  };

  const scrollToDot = (dotIndex: number) => {
    if (sliderRef.current) {
      const { scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      sliderRef.current.scrollTo({
        left: (dotIndex / 4) * maxScroll,
        behavior: "smooth",
      });
      setActiveDot(dotIndex);
    }
  };

  // Sync dbDocs when selected postulation changes
  useEffect(() => {
    if (selectedPostId && postDocsMap[selectedPostId]) {
      setDbDocs(postDocsMap[selectedPostId]);
    }
  }, [selectedPostId, postDocsMap]);

  // Close beca dropdown on outside click
  useEffect(() => {
    if (!showBecaDD) return;
    const handler = (e: MouseEvent) => {
      if (becaDDRef.current && !becaDDRef.current.contains(e.target as Node)) {
        setShowBecaDD(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBecaDD]);

  const profileName = profile?.nombres ? profile.nombres.split(" ")[0] : "Camila";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReserve = (id: string, title: string) => {
    let updated: string[];
    if (reservations.includes(id)) {
      updated = reservations.filter((item) => item !== id);
      setNotificationMsg(`Cancelaste tu cupo para: "${title}"`);
    } else {
      updated = [...reservations, id];
      setNotificationMsg(`¡Cupo reservado con éxito para: "${title}"! Se guardó en tu calendario.`);
    }
    setReservations(updated);
    localStorage.setItem("pathfinder_reservations", JSON.stringify(updated));

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // Formatting helpers
  const truncateToWordBoundary = (str: string, maxLength: number) => {
    if (!str || str.length <= maxLength) return str;
    const sub = str.slice(0, maxLength);
    const lastSpace = sub.lastIndexOf(" ");
    if (lastSpace === -1) return sub + "...";
    return sub.slice(0, lastSpace) + "...";
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
    }).replace(".", "");
  };

  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return "pronto";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDeadlineTextColorStyle = (dateStr: string) => {
    if (!dateStr) return { color: "var(--slate)" };
    const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (days <= 7) return { color: "var(--red)", fontWeight: "var(--fw-medium)" };
    if (days <= 30) return { color: "var(--amber)", fontWeight: "var(--fw-medium)" };
    return { color: "var(--green)", fontWeight: "var(--fw-medium)" };
  };

  const getEventWeight = (dateTimeStr: string) => {
    const str = (dateTimeStr || "").toLowerCase();
    if (str.includes("hoy") || str.includes("ahora")) return 1;
    if (str.includes("mañana")) return 2;
    if (str.includes("en 2 días")) return 3;
    if (str.includes("en 3 días")) return 4;
    if (str.includes("lunes")) return 10;
    if (str.includes("martes")) return 11;
    if (str.includes("miércoles")) return 12;
    if (str.includes("jueves")) return 13;
    if (str.includes("viernes")) return 14;
    if (str.includes("sábado")) return 15;
    if (str.includes("domingo")) return 16;
    return 100;
  };

  const getDashboardDocs = () => {
    // Build required docs list from active beca, then overlay real DB status
    let requiredDocs: { id: number; name: string; origin: string }[] = [];

    if (activeBeca && Array.isArray(activeBeca.documentos_requeridos) && activeBeca.documentos_requeridos.length > 0) {
      requiredDocs = activeBeca.documentos_requeridos.map((d: any, i: number) => ({
        id: i + 1,
        name: d.name || d.nombre_documento || "",
        origin: d.description || d.fileText || "",
      }));
    } else {
      requiredDocs = [
        { id: 1, name: "Certificado de Estudios", origin: "Trámite Minedu" },
        { id: 2, name: "Constancia de Primeros Puestos", origin: "Colegio Secundario" },
        { id: 3, name: "Declaración Jurada de Ingresos", origin: "Formato Pronabec" },
        { id: 4, name: "Certificado de Inglés", origin: "Británico / ICPNA" },
      ];
    }

    return requiredDocs.map((req) => {
      const dbDoc = selectedDocs.find((d: any) => d.nombre_documento === req.name);
      if (dbDoc) {
        const isValid     = ["Validado", "Listo", "Aprobado"].includes(dbDoc.estado);
        const isRejected  = dbDoc.estado === "Rechazado";
        const isReviewing = dbDoc.estado === "En Revisión";
        return {
          ...req,
          status:     isValid ? "valid" : isRejected ? "error" : isReviewing ? "reviewing" : "pending",
          statusText: isValid ? "Validado" : isRejected ? "Rechazado" : isReviewing ? "Validando" : "Pendiente",
          actionType: isValid || isReviewing ? "download" : "upload",
          archivo_url: dbDoc.archivo_url,
        };
      }
      return { ...req, status: "pending", statusText: "Pendiente", actionType: "upload" };
    });
  };

  const getPipelineSteps = (paso: number) => {
    return [
      { id: 1, label: "Preparación", icon: "edit_document", status: paso >= 1 ? (paso === 1 ? "active" : "completed") : "pending" },
      { id: 2, label: "Enviada", icon: "send", status: paso >= 2 ? (paso === 2 ? "active" : "completed") : "pending" },
      { id: 3, label: "Evaluación", icon: "fact_check", status: paso >= 3 ? (paso === 3 ? "active" : "completed") : "pending" },
      { id: 4, label: "Resultados", icon: "emoji_events", status: paso >= 4 ? (paso === 4 ? "active" : "completed") : "pending" },
    ];
  };

  const getMatches = () => {
    const sorted = [...becas]
      .filter((b) => b.id !== "BEC-01")
      .sort((a, b) => (b.afinidad || 85) - (a.afinidad || 85))
      .slice(0, 3);

    return sorted.map((row) => ({
      id: row.id,
      name: row.titulo,
      matchPercentage: row.afinidad || 85,
      coverage: row.cobertura.includes("100%") ? "100%" : row.cobertura.includes("80%") ? "80%" : "50%",
      requirementIcon: row.icono || "school",
      requirementLabel: row.requisitos ? (row.requisitos.split(",")[0] || "Requisito mínimo") : "Requisito mínimo"
    }));
  };

  const currentCharlas = charlas
    .map((c) => ({
      id: c.id,
      title: c.titulo,
      sponsor: c.sponsor,
      modality: c.modalidad,
      dateTime: c.fecha_hora,
      actionText: c.texto_accion
    }))
    .sort((a, b) => getEventWeight(a.dateTime) - getEventWeight(b.dateTime));

  const currentTalleres = talleres
    .map((t) => ({
      id: t.id,
      title: t.titulo,
      sponsor: t.sponsor,
      statusFrequency: t.frecuencia_estado,
      focus: t.enfoque,
      actionText: t.texto_accion
    }))
    .sort((a, b) => getEventWeight(a.statusFrequency) - getEventWeight(b.statusFrequency));

  const selectedPost = postulaciones.find(p => p.id === selectedPostId) || postulation;
  const activePaso = selectedPost ? selectedPost.paso_pipeline : null;
  const progressPercent = activePaso ? Math.round(((activePaso - 1) / 3) * 100) : 0;
  const activeBeca = selectedPost ? becas.find(b => b.id === selectedPost.beca_id) : null;
  const activeBecaTitle = activeBeca ? activeBeca.titulo : "Beca 18";

  const selectedDocs = selectedPostId ? (postDocsMap[selectedPostId] || dbDocs) : dbDocs;
  const docsListos = selectedDocs.filter(d => ["Validado", "Listo", "Aprobado"].includes(d.estado)).length;
  const docsTotal = selectedDocs.length;
  const diasCierre = activeBeca?.fecha_cierre
    ? Math.floor((new Date(activeBeca.fecha_cierre).getTime() - Date.now()) / 86400000)
    : null;

  const pasoLabels = ["", "Preparación", "Enviada", "Evaluación", "Resultados"];
  const badgeColors: Record<number, { bg: string; color: string }> = {
    1: { bg: "#fef3c7", color: "#92400e" },
    2: { bg: "#e8eef8", color: "#1a3a7c" },
    3: { bg: "#dcfce7", color: "#166534" },
    4: { bg: "#f1f5f9", color: "#64748b" },
  };

  const beca18 = becas.find(b => b.id === "BEC-01");
  const beca18DeadlineText = beca18?.fecha_cierre ? `el ${formatLongDate(beca18.fecha_cierre)}` : "pronto";

  // Check if there is any document with status "Rechazado"
  const hasRejectedDoc = dbDocs.some(d => d.estado === "Rechazado");

  return (
    <div className="root">
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <p className="t-lg">Hola, {profileName}</p>
        <p className="t-sm muted" style={{ marginTop: 3 }}>Aquí tienes el estado de tu camino a la universidad.</p>
      </div>

      {/* Beca selector */}
      <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12, position: "relative" }} className="flex-wrap">
        <span className="hidden sm:inline" style={{ fontSize: 10, fontWeight: 500, color: "var(--slate)", textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>Seguimiento de</span>
        <div style={{ flex: 1, position: "relative" }} ref={becaDDRef}>
          <button
            onClick={() => setShowBecaDD(!showBecaDD)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#e8eef8", border: "1.5px solid #1a3a7c", borderRadius: 10, padding: "8px 12px", cursor: "pointer", gap: 8 }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "#0F2554", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
              {activeBecaTitle}
            </span>
            {activePaso && (
              <span style={{ fontSize: 10, color: "#1a3a7c", whiteSpace: "nowrap", flexShrink: 0 }}>
                Paso {activePaso} de 4
              </span>
            )}
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#1a3a7c", flexShrink: 0, transition: "transform .2s", transform: showBecaDD ? "rotate(180deg)" : "none" }}>expand_more</span>
          </button>

          {showBecaDD && postulaciones.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 24px rgba(15,37,84,.12)", zIndex: 100, overflow: "hidden" }}>
              {postulaciones.map((p) => {
                const b = becas.find(b => b.id === p.beca_id);
                const isSelected = p.id === selectedPostId;
                const bc = badgeColors[p.paso_pipeline] || badgeColors[1];
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedPostId(p.id); setShowBecaDD(false); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer", gap: 8, borderBottom: "1px solid var(--border)", background: isSelected ? "#e8eef8" : "var(--white)" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "#e8eef8", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3a7c", flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>school</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: "#0F2554", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b?.titulo || "Beca"}</p>
                        <p style={{ fontSize: 10, color: "#64748b" }}>{b?.sponsor || ""}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: bc.bg, color: bc.color, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {pasoLabels[p.paso_pipeline] || "En curso"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dark pipeline card */}
      {selectedPost ? (
        <div style={{ background: "#0F2554", borderRadius: 14, padding: "18px 20px", marginBottom: 14, color: "white", position: "relative", overflow: "hidden" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ minWidth: 0, flex: 1, marginRight: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>Postulación en curso</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: "white", lineHeight: 1.2 }}>{activeBecaTitle}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{activeBeca?.sponsor}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 28, fontWeight: 500, color: "white", lineHeight: 1 }}>{progressPercent}%</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginTop: 2 }}>completado</p>
            </div>
          </div>

          {/* Pipeline steps */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", padding: "0 8px" }}>
            <div style={{ position: "absolute", top: 17, left: 8, right: 8, height: 2, background: "rgba(255,255,255,.15)", borderRadius: 2 }} />
            <div style={{ position: "absolute", top: 17, left: 8, height: 2, background: "#60a5fa", borderRadius: 2, transition: "width .6s", width: activePaso === 1 ? "8%" : activePaso === 2 ? "40%" : activePaso === 3 ? "72%" : "100%" }} />
            {getPipelineSteps(activePaso || 1).map((step) => {
              const isDone = step.status === "completed";
              const isActive = step.status === "active";
              const circleStyle = isDone
                ? { background: "#60a5fa", color: "#0F2554" }
                : isActive
                  ? { background: "white", color: "#1a3a7c", boxShadow: "0 0 0 4px rgba(96,165,250,.3)" }
                  : { background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.3)" };
              const labelColor = isDone ? "rgba(255,255,255,.7)" : isActive ? "white" : "rgba(255,255,255,.3)";
              return (
                <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative", zIndex: 1, width: "25%" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", ...circleStyle }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      {isDone ? "check" : step.icon}
                    </span>
                  </div>
                  <span style={{ fontSize: 9, textAlign: "center", lineHeight: 1.3, color: labelColor, fontWeight: isDone || isActive ? 500 : 400 }}>{step.label}</span>
                  {isActive && <span style={{ background: "rgba(96,165,250,.25)", color: "#bfdbfe", fontSize: 8, fontWeight: 500, padding: "1px 6px", borderRadius: 99 }}>Actual</span>}
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)" }}>
            <div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".05em" }}>Afinidad</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#86efac" }}>
                {activeBeca?.afinidad ? `${activeBeca.afinidad}% match` : "—"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".05em" }}>Documentos</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: docsTotal > 0 && docsListos === docsTotal ? "#86efac" : "#fcd34d" }}>
                {docsTotal > 0 ? `${docsListos} de ${docsTotal} listos` : "Sin docs"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".05em" }}>Cierre</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: diasCierre === null ? "white" : diasCierre <= 7 ? "#fca5a5" : diasCierre <= 30 ? "#fcd34d" : "#86efac" }}>
                {diasCierre === null ? "Sin fecha" : diasCierre < 0 ? "Cerrado" : `En ${diasCierre} días`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: "#0F2554", borderRadius: 14, padding: "18px 20px", marginBottom: 14, color: "white", textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: "rgba(255,255,255,.4)", marginBottom: 8, display: "block" }}>assignment_late</span>
          <p style={{ fontSize: 13, fontWeight: 500, color: "white" }}>Sin postulaciones activas</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 4 }}>Explora becas y guarda tus favoritas para comenzar.</p>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col">

          {/* Alerta de Documento Rechazado */}
          {hasRejectedDoc && (
            <div className="card b-red" style={{ border: "1px solid var(--red)", display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span className="material-symbols-outlined text-lg" style={{ color: "var(--red)", marginTop: "1px" }}>priority_high</span>
              <div>
                <p className="t-sm bold" style={{ color: "var(--red)" }}>Atención inmediata</p>
                <p className="t-xs" style={{ color: "var(--red)", marginTop: "2px", lineHeight: "1.4" }}>
                  Tienes un documento rechazado en tu mochila que requiere tu acción para no perder elegibilidad.
                </p>
                <a href="/documentos" className="t-link font-bold" style={{ color: "var(--red)", textDecoration: "underline", display: "inline-block", marginTop: "6px" }}>
                  Reemplazar ahora →
                </a>
              </div>
            </div>
          )}

          {/* Mochila de Documentos */}
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div className="row" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span className="material-symbols-outlined icon-hdr">backpack</span>
                <span className="t-base bold">Mochila de documentos</span>
              </div>
              <a href="/documentos" className="t-link">Gestionar todo</a>
            </div>
            <div style={{ padding: "0 16px" }}>
              <table className="tbl">
                <colgroup>
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "38%" }} />
                  <col style={{ width: "26%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {getDashboardDocs().map((doc) => {
                    let statusClass = "s-ok";
                    let statusIcon = "check_circle";

                    if (doc.status === "reviewing") {
                      statusClass = "s-warn";
                      statusIcon = "sync";
                    } else if (doc.status === "error") {
                      statusClass = "s-err";
                      statusIcon = "cancel";
                    } else if (doc.status === "pending") {
                      statusClass = "s-pen";
                      statusIcon = "hourglass_empty";
                    }

                    return (
                      <tr key={doc.id}>
                        <td>
                          <p className="t-sm bold trunc" title={doc.name}>{doc.name}</p>
                          <p className="t-xs muted2">{doc.origin}</p>
                        </td>
                        <td>
                          <span className={statusClass}>
                            <span className="material-symbols-outlined text-[14px]">{statusIcon}</span>
                            {doc.statusText}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {doc.actionType === "download" ? (
                            <button 
                              className="btn-ico" 
                              aria-label="Descargar"
                              onClick={() => {
                                if ((doc as any).archivo_url) {
                                  window.open((doc as any).archivo_url, "_blank");
                                } else {
                                  setNotificationMsg(`Descargando copia local de: "${doc.name}"...`);
                                  setShowNotification(true);
                                  setTimeout(() => setShowNotification(false), 3000);
                                }
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                            </button>
                          ) : (
                            <a href="/documentos" style={{ textDecoration: "none" }}>
                              <button className="btn-sub">Subir →</button>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charlas e Inducciones en Vivo */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <span className="material-symbols-outlined icon-hdr">live_tv</span>
              <span className="t-base bold">Charlas e inducciones en vivo</span>
            </div>
            
            <div className="tabs">
              <button 
                onClick={() => {
                  setActiveTab("charlas");
                  setActiveDot(0);
                  if (sliderRef.current) sliderRef.current.scrollLeft = 0;
                }}
                className={`tab ${activeTab === "charlas" ? "on" : ""}`}
              >
                Charlas informativas ({currentCharlas.length})
              </button>
              <button 
                onClick={() => {
                  setActiveTab("talleres");
                  setActiveDot(0);
                  if (sliderRef.current) sliderRef.current.scrollLeft = 0;
                }}
                className={`tab ${activeTab === "talleres" ? "on" : ""}`}
              >
                Talleres prácticos ({currentTalleres.length})
              </button>
            </div>

            {/* Slider Container */}
            <div className="space-y-md min-w-0 w-full overflow-hidden">
              <div
                ref={sliderRef}
                onScroll={handleScroll}
                className="flex gap-md overflow-x-auto snap-x snap-mandatory scroll-smooth pb-md pr-1 py-1 custom-scrollbar w-full min-w-0"
              >
                {activeTab === "charlas" ? (
                  currentCharlas.map((charla) => {
                    const isReserved = reservations.includes(charla.id);
                    const isLive = (charla.dateTime || "").toLowerCase().includes("hoy") || (charla.dateTime || "").toLowerCase().includes("mañana") || (charla.dateTime || "").toLowerCase().includes("en vivo");

                    return (
                      <div
                        key={charla.id}
                        className="snap-start shrink-0 w-[88%] sm:w-[48%] bg-surface border border-border-subtle rounded-2xl p-md lg:p-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px", minHeight: "140px" }}
                      >
                        <div>
                          <div className="row" style={{ marginBottom: "8px" }}>
                            {isLive ? (
                              <span className="badge b-red">
                                <span className="live-dot" aria-label="En vivo" role="img"></span>
                                {charla.modality}
                              </span>
                            ) : (
                              <span className="badge b-blue">{charla.modality}</span>
                            )}
                            <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--slate-2)" }}>
                              {isLive ? "videocam" : "calendar_today"}
                            </span>
                          </div>
                          <p className="t-sm bold" style={{ lineHeight: "1.45" }}>
                            {truncateToWordBoundary(charla.title, 60)}
                          </p>
                          <p className="t-xs muted2" style={{ marginTop: "4px" }}>
                            {charla.dateTime} · {charla.sponsor}
                          </p>
                        </div>

                        {isReserved ? (
                          <div className="reserved">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Cupo reservado
                          </div>
                        ) : (
                          <button
                            onClick={() => handleReserve(charla.id, charla.title)}
                            className="btn-sub"
                            style={{ width: "100%", marginTop: "10px", padding: "6px" }}
                          >
                            {charla.actionText || "Reservar →"}
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  currentTalleres.map((taller) => {
                    const isReserved = reservations.includes(taller.id);
                    const isLive = (taller.statusFrequency || "").toLowerCase().includes("hoy") || (taller.statusFrequency || "").toLowerCase().includes("mañana") || (taller.statusFrequency || "").toLowerCase().includes("en vivo");

                    return (
                      <div
                        key={taller.id}
                        className="snap-start shrink-0 w-[88%] sm:w-[48%] bg-surface border border-border-subtle rounded-2xl p-md lg:p-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px", minHeight: "140px" }}
                      >
                        <div>
                          <div className="row" style={{ marginBottom: "8px" }}>
                            {isLive ? (
                              <span className="badge b-red">
                                <span className="live-dot" aria-label="En vivo" role="img"></span>
                                {taller.focus}
                              </span>
                            ) : (
                              <span className="badge b-blue">{taller.focus}</span>
                            )}
                            <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--slate-2)" }}>
                              engineering
                            </span>
                          </div>
                          <p className="t-sm bold" style={{ lineHeight: "1.45" }}>
                            {truncateToWordBoundary(taller.title, 60)}
                          </p>
                          <p className="t-xs muted2" style={{ marginTop: "4px" }}>
                            {taller.statusFrequency} · {taller.sponsor}
                          </p>
                        </div>

                        {isReserved ? (
                          <div className="reserved">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Inscrito
                          </div>
                        ) : (
                          <button
                            onClick={() => handleReserve(taller.id, taller.title)}
                            className="btn-sub"
                            style={{ width: "100%", marginTop: "10px", padding: "6px" }}
                          >
                            {taller.actionText || "Inscribirse →"}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Slider Pagination Dots */}
              <div className="flex justify-center items-center gap-xs pt-xs" style={{ display: "flex", gap: "4px", justifyContent: "center", marginTop: "8px" }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    onClick={() => scrollToDot(i)}
                    className="transition-all cursor-pointer"
                    style={{
                      width: activeDot === i ? "16px" : "6px",
                      height: "6px",
                      borderRadius: "99px",
                      border: "none",
                      backgroundColor: activeDot === i ? "var(--navy-2)" : "var(--slate-2)",
                    }}
                    aria-label={`Ir al grupo ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="dashboard-col">

          {/* Próximo Cierre Hourglass Card */}
          <div className="card-dark">
            <p className="t-label" style={{ color: "#93c5fd", marginBottom: "6px" }}>Próximo cierre</p>
            <p style={{ fontSize: "28px", fontWeight: "var(--fw-medium)", color: "var(--white)", lineHeight: "1", marginBottom: "5px" }}>
              {hours}h {minutes}m {seconds}s
            </p>
            <p style={{ fontSize: "var(--fs-xs)", color: "#93c5fd", lineHeight: "1.6", marginBottom: "14px" }}>
              Beca 18 cierra sus inscripciones {beca18DeadlineText}. No pierdas tu lugar.
            </p>
            <a 
              href="/documentos"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: "var(--white)",
                color: "var(--navy-2)",
                fontSize: "var(--fs-sm)",
                fontWeight: "var(--fw-medium)",
                padding: "9px 12px",
                borderRadius: "var(--r-sm)",
                textDecoration: "none",
                cursor: "pointer"
              }}
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              Subir papel faltante
            </a>
          </div>

          {/* Match Feed */}
          <div>
            <div className="row" style={{ marginBottom: "10px" }}>
              <span className="t-label">Tus opciones de ganar</span>
              <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--slate-2)", cursor: "help" }} title="Afinidad de perfil con los requisitos de la beca">info</span>
            </div>
            
            {getMatches().map((match) => {
              const matchBadgeClass = match.matchPercentage >= 85 ? "b-green" : "b-blue";

              return (
                <a
                  href="/buscar"
                  key={match.id}
                  className="match-item block"
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div className="row" style={{ marginBottom: "3px" }}>
                    <p className="t-sm bold trunc" style={{ maxWidth: "140px" }} title={match.name}>
                      {truncateToWordBoundary(match.name, 30)}
                    </p>
                    <span className={`badge ${matchBadgeClass}`} style={{ flexShrink: 0, marginLeft: "6px" }}>
                      {match.matchPercentage}%
                    </span>
                  </div>
                  <p className="t-xs muted2 trunc">
                    Cobertura {match.coverage} · {truncateToWordBoundary(match.requirementLabel, 20)}
                  </p>
                </a>
              );
            })}

            <a href="/buscar" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "7px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--navy-2)", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-medium)", cursor: "pointer" }}>
                Ver todos los matches
              </button>
            </a>
          </div>

          {/* Becas Guardadas */}
          <div className="card">
            <div className="row" style={{ paddingBottom: "10px", borderBottom: "1px solid var(--border)", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "var(--slate)" }}>favorite</span>
                <span className="t-sm bold">Becas guardadas</span>
              </div>
              <a 
                href="/buscar"
                onClick={() => {
                  localStorage.setItem("pathfinder_search_tab", "guardadas");
                }}
                className="t-link"
              >
                Ver todas ({savedBecasCount})
              </a>
            </div>

            {savedBecas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <p className="t-xs muted" style={{ lineHeight: "1.6" }}>No tienes becas guardadas. Explora oportunidades y agrégalas a tus favoritos.</p>
                <a href="/buscar" className="t-link" style={{ fontSize: "10px", marginTop: "6px", display: "inline-block" }}>Explorar Becas</a>
              </div>
            ) : (
              savedBecas.slice(0, 3).map((beca) => (
                <a
                  href="/buscar"
                  key={beca.id}
                  onClick={() => {
                    localStorage.setItem("pathfinder_search_tab", "guardadas");
                  }}
                  className="saved-item"
                >
                  <div className="icon-sq">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                      {beca.icon === "science" ? "microscope" : beca.icon === "school" ? "school" : beca.icon}
                    </span>
                  </div>
                  <div style={{ minWidth: "0", flex: 1 }}>
                    <p className="t-sm bold trunc" title={beca.title}>{beca.title}</p>
                    <p className="t-xs" style={{ marginTop: "1px", color: "var(--slate-2)" }}>
                      {beca.sponsor} · <span style={getDeadlineTextColorStyle(beca.deadline)}>{formatShortDate(beca.deadline)}</span>
                    </p>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: "12px", color: "var(--slate-2)", flexShrink: 0 }}>arrow_forward</span>
                </a>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div 
          className="fixed top-20 right-6 z-[99] bg-primary text-white p-lg rounded-2xl shadow-2xl flex items-center gap-md border border-white/20 animate-in slide-in-from-right-4 duration-300"
          style={{
            position: "fixed",
            top: "80px",
            right: "24px",
            zIndex: 99,
            backgroundColor: "var(--navy)",
            color: "var(--white)",
            padding: "12px 16px",
            borderRadius: "var(--r-md)",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--green)" }}>verified</span>
          <div>
            <p className="t-sm bold" style={{ color: "var(--white)" }}>Reserva de Actividad</p>
            <p className="t-xs" style={{ color: "rgba(255,255,255,0.9)", marginTop: "2px" }}>{notificationMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
