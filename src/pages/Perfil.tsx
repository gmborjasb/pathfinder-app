import React, { useState, useEffect } from "react";
import type { PerfilData } from "../lib/types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

const defaultCondiciones = {
  vraem: false,
  nativa: false,
  licenciado: false,
  redeped: false,
};

const defaultPerfil: PerfilData = {
  nivelPerfil: 60,
  nombres: "",
  dni: "",
  correo: "",
  tipoColegio: "Público",
  sisfoh: "No Pobre",
  departamento: "Lima",
  provincia: "Lima",
  distrito: "Miraflores",
  condiciones: defaultCondiciones,
  institucionActual: "",
  notas: {
    año3: 15,
    año4: 15,
    año5: 15,
  },
  idiomas: {
    nivelIngles: "Ninguno",
    instituto: "",
  },
};

export default function Perfil() {
  const { user, profile, refreshProfile } = useAuth();

  const cachedProfile = (() => {
    const stored = localStorage.getItem("pathfinder_profile");
    if (stored) {
      try {
        return JSON.parse(stored) as PerfilData;
      } catch (e) {
        console.error("Error loading cached profile", e);
      }
    }
    return defaultPerfil;
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

  const [condiciones, setCondiciones] = useState(cachedProfile.condiciones || defaultCondiciones);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync state with Supabase user profile when it loads
  useEffect(() => {
    if (profile) {
      setNombres(profile.nombres || "");
      setDni(profile.dni || "");
      setCorreo(profile.correo || "");
      
      const det = profile.perfil_detalles || {};
      setTipoColegio(det.tipo_colegio || "Público");
      setSisfoh(det.sisfoh || "No Pobre");
      setDepartamento(det.departamento || "Lima");
      setProvincia(det.provincia || "Lima");
      setDistrito(det.distrito || "Miraflores");
      setInstitucionActual(det.institucionActual || "");
      setCondiciones(det.condiciones || defaultCondiciones);
      setNivelIngles(det.idiomas?.nivelIngles || "Ninguno");
      setInstituto(det.idiomas?.instituto || "");
    }
  }, [profile]);

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

  const handleSave = async (e: React.FormEvent) => {
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

    if (user) {
      try {
        const { error } = await supabase
          .from("usuarios")
          .update({
            dni: dni || null,
            nombres,
            perfil_detalles: {
              tipo_colegio: tipoColegio,
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
            }
          })
          .eq("id", user.id);

        if (error) throw error;
        
        await refreshProfile();
      } catch (err) {
        console.error("Error saving profile to Supabase:", err);
      }
    }
    
    // Dispatch custom event to notify other sidebar in same window
    window.dispatchEvent(new Event("profileUpdated"));

    // Trigger success notification toast
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const handleCheckboxChange = (key: string) => {
    setCondiciones((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  return (
    <form onSubmit={handleSave} className="space-y-4 pb-12 w-full relative">
      {/* Header Banner */}
      <header className="relative">
        <div className="relative overflow-hidden bg-[#0F2554] rounded-[16px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative z-10 max-w-xl">
            <h2 className="t-lg bold text-white mb-1 leading-tight">
              Mi Perfil Académico
            </h2>
            <p className="t-xs text-white/80 leading-relaxed">
              Completa estos datos para activar tus opciones reales de ganar becas y financiamiento universitario.
            </p>
          </div>
          
          <div className="relative z-10 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-[12px] p-3 border border-white/20 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ffdf94] rounded-full flex items-center justify-center text-[#594400] shrink-0">
                <span className="material-symbols-outlined font-bold text-lg">bolt</span>
              </div>
              <div className="flex-1">
                <p className="t-xs bold text-white">Nivel de Perfil: {nivelPerfil}%</p>
                <div className="w-full md:w-44 bg-white/20 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#ffdf94] rounded-full transition-all duration-500" style={{ width: `${nivelPerfil}%` }}></div>
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
      <div className="grid grid-cols-12 gap-4">
        {/* Column Left: Personal & Location */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Card 1: Datos Personales */}
          <section className="card flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1 border-b border-[#e2e8f0] pb-2">
              <span className="material-symbols-outlined text-[#1a3a7c] text-[18px] font-fill">person</span>
              <h3 className="t-base bold text-[#0F2554]">Datos Personales</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="t-label text-[#64748b] block mb-1">
                  NOMBRES COMPLETOS
                </label>
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                />
              </div>
              <div className="space-y-1">
                <label className="t-label text-[#64748b] block mb-1">
                  DNI / IDENTIDAD
                </label>
                <input
                  type="text"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                />
              </div>
              <div className="space-y-1">
                <label className="t-label text-[#64748b] block mb-1">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Situación de Vulnerabilidad */}
          <section className="card flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1 border-b border-[#e2e8f0] pb-2">
              <span className="material-symbols-outlined text-[#1a3a7c] text-[18px]">family_history</span>
              <h3 className="t-base bold text-[#0F2554]">Situación de Vulnerabilidad</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="t-label text-[#64748b] block mb-1">
                  TIPO DE COLEGIO
                </label>
                <select
                  value={tipoColegio}
                  onChange={(e) => setTipoColegio(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-2 t-base focus:border-[#1a3a7c] outline-none transition-all cursor-pointer text-[#0F2554]"
                >
                  <option value="Público">Público</option>
                  <option value="Privado">Privado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="t-label text-[#64748b] block mb-1">
                  CLASIFICACIÓN SISFOH
                </label>
                <select
                  value={sisfoh}
                  onChange={(e) => setSisfoh(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-2 t-base focus:border-[#1a3a7c] outline-none transition-all cursor-pointer text-[#0F2554]"
                >
                  <option value="No Pobre">No Pobre</option>
                  <option value="Pobre">Pobre</option>
                  <option value="Pobre Extremo">Pobre Extremo</option>
                </select>
              </div>
              
              {/* Stacked geographic fields to prevent horizontal clipping/overflow */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="t-label text-[#64748b] block mb-1">
                    DEPARTAMENTO
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-2 t-base focus:border-[#1a3a7c] outline-none transition-all cursor-pointer text-[#0F2554]"
                  >
                    <option value="Lima">Lima</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Cusco">Cusco</option>
                    <option value="Piura">Piura</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="t-label text-[#64748b] block mb-1">
                    PROVINCIA
                  </label>
                  <select
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-2 t-base focus:border-[#1a3a7c] outline-none transition-all cursor-pointer text-[#0F2554]"
                  >
                    <option value="Lima">Lima</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Cusco">Cusco</option>
                    <option value="Piura">Piura</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="t-label text-[#64748b] block mb-1">
                    DISTRITO
                  </label>
                  <select
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-2 t-base focus:border-[#1a3a7c] outline-none transition-all cursor-pointer text-[#0F2554]"
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
          <section className="card flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1 border-b border-[#e2e8f0] pb-2">
              <span className="material-symbols-outlined text-[#1a3a7c] text-[18px]">assignment_ind</span>
              <h3 className="t-base bold text-[#0F2554]">Condiciones Especiales</h3>
            </div>
            <div className="space-y-2 mb-3">
              <label className="flex items-center gap-3 p-1 hover:bg-[#f1f5f9] rounded-[8px] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.vraem}
                  onChange={() => handleCheckboxChange("vraem")}
                  className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                />
                <span className="t-sm text-[#0F2554] leading-tight">Zona VRAEM / Huallaga</span>
              </label>
              <label className="flex items-center gap-3 p-1 hover:bg-[#f1f5f9] rounded-[8px] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.nativa}
                  onChange={() => handleCheckboxChange("nativa")}
                  className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                />
                <span className="t-sm text-[#0F2554] leading-tight">Comunidad Nativa / Campesina</span>
              </label>
              <label className="flex items-center gap-3 p-1 hover:bg-[#f1f5f9] rounded-[8px] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.licenciado}
                  onChange={() => handleCheckboxChange("licenciado")}
                  className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                />
                <span className="t-sm text-[#0F2554] leading-tight">Licenciado FF.AA.</span>
              </label>
              <label className="flex items-center gap-3 p-1 hover:bg-[#f1f5f9] rounded-[8px] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={condiciones.redeped}
                  onChange={() => handleCheckboxChange("redeped")}
                  className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                />
                <span className="t-sm text-[#0F2554] leading-tight">Víctima de violencia (REDEPED)</span>
              </label>
            </div>
            <p className="t-xs border-t border-[#e2e8f0] pt-3 leading-normal text-[#64748b]">
              <span className="bold">Nota:</span> Activar estas opciones requerirá que subas la constancia oficial en tu Mochila de Documentos para validar el beneficio.
            </p>
          </section>
        </div>

        {/* Column Right: Academic & Socioeconomic */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Card 1: Información Académica */}
          <section className="card flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1 border-b border-[#e2e8f0] pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1a3a7c] text-[18px] font-fill">school</span>
                <h3 className="t-base bold text-[#0F2554]">Información Académica</h3>
              </div>
              <div className="badge b-green">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                Verificado por MINEDU
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="t-label text-[#64748b] block mb-1">
                INSTITUCIÓN EDUCATIVA ACTUAL
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={institucionActual}
                  onChange={(e) => setInstitucionActual(e.target.value)}
                  placeholder="Busca tu colegio..."
                  className="w-full pl-9 pr-3 py-2 bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              {/* Year 3 card */}
              <div className="p-3 rounded-[12px] border border-[#e2e8f0] bg-white flex flex-col items-center text-center shadow-sm">
                <p className="t-label text-[#64748b] mb-2">3ER AÑO SEC.</p>
                <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-[#f1f5f9]" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5" />
                    <circle className="text-[#166534] stroke-current" cx="18" cy="18" fill="transparent" r="16" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="15" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[#0F2554] text-base">
                    {profileData.notas.año3}
                  </div>
                </div>
                <p className="t-xs text-[#64748b]">Promedio Anual</p>
              </div>
              
              {/* Year 4 card */}
              <div className="p-3 rounded-[12px] border border-[#e2e8f0] bg-white flex flex-col items-center text-center shadow-sm">
                <p className="t-label text-[#64748b] mb-2">4TO AÑO SEC.</p>
                <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-[#f1f5f9]" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5" />
                    <circle className="text-[#166534] stroke-current" cx="18" cy="18" fill="transparent" r="16" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="5" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[#0F2554] text-base">
                    {profileData.notas.año4}
                  </div>
                </div>
                <p className="t-xs text-[#64748b]">Promedio Anual</p>
              </div>
              
              {/* Year 5 card */}
              <div className="p-3 rounded-[12px] border border-[#1a3a7c]/20 bg-[#e8eef8] flex flex-col items-center text-center shadow-sm">
                <p className="t-label text-[#1a3a7c] mb-2">5TO AÑO SEC. (ACTUAL)</p>
                <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-[#f1f5f9]/50" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5" />
                    <circle className="text-[#1a3a7c] stroke-current" cx="18" cy="18" fill="transparent" r="16" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[#0F2554] text-base">
                    {profileData.notas.año5.toFixed(1)}
                  </div>
                </div>
                <p className="t-xs text-[#64748b]">Promedio Parcial</p>
              </div>
            </div>
          </section>

          {/* Card 2: Idiomas y Aptitudes */}
          <section className="card flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1 border-b border-[#e2e8f0] pb-2">
              <span className="material-symbols-outlined text-[#1a3a7c] text-[18px]">language</span>
              <h3 className="t-base bold text-[#0F2554]">Idiomas y Aptitudes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="t-label text-[#64748b] block mb-1">
                  NIVEL DE INGLÉS
                </label>
                <select
                  value={nivelIngles}
                  onChange={(e) => setNivelIngles(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-2 t-base focus:border-[#1a3a7c] outline-none transition-all cursor-pointer text-[#0F2554]"
                >
                  <option value="Ninguno">Ninguno</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="t-label text-[#64748b] block mb-1">
                  INSTITUTO DE ESTUDIOS
                </label>
                <input
                  type="text"
                  value={instituto}
                  onChange={(e) => setInstituto(e.target.value)}
                  placeholder="Británico / ICPNA / Otros"
                  className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                />
              </div>
            </div>
          </section>

          {/* Premium Save Button Section - Restructured inside layout flow to prevent out-of-screen clipping */}
          <div className="card flex items-center justify-between gap-4">
            <div>
              <p className="t-sm bold text-[#0F2554]">¿Listo para guardar?</p>
              <p className="t-xs text-[#64748b] mt-0.5">Tus metas y afinidad de becas se recalcularán al instante.</p>
            </div>
            <button
              type="submit"
              className="bg-[#0F2554] hover:bg-[#1a3a7c] text-white px-4 py-2.5 rounded-[8px] shadow hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2 group cursor-pointer t-xs bold border-none"
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">save</span>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Success Toast Alert Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-[#166534] text-white p-4 rounded-[12px] shadow-2xl flex items-center gap-3 border border-white/10 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <div>
            <p className="t-sm bold text-white">Perfil Guardado</p>
            <p className="t-xs text-white/95">Los cambios se almacenaron con éxito.</p>
          </div>
        </div>
      )}
    </form>
  );
}
