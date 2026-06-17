import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import type { Oportunidad } from "../lib/types";
import {
  getBecasRecomendadas,
  getBecasFallback,
  type BecaRecomendada,
  type BecaRaw,
} from "../services/recomendaciones";

export default function BuscarOportunidades() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [isLoadingBecas, setIsLoadingBecas] = useState(false);
  // Controla caché: solo re-llama a la RPC cuando cambia user o se activa filtro
  const recomendacionesCargadas = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [selectedOportunidad, setSelectedOportunidad] =
    useState<Oportunidad | null>(null);

  // Estados para filtros avanzados y paginación
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>(
    [],
  );
  const [selectedFinancing, setSelectedFinancing] = useState<string>("todos");
  const [selectedGestiones, setSelectedGestiones] = useState<string[]>([]);
  const [selectedDestinos, setSelectedDestinos] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Mappers ---------------------------------------------------------------
  const mapRPCToOportunidad = (rows: BecaRecomendada[]): Oportunidad[] =>
    rows.map((row) => {
      let days = 30;
      if (row.fecha_cierre) {
        const diffTime = new Date(row.fecha_cierre).getTime() - Date.now();
        days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
      return {
        id: row.beca_id,
        title: row.titulo,
        sponsor: row.sponsor,
        coverage: row.cobertura || "",
        requirement: row.requisitos || "",
        deadline: days > 1 ? `Cierra en ${days} días` : `Cierra mañana`,
        level: row.nivel as Oportunidad["level"],
        affinity: row.afinidad_calculada,
        icon: row.icono || "school",
        sobre: row.sobre || "",
        beneficios: Array.isArray(row.beneficios) ? row.beneficios : [],
        // Criterios reales de la beca para el cruce de requisitos
        reqNotaMinima: row.req_nota_minima ?? null,
        reqSisfoh: row.req_sisfoh ?? null,
        reqMerito: row.req_merito ?? null,
        reqTipoColegio: row.req_tipo_colegio ?? null,
        requiereMujeres: row.requiere_mujeres ?? false,
        priorizaVoluntariado: row.prioriza_voluntariado ?? false,
        priorizaDeportista: row.prioriza_deportista ?? false,
      };
    });

  const mapFallbackToOportunidad = (rows: BecaRaw[]): Oportunidad[] =>
    rows.map((row) => {
      let days = 30;
      if (row.fecha_cierre) {
        const diffTime = new Date(row.fecha_cierre).getTime() - Date.now();
        days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
      return {
        id: row.id,
        title: row.titulo,
        sponsor: row.sponsor,
        coverage: row.cobertura || "",
        requirement: row.requisitos || "",
        deadline: days > 1 ? `Cierra en ${days} días` : `Cierra mañana`,
        level: row.nivel as Oportunidad["level"],
        affinity: row.afinidad ?? 50,
        icon: row.icono || "school",
        sobre: row.sobre || "",
        beneficios: Array.isArray(row.beneficios) ? row.beneficios : [],
      };
    });

  // Carga de becas con RPC (caché: solo re-llama si cambia el usuario) ------
  useEffect(() => {
    const isPlaceholder =
      !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    if (isPlaceholder) return;

    const userId = user?.id ?? null;
    const userChanged = userId !== lastUserId.current;

    // Evitar re-fetch si ya cargamos y el usuario no cambió
    if (recomendacionesCargadas.current && !userChanged) return;

    const fetchBecas = async () => {
      setIsLoadingBecas(true);
      try {
        if (userId) {
          const data = await getBecasRecomendadas(userId);
          setOportunidades(mapRPCToOportunidad(data));
        } else {
          const data = await getBecasFallback();
          setOportunidades(mapFallbackToOportunidad(data));
        }
        recomendacionesCargadas.current = true;
        lastUserId.current = userId;
      } catch (err) {
        console.error("[BuscarOportunidades] Error al cargar becas:", err);
        // Si la RPC falla, intenta el fallback simple
        try {
          const data = await getBecasFallback();
          setOportunidades(mapFallbackToOportunidad(data));
          recomendacionesCargadas.current = true;
          lastUserId.current = userId;
        } catch (fallbackErr) {
          console.error(
            "[BuscarOportunidades] Fallback también falló:",
            fallbackErr,
          );
        }
      } finally {
        setIsLoadingBecas(false);
      }
    };

    fetchBecas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [activeOportunidadesTab, setActiveOportunidadesTab] = useState<
    "explorar" | "guardadas" | "postuladas"
  >(() => {
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
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Applied beca IDs — loaded from Supabase postulaciones table
  const [appliedBecaIds, setAppliedBecaIds] = useState<string[]>([]);

  // Load saved becas from Supabase on mount
  useEffect(() => {
    const loadSavedBecas = async () => {
      if (
        !user ||
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
      )
        return;
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
      if (
        !user ||
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
      )
        return;
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

  // Determina si una beca es de patrocinador público o privado
  const isPublicSponsor = (sponsor: string) => {
    const lower = sponsor.toLowerCase();
    return (
      lower.includes("pronabec") ||
      lower.includes("embajada") ||
      lower.includes("uni") ||
      lower.includes("unmsm") ||
      lower.includes("unalm") ||
      lower.includes("municipalidad") ||
      lower.includes("bellas artes")
    );
  };

  // Determina el destino de la beca
  const getDestino = (o: Oportunidad) => {
    const text = (o.title + " " + o.sponsor + " " + o.sobre).toLowerCase();
    if (
      text.includes("extranjero") ||
      text.includes("ee.uu.") ||
      text.includes("embajada") ||
      text.includes("francia") ||
      text.includes("internacional")
    ) {
      return "Extranjero";
    }
    if (text.includes("provincia") || text.includes("regiones")) {
      return "Provincias";
    }
    return "Lima";
  };

  const handleLimpiarFiltros = () => {
    setSearchQuery("");
    setSelectedProgramTypes([]);
    setSelectedFinancing("todos");
    setSelectedGestiones([]);
    setSelectedDestinos([]);
    setCurrentPage(1);
  };

  // Resetear a la página 1 cuando cambia algún filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,

    selectedProgramTypes,
    selectedFinancing,
    selectedGestiones,
    selectedDestinos,
    activeOportunidadesTab,
  ]);

  // Toggle Save (Favorite) — syncs with Supabase becas_guardadas table
  const handleToggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isSaved = savedBecaIds.includes(id);
    const updated = isSaved
      ? savedBecaIds.filter((item) => item !== id)
      : [...savedBecaIds, id];

    setSavedBecaIds(updated);
    localStorage.setItem("pathfinder_saved_becas", JSON.stringify(updated));
    setToastMessage(
      isSaved
        ? "Beca eliminada de tus guardados."
        : "¡Beca guardada con éxito!",
    );
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    if (
      !user ||
      !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
    )
      return;
    try {
      if (isSaved) {
        await supabase
          .from("becas_guardadas")
          .delete()
          .eq("usuario_id", user.id)
          .eq("beca_id", id);
      } else {
        const { data: existing } = await supabase
          .from("becas_guardadas")
          .select("id")
          .eq("usuario_id", user.id)
          .eq("beca_id", id)
          .maybeSingle();
        if (!existing) {
          await supabase
            .from("becas_guardadas")
            .insert([{ usuario_id: user.id, beca_id: id }]);
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
    if (
      user &&
      import.meta.env.VITE_SUPABASE_URL &&
      !import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
    ) {
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

    setToastMessage(
      "¡Postulación enviada con éxito! Revisa tu pestaña 'Mis Postulaciones'.",
    );
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    closeAllDrawers();
  };

  // Genera las filas del cruce de requisitos usando datos reales del perfil
  const generateRequisitos = (oportunidad: Oportunidad) => {
    const rows: {
      campo: string;
      perfil: string;
      estado: "Cumple" | "NoCumple" | "Pendiente";
    }[] = [];
    const sinDatos = !profile;

    // --- Helpers de perfil ---
    const userGpa = profile
      ? parseFloat((profile.perfil_detalles?.notas?.gpa ?? "0").toString())
      : null;
    const userSisfoh = profile?.perfil_detalles?.sisfoh ?? null;
    const userColegio = profile?.perfil_detalles?.tipo_colegio ?? null;
    const userMerito = profile?.merito_academico ?? null;
    const userVoluntariado = profile?.hace_voluntariado ?? null;
    const userDeportista = profile?.es_deportista ?? null;
    const userGenero = profile?.genero ?? null;
    const userIngles = profile?.perfil_detalles?.idiomas?.nivelIngles ?? null;

    // Helpers de cumplimiento SISFOH (jerarquía: Pobreza Extrema ⊂ Pobre)
    const cumpleSisfoh = (
      req: string | null | undefined,
      user: string | null,
    ): boolean => {
      if (!req || req === "Cualquiera") return true;
      if (!user) return false;
      if (req === "Pobre")
        return user === "Pobre" || user === "Pobreza Extrema";
      return req === user;
    };

    // Helper de mérito (quinto ⊂ tercio ⊂ medio)
    const cumpleMerito = (
      req: string | null | undefined,
      user: string | null,
    ): boolean => {
      if (!req || req === "ninguno") return true;
      if (!user) return false;
      if (req === "tercio") return user === "quinto" || user === "tercio";
      if (req === "quinto") return user === "quinto";
      return false;
    };

    // Helper label de mérito
    const labelMerito = (m: string | null) => {
      if (m === "quinto") return "Quinto Superior";
      if (m === "tercio") return "Tercio Superior";
      if (m === "medio") return "Medio Superior";
      return "Sin datos";
    };

    // --- Fila 1: Nota mínima (siempre visible) ---
    const minNota = oportunidad.reqNotaMinima ?? 11.0;
    const gpaLabel =
      sinDatos || userGpa === null ? "Sin datos" : userGpa.toFixed(1);
    const cumpleNota = userGpa !== null && userGpa >= minNota;
    rows.push({
      campo: `Promedio mínimo ≥ ${minNota.toFixed(1)}`,
      perfil: gpaLabel,
      estado:
        sinDatos || userGpa === null
          ? "Pendiente"
          : cumpleNota
            ? "Cumple"
            : "NoCumple",
    });

    // --- Fila 2: Mérito (solo si la beca lo pide) ---
    const reqMerito = oportunidad.reqMerito;
    if (reqMerito && reqMerito !== "ninguno") {
      rows.push({
        campo: `Mérito: ${labelMerito(reqMerito)}`,
        perfil: sinDatos || !userMerito ? "Sin datos" : labelMerito(userMerito),
        estado:
          sinDatos || !userMerito
            ? "Pendiente"
            : cumpleMerito(reqMerito, userMerito)
              ? "Cumple"
              : "NoCumple",
      });
    }

    // --- Fila 3: SISFOH (solo si la beca lo pide) ---
    const reqSisfoh = oportunidad.reqSisfoh;
    if (reqSisfoh && reqSisfoh !== "Cualquiera") {
      rows.push({
        campo: `SISFOH: ${reqSisfoh}`,
        perfil: sinDatos || !userSisfoh ? "Sin datos" : userSisfoh,
        estado:
          sinDatos || !userSisfoh
            ? "Pendiente"
            : cumpleSisfoh(reqSisfoh, userSisfoh)
              ? "Cumple"
              : "NoCumple",
      });
    }

    // --- Fila 4: Tipo de colegio (solo si la beca lo pide) ---
    const reqColegio = oportunidad.reqTipoColegio;
    if (reqColegio && reqColegio !== "Cualquiera") {
      const cumpleColegio = userColegio === reqColegio;
      rows.push({
        campo: `Colegio de origen: ${reqColegio}`,
        perfil: sinDatos || !userColegio ? "Sin datos" : userColegio,
        estado:
          sinDatos || !userColegio
            ? "Pendiente"
            : cumpleColegio
              ? "Cumple"
              : "NoCumple",
      });
    }

    // --- Fila 5: Voluntariado (solo si la beca lo prioriza) ---
    if (oportunidad.priorizaVoluntariado) {
      rows.push({
        campo: "Experiencia en Voluntariado",
        perfil:
          sinDatos || userVoluntariado === null
            ? "Sin datos"
            : userVoluntariado
              ? "Sí"
              : "No",
        estado:
          sinDatos || userVoluntariado === null
            ? "Pendiente"
            : userVoluntariado
              ? "Cumple"
              : "NoCumple",
      });
    }

    // --- Fila 6: Deportista (solo si la beca lo prioriza) ---
    if (oportunidad.priorizaDeportista) {
      rows.push({
        campo: "Deportista de Alta Competencia",
        perfil:
          sinDatos || userDeportista === null
            ? "Sin datos"
            : userDeportista
              ? "Sí"
              : "No",
        estado:
          sinDatos || userDeportista === null
            ? "Pendiente"
            : userDeportista
              ? "Cumple"
              : "NoCumple",
      });
    }

    // --- Fila 7: Género (solo si la beca es exclusiva para mujeres) ---
    if (oportunidad.requiereMujeres) {
      rows.push({
        campo: "Beca exclusiva para mujeres",
        perfil: sinDatos || !userGenero ? "Sin datos" : userGenero,
        estado:
          sinDatos || !userGenero
            ? "Pendiente"
            : userGenero === "Femenino"
              ? "Cumple"
              : "NoCumple",
      });
    }

    // --- Fila 8: Nivel de inglés (solo para becas de Idioma) ---
    if (oportunidad.level === "Idioma") {
      rows.push({
        campo: "Nivel de Inglés requerido",
        perfil: sinDatos || !userIngles ? "Sin datos" : userIngles,
        estado:
          sinDatos || !userIngles
            ? "Pendiente"
            : userIngles === "B2" || userIngles === "C1" || userIngles === "C2"
              ? "Cumple"
              : "NoCumple",
      });
    }

    // Si no hay ninguna fila de criterio específico, mostrar mínimo la nota
    if (rows.length === 0) {
      rows.push({
        campo: "Promedio mínimo ≥ 11.0",
        perfil: gpaLabel,
        estado: "Pendiente",
      });
    }

    return rows;
  };

  // Delete a postulation from Supabase and update local state
  const handleDeletePostulation = async (becaId: string) => {
    setAppliedBecaIds((prev) => prev.filter((id) => id !== becaId));
    setShowDeleteModal(false);
    setPendingDeleteId(null);

    if (
      !user ||
      !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
    )
      return;
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

  // Helper: clase de color del badge de afinidad según score real
  const getAffinityBadgeClass = (score: number): string => {
    if (score >= 85) return "badge b-green";
    if (score >= 60) return "badge b-blue";
    return "badge b-slate";
  };

  // Helper: etiqueta textual de afinidad
  const getAffinityLabel = (score: number): string => {
    if (score >= 85) return `${score}% Alta Afinidad`;
    if (score >= 60) return `${score}% Afinidad`;
    return `${score}% Baja Afinidad`;
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

    // 1. Tipo de Programa
    const matchesProgram =
      selectedProgramTypes.length === 0 ||
      selectedProgramTypes.some((type) => {
        if (type === "Universitarias") return oportunidad.level === "Pregrado";
        if (type === "Técnicas") return oportunidad.level === "Técnico";
        if (type === "Postgrado") return oportunidad.level === "Maestría";
        if (type === "Idiomas") return oportunidad.level === "Idioma";
        return false;
      });

    // 2. Financiamiento
    const matchesFinancing =
      selectedFinancing === "todos" ||
      (selectedFinancing === "integral"
        ? (oportunidad.coverage || "").includes("100%")
        : !(oportunidad.coverage || "").includes("100%"));

    // 3. Gestión
    const matchesGestion =
      selectedGestiones.length === 0 ||
      selectedGestiones.some((g) => {
        const isPub = isPublicSponsor(oportunidad.sponsor);
        if (g === "Pública") return isPub;
        if (g === "Privada") return !isPub;
        return false;
      });

    // 4. Destino
    const matchesDestino =
      selectedDestinos.length === 0 ||
      selectedDestinos.includes(getDestino(oportunidad));

    return (
      matchesSearch &&
      matchesProgram &&
      matchesFinancing &&
      matchesGestion &&
      matchesDestino
    );
  });

  // Paginación lógica
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredOportunidades.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedOportunidades = filteredOportunidades.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Scroll suave hacia arriba al cambiar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* TopNavBar */}
      <header className="sticky top-0 right-0 w-full z-40 bg-white border-b border-[#e2e8f0] h-14 flex justify-between items-center px-6">
        <div className="flex items-center justify-between w-full gap-4">
          {/* 1. Buscador (flex-1 hace que ocupe todo el espacio sobrante hasta max-w-3xl) */}
          <div className="relative w-full md:flex-1 max-w-3xl flex items-center">
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

          {/* 2. Grupo de Acciones (shrink-0 evita que se aplasten) */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Botón de Filtros */}
            <button
              onClick={() => setIsFiltersDrawerOpen(true)}
              className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body Content */}
      <div className="p-md md:p-margin-desktop max-w-7xl mx-auto space-y-lg w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-sm border-b border-[#e2e8f0] pb-3">
          <div>
            <h2 className="t-lg bold leading-none">
              {activeOportunidadesTab === "explorar" &&
                "Oportunidades Disponibles"}
              {activeOportunidadesTab === "guardadas" && "Mis Becas Guardadas"}
              {activeOportunidadesTab === "postuladas" && "Mis Postulaciones"}
            </h2>
            <p className="t-sm mt-1.5">
              {activeOportunidadesTab === "explorar" &&
                `${filteredOportunidades.length} de ${oportunidades.length} resultados`}
              {activeOportunidadesTab === "guardadas" &&
                `${savedBecaIds.length} beca${savedBecaIds.length !== 1 ? "s" : ""} guardada${savedBecaIds.length !== 1 ? "s" : ""} — listas para postular`}
              {activeOportunidadesTab === "postuladas" &&
                `${appliedBecaIds.length} beca${appliedBecaIds.length !== 1 ? "s" : ""} con postulación activa`}
            </p>
          </div>

          <div className="flex gap-sm self-start shrink-0">
            {/* 3-tab switcher */}
            <div className="tabs">
              <button
                onClick={() => setActiveOportunidadesTab("explorar")}
                className={`tab ${activeOportunidadesTab === "explorar" ? "on" : ""}`}
              >
                <span className="material-symbols-outlined text-[12px] mr-1">
                  travel_explore
                </span>
                Explorar
              </button>
              <button
                onClick={() => setActiveOportunidadesTab("guardadas")}
                className={`tab ${activeOportunidadesTab === "guardadas" ? "on" : ""}`}
              >
                <span className="material-symbols-outlined text-[12px] mr-1">
                  favorite
                </span>
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
                <span className="material-symbols-outlined text-[12px] mr-1">
                  task_alt
                </span>
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
        {/* Skeleton de carga — 6 tarjetas animadas */}
        {isLoadingBecas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card flex flex-col gap-3"
                style={{ borderRadius: "var(--r-md)", minHeight: 200 }}
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-[12px] bg-[#e2e8f0] animate-pulse" />
                  <div className="w-6 h-6 rounded-full bg-[#e2e8f0] animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-[#e2e8f0] animate-pulse" />
                  <div className="h-5 w-4/5 rounded bg-[#e2e8f0] animate-pulse" />
                  <div className="h-4 w-2/5 rounded bg-[#e2e8f0] animate-pulse" />
                </div>
                <div className="space-y-2 mt-2">
                  <div className="h-3 w-full rounded bg-[#e2e8f0] animate-pulse" />
                  <div className="h-3 w-full rounded bg-[#e2e8f0] animate-pulse" />
                  <div className="h-3 w-3/5 rounded bg-[#e2e8f0] animate-pulse" />
                </div>
                <div className="mt-auto pt-2 border-t border-[#e2e8f0]">
                  <div className="h-4 w-28 rounded bg-[#e2e8f0] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOportunidades.length === 0 ? (
          <div className="card text-center max-w-md mx-auto my-8 w-full">
            {activeOportunidadesTab === "guardadas" ? (
              <>
                <span className="material-symbols-outlined text-slate text-5xl mb-3">
                  favorite_border
                </span>
                <h3 className="t-md bold mb-1">
                  No tienes becas guardadas aún
                </h3>
                <p className="t-xs mb-4">
                  Explora las oportunidades y haz clic en ❤️ para guardar las
                  que te interesen. Luego podrás postular con un solo clic.
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
                <span className="material-symbols-outlined text-slate text-5xl mb-3">
                  task_alt
                </span>
                <h3 className="t-md bold mb-1">
                  Aún no has postulado a ninguna beca
                </h3>
                <p className="t-xs mb-4">
                  Guarda primero una beca y desde la pestaña "Guardadas" podrás
                  postular. Tu progreso aparecerá en Mis Postulaciones.
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
                <span className="material-symbols-outlined text-slate text-5xl mb-3">
                  search_off
                </span>
                <h3 className="t-md bold mb-1">Sin resultados</h3>
                <p className="t-xs mb-4">
                  Intenta con otros términos de búsqueda.
                </p>
              </>
            )}
          </div>
        ) : isLoadingBecas ? null : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {paginatedOportunidades.map((oportunidad) => {
                const affinityClass = getAffinityBadgeClass(
                  oportunidad.affinity,
                );
                const affinityLabel = getAffinityLabel(oportunidad.affinity);

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
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDeleteId(oportunidad.id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <span
                              className="material-symbols-outlined text-red"
                              style={{ color: "var(--red)" }}
                            >
                              delete
                            </span>
                          </button>
                        ) : (
                          <button
                            className="btn-ico"
                            onClick={(e) => handleToggleSave(oportunidad.id, e)}
                            title={
                              isSaved ? "Quitar de guardadas" : "Guardar beca"
                            }
                          >
                            <span
                              className="material-symbols-outlined"
                              style={isSaved ? { color: "var(--red)" } : {}}
                            >
                              favorite
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-xs mb-1 flex-wrap">
                          <span
                            className={`${affinityClass}`}
                            title={`Afinidad calculada: Académico 40% + Socioeconómico 30% + Extracurricular 20% + Perfil 10%`}
                          >
                            {affinityLabel}
                          </span>
                          <span className="badge b-slate">
                            {oportunidad.level}
                          </span>
                          {isApplied && (
                            <span className="badge b-blue">Postulado</span>
                          )}
                        </div>
                        <h3 className="t-base bold group-hover:text-[#1a3a7c] transition-colors leading-snug">
                          {oportunidad.title}
                        </h3>
                        <p className="t-xs">{oportunidad.sponsor}</p>
                      </div>

                      <div className="space-y-sm text-body-sm mb-3">
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-sm text-slate-2 shrink-0">
                            payments
                          </span>
                          <span className="t-xs trunc">
                            {oportunidad.coverage}
                          </span>
                        </div>
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-sm text-slate-2 shrink-0">
                            grade
                          </span>
                          <span className="t-xs trunc">
                            {oportunidad.requirement}
                          </span>
                        </div>
                        <div className="flex items-center gap-sm">
                          <span
                            className={`material-symbols-outlined text-sm shrink-0 ${
                              oportunidad.id === "BEC-03"
                                ? "text-red"
                                : "text-slate-2"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/postulaciones", {
                              state: { becaId: oportunidad.id },
                            });
                          }}
                          className="text-[#166534] t-xs bold flex items-center gap-1 cursor-pointer hover:underline border-none bg-transparent"
                        >
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            task_alt
                          </span>
                          Ver mi progreso
                        </button>
                      ) : (
                        <button className="text-navy-2 t-xs bold flex items-center gap-1 cursor-pointer hover:underline border-none bg-transparent">
                          Ver Detalles{" "}
                          <span className="material-symbols-outlined text-sm">
                            arrow_forward
                          </span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Paginador (Controles) */}
            {totalPages > 1 && (
              <div className="pg">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={activePage === 1}
                  className="pb"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`pn ${activePage === pNum ? "on" : ""}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={activePage === totalPages}
                  className="pb"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Common Overlay Backdrop */}
      {(isFiltersDrawerOpen || selectedOportunidad) && (
        <div
          onClick={() => setSelectedOportunidad(null)}
          className="fixed inset-0 bg-black/50 z-[59] transition-opacity duration-300 opacity-100 cursor-pointer"
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
          <button
            onClick={handleLimpiarFiltros}
            className="t-link bg-transparent border-none font-medium hover:underline cursor-pointer"
          >
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
              <span className="t-base bold text-[#0F2554]">
                Tipo de Programa
              </span>
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
                {["Universitarias", "Técnicas", "Postgrado", "Idiomas"].map(
                  (p, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        checked={selectedProgramTypes.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProgramTypes([
                              ...selectedProgramTypes,
                              p,
                            ]);
                          } else {
                            setSelectedProgramTypes(
                              selectedProgramTypes.filter((type) => type !== p),
                            );
                          }
                        }}
                        className="rounded border-[#e2e8f0] text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                        type="checkbox"
                      />
                      <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                        {p}
                      </span>
                    </label>
                  ),
                )}
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
                  <input
                    checked={selectedFinancing === "todos"}
                    onChange={() => setSelectedFinancing("todos")}
                    className="text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                    name="fin"
                    type="radio"
                  />
                  <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                    Todos
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    checked={selectedFinancing === "integral"}
                    onChange={() => setSelectedFinancing("integral")}
                    className="text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                    name="fin"
                    type="radio"
                  />
                  <span className="t-sm text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                    Beca Integral (100%)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    checked={selectedFinancing === "parcial"}
                    onChange={() => setSelectedFinancing("parcial")}
                    className="text-[#1a3a7c] focus:ring-[#1a3a7c] h-3.5 w-3.5"
                    name="fin"
                    type="radio"
                  />
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
                  <label
                    key={i}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      checked={selectedGestiones.includes(g)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGestiones([...selectedGestiones, g]);
                        } else {
                          setSelectedGestiones(
                            selectedGestiones.filter((type) => type !== g),
                          );
                        }
                      }}
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
                  <label
                    key={i}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      checked={selectedDestinos.includes(d)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDestinos([...selectedDestinos, d]);
                        } else {
                          setSelectedDestinos(
                            selectedDestinos.filter((type) => type !== d),
                          );
                        }
                      }}
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

      {/* Details Drawer — bottom-sheet on mobile, side drawer on desktop */}
      <div
        className={`fixed z-[60] bg-white shadow-2xl flex flex-col
          bottom-0 left-0 right-0 h-[88vh] rounded-t-2xl
          lg:bottom-auto lg:top-0 lg:right-0 lg:left-auto lg:w-full lg:max-w-2xl lg:h-screen lg:rounded-none lg:border-l lg:border-[#e2e8f0]
          transition-transform duration-500 ease-out ${
          selectedOportunidad
            ? "translate-y-0 lg:translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full"
        }`}
      >
        {selectedOportunidad && (
          <>
            {/* Grab handle for mobile */}
            <div className="lg:hidden mx-auto mt-3 mb-2 w-10 h-1 bg-gray-300 rounded-full" />
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
                    {selectedOportunidad.affinity >= 90
                      ? "Excelencia"
                      : "Aptitud"}
                  </span>
                </div>
                <h2 className="t-lg bold text-[#0F2554] leading-tight">
                  {selectedOportunidad.title}
                </h2>
                <div className="flex items-center gap-1.5 text-[#166534] t-sm bold">
                  <span className="material-symbols-outlined text-sm font-fill">
                    verified
                  </span>
                  <span>
                    {selectedOportunidad.affinity}% de afinidad con tu perfil
                  </span>
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
                      <span className="t-sm text-[#0F2554] leading-snug">
                        {ben}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cross Match Requirements Section */}
              <section className="space-y-2 border-t border-[#e2e8f0] pt-4 pb-4">
                <h3 className="t-md bold border-l-4 border-[#1a3a7c] pl-2 text-[#0F2554]">
                  Cruce de Requisitos
                </h3>

                {/* Banner si el perfil no está completo */}
                {!profile && (
                  <div className="flex items-center gap-2 bg-[#fef3c7] border border-[#d97706]/30 rounded-[8px] px-3 py-2 mb-2">
                    <span className="material-symbols-outlined text-[#d97706] text-sm">
                      info
                    </span>
                    <p className="t-xs text-[#92400e]">
                      <span className="font-semibold">Completa tu perfil</span>{" "}
                      para ver el cruce real de requisitos con tus datos.
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-[12px] overflow-hidden border border-[#e2e8f0] p-3">
                  <div className="overflow-x-auto -mx-3 px-3">
                  <table className="tbl" style={{ minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>Requisito Beca</th>
                        <th style={{ width: "35%" }}>Tu Perfil</th>
                        <th style={{ width: "20%" }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateRequisitos(selectedOportunidad).map(
                        (req, idx) => (
                          <tr key={idx}>
                            <td className="t-base text-[#0F2554]">
                              {req.campo}
                            </td>
                            <td className="t-base bold text-[#0F2554] font-semibold">
                              {req.perfil}
                            </td>
                            <td>
                              {req.estado === "Cumple" ? (
                                <span className="s-ok bold">
                                  <span className="material-symbols-outlined text-xs">
                                    check_circle
                                  </span>{" "}
                                  Cumple
                                </span>
                              ) : req.estado === "NoCumple" ? (
                                <span
                                  className="bold"
                                  style={{
                                    color: "#991b1b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    fontSize: "11px",
                                  }}
                                >
                                  <span
                                    className="material-symbols-outlined text-xs"
                                    style={{
                                      fontVariationSettings: "'FILL' 1",
                                    }}
                                  >
                                    cancel
                                  </span>{" "}
                                  No cumple
                                </span>
                              ) : (
                                <span className="s-warn bold">
                                  <span className="material-symbols-outlined text-xs">
                                    pending
                                  </span>{" "}
                                  Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                  </div>
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
                <span className="material-symbols-outlined text-sm">
                  favorite
                </span>{" "}
                {savedBecaIds.includes(selectedOportunidad.id)
                  ? "Guardado ✓"
                  : "Guardar"}
              </button>
              {appliedBecaIds.includes(selectedOportunidad.id) ? (
                <button
                  onClick={() => {
                    navigate("/postulaciones", {
                      state: { becaId: selectedOportunidad.id },
                    });
                    closeAllDrawers();
                  }}
                  className="flex-[2] bg-[#e8eef8] text-[#1a3a7c] border border-[#1a3a7c]/30 py-2 rounded-[8px] flex items-center justify-center gap-1 cursor-pointer font-bold hover:bg-[#e2e8f0] transition-all hover:scale-[1.01] active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm font-fill">
                    task_alt
                  </span>
                  Ver mi progreso
                </button>
              ) : (
                <button
                  onClick={() => handleApply(selectedOportunidad.id)}
                  className="flex-[2] bg-[#0F2554] text-white py-2 rounded-[8px] shadow-sm hover:bg-[#1a3a7c] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1 ml-auto cursor-pointer bold border-none"
                >
                  Postular ahora{" "}
                  <span className="material-symbols-outlined text-sm">
                    bolt
                  </span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Light Delete Confirmation Modal */}
      {showDeleteModal && pendingDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0F2554]/40 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setPendingDeleteId(null);
            }}
          />
          {/* Modal */}
          <div className="relative card max-w-sm w-full shadow-2xl border border-[#e2e8f0] p-6 animate-in slide-in-from-bottom-4 duration-300">
            {/* Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[8px] bg-[#fee2e2] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#991b1b] text-2xl">
                  delete_forever
                </span>
              </div>
              <div>
                <h3 className="t-base bold text-navy">
                  ¿Cancelar postulación?
                </h3>
                <p className="t-xs mt-0.5" style={{ color: "var(--slate)" }}>
                  {oportunidades.find((o) => o.id === pendingDeleteId)?.title ||
                    "Esta beca"}
                </p>
              </div>
            </div>
            <p
              className="t-sm mb-6 leading-relaxed"
              style={{ color: "var(--slate)" }}
            >
              Se eliminará tu postulación y todo el progreso guardado. Esta
              acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPendingDeleteId(null);
                }}
                className="flex-1 py-2 rounded-[8px] border border-[#e2e8f0] bg-white t-xs bold hover:bg-[#f1f5f9] transition-all cursor-pointer"
                style={{ color: "var(--slate)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePostulation(pendingDeleteId)}
                className="flex-[1.5] py-2 rounded-[8px] bg-[#991b1b] hover:bg-[#7f1d1d] transition-all active:scale-95 shadow-lg shadow-red-600/20 cursor-pointer flex items-center justify-center gap-1.5 border-none"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ color: "#ffffff" }}
                >
                  delete
                </span>
                <span
                  className="bold"
                  style={{
                    fontSize: "10px",
                    color: "#ffffff",
                    fontWeight: "bold",
                  }}
                >
                  Sí, eliminar
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-[#0F2554] text-white p-4 rounded-[12px] shadow-2xl flex items-center gap-3 border border-white/10 animate-pulse">
          <span className="material-symbols-outlined text-[20px]">
            verified
          </span>
          <div>
            <p className="t-sm bold text-white">Notificación de Pathfinder</p>
            <p className="t-xs text-white/95">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
