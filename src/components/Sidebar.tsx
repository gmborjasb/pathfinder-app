import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

export function Sidebar() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [profileName, setProfileName] = useState("Estudiante");
  const [postulacionesCount, setPostulacionesCount] = useState<number | null>(null);
  const [docsRechazados, setDocsRechazados] = useState(0);
  const [showFootMenu, setShowFootMenu] = useState(false);
  const footMenuRef = useRef<HTMLDivElement>(null);

  // Profile name from localStorage / auth
  useEffect(() => {
    const loadProfile = () => {
      if (profile?.nombres) {
        setProfileName(profile.nombres.split(" ")[0]);
        return;
      }
      const stored = localStorage.getItem("pathfinder_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.nombres) setProfileName(parsed.nombres.split(" ")[0]);
        } catch (e) { console.error(e); }
      }
    };
    loadProfile();
    window.addEventListener("storage", loadProfile);
    window.addEventListener("profileUpdated", loadProfile);
    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("profileUpdated", loadProfile);
    };
  }, [profile]);

  // Postulaciones count + rejected docs from Supabase
  useEffect(() => {
    const load = async () => {
      const isMock = !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
      if (!user || isMock) return;
      try {
        const { data: becasData } = await supabase.from("becas").select("id");
        const validIds = (becasData || []).map((b: any) => b.id);

        const { count } = await supabase
          .from("postulaciones")
          .select("id", { count: "exact", head: true })
          .eq("usuario_id", user.id)
          .in("beca_id", validIds.length > 0 ? validIds : [""]);
        setPostulacionesCount(count ?? 0);

        // Rejected docs for active beca
        const becaId = localStorage.getItem("pathfinder_active_meta");
        if (becaId) {
          const { data: post } = await supabase
            .from("postulaciones")
            .select("id")
            .eq("usuario_id", user.id)
            .eq("beca_id", becaId)
            .maybeSingle();
          if (post) {
            const { data: docs } = await supabase
              .from("documentos")
              .select("estado")
              .eq("postulacion_id", post.id)
              .eq("estado", "Rechazado");
            setDocsRechazados(docs?.length ?? 0);
          }
        }
      } catch (err) {
        console.error("Error loading sidebar data:", err);
      }
    };
    load();
  }, [user]);

  // Close foot menu on outside click
  useEffect(() => {
    if (!showFootMenu) return;
    const handler = (e: MouseEvent) => {
      if (footMenuRef.current && !footMenuRef.current.contains(e.target as Node)) {
        setShowFootMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFootMenu]);

  // Profile completeness
  const pd = profile?.perfil_detalles;
  const profilePct = (() => {
    if (pd?.nivelPerfil && pd.nivelPerfil > 0) return Math.min(pd.nivelPerfil * 20, 100);
    let score = 0;
    if (profile?.nombres)               score += 20;
    if (pd?.tipo_colegio)               score += 15;
    if (pd?.departamento)               score += 15;
    if (pd?.notas?.gpa)                 score += 20;
    if (pd?.sisfoh)                     score += 15;
    if (pd?.idiomas?.nivelIngles)       score += 15;
    return score;
  })();

  // NavLink class factory
  const navCls = (isActive: boolean) =>
    `flex items-center gap-[10px] cursor-pointer transition-colors relative ${
      isActive
        ? "rounded-[10px] bg-[#e8eef8] text-[#1a3a7c]"
        : "rounded-[10px] text-[#64748b] hover:bg-[#f1f5f9]"
    }`;

  const activeBar = (
    <span style={{
      position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)",
      width: 3, height: 24, background: "#1a3a7c", borderRadius: "0 3px 3px 0",
    }} />
  );

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, height: "100%", width: 240,
      background: "#fff", borderRight: "1px solid #e2e8f0",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }} className="hidden lg:flex">

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 14px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1a3a7c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 500, flexShrink: 0 }}>
          P
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#0F2554", lineHeight: 1.2 }}>Pathfinder</p>
          <p style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", marginTop: 1 }}>Portal postulante</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>

        {/* Sección Principal */}
        <p style={{ fontSize: 9, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", padding: "10px 10px 4px" }}>
          Principal
        </p>

        <NavLink to="/dashboard" className={({ isActive }) => navCls(isActive)} style={{ padding: "9px 10px" }}>
          {({ isActive }) => (
            <>
              {isActive && activeBar}
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: isActive ? "#1a3a7c" : "#64748b", width: 20, textAlign: "center", flexShrink: 0 }}>home</span>
              <span style={{ fontSize: 12, color: isActive ? "#1a3a7c" : "#64748b", fontWeight: isActive ? 500 : 400, flex: 1 }}>Inicio / Mi panel</span>
            </>
          )}
        </NavLink>

        <NavLink to="/perfil" className={({ isActive }) => navCls(isActive)} style={{ padding: "9px 10px" }}>
          {({ isActive }) => (
            <>
              {isActive && activeBar}
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: isActive ? "#1a3a7c" : "#64748b", width: 20, textAlign: "center", flexShrink: 0 }}>person</span>
              <span style={{ fontSize: 12, color: isActive ? "#1a3a7c" : "#64748b", fontWeight: isActive ? 500 : 400, flex: 1 }}>Perfil del postulante</span>
              <span
                title="Completa tu perfil para mejorar tus postulaciones"
                style={{ width: 18, height: 18, background: "#fef3c7", color: "#92400e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 10 }}>warning</span>
              </span>
            </>
          )}
        </NavLink>

        <NavLink to="/postulaciones" className={({ isActive }) => navCls(isActive)} style={{ padding: "9px 10px" }}>
          {({ isActive }) => (
            <>
              {isActive && activeBar}
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: isActive ? "#1a3a7c" : "#64748b", width: 20, textAlign: "center", flexShrink: 0 }}>assignment</span>
              <span style={{ fontSize: 12, color: isActive ? "#1a3a7c" : "#64748b", fontWeight: isActive ? 500 : 400, flex: 1 }}>Mis postulaciones</span>
              {postulacionesCount !== null && postulacionesCount > 0 && (
                <span style={{ fontSize: 9, fontWeight: 500, minWidth: 18, height: 18, borderRadius: 99, background: "#e8eef8", color: "#1a3a7c", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 }}>
                  {postulacionesCount}
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "6px 0" }} />

        {/* Sección Explorar */}
        <p style={{ fontSize: 9, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", padding: "4px 10px 4px" }}>
          Explorar
        </p>

        <NavLink to="/buscar" className={({ isActive }) => navCls(isActive)} style={{ padding: "9px 10px" }}>
          {({ isActive }) => (
            <>
              {isActive && activeBar}
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: isActive ? "#1a3a7c" : "#64748b", width: 20, textAlign: "center", flexShrink: 0 }}>search</span>
              <span style={{ fontSize: 12, color: isActive ? "#1a3a7c" : "#64748b", fontWeight: isActive ? 500 : 400, flex: 1 }}>Buscar oportunidades</span>
            </>
          )}
        </NavLink>

        <NavLink to="/documentos" className={({ isActive }) => navCls(isActive)} style={{ padding: "9px 10px" }}>
          {({ isActive }) => (
            <>
              {isActive && activeBar}
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: isActive ? "#1a3a7c" : "#64748b", width: 20, textAlign: "center", flexShrink: 0 }}>backpack</span>
              <span style={{ fontSize: 12, color: isActive ? "#1a3a7c" : "#64748b", fontWeight: isActive ? 500 : 400, flex: 1 }}>Mochila de documentos</span>
              {docsRechazados > 0 && (
                <span style={{ fontSize: 9, fontWeight: 500, minWidth: 18, height: 18, borderRadius: 99, background: "#fee2e2", color: "#991b1b", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 }}>
                  {docsRechazados}
                </span>
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/asesor" className={({ isActive }) => navCls(isActive)} style={{ padding: "9px 10px" }}>
          {({ isActive }) => (
            <>
              {isActive && activeBar}
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: isActive ? "#1a3a7c" : "#64748b", width: 20, textAlign: "center", flexShrink: 0 }}>smart_toy</span>
              <span style={{ fontSize: 12, color: isActive ? "#1a3a7c" : "#64748b", fontWeight: isActive ? 500 : 400, flex: 1 }}>Asesor IA</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Profile completeness bar */}
      <div style={{ margin: "0 10px 8px", background: "#f1f5f9", borderRadius: 10, padding: "9px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "#64748b" }}>Completitud del perfil</span>
          <span style={{ fontSize: 10, fontWeight: 500, color: "#1a3a7c" }}>{profilePct}%</span>
        </div>
        <div style={{ background: "#e2e8f0", borderRadius: 99, height: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#1a3a7c", borderRadius: 99, width: `${profilePct}%`, transition: "width .5s" }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e2e8f0", padding: "11px 12px", display: "flex", alignItems: "center", gap: 9, position: "relative" }}>

        {/* Three-dot dropdown menu */}
        {showFootMenu && (
          <div
            ref={footMenuRef}
            style={{
              position: "absolute", bottom: "calc(100% + 6px)", right: 10,
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 11,
              boxShadow: "0 6px 20px rgba(15,37,84,.12)", minWidth: 160, overflow: "hidden", zIndex: 50,
            }}
          >
            <button
              onClick={() => { setShowFootMenu(false); navigate("/perfil"); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 13px", fontSize: 12, cursor: "pointer", color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "none", border: "none", borderBottom: "1px solid #e2e8f0", textAlign: "left" } as React.CSSProperties}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
              Ver mi perfil
            </button>
            <button
              onClick={() => { setShowFootMenu(false); navigate("/login"); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 13px", fontSize: 12, cursor: "pointer", color: "#991b1b", background: "none", border: "none", textAlign: "left" } as React.CSSProperties}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8eef8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#64748b" }}>person</span>
        </div>

        {/* Name + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#0F2554", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profileName}
          </p>
          <p style={{ fontSize: 10, color: "#94a3b8" }}>Estudiante 5to Sec.</p>
        </div>

        {/* Three-dot button */}
        <button
          onClick={() => setShowFootMenu(!showFootMenu)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", padding: "4px 5px", borderRadius: 7, lineHeight: 1, display: "flex", alignItems: "center" }}
          aria-label="Más opciones"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
        </button>
      </div>
    </aside>
  );
}
