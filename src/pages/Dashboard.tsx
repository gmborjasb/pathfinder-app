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
          const { data: post } = await supabase
            .from("postulaciones")
            .select("*")
            .eq("usuario_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (post) {
            setPostulation(post);
            const { data: docs } = await supabase
              .from("documentos")
              .select("*")
              .eq("postulacion_id", post.id);

            if (docs) {
              setDbDocs(docs);
            }
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
    const baseDocs = [
      { id: 1, name: "Certificado de Estudios", origin: "Trámite Minedu", actionType: "download" },
      { id: 2, name: "Constancia de Primeros Puestos", origin: "Colegio Secundario", actionType: "download" },
      { id: 3, name: "Declaración Jurada de Ingresos", origin: "Formato Pronabec", actionType: "upload_signature" },
      { id: 4, name: "Certificado de Inglés", origin: "Británico / ICPNA", actionType: "upload_certificate" }
    ];

    return baseDocs.map((doc) => {
      const dbDoc = dbDocs.find((d) => d.nombre_documento === doc.name);
      if (dbDoc) {
        return {
          ...doc,
          status: dbDoc.estado === "Rechazado" ? "error" : "valid",
          statusText: dbDoc.estado === "Rechazado" ? "Rechazado" : "Validado",
          actionType: "download",
          archivo_url: dbDoc.archivo_url
        };
      }
      return {
        ...doc,
        status: doc.id === 3 ? "warning" : doc.id === 4 ? "pending" : "valid",
        statusText: doc.id === 1 
          ? "Validado" 
          : doc.id === 2 
            ? "Validado"
            : doc.id === 3 
              ? "Falta firma" 
              : "Pendiente",
      };
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

  const activePaso = postulation ? postulation.paso_pipeline : null;
  const progressPercent = activePaso ? Math.round(((activePaso - 1) / 3) * 100) : 0;
  const activeBeca = postulation ? becas.find(b => b.id === postulation.beca_id) : null;
  const activeBecaTitle = activeBeca ? activeBeca.titulo : "Beca 18";

  const beca18 = becas.find(b => b.id === "BEC-01");
  const beca18DeadlineText = beca18?.fecha_cierre ? `el ${formatLongDate(beca18.fecha_cierre)}` : "pronto";

  // Check if there is any document with status "Rechazado"
  const hasRejectedDoc = dbDocs.some(d => d.estado === "Rechazado");

  return (
    <div className="root">
      {/* Header and Welcome Section */}
      <div>
        <p className="t-lg">Hola, {profileName}</p>
        <p className="t-sm muted" style={{ marginTop: "3px" }}>Aquí tienes el estado de tu camino a la universidad.</p>
        
        {postulation && (
          <div style={{ maxWidth: "300px", marginTop: "10px" }}>
            <div className="row" style={{ marginBottom: "5px" }}>
              <span className="t-xs muted">
                Progreso en {activeBecaTitle} · Paso {activePaso} de 4
              </span>
              <span className="t-xs bold" style={{ color: "var(--navy-2)" }}>{progressPercent}%</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col">

          {/* Pipeline de Postulación */}
          <div className="card">
            <div className="row" style={{ marginBottom: "14px" }}>
              <div>
                <p className="t-base bold">Pipeline de postulación</p>
                <p className="t-xs muted" style={{ marginTop: "2px" }}>
                  Proceso actual para <span className="bold" style={{ color: "var(--navy-2)" }}>{activeBecaTitle}</span>
                </p>
              </div>
              {postulation ? (
                <span className="badge b-amber">
                  {postulation.estado_general.charAt(0).toUpperCase() + postulation.estado_general.slice(1).toLowerCase()}
                </span>
              ) : (
                <span className="badge b-slate">Sin postulación</span>
              )}
            </div>

            {!postulation ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0", textAlign: "center" }}>
                <span className="material-symbols-outlined muted" style={{ fontSize: "28px", marginBottom: "8px" }}>assignment_late</span>
                <p className="t-sm bold">Sin postulaciones activas</p>
                <p className="t-xs muted" style={{ marginTop: "4px", maxWidth: "260px" }}>
                  Aún no has iniciado una postulación. Explora becas y guarda tus favoritas para comenzar.
                </p>
                <a href="/buscar" className="t-link" style={{ marginTop: "10px", fontSize: "11px" }}>
                  Explorar becas ahora →
                </a>
              </div>
            ) : (
              <div className="pipe-wrap">
                <div className="pipe-bg"></div>
                <div 
                  className="pipe-fill" 
                  style={{ 
                    width: activePaso === 1 ? "8%" : activePaso === 2 ? "40%" : activePaso === 3 ? "72%" : "100%" 
                  }}
                ></div>
                
                {getPipelineSteps(activePaso).map((step) => {
                  let stepClass = "sc-pend";
                  if (step.status === "completed") stepClass = "sc-done";
                  else if (step.status === "active") stepClass = "sc-active";

                  return (
                    <div key={step.id} className="step">
                      <div className={`sc ${stepClass}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {step.status === "completed" ? "check" : step.icon}
                        </span>
                      </div>
                      <span 
                        className={`t-xs ${step.status === "pending" ? "muted2" : "bold"}`} 
                        style={{ color: step.status !== "pending" ? "var(--navy-2)" : undefined, textAlign: "center" }}
                      >
                        {step.label}
                      </span>
                      {step.status === "active" && <span className="pill-now">Actual</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

                    if (doc.status === "warning") {
                      statusClass = "s-warn";
                      statusIcon = "warning";
                    } else if (doc.status === "error" || doc.status === "pending") {
                      statusClass = "s-err";
                      statusIcon = "cancel";
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
