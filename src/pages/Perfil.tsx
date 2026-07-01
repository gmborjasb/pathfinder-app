import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Perfil() {
  const { user, profile, refreshProfile } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [now] = useState(() => Date.now());

  // ── Sección A — Datos personales ──────────────────────────────────────────
  const [nombres, setNombres] = useState("");
  const [dni, setDni] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("Prefiero no decir");
  const [departamento, setDepartamento] = useState("Lima");
  const [provincia, setProvincia] = useState("Lima");

  // ── Sección B — Perfil académico ──────────────────────────────────────────
  const [institucionActual, setInstitucionActual] = useState("");
  const [tipoColegio, setTipoColegio] = useState("Público");
  const [anoEgreso, setAnoEgreso] = useState("2025");
  const [nota3, setNota3] = useState<number | "">(15);
  const [nota4, setNota4] = useState<number | "">(15);
  const [nota5, setNota5] = useState<number | "">(15);
  const [meritoAcademico, setMeritoAcademico] = useState("");
  const [areaInteres, setAreaInteres] = useState("");

  // ── Sección C — Perfil socioeconómico ────────────────────────────────────
  const [sisfoh, setSisfoh] = useState("No Pobre");
  const [sisfohFechaVenc, setSisfohFechaVenc] = useState("");
  const [condiciones, setCondiciones] = useState({
    vraem: false, nativa: false, licenciado: false, redeped: false,
  });
  const [tieneConadis, setTieneConadis] = useState(false);
  const [hijoDocente, setHijoDocente] = useState(false);

  // ── Sección D — Extracurriculares ─────────────────────────────────────────
  const [haceVoluntariado, setHaceVoluntariado] = useState(false);
  const [esDeportista, setEsDeportista] = useState(false);
  const [tieneLiderazgo, setTieneLiderazgo] = useState(false);
  const [tieneEmprendimiento, setTieneEmprendimiento] = useState(false);
  const [nivelIngles, setNivelIngles] = useState("Ninguno");
  const [instituto, setInstituto] = useState("");
  const [certOficial, setCertOficial] = useState(false);

  // ── Privacidad ────────────────────────────────────────────────────────────
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  // ── Cargar desde profile/localStorage ────────────────────────────────────
  useEffect(() => {
    const load = (p: any, det: any) => {
      if (p.nombres)  setNombres(p.nombres);
      if (p.dni)      setDni(p.dni);
      if (p.correo)   setCorreo(p.correo);
      if (p.fecha_nacimiento) setFechaNacimiento(p.fecha_nacimiento.split("T")[0]);
      if (p.genero)   setGenero(p.genero);
      if (p.merito_academico || det.merito_academico) setMeritoAcademico(p.merito_academico || det.merito_academico || "");
      if (p.area_interes || det.area_interes) setAreaInteres(p.area_interes || det.area_interes || "");
      if (p.tiene_conadis !== undefined) setTieneConadis(!!p.tiene_conadis);
      if (p.es_deportista !== undefined) setEsDeportista(!!p.es_deportista);
      if (p.hace_voluntariado !== undefined) setHaceVoluntariado(!!p.hace_voluntariado);
      if (p.hijo_docente !== undefined) setHijoDocente(!!p.hijo_docente);
      if (p.acepta_privacidad !== undefined) setAceptaPrivacidad(!!p.acepta_privacidad);

      if (det.tipo_colegio) setTipoColegio(det.tipo_colegio);
      if (det.sisfoh)       setSisfoh(det.sisfoh);
      if (det.sisfoh_fecha_vencimiento) setSisfohFechaVenc(det.sisfoh_fecha_vencimiento);
      if (det.departamento) setDepartamento(det.departamento);
      if (det.provincia)    setProvincia(det.provincia);
      if (det.institucionActual) setInstitucionActual(det.institucionActual);
      if (det.condiciones)  setCondiciones(prev => ({ ...prev, ...det.condiciones }));
      if (det.colegio?.ano_egreso) setAnoEgreso(det.colegio.ano_egreso);
      if (det.notas?.año3)  setNota3(det.notas.año3);
      if (det.notas?.año4)  setNota4(det.notas.año4);
      if (det.notas?.año5)  setNota5(det.notas.año5);
      if (det.idiomas?.nivelIngles) setNivelIngles(det.idiomas.nivelIngles);
      if (det.idiomas?.instituto)   setInstituto(det.idiomas.instituto);
      if (det.idiomas?.certificacion_oficial !== undefined) setCertOficial(!!det.idiomas.certificacion_oficial);
      if (det.tiene_liderazgo !== undefined) setTieneLiderazgo(!!det.tiene_liderazgo);
      if (det.tiene_emprendimiento !== undefined) setTieneEmprendimiento(!!det.tiene_emprendimiento);
      if (det.hace_voluntariado !== undefined) setHaceVoluntariado(!!det.hace_voluntariado);
      if (det.es_deportista !== undefined) setEsDeportista(!!det.es_deportista);
    };

    if (profile) {
      load(profile, profile.perfil_detalles || {});
    } else {
      const stored = localStorage.getItem("pathfinder_profile");
      if (stored) try { const p = JSON.parse(stored); load(p, p); } catch { /* ignore */ }
    }
  }, [profile]);

  // ── Completitud ───────────────────────────────────────────────────────────
  const items = [
    !!nombres.trim(), !!dni.trim(), !!correo.trim(),
    !!fechaNacimiento, genero !== "Prefiero no decir",
    !!institucionActual.trim(), !!anoEgreso,
    Number(nota3) > 0, Number(nota4) > 0, Number(nota5) > 0,
    !!meritoAcademico, !!areaInteres,
    sisfoh !== "No Pobre",
    Object.values(condiciones).some(Boolean) || tieneConadis || hijoDocente,
    nivelIngles !== "Ninguno",
    haceVoluntariado || esDeportista || tieneLiderazgo || tieneEmprendimiento,
    aceptaPrivacidad,
  ];
  const nivelPerfil = Math.round((items.filter(Boolean).length / items.length) * 100);

  const personalDone = [!!nombres, !!dni, !!correo, !!fechaNacimiento, genero !== "Prefiero no decir"].every(Boolean);
  const academicoDone = [!!institucionActual, !!meritoAcademico, Number(nota3) > 0].every(Boolean);
  const extrasDone = aceptaPrivacidad && (haceVoluntariado || esDeportista || tieneLiderazgo || tieneEmprendimiento);

  const missingItems = [
    !meritoAcademico && "Mérito académico",
    !areaInteres && "Área de interés",
    !(haceVoluntariado || esDeportista || tieneLiderazgo || tieneEmprendimiento) && "Extracurriculares",
    !certOficial && nivelIngles !== "Ninguno" && "Certificación de inglés",
    !fechaNacimiento && "Fecha de nacimiento",
    !aceptaPrivacidad && "Aceptar privacidad",
  ].filter(Boolean) as string[];

  // ── SISFOH alert ──────────────────────────────────────────────────────────
  const diasSisfoh = sisfohFechaVenc
    ? Math.floor((new Date(sisfohFechaVenc).getTime() - now) / 86400000)
    : null;
  const sisfohAlert = diasSisfoh !== null && diasSisfoh <= 180;

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const perfil_detalles = {
      tipo_colegio: tipoColegio,
      sisfoh,
      sisfoh_fecha_vencimiento: sisfohFechaVenc || null,
      departamento,
      provincia,
      institucionActual,
      condiciones,
      nivelPerfil,
      colegio: { ano_egreso: anoEgreso },
      notas: { año3: Number(nota3), año4: Number(nota4), año5: Number(nota5), gpa: Number(nota5) },
      idiomas: { nivelIngles, instituto, certificacion_oficial: certOficial },
      merito_academico: meritoAcademico,
      area_interes: areaInteres,
      hace_voluntariado: haceVoluntariado,
      es_deportista: esDeportista,
      tiene_liderazgo: tieneLiderazgo,
      tiene_emprendimiento: tieneEmprendimiento,
      acepta_privacidad: aceptaPrivacidad,
    };

    const localData = {
      nombres, dni, correo, fechaNacimiento, genero,
      tipoColegio, anoEgreso, meritoAcademico, areaInteres,
      sisfoh, sisfohFechaVenc, departamento, provincia,
      condiciones, tieneConadis, hijoDocente,
      haceVoluntariado, esDeportista, tieneLiderazgo, tieneEmprendimiento,
      nivelIngles, instituto, certOficial,
      aceptaPrivacidad, nivelPerfil,
      notas: { año3: Number(nota3), año4: Number(nota4), año5: Number(nota5) },
      idiomas: { nivelIngles, instituto, certificacionOficial: certOficial },
      perfil_detalles,
    };
    localStorage.setItem("pathfinder_profile", JSON.stringify(localData));

    if (user) {
      try {
        await supabase.from("usuarios").update({
          dni: dni || null,
          nombres,
          fecha_nacimiento: fechaNacimiento || null,
          genero,
          merito_academico: meritoAcademico || null,
          area_interes: areaInteres || null,
          tiene_conadis: tieneConadis,
          es_deportista: esDeportista,
          hace_voluntariado: haceVoluntariado,
          hijo_docente: hijoDocente,
          acepta_privacidad: aceptaPrivacidad,
          privacidad_fecha: aceptaPrivacidad ? new Date().toISOString() : null,
          perfil_detalles,
        }).eq("id", user.id);

        await refreshProfile();
      } catch (err) {
        console.error("Error saving profile:", err);
      }
    }

    window.dispatchEvent(new Event("profileUpdated"));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  // Helpers moved outside of render to satisfy react-hooks/static-components


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 animate-fade-in select-none flex-1">

      {/* Botones Flotantes Desktop */}
      <div className="fixed top-8 right-16 hidden lg:flex items-center gap-3 z-50">
        <div className="flex flex-col items-end">
          <p className="text-xs font-black text-text-primary mb-0.5">
            {nivelPerfil === 100 ? "¡Perfil completo!" : "Perfil incompleto"}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Autoguardado activado
          </p>
        </div>
        <Button
          type="submit"
          variant="default"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          Guardar cambios
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-brand-blue">Perfil del postulante</h2>
          <p className="text-sm text-text-tertiary mt-1">
            Completa tu perfil para que Pathfinder calcule tu afinidad con cada beca y te recomiende las mejores oportunidades.
          </p>
        </div>
      </div>

      {/* Progreso */}
      <Card className="bg-white p-4 flex flex-row items-center gap-4 flex-wrap animate-fade-in">
        <CardContent className="p-0 flex-1 min-w-[200px] flex flex-row items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-text-tertiary">Completitud del perfil</span>
              <span className="text-sm font-bold text-brand-blue">{nivelPerfil}%</span>
            </div>
            <div className="bg-background rounded-full h-2 overflow-hidden border-2 border-border">
              <div className="h-full bg-brand-blue rounded-full transition-all duration-500" style={{ width: `${nivelPerfil}%` }} />
            </div>
            {missingItems.length > 0 && (
              <p className="text-[10px] text-text-tertiary mt-1 font-medium">
                Faltan: <span className="text-amber-700 font-semibold">{missingItems.join(", ")}</span>
              </p>
            )}
          </div>
          <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
            {[
              { label: "Personal", done: personalDone },
              { label: "Académico", done: academicoDone },
              { label: "Extras", done: !!extrasDone },
            ].map(({ label, done }) => (
              <div key={label} className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border-2 border-border ${
                done ? "bg-success-bg text-success-text" : "bg-slate-100 text-text-tertiary"
              }`}>
                <span className={`material-symbols-outlined text-[12px] ${done ? "[font-variation-settings:'FILL'_1]" : ""}`}>{done ? "check_circle" : "circle"}</span>
                {label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Accordion
        type="multiple"
        defaultValue={["personal", "academico", "socioeconomico", "extras"]}
        className="flex flex-col gap-5 mb-5"
      >
        {/* ── A. Datos personales ───────────────────────────────────────── */}
        <AccordionItem value="personal">
          <AccordionTrigger>
            <span className="flex items-center gap-2.5 flex-1">
              <span className="material-symbols-outlined text-[18px]">person</span>
              Datos personales
            </span>
            <Badge variant={personalDone ? "success" : "warning"} className="mr-2">
              {personalDone ? "Completo" : "Incompleto"}
            </Badge>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Nombres completos</label>
                <Input type="text" value={nombres} onChange={e => setNombres(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">DNI</label>
                <Input type="text" value={dni} onChange={e => setDni(e.target.value)} maxLength={8} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Correo electrónico</label>
                <Input type="email" value={correo} onChange={e => setCorreo(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Fecha de nacimiento</label>
                <Input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
                <span className="text-[9px] text-text-tertiary font-medium mt-0.5">Necesario para verificar edad máxima por beca.</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Género</label>
                <Select value={genero} onValueChange={setGenero}>
                  <SelectTrigger className="w-full h-auto">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[9px] text-text-tertiary font-medium mt-0.5">Algunas becas son exclusivas para mujeres (ej. Beca Mujeres en Ciencia).</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Departamento</label>
                <Select value={departamento} onValueChange={setDepartamento}>
                  <SelectTrigger className="w-full h-auto">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["Lima","Arequipa","Cusco","Piura","La Libertad","Lambayeque","Junín","Puno","Cajamarca","Loreto"].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Provincia</label>
                <Input type="text" value={provincia} onChange={e => setProvincia(e.target.value)} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── B. Perfil académico ─────────────────────────────────────────── */}
        <AccordionItem value="academico">
          <AccordionTrigger>
            <span className="flex items-center gap-2.5 flex-1">
              <span className="material-symbols-outlined text-[18px]">school</span>
              Perfil académico
            </span>
            <Badge variant={academicoDone ? "success" : "warning"} className="mr-2">
              {academicoDone ? "Completo" : "Incompleto"}
            </Badge>
          </AccordionTrigger>
          <AccordionContent>

            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.07em] pb-1.5 border-b border-slate-200 mb-3.5">Colegio</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
              <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Nombre del colegio</label>
                <Input type="text" value={institucionActual} onChange={e => setInstitucionActual(e.target.value)} placeholder="Busca tu colegio..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Tipo de gestión</label>
                <Select value={tipoColegio} onValueChange={setTipoColegio}>
                  <SelectTrigger className="w-full h-auto">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Público">Público</SelectItem>
                    <SelectItem value="Privado">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Año de egreso</label>
                <Select value={anoEgreso} onValueChange={setAnoEgreso}>
                  <SelectTrigger className="w-full h-auto">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["2026","2025","2024","2023","2022","2021"].map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[9px] text-text-tertiary font-medium mt-0.5">Becas de pregrado exigen egreso hace ≤ 3 años.</span>
              </div>
            </div>

            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.07em] pb-1.5 border-b border-slate-200 mb-3.5">Rendimiento (escala 0–20)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3.5">
              {[
                { label: "3er año", val: nota3, set: setNota3 },
                { label: "4to año", val: nota4, set: setNota4 },
                { label: "5to año", val: nota5, set: setNota5 },
              ].map(({ label, val, set }) => (
                <div key={label} className="bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] font-medium text-text-tertiary uppercase tracking-wider mb-1">{label}</p>
                  <Input
                    type="number" min={0} max={20} step={0.1}
                    value={val}
                    onChange={e => set(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-center"
                  />
                </div>
              ))}
            </div>

            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.07em] pb-1.5 border-b border-slate-200 mb-3.5">Mérito académico</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3.5">
              <Button type="button" variant={meritoAcademico === "quinto" ? "default" : "neutral"} onClick={() => setMeritoAcademico("quinto")} className="flex-col h-auto py-2.5">
                  <span className="material-symbols-outlined text-lg text-warning-text">emoji_events</span>
                Quinto Superior
              </Button>
              <Button type="button" variant={meritoAcademico === "tercio" ? "default" : "neutral"} onClick={() => setMeritoAcademico("tercio")} className="flex-col h-auto py-2.5">
                  <span className="material-symbols-outlined text-lg text-text-tertiary">emoji_events</span>
                Tercio Superior
              </Button>
              <Button type="button" variant={meritoAcademico === "medio" ? "default" : "neutral"} onClick={() => setMeritoAcademico("medio")} className="flex-col h-auto py-2.5">
                  <span className="material-symbols-outlined text-lg text-amber-700">emoji_events</span>
                Medio Superior
              </Button>
            </div>

            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.07em] pb-1.5 border-b border-slate-200 mb-3.5">Área de interés vocacional</p>
            <div className="flex flex-col gap-1">
              <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">¿Qué quieres estudiar?</label>
              <Select value={areaInteres} onValueChange={setAreaInteres}>
                <SelectTrigger className="w-full h-auto">
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STEM / Ingenierías">STEM / Ingenierías</SelectItem>
                  <SelectItem value="Ciencias de la Salud">Ciencias de la Salud</SelectItem>
                  <SelectItem value="Letras / Derecho">Letras / Derecho</SelectItem>
                  <SelectItem value="Arte / Diseño">Arte / Diseño</SelectItem>
                  <SelectItem value="Negocios / Administración">Negocios / Administración</SelectItem>
                  <SelectItem value="Educación">Educación</SelectItem>
                  <SelectItem value="Ciencias Sociales">Ciencias Sociales</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[9px] text-text-tertiary font-medium mt-0.5">Pathfinder usará esto para recomendarte becas afines a tu carrera.</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── C. Perfil socioeconómico ────────────────────────────────────── */}
        <AccordionItem value="socioeconomico">
          <AccordionTrigger>
            <span className="flex items-center gap-2.5 flex-1">
              <span className="material-symbols-outlined text-[18px]">home</span>
              Perfil socioeconómico
            </span>
            <Badge variant={sisfoh !== "No Pobre" ? "success" : "warning"} className="mr-2">
              {sisfoh !== "No Pobre" ? "Completo" : "Incompleto"}
            </Badge>
          </AccordionTrigger>
          <AccordionContent>

            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.07em] pb-1.5 border-b border-slate-200 mb-3.5">Clasificación SISFOH</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Clasificación actual</label>
                <Select value={sisfoh} onValueChange={setSisfoh}>
                  <SelectTrigger className="w-full h-auto">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pobreza Extrema">Pobreza Extrema</SelectItem>
                    <SelectItem value="Pobre">Pobre</SelectItem>
                    <SelectItem value="No Pobre">No Pobre (o sin clasificar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Fecha de vencimiento</label>
                <Input type="date" value={sisfohFechaVenc} onChange={e => setSisfohFechaVenc(e.target.value)} />
                <span className="text-[9px] text-text-tertiary font-medium mt-0.5">Te avisaremos 30 días antes de que venza.</span>
              </div>
            </div>

            {sisfohAlert && (
              <Alert className="mb-3 animate-fade-in">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <AlertDescription>
                  <strong>Tu SISFOH vence en {Math.ceil(diasSisfoh! / 30)} mes{diasSisfoh! < 60 ? "" : "es"}.</strong> Renuévalo en tu municipio para mantener tu elegibilidad en la Beca 18.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.07em] pb-1.5 border-b border-slate-200 mb-3.5">Condiciones especiales</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={condiciones.redeped} onCheckedChange={() => setCondiciones(p => ({ ...p, redeped: !p.redeped }))} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Afectado por violencia (REDEPED)</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Registro de DEVIDA</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={condiciones.nativa} onCheckedChange={() => setCondiciones(p => ({ ...p, nativa: !p.nativa }))} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Comunidad Nativa / Campesina</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Certificado de comunidad</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={condiciones.vraem} onCheckedChange={() => setCondiciones(p => ({ ...p, vraem: !p.vraem }))} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Residente en VRAEM / Huallaga</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Constancia de residencia</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={condiciones.licenciado} onCheckedChange={() => setCondiciones(p => ({ ...p, licenciado: !p.licenciado }))} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Licenciado FF.AA.</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Certificado de licenciamiento</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={tieneConadis} onCheckedChange={() => setTieneConadis(p => !p)} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Discapacidad inscrita en CONADIS</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Certificado CONADIS vigente</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={hijoDocente} onCheckedChange={() => setHijoDocente(p => !p)} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Hijo/a de docente público</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Constancia MINEDU</p>
                </div>
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── D. Extracurriculares ────────────────────────────────────────── */}
        <AccordionItem value="extras">
          <AccordionTrigger>
            <span className="flex items-center gap-2.5 flex-1">
              <span className="material-symbols-outlined text-[18px]">emoji_events</span>
              Extracurriculares y aptitudes
            </span>
            <Badge
              variant={haceVoluntariado || esDeportista || tieneLiderazgo || tieneEmprendimiento ? "success" : "warning"}
              className="mr-2"
            >
              {haceVoluntariado || esDeportista || tieneLiderazgo || tieneEmprendimiento ? "Completo" : "Incompleto"}
            </Badge>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-[11px] text-text-tertiary mb-3 leading-relaxed">
              Esta sección diferencia tu postulación en becas privadas. Completa todo lo que aplique.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3.5">
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={haceVoluntariado} onCheckedChange={() => setHaceVoluntariado(p => !p)} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Participo en voluntariados</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Ej. Techo, AIESEC, ONG local</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={esDeportista} onCheckedChange={() => setEsDeportista(p => !p)} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Deportista calificado (IPD)</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Con acreditación oficial del IPD</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={tieneLiderazgo} onCheckedChange={() => setTieneLiderazgo(p => !p)} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Liderazgo / Municipio Escolar</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Presidente, alcalde escolar, etc.</p>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border-2 border-border rounded-base cursor-pointer">
                <Checkbox checked={tieneEmprendimiento} onCheckedChange={() => setTieneEmprendimiento(p => !p)} />
                <div>
                  <p className="text-xs font-semibold leading-snug">Proyecto o emprendimiento</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">Concurso, feria de ciencias, etc.</p>
                </div>
              </label>
            </div>

            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.07em] pb-1.5 border-b border-slate-200 mb-3.5">Idiomas</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Idioma</label>
                <Select defaultValue="Inglés">
                  <SelectTrigger className="w-full h-auto">
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inglés">Inglés</SelectItem>
                    <SelectItem value="Francés">Francés</SelectItem>
                    <SelectItem value="Portugués">Portugués</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Nivel</label>
                <Select value={nivelIngles} onValueChange={setNivelIngles}>
                  <SelectTrigger className="w-full h-auto">
                    <SelectValue placeholder="Selecciona nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ninguno">Ninguno</SelectItem>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                    <SelectItem value="Nativo">Nativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Instituto</label>
                <Input type="text" value={instituto} onChange={e => setInstituto(e.target.value)} placeholder="Británico / ICPNA" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-1">Certificación</label>
                <label className="flex items-center gap-1.5 px-2.5 py-2 border-2 border-border rounded-base bg-secondary-background cursor-pointer text-[11px] text-text-tertiary select-none w-full justify-center h-10">
                  <Checkbox checked={certOficial} onCheckedChange={() => setCertOficial(p => !p)} />
                  TOEFL / Cambridge
                </label>
              </div>
            </div>
            {certOficial && (
              <p className="text-[10px] text-green-700 mt-1.5 bg-success-bg px-2.5 py-1.5 rounded-lg">
                Tener una certificación oficial aumenta tu afinidad con becas de idiomas.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* ── Privacidad ──────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-3.5 flex items-start gap-2.5">
        <Checkbox checked={aceptaPrivacidad} onCheckedChange={() => setAceptaPrivacidad(p => !p)} required />
        <p className="text-[11px] text-text-tertiary leading-relaxed">
          Acepto el <span className="text-brand-blue underline cursor-pointer">tratamiento de mis datos personales</span> según la <strong className="text-brand-blue font-semibold">Ley N° 29733</strong> de Protección de Datos Personales del Perú. Mis datos serán usados únicamente para calcular mi afinidad con becas y mejorar mis recomendaciones dentro de Pathfinder.
        </p>
      </div>

      {/* ── Botones bottom ──────────────────────────────────────────────── */}
      <div className="flex justify-end gap-2 pb-2 flex-wrap">
        <Button variant="neutral" type="button" className="flex-1 sm:flex-none">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 sm:flex-none">
          <span className="material-symbols-outlined text-[14px]">save</span>
          Guardar cambios
        </Button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 right-6 z-[99] bg-brand-blue text-white px-4 py-3 rounded-xl shadow-[4px_4px_0_#0f172a] flex items-center gap-2.5 border-2 border-border animate-fade-in">
          <span className="material-symbols-outlined text-[20px] text-green-300">check_circle</span>
          <div>
            <p className="text-xs font-semibold text-white">Perfil guardado</p>
            <p className="text-[11px] text-white/80 mt-0.5">Los cambios se almacenaron con éxito.</p>
          </div>
        </div>
      )}
    </form>
  );
}
