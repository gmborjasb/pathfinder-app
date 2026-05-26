import React, { useState, useEffect, useRef } from "react";
import { pipelineSteps, documents, matches } from "../mocks/dashboard";
import { charlasMockData, talleresMockData, becasMockData } from "../mocks/dataBase";

const Dashboard: React.FC = () => {
  // Simple countdown interaction
  const [timeLeft, setTimeLeft] = useState(48 * 3600 + 10 * 60 + 15);
  const [activeTab, setActiveTab] = useState<"charlas" | "talleres">("charlas");
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

  const savedBecas = savedBecaIds
    .map((id) => becasMockData.find((b) => b.id === id))
    .filter((b): b is typeof becasMockData[0] => !!b);
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


  
  // Dynamic user data
  const [profileName] = useState<string>(() => {
    const storedProfile = localStorage.getItem("pathfinder_profile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed.nombres) {
          // Take first name
          return parsed.nombres.split(" ")[0];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return "Camila";
  });

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

  return (
    <div className="grid grid-cols-12 gap-8 relative">
      {/* Cabecera Contextual */}
      <div className="col-span-12 mb-lg">
        <div className="flex flex-col gap-sm">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-tight font-extrabold text-[28px] md:text-display-lg">
            ¡Hola, {profileName}! 👋
          </h1>
          <p className="text-headline-md text-muted-slate text-sm md:text-headline-md">
            Aquí tienes el estado de tu camino a la universidad.
          </p>
          <div className="mt-md flex flex-col gap-md">
            {/* Goal Indicator */}
            <div className="flex flex-col gap-xs max-w-md">
              <div className="flex justify-between items-center text-body-sm">
                <span className="font-body-bold text-on-surface font-semibold text-xs md:text-sm">
                  Tu meta global actual: Ingresar a la Universidad
                </span>
                <span className="text-primary font-body-bold font-bold">50%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Principal */}
      <div className="col-span-12 lg:col-span-8 space-y-10 min-w-0">
        {/* Pipeline de Postulación */}
        <section className="bg-surface rounded-2xl p-lg shadow-sm border border-border-subtle">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-sm mb-xl">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-base md:text-headline-md leading-none">
                Pipeline de Postulación
              </h2>
              <p className="text-body-sm text-muted-slate mt-1">
                Proceso actual para{" "}
                <span className="text-primary font-body-bold font-semibold">Beca 18</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-secondary-container bg-on-secondary-container/10 px-2.5 py-1 rounded-full uppercase">
                Estado: Papeles Listos
              </span>
            </div>
          </div>

          <div className="relative flex justify-between items-center w-full px-xs md:px-lg py-4">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 -z-0"></div>
            <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-primary -translate-y-1/2 -z-0"></div>

            {/* Nodes */}
            {pipelineSteps.map((step) => (
              <div
                key={step.id}
                className={`relative z-10 flex flex-col items-center gap-sm ${step.status === "pending" ? "opacity-45" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step.status === "completed" || step.status === "current" ? "bg-primary text-white shadow-md" : "bg-surface-container-high text-muted-slate"} ${step.status === "current" ? "pulse-active relative ring-4 ring-primary/10" : ""}`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px]`}
                  >
                    {step.icon}
                  </span>
                </div>
                <span
                  className={`text-[9px] md:text-[10px] ${step.status === "pending" ? "font-body-base text-muted-slate" : "font-body-bold text-primary font-semibold"} text-center leading-tight`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Mochila de Documentos */}
        <section className="bg-surface rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
          <div className="p-lg border-b border-border-subtle flex justify-between items-center bg-surface-bright">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary font-fill text-xl">
                backpack
              </span>
              <h2 className="font-headline-md text-headline-md font-bold text-base">
                Mochila de Documentos
              </h2>
            </div>
            <a href="/documentos" className="text-body-sm text-primary font-body-bold hover:underline font-bold">
              Gestionar todo
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-lg py-3 text-label-caps text-muted-slate font-bold text-xs uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-lg py-3 text-label-caps text-muted-slate font-bold text-xs uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-lg py-3 text-label-caps text-muted-slate font-bold text-xs uppercase tracking-wider text-right">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {documents.map((doc) => {
                  let rowClass = "hover:bg-surface-container-lowest transition-colors";
                  let statusColorClass = "text-tertiary-container";
                  let statusIcon = "check_circle";

                  if (doc.status === "warning") {
                    rowClass += " bg-secondary-container/5";
                    statusColorClass = "text-on-secondary-container";
                    statusIcon = "warning";
                  } else if (doc.status === "error") {
                    rowClass += " bg-error-container/10";
                    statusColorClass = "text-error";
                    statusIcon = "error";
                  }

                  return (
                    <tr key={doc.id} className={rowClass}>
                      <td className="px-lg py-4">
                        <p className="text-body-sm font-body-bold text-on-surface font-semibold text-sm">
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-muted-slate mt-0.5">
                          {doc.origin}
                        </p>
                      </td>
                      <td className="px-lg py-4">
                        <span
                          className={`inline-flex items-center gap-1 font-body-bold text-xs ${statusColorClass}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {statusIcon}
                          </span>
                          {doc.statusText}
                        </span>
                      </td>
                      <td className="px-lg py-4 text-right">
                        {doc.actionType === "download" && (
                          <button className="material-symbols-outlined text-muted-slate hover:text-primary cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors">
                            download
                          </button>
                        )}
                        {doc.actionType === "upload_signature" && (
                          <button className="text-primary font-body-bold text-xs underline font-bold cursor-pointer">
                            Subir firma
                          </button>
                        )}
                        {doc.actionType === "upload_certificate" && (
                          <button className="bg-error-red text-white text-[10px] px-2.5 py-1 rounded-lg font-body-bold font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                            Sube tu certificado
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Charlas y Talleres switcher (Dynamic loading of Category 2 and Category 3) */}
        <section className="space-y-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm border-b border-border-subtle pb-2">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-xl">
                live_tv
              </span>
              <h3 className="text-headline-md text-on-surface font-bold text-base md:text-lg">
                Charlas e Inducciones en Vivo
              </h3>
            </div>
            
            {/* Dynamic tabs for all 50 items */}
            <div className="flex p-0.5 bg-surface-container-low rounded-lg shrink-0 w-fit self-start">
              <button
                onClick={() => {
                  setActiveTab("charlas");
                  setActiveDot(0);
                  if (sliderRef.current) sliderRef.current.scrollLeft = 0;
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "charlas"
                    ? "bg-white text-primary shadow"
                    : "text-muted-slate hover:bg-slate-200"
                }`}
              >
                Charlas Informativas (25)
              </button>
              <button
                onClick={() => {
                  setActiveTab("talleres");
                  setActiveDot(0);
                  if (sliderRef.current) sliderRef.current.scrollLeft = 0;
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "talleres"
                    ? "bg-white text-primary shadow"
                    : "text-muted-slate hover:bg-slate-200"
                }`}
              >
                Talleres Prácticos (25)
              </button>
            </div>
          </div>

          {/* Horizontal scroll layout containing all items with dots indicators */}
          <div className="space-y-md min-w-0 w-full overflow-hidden">
            <div
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex gap-lg overflow-x-auto snap-x snap-mandatory scroll-smooth pb-md pr-1 py-1 custom-scrollbar w-full min-w-0"
            >
              {activeTab === "charlas"
                ? charlasMockData.map((charla) => {
                    const isReserved = reservations.includes(charla.id);
                    const isLive = charla.dateTime.includes("Mañana") || charla.dateTime.includes("Hoy");

                    return (
                      <div
                        key={charla.id}
                        className="snap-start shrink-0 w-[88%] sm:w-[48%] lg:w-[31.5%] bg-surface border border-border-subtle rounded-2xl p-md lg:p-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-md">
                            <span
                              className={`${isLive ? "bg-error-red/10 text-error-red" : "bg-primary/10 text-primary"} text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${isLive ? "animate-pulse" : ""}`}
                            >
                              {isLive && <span className="w-1.5 h-1.5 bg-error-red rounded-full"></span>}
                              {charla.modality}
                            </span>
                            <span className="material-symbols-outlined text-muted-slate text-[20px]">
                              {isLive ? "videocam" : "calendar_today"}
                            </span>
                          </div>
                          <h4 className="text-body-bold text-on-surface mb-xs leading-snug font-bold text-sm">
                            {charla.title}
                          </h4>
                          <p className="text-[11px] text-muted-slate mb-xl flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {charla.dateTime} | <span className="font-semibold">{charla.sponsor}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleReserve(charla.id, charla.title)}
                          className={`w-full font-body-bold font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs mt-6 ${
                            isReserved
                              ? "bg-tertiary-fixed text-tertiary border border-tertiary/30 shadow-sm"
                              : "border-2 border-primary text-primary hover:bg-primary/5"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isReserved ? "check_circle" : "event_available"}
                          </span>
                          {isReserved ? "¡Cupo Reservado!" : charla.actionText}
                        </button>
                      </div>
                    );
                  })
                : talleresMockData.map((taller) => {
                    const isReserved = reservations.includes(taller.id);
                    const isLive = taller.statusFrequency.includes("Hoy") || taller.statusFrequency.includes("Mañana");

                    return (
                      <div
                        key={taller.id}
                        className="snap-start shrink-0 w-[88%] sm:w-[48%] lg:w-[31.5%] bg-surface border border-border-subtle rounded-2xl p-md lg:p-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-md">
                            <span
                              className={`${isLive ? "bg-error-red/10 text-error-red" : "bg-primary/10 text-primary"} text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${isLive ? "animate-pulse" : ""}`}
                            >
                              {isLive && <span className="w-1.5 h-1.5 bg-error-red rounded-full"></span>}
                              {taller.focus}
                            </span>
                            <span className="material-symbols-outlined text-muted-slate text-[20px]">
                              engineering
                            </span>
                          </div>
                          <h4 className="text-body-bold text-on-surface mb-xs leading-snug font-bold text-sm">
                            {taller.title}
                          </h4>
                          <p className="text-[11px] text-muted-slate mb-xl flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {taller.statusFrequency} | <span className="font-semibold">{taller.sponsor}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleReserve(taller.id, taller.title)}
                          className={`w-full font-body-bold font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs mt-6 ${
                            isReserved
                              ? "bg-tertiary-fixed text-tertiary border border-tertiary/30 shadow-sm"
                              : "border-2 border-primary text-primary hover:bg-primary/5"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isReserved ? "check_circle" : "check"}
                          </span>
                          {isReserved ? "¡Inscrito!" : taller.actionText}
                        </button>
                      </div>
                    );
                  })}
            </div>

            {/* Slider Pagination Dots */}
            <div className="flex justify-center items-center gap-xs pt-xs">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  onClick={() => scrollToDot(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeDot === i
                      ? "bg-primary w-6"
                      : "bg-outline-variant hover:bg-muted-slate"
                  }`}
                  aria-label={`Ir al grupo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Columna Lateral */}
      <div className="col-span-12 lg:col-span-4 space-y-10">
        {/* Panel de Urgencia "Reloj de Arena" */}
        <section className="bg-inverse-surface text-white rounded-2xl p-lg shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary-container/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-sm mb-md">
            <span className="material-symbols-outlined text-secondary-container fill-current">
              hourglass_bottom
            </span>
            <h2 className="text-secondary-container font-headline-md text-headline-md tracking-widest text-base font-bold">
              ¡PRÓXIMO CIERRE!
            </h2>
          </div>
          <div className="mb-lg">
            <p className="text-[36px] md:text-[40px] font-stat-lg leading-none mb-2 font-bold font-display-lg text-white">
              {hours}h {minutes}m {seconds}s
            </p>
            <p className="text-xs text-outline-variant leading-relaxed">
              La Beca 18 (Convocatoria 2026) cierra sus inscripciones electrónicas pronto. No pierdas tu lugar.
            </p>
          </div>
          <a
            href="/documentos"
            className="w-full bg-secondary-container text-on-secondary-container font-body-bold py-3.5 rounded-xl flex items-center justify-center gap-md hover:scale-[1.02] active:scale-95 transition-all text-center font-bold text-sm"
          >
            Subir papel faltante
            <span className="material-symbols-outlined text-md">upload_file</span>
          </a>
        </section>

        {/* Feed de Matches */}
        <section className="space-y-md">
          <div className="flex justify-between items-center">
            <h3 className="text-label-caps text-muted-slate font-bold text-[11px] tracking-wider">
              Tus opciones reales de ganar
            </h3>
            <span className="material-symbols-outlined text-muted-slate text-[18px] cursor-help">
              info
            </span>
          </div>

          {matches.map((match) => {
            const matchOpacity = match.matchPercentage > 80 ? "" : "opacity-80";
            const matchBadgeClass =
              match.matchPercentage > 80
                ? "bg-tertiary-container/10 text-tertiary-container"
                : "bg-secondary-container/10 text-on-secondary-container";

            return (
              <a
                href="/buscar"
                key={match.id}
                className={`bg-surface border border-border-subtle rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group cursor-pointer block ${matchOpacity}`}
              >
                <div className="flex justify-between items-start mb-sm gap-sm">
                  <h4 className="text-body-sm font-body-bold text-on-surface group-hover:text-primary font-semibold text-sm transition-colors">
                    {match.name}
                  </h4>
                  <span
                    className={`${matchBadgeClass} text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0`}
                  >
                    {match.matchPercentage}% Match
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-xs text-[11px]">
                  <div className="flex items-center gap-1 text-muted-slate truncate">
                    <span className="material-symbols-outlined text-[14px]">
                      payments
                    </span>
                    Cobertura: {match.coverage}
                  </div>
                  <div className="flex items-center gap-1 text-muted-slate truncate">
                    <span className="material-symbols-outlined text-[14px]">
                      {match.requirementIcon}
                    </span>
                    {match.requirementLabel}
                  </div>
                </div>
              </a>
            );
          })}

          <a
            href="/buscar"
            className="w-full py-2.5 text-body-sm text-primary font-body-bold border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors font-bold text-center block"
          >
            Ver todos los matches
          </a>
        </section>

        {/* Tus Becas Guardadas ❤️ */}
        <section className="bg-surface border border-border-subtle rounded-2xl p-lg shadow-sm space-y-md">
          <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-muted-slate text-xl">
                favorite
              </span>
              <h3 className="font-body-bold text-on-surface font-bold text-sm">
                Tus Becas Guardadas
              </h3>
            </div>
            <a
              href="/buscar"
              onClick={() => {
                localStorage.setItem("pathfinder_search_tab", "guardadas");
              }}
              className="text-xs text-primary font-bold hover:underline"
            >
              Ver todas ({savedBecasCount})
            </a>
          </div>

          {savedBecas.length === 0 ? (
            <div className="text-center py-6 animate-fade-in">
              <p className="text-xs text-muted-slate leading-relaxed">
                No tienes becas guardadas. Explora oportunidades y agrégalas a tus favoritos para verlas aquí.
              </p>
              <a
                href="/buscar"
                className="mt-3 inline-block px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold text-[10px] rounded-lg"
              >
                Explorar Becas
              </a>
            </div>
          ) : (
            <div className="space-y-sm animate-fade-in">
              {savedBecas.slice(0, 3).map((beca) => (
                <a
                  href="/buscar"
                  key={beca.id}
                  onClick={() => {
                    localStorage.setItem("pathfinder_search_tab", "guardadas");
                  }}
                  className="flex items-center gap-3 p-md rounded-xl bg-surface border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {beca.icon || "school"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-body-bold font-bold text-xs text-slate-800 group-hover:text-primary transition-colors truncate">
                      {beca.title}
                    </h4>
                    <p className="text-[10px] text-muted-slate truncate leading-normal">
                      {beca.sponsor} • <span className="text-error font-semibold">{beca.deadline}</span>
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-muted-slate text-xs group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Success Toast Alert Notification */}
      {showNotification && (
        <div className="fixed top-20 right-6 z-[99] bg-primary text-white p-lg rounded-2xl shadow-2xl flex items-center gap-md border border-white/20 animate-pulse">
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <div>
            <p className="font-body-bold font-bold text-sm">Reserva de Actividad</p>
            <p className="text-xs opacity-90">{notificationMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
