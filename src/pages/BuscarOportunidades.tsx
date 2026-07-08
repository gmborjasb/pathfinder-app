import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import type { Oportunidad } from "../lib/types";
import {
  getBecasRecomendadas,
  getBecasFallback,
  type BecaRecomendada,
  type BecaRaw,
} from "../services/recomendaciones";
import { ScholarshipCard } from "../components/catalogo/ScholarshipCard";
import { FilterDrawer } from "../components/catalogo/FilterDrawer";
import { DetailDrawer } from "../components/catalogo/DetailDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function BuscarOportunidades() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [isLoadingBecas, setIsLoadingBecas] = useState(false);
  // Controla caché: solo re-llama a la RPC cuando cambia user o se activa filtro
  const recomendacionesCargadas = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [selectedOportunidad, setSelectedOportunidad] =
    useState<Oportunidad | null>(null);
  // Retiene la última oportunidad seleccionada mientras el DetailDrawer se
  // desliza hacia afuera, para que el contenido no desaparezca a mitad de la
  // animación de cierre. Se ajusta durante el render (no en un efecto) según
  // el patrón recomendado por React para derivar estado a partir de props/estado
  // que cambian: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevSelectedOportunidad, setPrevSelectedOportunidad] =
    useState<Oportunidad | null>(null);
  const [displayedOportunidad, setDisplayedOportunidad] =
    useState<Oportunidad | null>(null);
  if (selectedOportunidad !== prevSelectedOportunidad) {
    setPrevSelectedOportunidad(selectedOportunidad);
    if (selectedOportunidad) setDisplayedOportunidad(selectedOportunidad);
  }

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
      let fechaCierreStr = "Fecha no disponible";
      if (row.fecha_cierre) {
        const diffTime = new Date(row.fecha_cierre).getTime() - Date.now();
        days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const dateObj = new Date(row.fecha_cierre);
        fechaCierreStr = dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
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
        url_oficial: row.url_oficial ?? undefined,
        fechaCierreStr: fechaCierreStr,
      };
    });

  const mapFallbackToOportunidad = (rows: BecaRaw[]): Oportunidad[] =>
    rows.map((row) => {
      let days = 30;
      let fechaCierreStr = "Fecha no disponible";
      if (row.fecha_cierre) {
        const diffTime = new Date(row.fecha_cierre).getTime() - Date.now();
        days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const dateObj = new Date(row.fecha_cierre);
        fechaCierreStr = dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
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
        url_oficial: row.url_oficial ?? undefined,
        fechaCierreStr: fechaCierreStr,
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

  // Open specific beca from navigation state (e.g., dashboard recommendation)
  useEffect(() => {
    const becaId = location.state?.openBecaId as string | undefined;
    if (becaId && oportunidades.length > 0) {
      const match = oportunidades.find((o) => o.id === becaId);
      if (match) {
        setSelectedOportunidad(match);
        // Clean state so it doesn't re-open on re-render
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state?.openBecaId, oportunidades]);

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

  const closeAllDrawers = () => {
    setIsFiltersDrawerOpen(false);
    setSelectedOportunidad(null);
  };

  // ── Auto-select beca from Dashboard recommendation ─────────────────────
  useEffect(() => {
    const becaId = (location.state as { becaId?: string } | null)?.becaId;
    if (!becaId || oportunidades.length === 0 || selectedOportunidad) return;
    const match = oportunidades.find((o) => o.id === becaId);
    if (match) {
      setSelectedOportunidad(match);
      // Clean up location state so refreshing doesn't re-select
      window.history.replaceState({}, document.title);
    }
  }, [oportunidades, location.state, selectedOportunidad]);

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
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
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

  const activeFiltersCount = selectedProgramTypes.length + (selectedFinancing !== "todos" ? 1 : 0) + selectedGestiones.length + selectedDestinos.length;

  return (
    <div className="flex flex-col flex-1 bg-bg-base">
      {/* Body Content */}
      <div className="px-6 md:px-16 pb-8 w-full mx-auto flex flex-col gap-6">
        
        {/* Título */}
        <h1 className="text-[32px] font-black text-brand-blue leading-none">
          Explorar Becas
        </h1>

        {/* Buscador y Pestañas Wrapper */}
        <div className="flex flex-col gap-6">
          
          {/* Fila de Búsqueda y Filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <div className="relative w-full md:w-[400px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-black z-10">
                search
              </span>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 h-14 bg-white"
                placeholder="Buscar becas o programas..."
                type="text"
              />
            </div>
            
            <Button
              onClick={() => setIsFiltersDrawerOpen(true)}
              variant="neutral"
              className="w-full md:w-auto h-14"
            >
              <span className="material-symbols-outlined text-[18px]">list</span>
              <span className="text-[14px] font-black">Filtros Avanzados</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-main text-main-foreground">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Fila de Pestañas */}
          <div className="grid grid-cols-3 w-full border-b-3 border-border">
            <button
              onClick={() => setActiveOportunidadesTab("explorar")}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 pb-2 pt-2 border-b-3 transition-colors ${
                activeOportunidadesTab === "explorar"
                  ? "border-border"
                  : "border-transparent"
              }`}
            >
              <span className={`text-[12px] sm:text-[15px] font-black whitespace-nowrap ${
                activeOportunidadesTab === "explorar" ? "text-text-primary" : "text-text-tertiary"
              }`}>
                Explorar
              </span>
              <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[12px] font-black border-2 whitespace-nowrap ${
                activeOportunidadesTab === "explorar" ? "bg-brand-yellow text-text-primary border-border" : "bg-muted text-muted-foreground"
              }`}>
                {oportunidades.length}
              </span>
            </button>
            <button
              onClick={() => setActiveOportunidadesTab("guardadas")}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 pb-2 pt-2 border-b-3 transition-colors ${
                activeOportunidadesTab === "guardadas"
                  ? "border-border"
                  : "border-transparent"
              }`}
            >
              <span className={`text-[12px] sm:text-[15px] font-black whitespace-nowrap ${
                activeOportunidadesTab === "guardadas" ? "text-text-primary" : "text-text-tertiary"
              }`}>
                Guardadas
              </span>
              <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[12px] font-black border-2 whitespace-nowrap ${
                activeOportunidadesTab === "guardadas" ? "bg-brand-yellow text-text-primary border-border" : "bg-muted text-muted-foreground"
              }`}>
                {savedBecaIds.length}
              </span>
            </button>
            <button
              onClick={() => setActiveOportunidadesTab("postuladas")}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 pb-2 pt-2 border-b-3 transition-colors ${
                activeOportunidadesTab === "postuladas"
                  ? "border-border"
                  : "border-transparent"
              }`}
            >
              <span className={`text-[12px] sm:text-[15px] font-black whitespace-nowrap ${
                activeOportunidadesTab === "postuladas" ? "text-text-primary" : "text-text-tertiary"
              }`}>
                Postuladas
              </span>
              <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[12px] font-black border-2 whitespace-nowrap ${
                activeOportunidadesTab === "postuladas" ? "bg-brand-yellow text-text-primary border-border" : "bg-muted text-muted-foreground"
              }`}>
                {appliedBecaIds.length}
              </span>
            </button>
          </div>
        </div>

        {/* Results Grid - Scrollable and highly responsive */}
        {/* Skeleton de carga — 6 tarjetas animadas */}
        {isLoadingBecas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white p-5 min-h-[200px]"
              >
                <CardContent className="flex flex-col gap-3 p-0">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-none bg-secondary-background animate-pulse" />
                    <div className="w-6 h-6 rounded-full bg-secondary-background animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-secondary-background animate-pulse" />
                    <div className="h-5 w-4/5 rounded bg-secondary-background animate-pulse" />
                    <div className="h-4 w-2/5 rounded bg-secondary-background animate-pulse" />
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="h-3 w-full rounded bg-secondary-background animate-pulse" />
                    <div className="h-3 w-full rounded bg-secondary-background animate-pulse" />
                    <div className="h-3 w-3/5 rounded bg-secondary-background animate-pulse" />
                  </div>
                  <div className="mt-auto pt-2 border-t border-border">
                    <div className="h-4 w-28 rounded bg-secondary-background animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOportunidades.length === 0 ? (
          <Card className="text-center max-w-md mx-auto my-8 w-full p-8 bg-white">
            <CardContent className="flex flex-col items-center p-0">
            {activeOportunidadesTab === "guardadas" ? (
              <>
                <span className="material-symbols-outlined text-text-tertiary text-5xl mb-3">
                  favorite_border
                </span>
                <h3 className="text-lg font-black text-text-primary mb-1">
                  No tienes becas guardadas aún
                </h3>
                <p className="text-xs font-bold text-text-tertiary mb-4">
                  Explora las oportunidades y haz clic en <span className="material-symbols-outlined text-sm align-middle text-danger-text" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span> para guardar las
                  que te interesen. Luego podrás postular con un solo clic.
                </p>
                <Button
                  onClick={() => setActiveOportunidadesTab("explorar")}
                  variant="neutral"
                >
                  Explorar Becas
                </Button>
              </>
            ) : activeOportunidadesTab === "postuladas" ? (
              <>
                <span className="material-symbols-outlined text-text-tertiary text-5xl mb-3">
                  task_alt
                </span>
                <h3 className="text-lg font-black text-text-primary mb-1">
                  Aún no has postulado a ninguna beca
                </h3>
                <p className="text-xs font-bold text-text-tertiary mb-4">
                  Guarda primero una beca y desde la pestaña "Guardadas" podrás
                  postular. Tu progreso aparecerá en Mis Postulaciones.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setActiveOportunidadesTab("guardadas")}
                    variant="neutral"
                  >
                    Ver Guardadas
                  </Button>
                  <Button
                    onClick={() => navigate("/postulaciones")}
                    variant="neutral"
                  >
                    Mis Postulaciones
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-text-tertiary text-5xl mb-3">
                  search_off
                </span>
                <h3 className="text-lg font-black text-text-primary mb-1">Sin resultados</h3>
                <p className="text-xs font-bold text-text-tertiary mb-4">
                  Intenta con otros términos de búsqueda.
                </p>
              </>
            )}
            </CardContent>
          </Card>
        ) : isLoadingBecas ? null : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedOportunidades.map((oportunidad) => {
                return (
                  <ScholarshipCard
                    key={oportunidad.id}
                    oportunidad={oportunidad}
                    activeTab={activeOportunidadesTab}
                    onClick={() => setSelectedOportunidad(oportunidad)}
                    isSaved={savedBecaIds.includes(oportunidad.id)}
                    onToggleSave={(id) => handleToggleSave(id)}
                    onDeletePostulacion={(e) => {
                      e.stopPropagation();
                      setPendingDeleteId(oportunidad.id);
                      setShowDeleteModal(true);
                    }}
                  />
                );
              })}
            </div>

            {/* Paginador */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 sm:gap-4 py-6">
                <Button
                  variant="neutral"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <span className="sm:hidden text-xs font-black text-text-tertiary shrink-0">
                  {currentPage} / {totalPages}
                </span>

                <div className="hidden sm:flex items-center gap-2 overflow-x-auto px-2 no-scrollbar">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 shrink-0 rounded-lg shadow-shadow text-xs font-black hover:scale-105 active:scale-95 transition-transform ${
                          currentPage === page
                            ? "bg-text-primary text-white border-2 border-border"
                            : "bg-white text-text-primary border-2 border-border"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <Button
                  variant="neutral"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filters Drawer (Slides from right) */}
      <FilterDrawer
        isOpen={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
        onClear={handleLimpiarFiltros}
        selectedProgramTypes={selectedProgramTypes}
        setSelectedProgramTypes={setSelectedProgramTypes}
        selectedFinancing={selectedFinancing}
        setSelectedFinancing={setSelectedFinancing}
        selectedGestiones={selectedGestiones}
        setSelectedGestiones={setSelectedGestiones}
        selectedDestinos={selectedDestinos}
        setSelectedDestinos={setSelectedDestinos}
      />

      {/* Details Drawer — bottom-sheet on mobile, side drawer on desktop */}
      <DetailDrawer
        oportunidad={displayedOportunidad}
        isOpen={!!selectedOportunidad}
        isSaved={displayedOportunidad ? savedBecaIds.includes(displayedOportunidad.id) : false}
        isApplied={displayedOportunidad ? appliedBecaIds.includes(displayedOportunidad.id) : false}
        hasProfile={!!profile}
        requisitos={displayedOportunidad ? generateRequisitos(displayedOportunidad) : []}
        onClose={() => setSelectedOportunidad(null)}
        onToggleSave={(id) => handleToggleSave(id)}
        onApply={(id) => {
          if (appliedBecaIds.includes(id)) {
            navigate("/postulaciones", { state: { becaId: id } });
            closeAllDrawers();
          } else {
            handleApply(id);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteModal && !!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteModal(false);
            setPendingDeleteId(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-base bg-danger-bg border-2 border-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-danger-text text-2xl">
                  delete_forever
                </span>
              </div>
              <div className="text-left">
                <DialogTitle className="text-base">¿Cancelar postulación?</DialogTitle>
                <p className="text-xs font-bold text-text-tertiary mt-0.5">
                  {oportunidades.find((o) => o.id === pendingDeleteId)?.title ||
                    "Esta beca"}
                </p>
              </div>
            </div>
          </DialogHeader>
          <p className="text-sm font-bold text-text-tertiary leading-relaxed">
            Se eliminará tu postulación y todo el progreso guardado. Esta
            acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="neutral"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setPendingDeleteId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-[1.5] bg-danger-text text-white hover:bg-danger-text/90"
              onClick={() => pendingDeleteId && handleDeletePostulation(pendingDeleteId)}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-brand-blue text-white p-4 rounded-none shadow-shadow flex items-center gap-3 border-2 border-white/20 animate-pulse">
          <span className="material-symbols-outlined text-[20px]">
            verified
          </span>
          <div>
            <p className="text-sm font-black text-white">Notificación de Pathfinder</p>
            <p className="text-xs font-semibold text-white/95">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
