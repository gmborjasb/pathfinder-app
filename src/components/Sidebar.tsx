import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const getProfilePct = (currentProfile: any) => {
  if (currentProfile) {
    const pd = currentProfile.perfil_detalles;
    if (pd && typeof pd.nivelPerfil === "number") {
      return Math.min(pd.nivelPerfil, 100);
    }
  }
  const stored = localStorage.getItem("pathfinder_profile");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.nivelPerfil === "number") return Math.min(parsed.nivelPerfil, 100);
      if (parsed?.perfil_detalles && typeof parsed.perfil_detalles.nivelPerfil === "number")
        return Math.min(parsed.perfil_detalles.nivelPerfil, 100);
    } catch (e) {
      console.error(e);
    }
  }
  const p = currentProfile || {};
  const pd = currentProfile?.perfil_detalles || {};
  const items = [
    !!(p.nombres || "").trim(), !!(p.dni || "").trim(), !!(p.correo || "").trim(),
    !!p.fecha_nacimiento, p.genero !== "Prefiero no decir", !!(pd.institucionActual || "").trim(),
    !!pd.colegio?.ano_egreso, Number(pd.notas?.año3) > 0, Number(pd.notas?.año4) > 0,
    Number(pd.notas?.año5) > 0, !!p.merito_academico, !!p.area_interes,
    pd.sisfoh !== "No Pobre", Object.values(pd.condiciones || {}).some(Boolean) || p.tiene_conadis || p.hijo_docente,
    pd.idiomas?.nivelIngles !== "Ninguno",
    p.hace_voluntariado || p.es_deportista || pd.tiene_liderazgo || pd.tiene_emprendimiento,
    p.acepta_privacidad,
  ];
  return Math.round((items.filter(Boolean).length / items.length) * 100);
};

type NavItem = {
  to: string;
  icon: string;
  label: string;
  badge?: React.ReactNode;
};

