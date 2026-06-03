import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

const S = {
  input: {
    background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8,
    padding: "8px 10px", fontSize: 12, color: "#0F2554", outline: "none", width: "100%",
  } as React.CSSProperties,
  label: {
    fontSize: 10, fontWeight: 500, color: "#64748b",
    textTransform: "uppercase" as const, letterSpacing: ".05em", display: "block", marginBottom: 4,
  } as React.CSSProperties,
  field: { display: "flex", flexDirection: "column" as const, gap: 4 } as React.CSSProperties,
  card: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden",
  } as React.CSSProperties,
  cardHead: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "13px 16px", borderBottom: "1px solid #e2e8f0",
  } as React.CSSProperties,
  cardBody: { padding: 16 } as React.CSSProperties,
  sdiv: {
    fontSize: 10, fontWeight: 500, color: "#94a3b8",
    textTransform: "uppercase" as const, letterSpacing: ".06em",
    paddingBottom: 8, borderBottom: "1px solid #e2e8f0", marginBottom: 12,
  } as React.CSSProperties,
  hint: { fontSize: 9, color: "#94a3b8", marginTop: 2 } as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } as React.CSSProperties,
};

export default function Perfil() {
  const { user, profile, refreshProfile } = useAuth();
  const [showToast, setShowToast] = useState(false);

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
      if (det.condiciones)  setCondiciones({ ...condiciones, ...det.condiciones });
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
      if (stored) try { const p = JSON.parse(stored); load(p, p); } catch (_) {}
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
    ? Math.floor((new Date(sisfohFechaVenc).getTime() - Date.now()) / 86400000)
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
  const CheckItem = ({
    checked, onChange, label, sub,
  }: { checked: boolean; onChange: () => void; label: string; sub?: string }) => (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 10px",
      border: `1px solid ${checked ? "#1a3a7c" : "#e2e8f0"}`,
      borderRadius: 9, cursor: "pointer",
      background: checked ? "#e8eef8" : "#fff",
    }}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1, accentColor: "#1a3a7c" }} />
      <div>
        <p style={{ fontSize: 11, color: "#0F2554", lineHeight: 1.4 }}>{label}</p>
        {sub && <p style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>{sub}</p>}
      </div>
    </label>
  );

  const MeritOpt = ({ value, icon, label }: { value: string; icon: string; label: string }) => (
    <button type="button" onClick={() => setMeritoAcademico(value)} style={{
      border: `1px solid ${meritoAcademico === value ? "#1a3a7c" : "#e2e8f0"}`,
      borderRadius: 9, padding: "9px 8px", textAlign: "center", cursor: "pointer",
      fontSize: 11, color: meritoAcademico === value ? "#1a3a7c" : "#64748b",
      background: meritoAcademico === value ? "#e8eef8" : "#fff",
      fontWeight: meritoAcademico === value ? 500 : 400,
    }}>
      <span style={{ fontSize: 18, display: "block", marginBottom: 4 }}>{icon}</span>
      {label}
    </button>
  );

  const CardIcon = ({ icon }: { icon: string }) => (
    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#e8eef8", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3a7c", flexShrink: 0 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
    </div>
  );

  const Badge = ({ done }: { done: boolean }) => (
    <span style={{ fontSize: 9, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: done ? "#dcfce7" : "#fef3c7", color: done ? "#166534" : "#92400e" }}>
      {done ? "Completo" : "Incompleto"}
    </span>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSave} className="page animate-fade-in select-none" style={{ gap: 14 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p className="t4">Perfil del postulante</p>
          <p className="t1 muted" style={{ marginTop: 3 }}>
            Completa tu perfil para que Pathfinder calcule tu afinidad con cada beca y te recomiende las mejores oportunidades.
          </p>
        </div>
        <button type="submit" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1a3a7c", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
          Guardar cambios
        </button>
      </div>

      {/* Progreso */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#0F2554" }}>Completitud del perfil</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1a3a7c" }}>{nivelPerfil}%</span>
          </div>
          <div style={{ background: "#f1f5f9", borderRadius: 99, height: 7, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#1a3a7c", borderRadius: 99, width: `${nivelPerfil}%`, transition: "width .5s" }} />
          </div>
          {missingItems.length > 0 && (
            <p style={{ fontSize: 10, color: "#64748b", marginTop: 5 }}>
              Faltan: <span style={{ color: "#92400e", fontWeight: 500 }}>{missingItems.join(", ")}</span>
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {[
            { label: "Personal", done: personalDone },
            { label: "Académico", done: academicoDone },
            { label: "Extras", done: !!extrasDone },
          ].map(({ label, done }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, padding: "4px 8px", borderRadius: 99, border: "1px solid #e2e8f0", background: done ? "#dcfce7" : "#f1f5f9", color: done ? "#166534" : "#94a3b8" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{done ? "check_circle" : "circle"}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── A. Datos personales ─────────────────────────────────────────── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <CardIcon icon="person" />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#0F2554", flex: 1 }}>Datos personales</span>
          <Badge done={personalDone} />
        </div>
        <div style={S.cardBody}>
          <div style={S.grid2}>
            <div style={{ ...S.field, gridColumn: "span 2" }}>
              <label style={S.label}>Nombres completos</label>
              <input style={S.input} type="text" value={nombres} onChange={e => setNombres(e.target.value)} required />
            </div>
            <div style={S.field}>
              <label style={S.label}>DNI</label>
              <input style={S.input} type="text" value={dni} onChange={e => setDni(e.target.value)} maxLength={8} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Correo electrónico</label>
              <input style={S.input} type="email" value={correo} onChange={e => setCorreo(e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Fecha de nacimiento</label>
              <input style={S.input} type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
              <span style={S.hint}>Necesario para verificar edad máxima por beca.</span>
            </div>
            <div style={S.field}>
              <label style={S.label}>Género</label>
              <select style={S.input} value={genero} onChange={e => setGenero(e.target.value)}>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Prefiero no decir</option>
              </select>
              <span style={S.hint}>Algunas becas son exclusivas para mujeres (ej. Beca Mujeres en Ciencia).</span>
            </div>
            <div style={S.field}>
              <label style={S.label}>Departamento</label>
              <select style={S.input} value={departamento} onChange={e => setDepartamento(e.target.value)}>
                {["Lima","Arequipa","Cusco","Piura","La Libertad","Lambayeque","Junín","Puno","Cajamarca","Loreto"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Provincia</label>
              <input style={S.input} type="text" value={provincia} onChange={e => setProvincia(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── B. Perfil académico ─────────────────────────────────────────── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <CardIcon icon="school" />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#0F2554", flex: 1 }}>Perfil académico</span>
          <Badge done={academicoDone} />
        </div>
        <div style={S.cardBody}>

          <p style={S.sdiv}>Colegio</p>
          <div style={{ ...S.grid2, marginBottom: 14 }}>
            <div style={{ ...S.field, gridColumn: "span 2" }}>
              <label style={S.label}>Nombre del colegio</label>
              <input style={S.input} type="text" value={institucionActual} onChange={e => setInstitucionActual(e.target.value)} placeholder="Busca tu colegio..." />
            </div>
            <div style={S.field}>
              <label style={S.label}>Tipo de gestión</label>
              <select style={S.input} value={tipoColegio} onChange={e => setTipoColegio(e.target.value)}>
                <option>Público</option>
                <option>Privado</option>
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Año de egreso</label>
              <select style={S.input} value={anoEgreso} onChange={e => setAnoEgreso(e.target.value)}>
                {["2026","2025","2024","2023","2022","2021"].map(y => <option key={y}>{y}</option>)}
              </select>
              <span style={S.hint}>Becas de pregrado exigen egreso hace ≤ 3 años.</span>
            </div>
          </div>

          <p style={S.sdiv}>Rendimiento (escala 0–20)</p>
          <div style={{ ...S.grid3, marginBottom: 14 }}>
            {[
              { label: "3er año", val: nota3, set: setNota3 },
              { label: "4to año", val: nota4, set: setNota4 },
              { label: "5to año", val: nota5, set: setNota5 },
            ].map(({ label, val, set }) => (
              <div key={label} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, textAlign: "center" }}>
                <p style={{ fontSize: 9, fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>{label}</p>
                <input
                  type="number" min={0} max={20} step={0.1}
                  value={val}
                  onChange={e => set(e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ width: "100%", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: 6, fontSize: 15, fontWeight: 500, color: "#1a3a7c", textAlign: "center", outline: "none" }}
                />
              </div>
            ))}
          </div>

          <p style={S.sdiv}>Mérito académico</p>
          <div style={{ ...S.grid3, marginBottom: 14 }}>
            <MeritOpt value="quinto" icon="🥇" label="Quinto Superior" />
            <MeritOpt value="tercio" icon="🥈" label="Tercio Superior" />
            <MeritOpt value="medio" icon="🥉" label="Medio Superior" />
          </div>

          <p style={S.sdiv}>Área de interés vocacional</p>
          <div style={S.field}>
            <label style={S.label}>¿Qué quieres estudiar?</label>
            <select style={S.input} value={areaInteres} onChange={e => setAreaInteres(e.target.value)}>
              <option value="">Selecciona un área</option>
              <option>STEM / Ingenierías</option>
              <option>Ciencias de la Salud</option>
              <option>Letras / Derecho</option>
              <option>Arte / Diseño</option>
              <option>Negocios / Administración</option>
              <option>Educación</option>
              <option>Ciencias Sociales</option>
            </select>
            <span style={S.hint}>Pathfinder usará esto para recomendarte becas afines a tu carrera.</span>
          </div>
        </div>
      </div>

      {/* ── C. Perfil socioeconómico ────────────────────────────────────── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <CardIcon icon="home" />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#0F2554", flex: 1 }}>Perfil socioeconómico</span>
          <Badge done={sisfoh !== "No Pobre"} />
        </div>
        <div style={S.cardBody}>

          <p style={S.sdiv}>Clasificación SISFOH</p>
          <div style={{ ...S.grid2, marginBottom: 8 }}>
            <div style={S.field}>
              <label style={S.label}>Clasificación actual</label>
              <select style={S.input} value={sisfoh} onChange={e => setSisfoh(e.target.value)}>
                <option>Pobre Extremo</option>
                <option>Pobre</option>
                <option>No Pobre</option>
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Fecha de vencimiento</label>
              <input style={S.input} type="date" value={sisfohFechaVenc} onChange={e => setSisfohFechaVenc(e.target.value)} />
              <span style={S.hint}>Te avisaremos 30 días antes de que venza.</span>
            </div>
          </div>

          {sisfohAlert && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 9, padding: "9px 11px", marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#92400e", flexShrink: 0, marginTop: 1 }}>warning</span>
              <p style={{ fontSize: 10, color: "#92400e", lineHeight: 1.5 }}>
                <strong>Tu SISFOH vence en {Math.ceil(diasSisfoh! / 30)} mes{diasSisfoh! < 60 ? "" : "es"}.</strong> Renuévalo en tu municipio para mantener tu elegibilidad en la Beca 18.
              </p>
            </div>
          )}

          <p style={{ ...S.sdiv, marginTop: 14 }}>Condiciones especiales</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <CheckItem checked={condiciones.redeped} onChange={() => setCondiciones(p => ({ ...p, redeped: !p.redeped }))} label="Afectado por violencia (REDEPED)" sub="Registro de DEVIDA" />
            <CheckItem checked={condiciones.nativa} onChange={() => setCondiciones(p => ({ ...p, nativa: !p.nativa }))} label="Comunidad Nativa / Campesina" sub="Certificado de comunidad" />
            <CheckItem checked={condiciones.vraem} onChange={() => setCondiciones(p => ({ ...p, vraem: !p.vraem }))} label="Residente en VRAEM / Huallaga" sub="Constancia de residencia" />
            <CheckItem checked={condiciones.licenciado} onChange={() => setCondiciones(p => ({ ...p, licenciado: !p.licenciado }))} label="Licenciado FF.AA." sub="Certificado de licenciamiento" />
            <CheckItem checked={tieneConadis} onChange={() => setTieneConadis(p => !p)} label="Discapacidad inscrita en CONADIS" sub="Certificado CONADIS vigente" />
            <CheckItem checked={hijoDocente} onChange={() => setHijoDocente(p => !p)} label="Hijo/a de docente público" sub="Constancia MINEDU" />
          </div>
        </div>
      </div>

      {/* ── D. Extracurriculares ────────────────────────────────────────── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <CardIcon icon="emoji_events" />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#0F2554", flex: 1 }}>Extracurriculares y aptitudes</span>
          <Badge done={haceVoluntariado || esDeportista || tieneLiderazgo || tieneEmprendimiento} />
        </div>
        <div style={S.cardBody}>
          <p style={{ fontSize: 11, color: "#64748b", marginBottom: 12, lineHeight: 1.6 }}>
            Esta sección diferencia tu postulación en becas privadas. Completa todo lo que aplique.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <CheckItem checked={haceVoluntariado} onChange={() => setHaceVoluntariado(p => !p)} label="Participo en voluntariados" sub="Ej. Techo, AIESEC, ONG local" />
            <CheckItem checked={esDeportista} onChange={() => setEsDeportista(p => !p)} label="Deportista calificado (IPD)" sub="Con acreditación oficial del IPD" />
            <CheckItem checked={tieneLiderazgo} onChange={() => setTieneLiderazgo(p => !p)} label="Liderazgo / Municipio Escolar" sub="Presidente, alcalde escolar, etc." />
            <CheckItem checked={tieneEmprendimiento} onChange={() => setTieneEmprendimiento(p => !p)} label="Proyecto o emprendimiento" sub="Concurso, feria de ciencias, etc." />
          </div>

          <p style={S.sdiv}>Idiomas</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, alignItems: "end" }}>
            <div style={S.field}>
              <label style={S.label}>Idioma</label>
              <select style={S.input}><option>Inglés</option><option>Francés</option><option>Portugués</option></select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Nivel</label>
              <select style={S.input} value={nivelIngles} onChange={e => setNivelIngles(e.target.value)}>
                <option value="Ninguno">Ninguno</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Instituto</label>
              <input style={S.input} type="text" value={instituto} onChange={e => setInstituto(e.target.value)} placeholder="Británico / ICPNA" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Certificación</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f1f5f9", cursor: "pointer", fontSize: 11, color: "#64748b" }}>
                <input type="checkbox" checked={certOficial} onChange={() => setCertOficial(p => !p)} style={{ accentColor: "#1a3a7c" }} />
                TOEFL / Cambridge
              </label>
            </div>
          </div>
          {certOficial && (
            <p style={{ fontSize: 10, color: "#166534", marginTop: 6, background: "#dcfce7", padding: "6px 10px", borderRadius: 8 }}>
              Tener una certificación oficial aumenta tu afinidad con becas de idiomas.
            </p>
          )}
        </div>
      </div>

      {/* ── Privacidad ──────────────────────────────────────────────────── */}
      <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: "13px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <input type="checkbox" checked={aceptaPrivacidad} onChange={() => setAceptaPrivacidad(p => !p)}
          style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2, accentColor: "#1a3a7c" }} required />
        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
          Acepto el <span style={{ color: "#1a3a7c", textDecoration: "underline", cursor: "pointer" }}>tratamiento de mis datos personales</span> según la <strong style={{ color: "#0F2554" }}>Ley N° 29733</strong> de Protección de Datos Personales del Perú. Mis datos serán usados únicamente para calcular mi afinidad con becas y mejorar mis recomendaciones dentro de Pathfinder.
        </p>
      </div>

      {/* ── Botones bottom ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingBottom: 8 }}>
        <button type="button" style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#64748b", background: "#fff", cursor: "pointer" }}>
          Cancelar
        </button>
        <button type="submit" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1a3a7c", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
          Guardar cambios
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{ position: "fixed", top: 80, right: 24, zIndex: 99, background: "#0F2554", color: "#fff", padding: "12px 16px", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,.15)", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,.1)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#86efac" }}>check_circle</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Perfil guardado</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.85)", marginTop: 2 }}>Los cambios se almacenaron con éxito.</p>
          </div>
        </div>
      )}
    </form>
  );
}
