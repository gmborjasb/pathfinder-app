import { useEffect, useState } from "react";
import {
  historyConvocatorias,
  criticalDates,
} from "../mocks/postulaciones";
import { becasMockData } from "../mocks/dataBase";

export default function MisPostulaciones() {
  const [mounted, setMounted] = useState(false);

  const [appliedBecaIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("pathfinder_applied_becas");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored has fewer than 3 items, make sure BEC-03 is appended to ensure "2 enviadas y 1 en espera"
          if (parsed.length < 3 && !parsed.includes("BEC-03")) {
            const migrated = [...parsed, "BEC-03"];
            localStorage.setItem("pathfinder_applied_becas", JSON.stringify(migrated));
            return migrated;
          }
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Default initial mock applications for the prototype (2 sent: BEC-01, BEC-03, and 1 waiting: BEC-02)
    const defaults = ["BEC-01", "BEC-02", "BEC-03"];
    localStorage.setItem("pathfinder_applied_becas", JSON.stringify(defaults));
    return defaults;
  });

  const [selectedAppId, setSelectedAppId] = useState<string>(() => {
    const stored = localStorage.getItem("pathfinder_applied_becas");
    let ids = ["BEC-01", "BEC-02", "BEC-03"];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ids = parsed;
          if (parsed.length < 3 && !parsed.includes("BEC-03")) {
            ids = [...parsed, "BEC-03"];
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ids.includes("BEC-01") ? "BEC-01" : ids[0] || "BEC-01";
  });

  useEffect(() => {
    // Para replicar la animación de entrada
    setTimeout(() => {
      setMounted(true);
    }, 50);
  }, []);

  // Compute dynamic applied scholarship details
  const appliedBecas = appliedBecaIds.map((id) => {
    const found = becasMockData.find((b) => b.id === id);
    return found || {
      id,
      title: id === "BEC-01" ? "Beca 18 - Ordinaria" : id === "BEC-02" ? "Beca Excelencia BCP" : "Beca Seleccionada",
      sponsor: id === "BEC-01" ? "PRONABEC" : id === "BEC-02" ? "Patronato BCP" : "Institución Organizadora",
      affinity: 85,
      icon: "school",
    };
  });

  // Calculate stats dynamically based on cache
  const dynamicSummaryStats = (() => {
    let prep = 0;
    let env = 0;
    appliedBecaIds.forEach((id) => {
      if (id === "BEC-02") prep++;
      else env++;
    });
    return {
      enPreparacion: prep,
      enviadas: env,
      cerradas: 0,
    };
  })();

  const getAppDetail = (id: string) => {
    const beca = becasMockData.find((b) => b.id === id);
    const logoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBciyI5Ku20i-WnPGAf07a_idMcYQLzPoJp2j83Zwh7D4z_HoU5bzeGgM23CIRG4rSr5jrIXY2DrCUOtwBuluHxVq71dPWcCD7FVGDBEhrF7YYZQxKcayhoYsDQB7DjTyporzoh_C44EDm4j5yiGX56jt3iwurpzkJCrNR1lVCnjftya1ke21_4pmSZSdVqo2IKiW5TORKuJXJnqp-rG-0IwO6ausK-qWaFpeQ2tpxDyZXGebUtyItif1plmh-oQl_RKwNJQsRsXw";
    
    if (id === "BEC-01") {
      return {
        title: "Beca 18 - Convocatoria 2026",
        organization: "Programa Nacional de Becas y Crédito Educativo (PRONABEC)",
        logo: logoUrl,
        status: "Evaluación",
        affinity: 95,
        connectorWidth: "w-[66%]",
        milestoneAlert: {
          title: "Próximo hito:",
          event: "Examen Nacional del Pronabec",
          date: "Domingo 14 de Junio",
        },
        pipeline: [
          { label: "Preparación", status: "completed", icon: "check" },
          { label: "Enviada", status: "completed", icon: "check" },
          { label: "Evaluación", status: "active", icon: "hourglass_empty" },
          { label: "Resultados", status: "pending", icon: "flag" },
        ],
        recommendedTasks: [
          { title: "Ver Temarios del Examen", icon: "description" },
          { title: "Simulacro de Aptitud Académica", icon: "quiz" },
        ],
        iaBanner: {
          badge: "IA Ready",
          title: "Asesor de Postulación",
          description: "He analizado tu perfil y los exámenes pasados. ¿Quieres practicar las secciones de Razonamiento Lógico?",
          buttonText: "Practicar con IA",
        }
      };
    } else if (id === "BEC-02") {
      return {
        title: "Beca Excelencia BCP",
        organization: "Patronato de la Fundación del Banco de Crédito",
        logo: logoUrl,
        status: "Preparación",
        affinity: 88,
        connectorWidth: "w-[10%]",
        milestoneAlert: {
          title: "Próximo hito:",
          event: "Llenado de Ficha Socioeconómica y Carga de Ensayo",
          date: "Viernes 19 de Junio",
        },
        pipeline: [
          { label: "Preparación", status: "active", icon: "edit" },
          { label: "Enviada", status: "pending", icon: "send" },
          { label: "Evaluación", status: "pending", icon: "hourglass_empty" },
          { label: "Resultados", status: "pending", icon: "flag" },
        ],
        recommendedTasks: [
          { title: "Redactar Ensayo de Motivación BCP", icon: "edit_note" },
          { title: "Subir Carta de Admisión U. Aliada", icon: "school" },
        ],
        iaBanner: {
          badge: "IA Ready",
          title: "Optimizar Ensayo",
          description: "Tu borrador del ensayo de voluntariado tiene 78% de afinidad con la beca. ¿Quieres que lo optimicemos?",
          buttonText: "Optimizar con IA",
        }
      };
    } else if (id === "BEC-03") {
      return {
        title: "Beca Mujeres en Ciencia",
        organization: "Programa Nacional de Becas y Crédito Educativo (PRONABEC)",
        logo: logoUrl,
        status: "Evaluación",
        affinity: 89,
        connectorWidth: "w-[66%]",
        milestoneAlert: {
          title: "Próximo hito:",
          event: "Publicación de Lista de Postulantes Aptas",
          date: "Viernes 05 de Junio",
        },
        pipeline: [
          { label: "Preparación", status: "completed", icon: "check" },
          { label: "Enviada", status: "completed", icon: "check" },
          { label: "Evaluación", status: "active", icon: "hourglass_empty" },
          { label: "Resultados", status: "pending", icon: "flag" },
        ],
        recommendedTasks: [
          { title: "Revisar Constancia de Inscripción", icon: "verified" },
          { title: "Verificar Requisitos de Beca STEM", icon: "science" },
        ],
        iaBanner: {
          badge: "IA Ready",
          title: "Validación STEM",
          description: "Tu perfil de Ciencias cumple con los criterios geográficos y promedio de la beca. ¡Tienes 89% de afinidad!",
          buttonText: "Ver Diagnóstico IA",
        }
      };
    } else {
      const name = beca ? beca.title : "Beca Seleccionada";
      const org = beca ? beca.sponsor : "Institución Organizadora";
      const aff = beca ? beca.affinity : 85;
      return {
        title: name,
        organization: org,
        logo: logoUrl,
        status: "Enviada",
        affinity: aff,
        connectorWidth: "w-[66%]",
        milestoneAlert: {
          title: "Próximo hito:",
          event: "Verificación de Firma de Expediente de Documentos",
          date: "En evaluación por comité",
        },
        pipeline: [
          { label: "Preparación", status: "completed", icon: "check" },
          { label: "Enviada", status: "completed", icon: "check" },
          { label: "Evaluación", status: "active", icon: "hourglass_empty" },
          { label: "Resultados", status: "pending", icon: "flag" },
        ],
        recommendedTasks: [
          { title: "Verificar firma de Mochila de Documentos", icon: "verified" },
          { title: "Esperar lista preliminar de elegibles", icon: "schedule" },
        ],
        iaBanner: {
          badge: "IA Ready",
          title: "Expediente Validado",
          description: "He analizado tus documentos y cumplen al 100% con los requisitos legales de postulación.",
          buttonText: "Verificar Requisitos",
        }
      };
    }
  };

  const selectedAppDetail = getAppDetail(selectedAppId);

  return (
    <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      {/* Page Content */}
      <div
        className="max-w-6xl mx-auto px-margin-desktop py-xl w-full transition-all duration-400 ease-out"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0px)" : "translateY(10px)",
        }}
      >
        {/* HEADER Section */}
        <header className="mb-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold text-2xl md:text-display-lg leading-none">
                Mis Postulaciones
              </h1>
              <p className="font-body-base text-body-base text-muted-slate mt-1">
                Sigue el estado de tus aplicaciones y completa los pasos necesarios para obtener tu beca.
              </p>
            </div>
          </div>
        </header>

        {/* Counters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <div className="bg-surface p-lg rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between group hover:border-primary transition-all cursor-default">
            <div>
              <p className="text-muted-slate font-label-caps uppercase tracking-wider mb-1 text-[10px]">
                En Preparación
              </p>
              <h3 className="font-stat-lg text-stat-lg text-on-background font-bold">
                {dynamicSummaryStats.enPreparacion}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
          </div>
          <div className="bg-surface p-lg rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between group hover:border-primary transition-all cursor-default">
            <div>
              <p className="text-muted-slate font-label-caps uppercase tracking-wider mb-1 text-[10px]">
                Enviadas
              </p>
              <h3 className="font-stat-lg text-stat-lg text-on-background font-bold">
                {dynamicSummaryStats.enviadas}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">send</span>
            </div>
          </div>
          <div className="bg-surface p-lg rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between opacity-60">
            <div>
              <p className="text-muted-slate font-label-caps uppercase tracking-wider mb-1 text-[10px]">
                Cerradas
              </p>
              <h3 className="font-stat-lg text-stat-lg text-on-background font-bold">
                {dynamicSummaryStats.cerradas}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low text-muted-slate">
              <span className="material-symbols-outlined">archive</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Left Column: Applications selector & critical dates stacked */}
          <div className="lg:col-span-4 space-y-xl">
            {/* Applications Selector Card list */}
            <div className="bg-surface rounded-2xl border border-border-subtle p-lg shadow-sm">
              <h3 className="font-body-bold font-bold text-sm text-on-surface mb-lg flex items-center gap-2 pb-2 border-b border-border-subtle">
                <span className="material-symbols-outlined text-primary text-xl">list_alt</span>
                Tus Convocatorias Activas
              </h3>
              <div className="space-y-sm">
                {appliedBecas.map((beca) => {
                  const isSelected = beca.id === selectedAppId;
                  const details = getAppDetail(beca.id);
                  
                  return (
                    <button
                      key={beca.id}
                      onClick={() => setSelectedAppId(beca.id)}
                      className={`w-full text-left p-md rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                          : "bg-surface-bright border-border-subtle hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold">
                          <span className="material-symbols-outlined text-[20px]">
                            {beca.id === "BEC-01" ? "school" : beca.id === "BEC-02" ? "workspace_premium" : beca.id === "BEC-03" ? "science" : "account_balance"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-body-bold font-bold text-xs text-slate-800 truncate leading-snug">
                            {beca.title}
                          </h4>
                          <p className="text-[10px] text-muted-slate truncate leading-normal">
                            {beca.sponsor}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 mt-1">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          details.status === "Preparación"
                            ? "bg-secondary-container/10 text-on-secondary-container"
                            : "bg-tertiary-container/10 text-tertiary"
                        }`}>
                          {details.status}
                        </span>
                        <span className="font-bold text-primary">
                          Afinidad: {beca.affinity}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar: Critical Dates */}
            <aside className="space-y-xl">
              <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-lg">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-body-bold font-bold text-sm text-on-background">
                    Fechas Críticas
                  </h4>
                  <span className="material-symbols-outlined text-muted-slate text-xl">
                    calendar_month
                  </span>
                </div>
                <div className="space-y-6 relative px-2">
                  {/* Vertical line */}
                  <div className="absolute left-7 top-2 bottom-2 w-px bg-border-subtle"></div>

                  {criticalDates.map((date, idx) => (
                    <div
                      key={idx}
                      className={`relative flex gap-4 group ${date.active ? "" : date.past ? "opacity-70" : "opacity-70"}`}
                    >
                      <div
                        className={`z-10 w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                          date.active
                            ? "bg-primary text-white shadow-md"
                            : "bg-surface border border-border-subtle shadow-sm group-hover:border-primary transition-colors"
                        }`}
                      >
                        <span
                          className={`text-[9px] font-bold uppercase ${date.active ? "text-primary-fixed opacity-80" : "text-muted-slate"}`}
                        >
                          {date.month}
                        </span>
                        <span
                          className={`text-base font-bold ${date.active ? "" : "text-on-background"}`}
                        >
                          {date.day}
                        </span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h5
                          className={`font-body-bold text-xs font-bold ${date.active ? "text-primary" : "text-on-background group-hover:text-primary transition-colors"}`}
                        >
                          {date.title}
                        </h5>
                        <p className="text-[10px] text-muted-slate">
                          {date.subtitle}
                        </p>

                        {date.timeLeftInfo && (
                          <div className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-error">
                            <span className="material-symbols-outlined text-[11px]">
                              {date.timeLeftIcon}
                            </span>
                            <span>{date.timeLeftInfo}</span>
                          </div>
                        )}

                        {date.priorityInfo && (
                          <div className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-tertiary">
                            <span className="material-symbols-outlined text-[11px]">
                              {date.priorityIcon}
                            </span>
                            <span>{date.priorityInfo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-2.5 border-2 border-dashed border-border-subtle rounded-xl text-muted-slate text-xs font-body-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">
                    add
                  </span>
                  Sincronizar Calendario
                </button>
              </div>
            </aside>
          </div>

          {/* Right Column: Active Application Details */}
          <div className="lg:col-span-8 space-y-xl">
            {/* Expanded Card for selected postulation */}
            <section className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-lg border-b border-border-subtle flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-4xl">
                      {selectedAppId === "BEC-01" ? "school" : selectedAppId === "BEC-02" ? "workspace_premium" : "account_balance"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-body-bold text-headline-md font-bold text-lg text-on-background">
                      {selectedAppDetail.title}
                    </h3>
                    <p className="text-muted-slate text-xs mt-1">
                      {selectedAppDetail.organization}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full animate-fade-in" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                      ></path>
                      <path
                        className="text-tertiary stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray="95, 100"
                        strokeLinecap="round"
                        strokeWidth="3"
                      ></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-tertiary text-[12px] font-bold">
                      {selectedAppDetail.affinity}%
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted-slate mt-1">
                    Afinidad
                  </span>
                </div>
              </div>

              {/* Milestone Alert */}
              <div className="bg-secondary-container/10 px-lg py-4 flex items-center gap-3 border-b border-secondary-container/20">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">
                  event
                </span>
                <p className="font-body-bold text-on-secondary-container text-xs md:text-sm">
                  {selectedAppDetail.milestoneAlert.title}{" "}
                  <span className="font-extrabold underline decoration-secondary-container/40">
                    {selectedAppDetail.milestoneAlert.event}
                  </span>{" "}
                  - {selectedAppDetail.milestoneAlert.date}
                </p>
              </div>

              {/* Pipeline Visual */}
              <div className="p-lg bg-surface-container-lowest">
                <div className="relative flex justify-between items-center max-w-2xl mx-auto py-4">
                  {/* Connector Lines */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
                  <div className={`absolute top-1/2 left-0 ${selectedAppDetail.connectorWidth} h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700`}></div>

                  {/* Steps */}
                  {selectedAppDetail.pipeline.map((step, idx) => (
                    <div
                      key={idx}
                      className="relative z-10 flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-primary text-white shadow-md"
                            : step.status === "active"
                              ? "bg-primary text-white shadow-lg animate-pulse ring-4 ring-primary/10"
                              : "bg-surface-container-high text-muted-slate"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-sm animate-fade-in"
                          style={
                            step.status === "completed"
                              ? { fontVariationSettings: '"FILL" 1' }
                              : {}
                          }
                        >
                          {step.icon}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] ${
                          step.status === "completed" ||
                          step.status === "active"
                            ? "font-body-bold font-bold text-slate-800"
                            : "font-body-base"
                        } ${
                          step.status === "active"
                            ? "text-primary"
                            : step.status === "completed"
                              ? "text-on-background"
                              : "text-muted-slate"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Panel */}
              <div className="p-lg bg-white border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <h4 className="font-body-bold text-on-background mb-4 flex items-center gap-2 text-sm font-bold">
                    <span className="material-symbols-outlined text-primary">
                      task_alt
                    </span>
                    Tareas Recomendadas
                  </h4>
                  <div className="space-y-3">
                    {selectedAppDetail.recommendedTasks.map((task, idx) => (
                      <a
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-xl border border-border-subtle hover:bg-surface-container-low transition-colors group"
                        href="#"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-muted-slate group-hover:text-primary">
                            {task.icon}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {task.title}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-muted-slate text-sm">
                          open_in_new
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 transform scale-150 group-hover:rotate-12 transition-transform text-primary">
                    <span className="material-symbols-outlined text-6xl">
                      smart_toy
                    </span>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {selectedAppDetail.iaBanner.badge}
                      </span>
                      <h4 className="font-body-bold font-bold text-sm text-slate-800">
                        {selectedAppDetail.iaBanner.title}
                      </h4>
                    </div>
                    <p className="text-muted-slate text-xs mb-6 leading-relaxed">
                      {selectedAppDetail.iaBanner.description}
                    </p>
                  </div>
                  <button className="relative z-10 bg-primary text-white font-bold py-2.5 px-5 rounded-xl hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 text-xs cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">
                      psychology
                    </span>
                    {selectedAppDetail.iaBanner.buttonText}
                  </button>
                </div>
              </div>
            </section>

            {/* Collapsible Footer Section */}
            <details
              className="group bg-surface rounded-2xl border border-border-subtle shadow-sm transition-all overflow-hidden"
              open
            >
              <summary className="flex items-center justify-between p-lg cursor-pointer list-none hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-muted-slate group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                  <h4 className="font-body-bold font-bold text-sm text-on-background">
                    Historial y Convocatorias Archivadas
                  </h4>
                </div>
                <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase">
                  Ver {historyConvocatorias.length} anteriores
                </span>
              </summary>
              <div className="p-lg border-t border-border-subtle bg-surface-container-lowest overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] uppercase text-muted-slate border-b border-border-subtle">
                    <tr>
                      <th className="py-3 px-2 font-bold">Programa</th>
                      <th className="py-3 px-2 font-bold">Estado Final</th>
                      <th className="py-3 px-2 font-bold">Fecha</th>
                      <th className="py-3 px-2 font-bold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {historyConvocatorias.map((hist, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-white/50 transition-colors"
                      >
                        <td className="py-4 px-2 font-body-bold">
                          {hist.program}
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              hist.statusVariant === "error"
                                ? "bg-error-container text-on-error-container"
                                : "bg-tertiary-fixed text-tertiary"
                            }`}
                          >
                            {hist.statusBadge}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-muted-slate">
                          {hist.date}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button className="text-primary font-bold hover:underline cursor-pointer">
                            {hist.actionText}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