export function Sidebar() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [profileName, setProfileName] = useState("Estudiante");
  const [postulacionesCount, setPostulacionesCount] = useState<number | null>(null);
  const [docsRechazados, setDocsRechazados] = useState(0);
  const [showFootMenu, setShowFootMenu] = useState(false);
  const [profilePct, setProfilePct] = useState(0);
  const footMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProfile = () => {
      if (profile?.nombres) { setProfileName(profile.nombres.split(" ")[0]); return; }
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
    return () => { window.removeEventListener("storage", loadProfile); window.removeEventListener("profileUpdated", loadProfile); };
  }, [profile]);

  useEffect(() => {
    const load = async () => {
      const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
      if (!user || isMock) return;
      try {
        const { data: becasData } = await supabase.from("becas").select("id");
        const validIds = (becasData || []).map((b: any) => b.id);
        const { count } = await supabase.from("postulaciones").select("id", { count: "exact", head: true })
          .eq("usuario_id", user.id).in("beca_id", validIds.length > 0 ? validIds : [""]);
        setPostulacionesCount(count ?? 0);
        const becaId = localStorage.getItem("pathfinder_active_meta");
        if (becaId) {
          const { data: post } = await supabase.from("postulaciones").select("id")
            .eq("usuario_id", user.id).eq("beca_id", becaId).maybeSingle();
          if (post) {
            const { data: docs } = await supabase.from("documentos").select("estado")
              .eq("postulacion_id", post.id).eq("estado", "Rechazado");
            setDocsRechazados(docs?.length ?? 0);
          }
        }
      } catch (err) { console.error("Error loading sidebar data:", err); }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!showFootMenu) return;
    const handler = (e: MouseEvent) => {
      if (footMenuRef.current && !footMenuRef.current.contains(e.target as Node)) setShowFootMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFootMenu]);

  useEffect(() => {
    const updateCompleteness = () => setProfilePct(getProfilePct(profile));
    updateCompleteness();
    window.addEventListener("storage", updateCompleteness);
    window.addEventListener("profileUpdated", updateCompleteness);
    return () => { window.removeEventListener("storage", updateCompleteness); window.removeEventListener("profileUpdated", updateCompleteness); };
  }, [profile]);

  const navItems: NavItem[] = [
    { to: "/dashboard", icon: "home", label: "Inicio / Mi panel" },
    {
      to: "/perfil", icon: "person", label: "Perfil del postulante",
      badge: (
        <span className="flex size-[18px] items-center justify-center rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
          <span className="material-symbols-outlined" style={{ fontSize: 10 }}>warning</span>
        </span>
      ),
    },
    {
      to: "/postulaciones", icon: "assignment", label: "Mis postulaciones",
      badge: postulacionesCount !== null && postulacionesCount > 0 ? (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--brand-bg)] px-1.5 text-[9px] font-semibold text-[var(--brand)] flex-shrink-0">
          {postulacionesCount}
        </span>
      ) : null,
    },
  ];

  const exploreItems: NavItem[] = [
    { to: "/buscar", icon: "search", label: "Buscar oportunidades" },
    {
      to: "/documentos", icon: "backpack", label: "Mochila de documentos",
      badge: docsRechazados > 0 ? (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-100 px-1.5 text-[9px] font-semibold text-red-700 flex-shrink-0">
          {docsRechazados}
        </span>
      ) : null,
    },
    { to: "/asesor", icon: "smart_toy", label: "Asesor IA" },
  ];

  const NavItem = ({ item }: { item: NavItem }) => (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors duration-150 ${
          isActive
            ? "bg-[var(--brand-bg)] text-[var(--brand)]"
            : "text-[var(--slate)] hover:bg-slate-100 hover:text-[var(--navy)]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[var(--brand)]" />
          )}
          <span
            className="material-symbols-outlined flex-shrink-0 text-center"
            style={{
              fontSize: 16,
              width: 20,
              fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {item.icon}
          </span>
          <span className="flex-1 text-[12px] font-[var(--fw-medium)] leading-tight truncate" style={{ fontWeight: isActive ? 500 : 400 }}>
            {item.label}
          </span>
          {item.badge}
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-white border-r border-[var(--border)] overflow-hidden">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[var(--border)]">
        <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand)] text-white text-base font-semibold shadow-sm">
          P
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--navy)] leading-tight">Pathfinder</p>
          <p className="text-[9px] uppercase tracking-[.07em] text-[var(--slate-2)] mt-0.5">Portal postulante</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-2">
        <p className="px-2.5 pb-1 pt-2.5 text-[9px] font-semibold uppercase tracking-[.07em] text-[var(--slate-2)]">
          Principal
        </p>
        {navItems.map((item) => <NavItem key={item.to} item={item} />)}

        <hr className="my-1.5 border-[var(--border)]" />

        <p className="px-2.5 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[.07em] text-[var(--slate-2)]">
          Explorar
        </p>
        {exploreItems.map((item) => <NavItem key={item.to} item={item} />)}
      </nav>

      {/* Profile completeness */}
      <div className="mx-2.5 mb-2 rounded-xl bg-[var(--brand-bg)] border border-[var(--brand-br)] px-3 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[var(--slate)]">Completitud del perfil</span>
          <span className="text-[10px] font-semibold text-[var(--brand)]">{profilePct}%</span>
        </div>
        <div className="h-[4px] w-full overflow-hidden rounded-full bg-[var(--brand-br)]">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
            style={{ width: `${profilePct}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-2.5 border-t border-[var(--border)] px-3 py-3">
        {/* Dropdown */}
        {showFootMenu && (
          <div
            ref={footMenuRef}
            className="absolute bottom-[calc(100%+6px)] right-2.5 z-50 min-w-[160px] overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-lg"
          >
            <button
              onClick={() => { setShowFootMenu(false); navigate("/perfil"); }}
              className="flex w-full items-center gap-2 border-b border-[var(--border)] px-3 py-2.5 text-[12px] text-[var(--slate)] transition-colors hover:bg-slate-50 cursor-pointer bg-transparent"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
              Ver mi perfil
            </button>
            <button
              onClick={() => { setShowFootMenu(false); navigate("/login"); }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] text-red-700 transition-colors hover:bg-red-50 cursor-pointer bg-transparent border-none"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Avatar */}
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-bg)]">
          <span className="material-symbols-outlined text-[var(--slate-2)]" style={{ fontSize: 16 }}>person</span>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-[12px] font-semibold text-[var(--navy)]">{profileName}</p>
          <p className="text-[10px] text-[var(--slate-2)]">Estudiante 5to Sec.</p>
        </div>

        {/* Three-dot */}
        <button
          onClick={() => setShowFootMenu(!showFootMenu)}
          aria-label="Más opciones"
          className="flex items-center justify-center rounded-lg p-1 text-[var(--slate-2)] transition-colors hover:bg-slate-100 hover:text-[var(--slate)] cursor-pointer bg-transparent border-none"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
        </button>
      </div>
    </aside>
  );
}
