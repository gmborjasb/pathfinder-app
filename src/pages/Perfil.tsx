import React, { useState } from "react";
import { mockPerfil } from "../mocks/perfil";
import type { PerfilData } from "../mocks/perfil";

export default function Perfil() {
  const cachedProfile = (() => {
    const stored = localStorage.getItem("pathfinder_profile");
    if (stored) {
      try {
        return JSON.parse(stored) as PerfilData;
      } catch (e) {
        console.error("Error loading cached profile", e);
      }
    }
    return mockPerfil;
  })();

  const profileData = cachedProfile;
  const [nombres, setNombres] = useState(cachedProfile.nombres || "");
  const [dni, setDni] = useState(cachedProfile.dni || "");
  const [correo, setCorreo] = useState(cachedProfile.correo || "");
  const [tipoColegio, setTipoColegio] = useState(cachedProfile.tipoColegio || "Público");
  const [sisfoh, setSisfoh] = useState(cachedProfile.sisfoh || "No Pobre");
  const [departamento, setDepartamento] = useState(cachedProfile.departamento || "Lima");
  const [provincia, setProvincia] = useState(cachedProfile.provincia || "Lima");
  const [distrito, setDistrito] = useState(cachedProfile.distrito || "Miraflores");
  const [nivelIngles, setNivelIngles] = useState(cachedProfile.idiomas?.nivelIngles || "Ninguno");
  const [instituto, setInstituto] = useState(cachedProfile.idiomas?.instituto || "");
  const [institucionActual, setInstitucionActual] = useState(cachedProfile.institucionActual || "");

  const [condiciones, setCondiciones] = useState(cachedProfile.condiciones || mockPerfil.condiciones);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Dynamically calculate completeness percentage based on filled fields on every render
  let filledCount = 0;
  if (nombres.trim()) filledCount++;
  if (dni.trim()) filledCount++;
  if (correo.trim()) filledCount++;
  if (institucionActual.trim()) filledCount++;
  if (nivelIngles !== "Ninguno") filledCount++;
  if (instituto.trim()) filledCount++;

  const conditionCount = Object.values(condiciones).filter(Boolean).length;
  filledCount += conditionCount;

  // Calculate percentage (base 60% + 5% per filled item up to 100%)
  const nivelPerfil = Math.min(60 + filledCount * 5, 100);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: PerfilData = {
      ...profileData,
      nombres,
      dni,
      correo,
      tipoColegio,
      sisfoh,
      departamento,
      provincia,
      distrito,
      institucionActual,
      condiciones,
      nivelPerfil,
      idiomas: {
        nivelIngles,
        instituto
      }
    };

    localStorage.setItem("pathfinder_profile", JSON.stringify(updatedProfile));
    
    // Dispatch custom event to notify other sidebar in same window
    window.dispatchEvent(new Event("profileUpdated"));

    // Trigger success notification toast
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const handleCheckboxChange = (key: string) => {
    setCondiciones((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-lg pb-12 w-full relative">
      {/* Header Banner */}
      <header className="relative">
        <div className="relative overflow-hidden bg-primary-container rounded-3xl p-lg md:p-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div className="relative z-10 max-w-xl">
            <h2 className="font-display-lg text-xl md:text-2xl text-white mb-2 font-bold leading-tight">
              Mi Perfil Académico
            </h2>
            <p className="text-white/80 font-body-base text-sm leading-relaxed">
              Completa estos datos para activar tus opciones reales de ganar becas y financiamiento universitario.
            </p>
          </div>
          
          <div className="relative z-10 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-md border border-white/20 flex items-center gap-md">
              <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-secondary shrink-0 shadow">
                <span className="material-symbols-outlined font-bold text-lg">bolt</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-xs md:text-sm">Nivel de Perfil: {nivelPerfil}%</p>
                <div className="w-full md:w-44 bg-white/20 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-secondary-container rounded-full transition-all duration-500" style={{ width: `${nivelPerfil}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Abstract Background Shapes */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-tertiary-container/20 rounded-full blur-3xl"></div>
        </div>
      </header>

      {/* Profile Form Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Column Left: Personal & Location */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Card 1: Datos Personales */}
          <section className="bg-surface rounded-2xl p-lg shadow-sm border border-border-subtle flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-2 border-b border-border-subtle pb-2">
              <span className="material-symbols-outlined text-primary text-xl font-fill">person</span>
              <h3 className="font-headline-md text-on-surface font-bold text-base">Datos Personales</h3>
            </div>
            <div className="space-y-md">
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                  NOMBRES COMPLETOS
                </label>
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                  DNI / IDENTIDAD
                </label>
                <input
                  type="text"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-bold"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Situación de Vulnerabilidad */}
          <section className="bg-surface rounded-2xl p-lg shadow-sm border border-border-subtle flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-2 border-b border-border-subtle pb-2">
              <span className="material-symbols-outlined text-primary text-xl">family_history</span>
              <h3 className="font-headline-md text-on-surface font-bold text-base">Situación de Vulnerabilidad</h3>
            </div>
            <div className="space-y-md">
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                  TIPO DE COLEGIO
                </label>
                <select
                  value={tipoColegio}
                  onChange={(e) => setTipoColegio(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl p-3 text-sm font-body-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="Público">Público</option>
                  <option value="Privado">Privado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                  CLASIFICACIÓN SISFOH
                </label>
                <select
                  value={sisfoh}
                  onChange={(e) => setSisfoh(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl p-3 text-sm font-body-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="No Pobre">No Pobre</option>
                  <option value="Pobre">Pobre</option>
                  <option value="Pobre Extremo">Pobre Extremo</option>
                </select>
              </div>
              
              {/* Stacked geographic fields to prevent horizontal clipping/overflow */}
              <div className="space-y-md">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                    DEPARTAMENTO
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-xl p-3 text-sm font-body-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="Lima">Lima</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Cusco">Cusco</option>
                    <option value="Piura">Piura</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                    PROVINCIA
                  </label>
                  <select
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="w-full bg-surface-container-low border-border-subtle rounded-xl p-3 text-sm font-body-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="Lima">Lima</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Cusco">Cusco</option>
                    <option value="Piura">Piura</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                    DISTRITO
                  </label>
                  <select
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="w-full bg-surface-container-low border-border-subtle rounded-xl p-3 text-sm font-body-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="Miraflores">Miraflores</option>
                    <option value="San Isidro">San Isidro</option>
                    <option value="Los Olivos">Los Olivos</option>
                    <option value="Santiago de Surco">Santiago de Surco</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Condiciones Especiales */}
          <section className="bg-surface rounded-2xl p-lg shadow-sm border border-border-subtle flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-2 border-b border-border-subtle pb-2">
              <span className="material-symbols-outlined text-primary text-xl">assignment_ind</span>
              <h3 className="font-headline-md text-on-surface font-bold text-base">Condiciones Especiales</h3>
            </div>
            <div className="space-y-sm mb-md">
              <label className="flex items-center gap-md p-sm hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.vraem}
                  onChange={() => handleCheckboxChange("vraem")}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-body-base text-on-surface-variant leading-tight">Zona VRAEM / Huallaga</span>
              </label>
              <label className="flex items-center gap-md p-sm hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.nativa}
                  onChange={() => handleCheckboxChange("nativa")}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-body-base text-on-surface-variant leading-tight">Comunidad Nativa / Campesina</span>
              </label>
              <label className="flex items-center gap-md p-sm hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.licenciado}
                  onChange={() => handleCheckboxChange("licenciado")}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-body-base text-on-surface-variant leading-tight">Licenciado FF.AA.</span>
              </label>
              <label className="flex items-center gap-md p-sm hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.redeped}
                  onChange={() => handleCheckboxChange("redeped")}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-body-base text-on-surface-variant leading-tight">Víctima de violencia (REDEPED)</span>
              </label>
            </div>
            <p className="text-[11px] text-muted-slate border-t border-border-subtle pt-md leading-normal">
              <span className="font-bold">Nota:</span> Activar estas opciones requerirá que subas la constancia oficial en tu Mochila de Documentos para validar el beneficio.
            </p>
          </section>
        </div>

        {/* Column Right: Academic & Socioeconomic */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Card 1: Información Académica */}
          <section className="bg-surface rounded-2xl p-lg shadow-sm border border-border-subtle flex flex-col gap-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-2 border-b border-border-subtle pb-2">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-xl font-fill">school</span>
                <h3 className="font-headline-md text-on-surface font-bold text-base">Información Académica</h3>
              </div>
              <div className="bg-tertiary-container/10 text-tertiary px-md py-1 rounded-full text-xs font-bold flex items-center gap-xs w-fit self-start">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                Verificado por MINEDU
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                INSTITUCIÓN EDUCATIVA ACTUAL
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-muted-slate text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={institucionActual}
                  onChange={(e) => setInstitucionActual(e.target.value)}
                  placeholder="Busca tu colegio..."
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl font-body-bold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg mt-md">
              {/* Year 3 card */}
              <div className="p-md rounded-2xl border border-border-subtle bg-surface-bright flex flex-col items-center text-center shadow-sm">
                <p className="text-[10px] font-label-caps text-muted-slate font-bold tracking-wider mb-sm">3ER AÑO SEC.</p>
                <div className="relative w-20 h-20 mb-sm flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-surface-container" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5" />
                    <circle className="text-tertiary stroke-current" cx="18" cy="18" fill="transparent" r="16" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="15" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-on-surface text-base">
                    {profileData.notas.año3}
                  </div>
                </div>
                <p className="text-[10px] text-muted-slate font-semibold">Promedio Anual</p>
              </div>
              
              {/* Year 4 card */}
              <div className="p-md rounded-2xl border border-border-subtle bg-surface-bright flex flex-col items-center text-center shadow-sm">
                <p className="text-[10px] font-label-caps text-muted-slate font-bold tracking-wider mb-sm">4TO AÑO SEC.</p>
                <div className="relative w-20 h-20 mb-sm flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-surface-container" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5" />
                    <circle className="text-tertiary stroke-current" cx="18" cy="18" fill="transparent" r="16" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="5" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-on-surface text-base">
                    {profileData.notas.año4}
                  </div>
                </div>
                <p className="text-[10px] text-muted-slate font-semibold">Promedio Anual</p>
              </div>
              
              {/* Year 5 card */}
              <div className="p-md rounded-2xl border border-primary/20 bg-blue-50/30 flex flex-col items-center text-center shadow-sm">
                <p className="text-[10px] font-label-caps text-primary font-bold tracking-wider mb-sm">5TO AÑO SEC. (ACTUAL)</p>
                <div className="relative w-20 h-20 mb-sm flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-surface-container" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5" />
                    <circle className="text-secondary-container stroke-current" cx="18" cy="18" fill="transparent" r="16" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-on-surface text-base">
                    {profileData.notas.año5.toFixed(1)}
                  </div>
                </div>
                <p className="text-[10px] text-muted-slate font-semibold">Promedio Parcial</p>
              </div>
            </div>
          </section>

          {/* Card 2: Idiomas y Aptitudes */}
          <section className="bg-surface rounded-2xl p-lg shadow-sm border border-border-subtle flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-2 border-b border-border-subtle pb-2">
              <span className="material-symbols-outlined text-primary text-xl">language</span>
              <h3 className="font-headline-md text-on-surface font-bold text-base">Idiomas y Aptitudes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                  NIVEL DE INGLÉS
                </label>
                <select
                  value={nivelIngles}
                  onChange={(e) => setNivelIngles(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl p-3 text-sm font-body-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="Ninguno">Ninguno</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps text-muted-slate font-bold tracking-wider">
                  INSTITUTO DE ESTUDIOS
                </label>
                <input
                  type="text"
                  value={instituto}
                  onChange={(e) => setInstituto(e.target.value)}
                  placeholder="Británico / ICPNA / Otros"
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-bold"
                />
              </div>
            </div>
          </section>

          {/* Premium Save Button Section - Restructured inside layout flow to prevent out-of-screen clipping */}
          <div className="bg-surface border border-border-subtle p-lg rounded-2xl shadow-sm flex items-center justify-between gap-md">
            <div>
              <p className="font-body-bold text-on-surface text-sm font-bold">¿Listo para guardar?</p>
              <p className="text-xs text-muted-slate mt-0.5">Tus metas y afinidad de becas se recalcularán al instante.</p>
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-container text-white px-xl py-3.5 rounded-xl shadow hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-md group cursor-pointer text-sm font-bold font-body-bold"
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">save</span>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Success Toast Alert Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-tertiary text-white p-lg rounded-2xl shadow-2xl flex items-center gap-md border border-white/20 animate-bounce">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <div>
            <p className="font-body-bold font-bold text-sm">Perfil Guardado</p>
            <p className="text-xs opacity-90">Los cambios se almacenaron con éxito en caché.</p>
          </div>
        </div>
      )}

      {/* Background Graphic Decoration */}
      <div className="fixed top-0 right-0 -z-10 opacity-10 pointer-events-none">
        <svg fill="none" height="400" viewBox="0 0 400 400" width="400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="300" cy="100" fill="url(#paint0_radial)" r="150" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(300 100) rotate(90) scale(150)" gradientUnits="userSpaceOnUse" id="paint0_radial" r="1">
              <stop stopColor="#0F52BA" />
              <stop offset="1" stopColor="#0F52BA" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </form>
  );
}
