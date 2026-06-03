import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import type { Oportunidad } from "../lib/types";

export default function BuscarOportunidades() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [isProfileFilterActive, setIsProfileFilterActive] = useState(false);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [selectedOportunidad, setSelectedOportunidad] = useState<Oportunidad | null>(null);

  useEffect(() => {
    const fetchBecas = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
          return;
        }
        const { data, error } = await supabase
          .from("becas")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching scholarships from Supabase:", error);
          return;
        }

        if (data) {
          const mapped: Oportunidad[] = data.map((row: any) => {
            let days = 30;
            if (row.fecha_cierre) {
              const diffTime = new Date(row.fecha_cierre).getTime() - new Date().getTime();
              days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            }
            return {
              id: row.id,
              title: row.titulo,
              sponsor: row.sponsor,
              coverage: row.cobertura,
              requirement: row.requisitos,
              deadline: days > 1 ? `Cierra en ${days} días` : `Cierra mañana`,
              level: row.nivel,
              affinity: row.afinidad || 85,
              icon: row.icono || "school",
              sobre: row.sobre || "",
              beneficios: Array.isArray(row.beneficios) ? row.beneficios : []
            };
          });
          setOportunidades(mapped);
        }
      } catch (err) {
        console.error("Unexpected error fetching scholarships:", err);
      }
    };

    fetchBecas();
  }, []);

  const [activeOportunidadesTab, setActiveOportunidadesTab] = useState<"explorar" | "guardadas" | "postuladas">(() => {
    const storedTab = localStorage.getItem("pathfinder_search_tab");
    if (storedTab === "guardadas" || storedTab === "postuladas") {
      localStorage.removeItem("pathfinder_search_tab");
      return storedTab;
    }
    return "explorar";
  });

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Saved beca IDs — synced with Supabase (becas_guardadas table), localStorage as UI cache
  const [savedBecaIds, setSavedBecaIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("pathfinder_saved_becas");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Applied beca IDs — loaded from Supabase postulaciones table
  const [appliedBecaIds, setAppliedBecaIds] = useState<string[]>([]);

  // Load saved becas from Supabase on mount
  useEffect(() => {
    const loadSavedBecas = async () => {
      if (!user || !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) return;
      try {
        const { data, error } = await supabase
          .from("becas_guardadas")
          .select("beca_id")
          .eq("usuario_id", user.id);
        if (!error && data) {
          const ids = data.map((r: any) => r.beca_id);
          setSavedBecaIds(ids);
          localStorage.setItem("pathfinder_saved_becas", JSON.stringify(ids));
        }
      } catch (err) {
        console.error("Error loading saved becas:", err);
      }
    };
    loadSavedBecas();
  }, [user]);

  // Load applied becas from Supabase postulaciones table
  useEffect(() => {
    const loadAppliedBecas = async () => {
      if (!user || !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) return;
      try {
        const { data, error } = await supabase
          .from("postulaciones")
          .select("beca_id")
          .eq("usuario_id", user.id);
        if (!error && data) {
          setAppliedBecaIds(data.map((r: any) => r.beca_id));
        }
      } catch (err) {
        console.error("Error loading applied becas:", err);
      }
    };
    loadAppliedBecas();
  }, [user]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Delete postulation confirmation modal
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [accordionOpen, setAccordionOpen] = useState({
    programa: true,
    financiamiento: true,
    gestion: true,
    destino: true,
  });

  const toggleAccordion = (key: keyof typeof accordionOpen) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const closeAllDrawers = () => {
    setIsFiltersDrawerOpen(false);
    setSelectedOportunidad(null);
  };

  // Toggle Save (Favorite) — syncs with Supabase becas_guardadas table
  const handleToggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isSaved = savedBecaIds.includes(id);
    const updated = isSaved
      ? savedBecaIds.filter((item) => item !== id)
      : [...savedBecaIds, id];

    setSavedBecaIds(updated);
    localStorage.setItem("pathfinder_saved_becas", JSON.stringify(updated));
    setToastMessage(isSaved ? "Beca eliminada de tus guardados." : "¡Beca guardada con éxito!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    if (!user || !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) return;
    try {
      if (isSaved) {
        await supabase.from("becas_guardadas").delete().eq("usuario_id", user.id).eq("beca_id", id);
      } else {
        const { data: existing } = await supabase
          .from("becas_guardadas").select("id").eq("usuario_id", user.id).eq("beca_id", id).maybeSingle();
        if (!existing) {
          await supabase.from("becas_guardadas").insert([{ usuario_id: user.id, beca_id: id }]);
        }
      }
    } catch (err) {
      console.error("Error toggling saved beca in Supabase:", err);
    }
  };

  // Simulate Application
  const handleApply = async (id: string) => {
    if (appliedBecaIds.includes(id)) {
      setToastMessage("Ya has postulado a esta beca.");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    const updated = [...appliedBecaIds, id];
    setAppliedBecaIds(updated);
    localStorage.setItem("pathfinder_applied_becas", JSON.stringify(updated));

    // Also persist to Supabase so MisPostulaciones can read it
    if (user && import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from("postulaciones")
          .select("id")
          .eq("usuario_id", user.id)
          .eq("beca_id", id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("postulaciones").insert([
            {
              usuario_id: user.id,
              beca_id: id,
              paso_pipeline: 1,
              estado_general: "Preparación",
            },
          ]);
        }
      } catch (err) {
        console.error("Error saving postulation to Supabase:", err);
      }
    }

    setToastMessage("¡Postulación enviada con éxito! Revisa tu pestaña 'Mis Postulaciones'.");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    closeAllDrawers();
  };

  // Dynamic requirements checklists generator
  const generateRequisitos = (oportunidad: Oportunidad) => {
    let minNota = 14.0;
    if (oportunidad.requirement.toLowerCase().includes("16")) minNota = 16.0;
    else if (oportunidad.requirement.toLowerCase().includes("15")) minNota = 15.0;

    // Student has GPA of 18.5
    const cumpleNota = 18.5 >= minNota;

    return [
      { campo: `Promedio >= ${minNota.toFixed(1)}`, perfil: "18.5", estado: cumpleNota ? "Cumple" : "Pendiente" },
      {
        campo: oportunidad.level === "Idioma" ? "Certificado escolar" : "Idioma Inglés (B2)",
        perfil: oportunidad.level === "Idioma" ? "5to Sec." : "B2 (Intermedio)",
        estado: "Cumple",
      },
      { campo: "Certificado de salud", perfil: "No cargado", estado: "Pendiente" },
      { campo: "Ensayo de motivación", perfil: "Sin iniciar", estado: "Pendiente" },
    ];
  };

  // Delete a postulation from Supabase and update local state
  const handleDeletePostulation = async (becaId: string) => {
    setAppliedBecaIds((prev) => prev.filter((id) => id !== becaId));
    setShowDeleteModal(false);
    setPendingDeleteId(null);

    if (!user || !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) return;
    try {
      await supabase
        .from("postulaciones")
        .delete()
        .eq("usuario_id", user.id)
        .eq("beca_id", becaId);
    } catch (err) {
      console.error("Error deleting postulation:", err);
    }
  };

  // Filter and search logic
  const filteredOportunidades = oportunidades.filter((oportunidad) => {
    if (activeOportunidadesTab === "guardadas") {
      if (!savedBecaIds.includes(oportunidad.id)) return false;
    }
    if (activeOportunidadesTab === "postuladas") {
      if (!appliedBecaIds.includes(oportunidad.id)) return false;
    }

    const matchesSearch =
      oportunidad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oportunidad.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oportunidad.requirement.toLowerCase().includes(searchQuery.toLowerCase());

    if (isProfileFilterActive) {
      return matchesSearch && oportunidad.affinity >= 85;
    }

    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* TopNavBar */}
      <header className="sticky top-0 right-0 w-full z-40 bg-white border-b border-[#e2e8f0] h-14 flex justify-between items-center px-6">
        <div className="flex items-center gap-lg flex-1">
          <div className="relative w-full max-w-md flex items-center gap-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-2 text-[16px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] pl-10 pr-4 py-1.5 t-xs outline-none focus:border-[#1a3a7c] transition-all"
                placeholder="Buscar becas, universidades o convenios..."
                type="text"
              />
            </div>
            <button
              onClick={() => setIsFiltersDrawerOpen(true)}
              className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm mr-1">tune</span>
              Filtros
            </button>
          </div>
          <div className="flex items-center gap-sm shrink-0">
            <span className="t-xs bold hidden sm:inline text-navy">
              Filtrar por mi Perfil
            </span>
            <button
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${
                isProfileFilterActive ? "bg-[#1a3a7c]" : "bg-[#e2e8f0]"
              }`}
              onClick={() => setIsProfileFilterActive(!isProfileFilterActive)}
            >
              <div
                className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  isProfileFilterActive ? "translate-x-5" : ""
                }`}
              ></div>
            </button>
          </div>
        </div>
      </header>

      {/* Body Content */}
      <div className="p-md md:p-margin-desktop max-w-7xl mx-auto space-y-lg w-full">

        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-sm border-b border-[#e2e8f0] pb-3">
          <div>
            <h2 className="t-lg bold leading-none">
              {activeOportunidadesTab === "explorar" && "Oportunidades Disponibles"}
              {activeOportunidadesTab === "guardadas" && "Mis Becas Guardadas"}
              {activeOportunidadesTab === "postuladas" && "Mis Postulaciones"}
            </h2>
            <p className="t-sm mt-1.5">
              {activeOportunidadesTab === "explorar" && `${filteredOportunidades.length} de ${oportunidades.length} resultados para tu perfil`}
              {activeOportunidadesTab === "guardadas" && `${savedBecaIds.length} beca${savedBecaIds.length !== 1 ? "s" : ""} guardada${savedBecaIds.length !== 1 ? "s" : ""} — listas para postular`}
              {activeOportunidadesTab === "postuladas" && `${appliedBecaIds.length} beca${appliedBecaIds.length !== 1 ? "s" : ""} con postulación activa`}
            </p>
          </div>

          <div className="flex gap-sm self-start shrink-0">
            {/* 3-tab switcher */}
            <div className="tabs">
              <button
                onClick={() => setActiveOportunidadesTab("explorar")}
                className={`tab ${activeOportunidadesTab === "explorar" ? "on" : ""}`}
              >
                <span className="material-symbols-outlined text-[12px] mr-1">travel_explore</span>
                Explorar
              </button>
              <button
                onClick={() => setActiveOportunidadesTab("guardadas")}
                className={`tab ${activeOportunidadesTab === "guardadas" ? "on" : ""}`}
              >
                <span className="material-symbols-outlined text-[12px] mr-1">favorite</span>
                Guardadas
                {savedBecaIds.length > 0 && (
                  <span className="badge b-red ml-1">
                    {savedBecaIds.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveOportunidadesTab("postuladas")}
                className={`tab ${activeOportunidadesTab === "postuladas" ? "on" : ""}`}
              >
                <span className="material-symbols-outlined text-[12px] mr-1">task_alt</span>
                Postuladas
                {appliedBecaIds.length > 0 && (
                  <span className="badge b-blue ml-1">
                    {appliedBecaIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid - Scrollable and highly responsive */}
        {filteredOportunidades.length === 0 ? (
          <div className="card text-center max-w-md mx-auto my-8 w-full">
            {activeOportunidadesTab === "guardadas" ? (
              <>
                <span className="material-symbols-outlined text-slate text-5xl mb-3">favorite_border</span>
                <h3 className="t-md bold mb-1">No tienes becas guardadas aún</h3>
                <p className="t-xs mb-4">
                  Explora las oportunidades y haz clic en ❤️ para guardar las que te interesen. Luego podrás postular con un solo clic.
                </p>
                <button
                  onClick={() => setActiveOportunidadesTab("explorar")}
                  className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform"
                >
                  Explorar Becas
                </button>
              </>
            ) : activeOportunidadesTab === "postuladas" ? (
              <>
                <span className="material-symbols-outlined text-slate text-5xl mb-3">task_alt</span>
                <h3 className="t-md bold mb-1">Aún no has postulado a ninguna beca</h3>
                <p className="t-xs mb-4">
                  Guarda primero una beca y desde la pestaña "Guardadas" podrás postular. Tu progreso aparecerá en Mis Postulaciones.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setActiveOportunidadesTab("guardadas")}
                    className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform"
                  >
                    Ver Guardadas
                  </button>
                  <button
                    onClick={() => navigate("/postulaciones")}
                    className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform"
                  >
                    Mis Postulaciones
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-slate text-5xl mb-3">search_off</span>
                <h3 className="t-md bold mb-1">Sin resultados</h3>
                <p className="t-xs mb-4">Intenta con otros términos de búsqueda.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredOportunidades.map((oportunidad) => {
              const affinityClass = oportunidad.affinity >= 90 ? "badge b-green" : "badge b-blue";

              const isSaved = savedBecaIds.includes(oportunidad.id);
              const isApplied = appliedBecaIds.includes(oportunidad.id);

              return (
                <article
                  key={oportunidad.id}
                  onClick={() => setSelectedOportunidad(oportunidad)}
                  className="card hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  style={{ borderRadius: "var(--r-md)" }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#e8eef8] flex items-center justify-center text-navy-2">
                        <span className="material-symbols-outlined text-2xl font-fill">
                          {oportunidad.icon}
                        </span>
                      </div>
                      {activeOportunidadesTab === "postuladas" ? (
                        <button
                          className="btn-ico"
                          title="Cancelar postulación"
                          onClick={(e) => { e.stopPropagation(); setPendingDeleteId(oportunidad.id); setShowDeleteModal(true); }}
                        >
                          <span className="material-symbols-outlined text-red">delete</span>
                        </button>
                      ) : (
                        <button
                          className={`btn-ico ${isSaved ? "text-red font-fill" : ""}`}
                          onClick={(e) => handleToggleSave(oportunidad.id, e)}
                        >
                          <span className="material-symbols-outlined">favorite</span>
                        </button>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-xs mb-1 flex-wrap">
                        <span className={`${affinityClass}`}>
                          {oportunidad.affinity}% Afinidad
                        </span>
                        <span className="badge b-slate">
                          {oportunidad.level}
                        </span>
                        {isApplied && (
                          <span className="badge b-blue">
                            Postulado
                          </span>
                        )}
                      </div>
                      <h3 className="t-base bold group-hover:text-[#1a3a7c] transition-colors leading-snug">
                        {oportunidad.title}
                      </h3>
                      <p className="t-xs">
                        {oportunidad.sponsor}
                      </p>
                    </div>

                    <div className="space-y-sm text-body-sm mb-3">
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-sm text-slate-2 shrink-0">
                          payments
                        </span>
                        <span className="t-xs trunc">{oportunidad.coverage}</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-sm text-slate-2 shrink-0">
                          grade
                        </span>
                        <span className="t-xs trunc">{oportunidad.requirement}</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span
                          className={`material-symbols-outlined text-sm shrink-0 ${
                            oportunidad.id === "BEC-03" ? "text-red" : "text-slate-2"
                          }`}
                        >
                          event
                        </span>
                        <span
                          className={`t-xs ${oportunidad.id === "BEC-03" ? "text-red bold" : ""}`}
                        >
                          {oportunidad.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#e2e8f0]">
                    {activeOportunidadesTab === "postuladas" ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/postulaciones", { state: { becaId: oportunidad.id } }); }}
                        className="text-[#166534] t-xs bold flex items-center gap-1 cursor-pointer hover:underline border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                        Ver mi progreso
                      </button>
                    ) : (
                      <button className="text-navy-2 t-xs bold flex items-center gap-1 cursor-pointer hover:underline border-none bg-transparent">
                        Ver Detalles{" "}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Common Overlay Backdrop */}
      {(isFiltersDrawerOpen || selectedOportunidad) && (
        <div
          onClick={closeAllDrawers}
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[55] transition-opacity duration-300 opacity-100 cursor-pointer"
        />
      )}

      {/* Filters Drawer (Slides from right) */}
      <div
        className={`fixed top-0 right-0 h-screen w-[320px] bg-white z-[60] transition-transform duration-300 ease-out flex flex-col shadow-2xl border-l border-[#e2e8f0] ${
          isFiltersDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f1f5f9]">
          <h2 className="t-md bold text-[#0F2554]">Filtros Avanzados</h2>
          <button className="t-link bg-transparent border-none">
            Limpiar todo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Filter Group: Tipo de Programa */}
          <div className="border-b border-[#e2e8f0] pb-4">
            <button
              onClick={() => toggleAccordion("programa")}
              className="flex items-center justify-between w-full mb-3 group cursor-pointer bg-transparent border-none"
            >
              <span className="t-base bold text-[#0F2554]">Tipo de Programa</span>
              <span
                className={`material-symbols-outlined text-[18px] text-[#64748b] transition-transform duration-200 ${
                  accordionOpen.programa ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.programa && (
              <div className="space-y-2">
                {["Universitarias", "Técnicas", "Postgrado", "Idiomas"].map((p, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      defaultChecked={i === 0}
                      className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                      type="checkbox"
                    />
                    <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                      {p}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter Group: Nivel de Financiamiento */}
          <div className="border-b border-[#e2e8f0] pb-4">
            <button
              onClick={() => toggleAccordion("financiamiento")}
              className="flex items-center justify-between w-full mb-3 group cursor-pointer bg-transparent border-none"
            >
              <span className="t-base bold text-[#0F2554]">Financiamiento</span>
              <span
                className={`material-symbols-outlined text-[18px] text-[#64748b] transition-transform duration-200 ${
                  accordionOpen.financiamiento ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.financiamiento && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5" name="fin" type="radio" defaultChecked />
                  <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                    Beca Integral (100%)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5" name="fin" type="radio" />
                  <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                    Beca Parcial
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Filter Group: Gestión */}
          <div className="border-b border-[#e2e8f0] pb-4">
            <button
              onClick={() => toggleAccordion("gestion")}
              className="flex items-center justify-between w-full mb-3 group cursor-pointer bg-transparent border-none"
            >
              <span className="t-base bold text-[#0F2554]">Gestión</span>
              <span
                className={`material-symbols-outlined text-[18px] text-[#64748b] transition-transform duration-200 ${
                  accordionOpen.gestion ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.gestion && (
              <div className="space-y-2">
                {["Pública", "Privada"].map((g, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                      type="checkbox"
                    />
                    <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter Group: Destino */}
          <div>
            <button
              onClick={() => toggleAccordion("destino")}
              className="flex items-center justify-between w-full mb-3 group cursor-pointer bg-transparent border-none"
            >
              <span className="t-base bold text-[#0F2554]">Destino</span>
              <span
                className={`material-symbols-outlined text-[18px] text-[#64748b] transition-transform duration-200 ${
                  accordionOpen.destino ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.destino && (
              <div className="space-y-2">
                {["Lima", "Provincias", "Extranjero"].map((d, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      defaultChecked={i === 0}
                      className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                      type="checkbox"
                    />
                    <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                      {d}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-[#e2e8f0] sticky bottom-0">
          <button
            onClick={() => setIsFiltersDrawerOpen(false)}
            className="w-full py-2 bg-[#1a3a7c] text-white rounded-[8px] t-xs bold hover:bg-[#0F2554] transition-all cursor-pointer border-none"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Details Drawer (Slides from right, completely dynamic based on selected scholarship) */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-2xl bg-white z-[60] transition-transform duration-500 ease-out flex flex-col shadow-2xl border-l border-[#e2e8f0] ${
          selectedOportunidad ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedOportunidad && (
          <>
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-start bg-[#f1f5f9]">
              <div className="space-y-2 w-full">
                <button
                  onClick={() => setSelectedOportunidad(null)}
                  className="material-symbols-outlined text-[#64748b] hover:text-[#0F2554] mb-2 cursor-pointer p-1 rounded-full hover:bg-[#e2e8f0] transition-colors bg-transparent border-none text-[18px]"
                >
                  close
                </button>
                <div className="flex gap-2 mb-1 flex-wrap">
                  <span className="badge b-blue uppercase">
                    {selectedOportunidad.level}
                  </span>
                  <span className="badge b-amber uppercase">
                    {selectedOportunidad.affinity >= 90 ? "Excelencia" : "Aptitud"}
                  </span>
                </div>
                <h2 className="t-lg bold text-[#0F2554] leading-tight">
                  {selectedOportunidad.title}
                </h2>
                <div className="flex items-center gap-1.5 text-[#166534] t-sm bold">
                  <span className="material-symbols-outlined text-sm font-fill">
                    verified
                  </span>
                  <span>{selectedOportunidad.affinity}% de afinidad con tu perfil</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* T-Shirt Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#f1f5f9] p-3 rounded-[12px] border border-[#e2e8f0]">
                  <p className="t-xs bold uppercase mb-1">Cobertura</p>
                  <p className="t-sm bold text-[#0F2554] leading-tight">
                    {selectedOportunidad.coverage.replace("Cubre: ", "")}
                  </p>
                </div>
                <div className="bg-[#f1f5f9] p-3 rounded-[12px] border border-[#e2e8f0]">
                  <p className="t-xs bold uppercase mb-1">Cierre</p>
                  <p className="t-sm bold text-[#991b1b] leading-tight">
                    {selectedOportunidad.deadline.replace("Cierra en ", "")}
                  </p>
                </div>
                <div className="bg-[#f1f5f9] p-3 rounded-[12px] border border-[#e2e8f0]">
                  <p className="t-xs bold uppercase mb-1">Institución</p>
                  <p className="t-sm bold text-[#0F2554] leading-tight">
                    {selectedOportunidad.sponsor}
                  </p>
                </div>
                <div className="bg-[#f1f5f9] p-3 rounded-[12px] border border-[#e2e8f0]">
                  <p className="t-xs bold uppercase mb-1">Nivel</p>
                  <p className="t-sm bold text-[#0F2554] leading-tight">
                    {selectedOportunidad.level}
                  </p>
                </div>
              </div>

              {/* About section */}
              <section className="space-y-2">
                <h3 className="t-md bold border-l-4 border-[#1a3a7c] pl-2 text-[#0F2554]">
                  Sobre la Convocatoria
                </h3>
                <p className="t-base text-[#0F2554] leading-relaxed">
                  {selectedOportunidad.sobre}
                </p>
              </section>

              {/* Benefits Section */}
              <section className="space-y-2 border-t border-[#e2e8f0] pt-4">
                <h3 className="t-md bold border-l-4 border-[#1a3a7c] pl-2 text-[#0F2554]">
                  Beneficios Subvencionados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-body-sm">
                  {selectedOportunidad.beneficios.map((ben, idx) => (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <span className="material-symbols-outlined text-[#166534] text-sm">
                        check_circle
                      </span>
                      <span className="t-sm text-[#0F2554] leading-snug">{ben}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cross Match Requirements Section */}
              <section className="space-y-2 border-t border-[#e2e8f0] pt-4 pb-4">
                <h3 className="t-md bold border-l-4 border-[#1a3a7c] pl-2 text-[#0F2554]">
                  Cruce de Requisitos
                </h3>
                <div className="bg-white rounded-[12px] overflow-hidden border border-[#e2e8f0] p-3">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>Requisito Beca</th>
                        <th style={{ width: "35%" }}>Tu Perfil</th>
                        <th style={{ width: "20%" }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateRequisitos(selectedOportunidad).map((req, idx) => (
                        <tr key={idx}>
                          <td className="t-base text-[#0F2554]">{req.campo}</td>
                          <td className="t-base bold text-[#0F2554] font-semibold">{req.perfil}</td>
                          <td>
                            {req.estado === "Cumple" ? (
                              <span className="s-ok bold">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Cumple
                              </span>
                            ) : (
                              <span className="s-warn bold">
                                <span className="material-symbols-outlined text-xs">pending</span> Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="p-4 bg-white border-t border-[#e2e8f0] flex gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => handleToggleSave(selectedOportunidad.id)}
                className={`btn-sub flex-1 py-2 flex items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                  savedBecaIds.includes(selectedOportunidad.id)
                    ? "border-[#991b1b] text-[#991b1b] bg-[#fee2e2]"
                    : "border-[#1a3a7c] text-[#1a3a7c]"
                }`}
              >
                <span className="material-symbols-outlined text-sm" style={savedBecaIds.includes(selectedOportunidad.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  favorite
                </span>{" "}
                {savedBecaIds.includes(selectedOportunidad.id) ? "Guardado ✓" : "Guardar"}
              </button>
              {appliedBecaIds.includes(selectedOportunidad.id) ? (
                <button
                  onClick={() => { navigate("/postulaciones", { state: { becaId: selectedOportunidad.id } }); closeAllDrawers(); }}
                  className="flex-[2] bg-[#e8eef8] text-[#1a3a7c] border border-[#1a3a7c]/30 py-2 rounded-[8px] flex items-center justify-center gap-1 cursor-pointer font-bold hover:bg-[#e2e8f0] transition-all hover:scale-[1.01] active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm font-fill">task_alt</span>
                  Ver mi progreso
                </button>
              ) : (
                <button
                  onClick={() => handleApply(selectedOportunidad.id)}
                  className="flex-[2] bg-[#0F2554] text-white py-2 rounded-[8px] shadow-sm hover:bg-[#1a3a7c] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1 ml-auto cursor-pointer bold border-none"
                >
                  Postular ahora{" "}
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Dark Delete Confirmation Modal */}
      {showDeleteModal && pendingDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
          />
          {/* Modal */}
          <div className="relative bg-slate-900 text-white rounded-[16px] p-6 max-w-sm w-full shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-4 duration-300">
            {/* Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[8px] bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-400 text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="t-base bold text-white">¿Cancelar postulación?</h3>
                <p className="t-xs mt-0.5 text-slate-400">
                  {oportunidades.find(o => o.id === pendingDeleteId)?.title || "Esta beca"}
                </p>
              </div>
            </div>
            <p className="t-sm mb-6 leading-relaxed text-slate-300">
              Se eliminará tu postulación y todo el progreso guardado. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
                className="flex-1 py-2 rounded-[8px] border border-slate-600 bg-transparent text-slate-300 t-xs bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePostulation(pendingDeleteId)}
                className="flex-[1.5] py-2 rounded-[8px] bg-red-600 hover:bg-red-700 text-white t-xs bold transition-all active:scale-95 shadow-lg shadow-red-600/30 cursor-pointer flex items-center justify-center gap-1.5 border-none"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-[#0F2554] text-white p-4 rounded-[12px] shadow-2xl flex items-center gap-3 border border-white/10 animate-pulse">
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <div>
            <p className="t-sm bold text-white">Notificación de Pathfinder</p>
            <p className="t-xs text-white/95">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
