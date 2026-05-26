import { useState } from "react";
import { oportunidadesMocks } from "../mocks/buscar";
import type { Oportunidad } from "../mocks/buscar";

export default function BuscarOportunidades() {
  const [isProfileFilterActive, setIsProfileFilterActive] = useState(false);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [selectedOportunidad, setSelectedOportunidad] = useState<Oportunidad | null>(null);

  const [activeOportunidadesTab, setActiveOportunidadesTab] = useState<"explorar" | "guardadas">(() => {
    const storedTab = localStorage.getItem("pathfinder_search_tab");
    if (storedTab === "guardadas") {
      localStorage.removeItem("pathfinder_search_tab");
      return "guardadas";
    }
    return "explorar";
  });

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Caching simulation states
  const [savedBecaIds, setSavedBecaIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("pathfinder_saved_becas");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [appliedBecaIds, setAppliedBecaIds] = useState<string[]>(() => {
    const applied = localStorage.getItem("pathfinder_applied_becas");
    if (applied) {
      try {
        return JSON.parse(applied);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

  // Toggle Save (Favorite)
  const handleToggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    let updated: string[];
    if (savedBecaIds.includes(id)) {
      updated = savedBecaIds.filter((item) => item !== id);
      setToastMessage("Beca eliminada de tus guardados.");
    } else {
      updated = [...savedBecaIds, id];
      setToastMessage("¡Beca guardada con éxito en tu portal!");
    }

    setSavedBecaIds(updated);
    localStorage.setItem("pathfinder_saved_becas", JSON.stringify(updated));

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Simulate Application
  const handleApply = (id: string) => {
    if (appliedBecaIds.includes(id)) {
      setToastMessage("Ya has postulado a esta beca.");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    const updated = [...appliedBecaIds, id];
    setAppliedBecaIds(updated);
    localStorage.setItem("pathfinder_applied_becas", JSON.stringify(updated));

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

  // Filter and search logic
  const filteredOportunidades = oportunidadesMocks.filter((oportunidad) => {
    // Filter by saved items if the active tab is "guardadas"
    if (activeOportunidadesTab === "guardadas") {
      if (!savedBecaIds.includes(oportunidad.id)) return false;
    }

    // Search query match
    const matchesSearch =
      oportunidad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oportunidad.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oportunidad.requirement.toLowerCase().includes(searchQuery.toLowerCase());

    // Profile filter (only show high affinity items > 85%)
    if (isProfileFilterActive) {
      return matchesSearch && oportunidad.affinity >= 85;
    }

    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* TopNavBar */}
      <header className="sticky top-0 right-0 w-full z-40 bg-surface/80 backdrop-blur-md border-b border-border-subtle h-16 flex justify-between items-center px-md md:px-margin-desktop">
        <div className="flex items-center gap-lg flex-1">
          <div className="relative w-full max-w-md flex items-center gap-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-slate text-[20px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border-none rounded-xl pl-10 pr-4 py-2 text-body-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Buscar becas, universidades o convenios..."
                type="text"
              />
            </div>
            <button
              onClick={() => setIsFiltersDrawerOpen(true)}
              className="flex items-center gap-2 px-md py-2 bg-surface border border-border-subtle rounded-xl text-body-sm font-body-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-md">tune</span>
              Filtros
            </button>
          </div>
          <div className="flex items-center gap-sm shrink-0">
            <span className="text-body-sm text-muted-slate hidden sm:inline">
              Filtrar por mi Perfil
            </span>
            <button
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${
                isProfileFilterActive ? "bg-primary" : "bg-outline-variant"
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

        <div className="flex items-center gap-lg pl-2">
          <button
            onClick={() => {
              setToastMessage("Selecciona una beca de la lista para postular.");
              setShowSuccessToast(true);
              setTimeout(() => setShowSuccessToast(false), 3000);
            }}
            className="bg-primary text-white px-md py-2 rounded-xl font-body-bold hover:bg-primary-container transition-all cursor-pointer font-bold hidden sm:block"
          >
            Postular Ahora
          </button>
        </div>
      </header>

      {/* Body Content */}
      <div className="p-md md:p-margin-desktop max-w-7xl mx-auto space-y-lg w-full">
        {/* Guía Rápida - Atenuada e Integrada */}
        <div className="bg-surface border border-border-subtle rounded-xl p-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm mb-lg animate-fade-in">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-muted-slate text-[18px]">help_outline</span>
            <p className="text-[11px] text-muted-slate leading-relaxed">
              Haz clic en una beca para ver sus detalles. Guárdala tocando el corazón ❤️ en la tarjeta o en el panel de detalles. Las verás en la pestaña <strong>"Mis Guardadas"</strong> o en tu Dashboard.
            </p>
          </div>
          <button
            onClick={() => setActiveOportunidadesTab("guardadas")}
            className="text-[11px] text-primary font-body-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-xs">favorite</span>
            Ver guardadas ({savedBecaIds.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-sm border-b border-border-subtle pb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary font-bold text-xl md:text-2xl leading-none">
              Oportunidades Disponibles
            </h2>
            <p className="text-body-sm text-muted-slate mt-1.5">
              {activeOportunidadesTab === "explorar"
                ? `Mostrando ${filteredOportunidades.length} de ${oportunidadesMocks.length} resultados que coinciden con tu perfil`
                : `Mostrando ${filteredOportunidades.length} becas guardadas en tus favoritos`
              }
            </p>
          </div>
          
          <div className="flex gap-sm self-start shrink-0">
            {/* Exploration Tabs switcher */}
            <div className="flex p-0.5 bg-surface-container-low rounded-lg shrink-0 w-fit">
              <button
                onClick={() => setActiveOportunidadesTab("explorar")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeOportunidadesTab === "explorar"
                    ? "bg-white text-primary shadow"
                    : "text-muted-slate hover:bg-slate-200"
                }`}
              >
                Explorar Todas
              </button>
              <button
                onClick={() => setActiveOportunidadesTab("guardadas")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeOportunidadesTab === "guardadas"
                    ? "bg-white text-primary shadow"
                    : "text-muted-slate hover:bg-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-[14px] text-error-red font-fill">favorite</span>
                Mis Guardadas ({savedBecaIds.length})
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid - Scrollable and highly responsive */}
        {filteredOportunidades.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border-subtle p-xl text-center max-w-md mx-auto my-8 animate-fade-in w-full">
            <span className="material-symbols-outlined text-muted-slate text-5xl mb-md">
              favorite_border
            </span>
            <h3 className="font-body-bold font-bold text-sm text-slate-800 mb-xs">
              No tienes becas guardadas aún
            </h3>
            <p className="text-xs text-muted-slate mb-lg leading-relaxed">
              Explora las oportunidades disponibles y haz clic en el icono de corazón ❤️ para guardar tus becas preferidas.
            </p>
            <button
              onClick={() => setActiveOportunidadesTab("explorar")}
              className="px-md py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-container transition-colors cursor-pointer"
            >
              Explorar Becas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredOportunidades.map((oportunidad) => {
              let affinityClass = "text-primary bg-primary/10";
              if (oportunidad.affinity >= 90) {
                affinityClass = "text-tertiary-container bg-tertiary/10";
              } else if (oportunidad.affinity < 85) {
                affinityClass = "text-secondary-container bg-secondary/10";
              }

              const isSaved = savedBecaIds.includes(oportunidad.id);
              const isApplied = appliedBecaIds.includes(oportunidad.id);

              return (
                <article
                  key={oportunidad.id}
                  onClick={() => setSelectedOportunidad(oportunidad)}
                  className="bg-surface p-lg rounded-2xl shadow-sm border border-border-subtle hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-md">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl font-fill">
                          {oportunidad.icon}
                        </span>
                      </div>
                      <button
                        className={`material-symbols-outlined hover:text-error-red transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100 ${
                          isSaved ? "text-error-red font-fill" : "text-muted-slate"
                        }`}
                        onClick={(e) => handleToggleSave(oportunidad.id, e)}
                      >
                        favorite
                      </button>
                    </div>

                    <div className="mb-lg">
                      <div className="flex items-center gap-xs mb-xs flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${affinityClass}`}
                        >
                          {oportunidad.affinity}% Afinidad
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-slate font-semibold">
                          {oportunidad.level}
                        </span>
                        {isApplied && (
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-100 text-primary px-2 py-0.5 rounded-full">
                            Postulado
                          </span>
                        )}
                      </div>
                      <h3 className="font-body-bold text-lg text-on-surface group-hover:text-primary transition-colors leading-snug font-bold">
                        {oportunidad.title}
                      </h3>
                      <p className="text-body-sm text-muted-slate mt-0.5">
                        {oportunidad.sponsor}
                      </p>
                    </div>

                    <div className="space-y-sm text-body-sm text-on-surface-variant mb-lg">
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-sm shrink-0">
                          payments
                        </span>
                        <span className="truncate">{oportunidad.coverage}</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-sm shrink-0">
                          grade
                        </span>
                        <span className="truncate">{oportunidad.requirement}</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span
                          className={`material-symbols-outlined text-sm shrink-0 ${
                            oportunidad.id === "BEC-03" ? "text-error-red" : ""
                          }`}
                        >
                          event
                        </span>
                        <span
                          className={oportunidad.id === "BEC-03" ? "text-error-red font-bold" : ""}
                        >
                          {oportunidad.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                    <button className="text-primary font-body-bold text-body-sm flex items-center gap-xs cursor-pointer hover:underline font-bold">
                      Ver Detalles{" "}
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
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
        className={`fixed top-0 right-0 h-screen w-[320px] bg-surface z-[60] transition-transform duration-300 ease-out flex flex-col shadow-2xl border-l border-border-subtle ${
          isFiltersDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-lg border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
          <h2 className="font-body-bold text-on-surface font-bold text-base">Filtros Avanzados</h2>
          <button className="text-primary text-xs font-body-bold hover:underline cursor-pointer">
            Limpiar todo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-lg space-y-md custom-scrollbar">
          {/* Filter Group: Tipo de Programa */}
          <div className="border-b border-border-subtle pb-md">
            <button
              onClick={() => toggleAccordion("programa")}
              className="flex items-center justify-between w-full mb-md group cursor-pointer"
            >
              <span className="font-body-bold text-on-surface text-sm font-semibold">Tipo de Programa</span>
              <span
                className={`material-symbols-outlined transition-transform duration-200 ${
                  accordionOpen.programa ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.programa && (
              <div className="space-y-sm">
                {["Universitarias", "Técnicas", "Postgrado", "Idiomas"].map((p, i) => (
                  <label key={i} className="flex items-center gap-sm cursor-pointer group">
                    <input
                      defaultChecked={i === 0}
                      className="rounded border-border-subtle text-primary focus:ring-primary h-4 w-4"
                      type="checkbox"
                    />
                    <span className="text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
                      {p}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter Group: Nivel de Financiamiento */}
          <div className="border-b border-border-subtle pb-md">
            <button
              onClick={() => toggleAccordion("financiamiento")}
              className="flex items-center justify-between w-full mb-md group cursor-pointer"
            >
              <span className="font-body-bold text-on-surface text-sm font-semibold">Financiamiento</span>
              <span
                className={`material-symbols-outlined transition-transform duration-200 ${
                  accordionOpen.financiamiento ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.financiamiento && (
              <div className="space-y-sm">
                <label className="flex items-center gap-sm cursor-pointer group">
                  <input className="text-primary focus:ring-primary h-4 w-4" name="fin" type="radio" defaultChecked />
                  <span className="text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    Beca Integral (100%)
                  </span>
                </label>
                <label className="flex items-center gap-sm cursor-pointer group">
                  <input className="text-primary focus:ring-primary h-4 w-4" name="fin" type="radio" />
                  <span className="text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    Beca Parcial
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Filter Group: Gestión */}
          <div className="border-b border-border-subtle pb-md">
            <button
              onClick={() => toggleAccordion("gestion")}
              className="flex items-center justify-between w-full mb-md group cursor-pointer"
            >
              <span className="font-body-bold text-on-surface text-sm font-semibold">Gestión</span>
              <span
                className={`material-symbols-outlined transition-transform duration-200 ${
                  accordionOpen.gestion ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.gestion && (
              <div className="space-y-sm">
                {["Pública", "Privada"].map((g, i) => (
                  <label key={i} className="flex items-center gap-sm cursor-pointer group">
                    <input
                      className="rounded border-border-subtle text-primary focus:ring-primary h-4 w-4"
                      type="checkbox"
                    />
                    <span className="text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
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
              className="flex items-center justify-between w-full mb-md group cursor-pointer"
            >
              <span className="font-body-bold text-on-surface text-sm font-semibold">Destino</span>
              <span
                className={`material-symbols-outlined transition-transform duration-200 ${
                  accordionOpen.destino ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {accordionOpen.destino && (
              <div className="space-y-sm">
                {["Lima", "Provincias", "Extranjero"].map((d, i) => (
                  <label key={i} className="flex items-center gap-sm cursor-pointer group">
                    <input
                      defaultChecked={i === 0}
                      className="rounded border-border-subtle text-primary focus:ring-primary h-4 w-4"
                      type="checkbox"
                    />
                    <span className="text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
                      {d}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-lg bg-surface border-t border-border-subtle sticky bottom-0">
          <button
            onClick={() => setIsFiltersDrawerOpen(false)}
            className="w-full py-3 bg-primary text-white rounded-xl font-body-bold hover:bg-primary-container transition-all cursor-pointer font-bold"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Details Drawer (Slides from right, completely dynamic based on selected scholarship) */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-2xl bg-surface z-[60] transition-transform duration-500 ease-out flex flex-col shadow-2xl border-l border-border-subtle ${
          selectedOportunidad ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedOportunidad && (
          <>
            <div className="p-lg border-b border-border-subtle flex justify-between items-start bg-slate-50/50">
              <div className="space-y-sm w-full">
                <button
                  onClick={() => setSelectedOportunidad(null)}
                  className="material-symbols-outlined text-muted-slate hover:text-on-surface mb-2 cursor-pointer p-1 rounded-full hover:bg-slate-200 transition-colors"
                >
                  close
                </button>
                <div className="flex gap-sm mb-xs">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-sm py-1 rounded-full uppercase">
                    {selectedOportunidad.level}
                  </span>
                  <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-sm py-1 rounded-full uppercase">
                    {selectedOportunidad.affinity >= 90 ? "Excelencia" : "Aptitud"}
                  </span>
                </div>
                <h2 className="font-headline-md text-primary text-xl md:text-2xl font-bold leading-tight">
                  {selectedOportunidad.title}
                </h2>
                <div className="flex items-center gap-sm text-tertiary font-body-bold text-sm">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>{selectedOportunidad.affinity}% de afinidad con tu perfil</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-lg space-y-xl custom-scrollbar">
              {/* T-Shirt Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
                <div className="bg-background p-md rounded-2xl border border-border-subtle">
                  <p className="text-[10px] font-bold text-muted-slate uppercase mb-1">Cobertura</p>
                  <p className="text-body-sm font-body-bold text-on-surface leading-tight font-semibold">
                    {selectedOportunidad.coverage.replace("Cubre: ", "")}
                  </p>
                </div>
                <div className="bg-background p-md rounded-2xl border border-border-subtle">
                  <p className="text-[10px] font-bold text-muted-slate uppercase mb-1 font-bold">Cierre</p>
                  <p className="text-body-sm font-body-bold text-error-red leading-tight font-semibold">
                    {selectedOportunidad.deadline.replace("Cierra en ", "")}
                  </p>
                </div>
                <div className="bg-background p-md rounded-2xl border border-border-subtle">
                  <p className="text-[10px] font-bold text-muted-slate uppercase mb-1">Institución</p>
                  <p className="text-body-sm font-body-bold text-on-surface leading-tight font-semibold">
                    {selectedOportunidad.sponsor}
                  </p>
                </div>
                <div className="bg-background p-md rounded-2xl border border-border-subtle">
                  <p className="text-[10px] font-bold text-muted-slate uppercase mb-1">Nivel</p>
                  <p className="text-body-sm font-body-bold text-on-surface leading-tight font-semibold">
                    {selectedOportunidad.level}
                  </p>
                </div>
              </div>

              {/* About section */}
              <section className="space-y-sm">
                <h3 className="font-body-bold text-on-surface border-l-4 border-primary pl-md font-bold text-base">
                  Sobre la Convocatoria
                </h3>
                <p className="text-body-sm text-on-surface-variant leading-relaxed text-slate-600">
                  {selectedOportunidad.sobre}
                </p>
              </section>

              {/* Benefits Section */}
              <section className="space-y-sm border-t border-border-subtle pt-lg">
                <h3 className="font-body-bold text-on-surface border-l-4 border-primary pl-md font-bold text-base">
                  Beneficios Subvencionados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-lg gap-y-sm text-body-sm text-on-surface-variant">
                  {selectedOportunidad.beneficios.map((ben, idx) => (
                    <div key={idx} className="flex gap-sm items-start">
                      <span className="material-symbols-outlined text-tertiary text-sm">
                        check_circle
                      </span>
                      <span className="text-slate-600 leading-snug">{ben}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cross Match Requirements Section */}
              <section className="space-y-sm border-t border-border-subtle pt-lg pb-lg">
                <h3 className="font-body-bold text-on-surface border-l-4 border-primary pl-md font-bold text-base">
                  Cruce de Requisitos
                </h3>
                <div className="bg-surface rounded-2xl overflow-hidden border border-border-subtle shadow-sm">
                  <table className="w-full text-left text-body-sm">
                    <thead className="bg-surface-container-low">
                      <tr className="text-muted-slate border-b border-border-subtle">
                        <th className="px-md py-sm font-body-bold text-xs uppercase tracking-wider">Requisito Beca</th>
                        <th className="px-md py-sm font-body-bold text-xs uppercase tracking-wider">Tu Perfil</th>
                        <th className="px-md py-sm font-body-bold text-xs uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {generateRequisitos(selectedOportunidad).map((req, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-md py-3 text-slate-750">{req.campo}</td>
                          <td className="px-md py-3 text-slate-750 font-semibold">{req.perfil}</td>
                          <td className="px-md py-3">
                            <span
                              className={`font-bold ${
                                req.estado === "Cumple" ? "text-tertiary" : "text-secondary"
                              }`}
                            >
                              {req.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="p-lg bg-surface border-t border-border-subtle flex gap-md sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => handleToggleSave(selectedOportunidad.id)}
                className="flex-1 py-3 border border-border-subtle rounded-xl font-body-bold text-primary hover:bg-surface-container transition-colors flex items-center justify-center gap-sm cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined">
                  {savedBecaIds.includes(selectedOportunidad.id) ? "favorite_border" : "favorite"}
                </span>{" "}
                {savedBecaIds.includes(selectedOportunidad.id) ? "Quitar de Guardados" : "Guardar Beca"}
              </button>
              <button
                onClick={() => handleApply(selectedOportunidad.id)}
                className="flex-[2] bg-[#FFDF94] text-[#594400] border border-[#594400]/20 font-body-bold py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-sm ml-auto cursor-pointer font-bold"
              >
                {appliedBecaIds.includes(selectedOportunidad.id) ? "¡Postulado con Éxito!" : "¡Postular ahora!"}{" "}
                <span className="material-symbols-outlined">bolt</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Floating Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-primary text-white p-lg rounded-2xl shadow-2xl flex items-center gap-md border border-white/20 animate-pulse">
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <div>
            <p className="font-body-bold font-bold text-sm">Notificación de Pathfinder</p>
            <p className="text-xs opacity-90">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
