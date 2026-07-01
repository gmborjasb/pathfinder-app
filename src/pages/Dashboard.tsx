import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(47 * 3600 + 12 * 60 + 8);
  const [activeTab, setActiveTab] = useState<"charlas" | "talleres">("charlas");
  const [now] = useState(() => Date.now());
  
  const [becas, setBecas] = useState<any[]>([]);
  const [charlas, setCharlas] = useState<any[]>([]);
  const [talleres, setTalleres] = useState<any[]>([]);
  const [dbDocs, setDbDocs] = useState<any[]>([]);
  const [postulation, setPostulation] = useState<any>(null);

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

  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postDocsMap, setPostDocsMap] = useState<Record<string, any[]>>({});
  const [showBecaDD, setShowBecaDD] = useState(false);
  const becaDDRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
          return;
        }

        const [becasRes, charlasRes, talleresRes] = await Promise.all([
          supabase.from("becas").select("*").order("id", { ascending: true }),
          supabase.from("charlas").select("*").order("id", { ascending: true }),
          supabase.from("talleres").select("*").order("id", { ascending: true })
        ]);

        if (becasRes.data) setBecas(becasRes.data);
        if (charlasRes.data) setCharlas(charlasRes.data);
        if (talleresRes.data) setTalleres(talleresRes.data);

        if (user) {
          const { data: posts } = await supabase
            .from("postulaciones")
            .select("*")
            .eq("usuario_id", user.id)
            .order("created_at", { ascending: false });

          if (posts && posts.length > 0) {
            setPostulaciones(posts);
            setPostulation(posts[0]);
            setSelectedPostId(posts[0].id);

            const map: Record<string, any[]> = {};
            for (const p of posts) {
              const { data: docs } = await supabase
                .from("documentos")
                .select("*")
                .eq("postulacion_id", p.id);
              if (docs) map[p.id] = docs;
            }
            setPostDocsMap(map);
            setDbDocs(map[posts[0].id] || []);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data from Supabase:", err);
      }
    };

    loadDashboardData();
  }, [user]);

  const savedBecas = savedBecaIds
    .map((id) => becas.find((b) => b.id === id))
    .filter((b) => !!b)
    .map((row) => ({
      id: row.id,
      title: row.titulo,
      sponsor: row.sponsor,
      coverage: row.cobertura,
      requirement: row.requisitos,
      deadline: row.fecha_cierre,
      level: row.nivel,
      affinity: row.afinidad || 85,
      icon: row.icono || "school"
    }));

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

  useEffect(() => {
    if (selectedPostId && postDocsMap[selectedPostId]) {
      const timer = setTimeout(() => {
        setDbDocs(postDocsMap[selectedPostId]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedPostId, postDocsMap]);

  useEffect(() => {
    if (!showBecaDD) return;
    const handler = (e: MouseEvent) => {
      if (becaDDRef.current && !becaDDRef.current.contains(e.target as Node)) {
        setShowBecaDD(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBecaDD]);

  const profileName = profile?.nombres ? profile.nombres.split(" ")[0] : "Camila";

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

  const truncateToWordBoundary = (str: string, maxLength: number) => {
    if (!str || str.length <= maxLength) return str;
    const sub = str.slice(0, maxLength);
    const lastSpace = sub.lastIndexOf(" ");
    if (lastSpace === -1) return sub + "...";
    return sub.slice(0, lastSpace) + "...";
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
    }).replace(".", "");
  };

  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return "pronto";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDeadlineTextColorStyle = (dateStr: string) => {
    if (!dateStr) return { color: "#64748b" };
    const days = Math.floor((new Date(dateStr).getTime() - now) / 86400000);
    if (days <= 7) return { color: "#dc2626", fontWeight: "500" };
    if (days <= 30) return { color: "#d97706", fontWeight: "500" };
    return { color: "#16a34a", fontWeight: "500" };
  };

  const getEventWeight = (dateTimeStr: string) => {
    const str = (dateTimeStr || "").toLowerCase();
    if (str.includes("hoy") || str.includes("ahora")) return 1;
    if (str.includes("mañana")) return 2;
    if (str.includes("en 2 días")) return 3;
    if (str.includes("en 3 días")) return 4;
    if (str.includes("lunes")) return 10;
    if (str.includes("martes")) return 11;
    if (str.includes("miércoles")) return 12;
    if (str.includes("jueves")) return 13;
    if (str.includes("viernes")) return 14;
    if (str.includes("sábado")) return 15;
    if (str.includes("domingo")) return 16;
    return 100;
  };

  const getDashboardDocs = () => {
    const requiredDocs: { id: number; name: string; origin: string }[] = (activeBeca && Array.isArray(activeBeca.documentos_requeridos) && activeBeca.documentos_requeridos.length > 0)
      ? activeBeca.documentos_requeridos.map((d: any, i: number) => ({
          id: i + 1,
          name: d.name || d.nombre_documento || "",
          origin: d.description || d.fileText || "",
        }))
      : [
          { id: 1, name: "Certificado de Estudios", origin: "Trámite Minedu" },
          { id: 2, name: "Constancia de Primeros Puestos", origin: "Colegio Secundario" },
          { id: 3, name: "Declaración Jurada de Ingresos", origin: "Formato Pronabec" },
          { id: 4, name: "Certificado de Inglés", origin: "Británico / ICPNA" },
        ];

    return requiredDocs.map((req) => {
      const dbDoc = selectedDocs.find((d: any) => d.nombre_documento === req.name);
      if (dbDoc) {
        const isValid     = ["Validado", "Listo", "Aprobado"].includes(dbDoc.estado);
        const isRejected  = dbDoc.estado === "Rechazado";
        const isReviewing = dbDoc.estado === "En Revisión";
        return {
          ...req,
          status:     isValid ? "valid" : isRejected ? "error" : isReviewing ? "reviewing" : "pending",
          statusText: isValid ? "Validado" : isRejected ? "Rechazado" : isReviewing ? "Validando" : "Pendiente",
          actionType: isValid || isReviewing ? "download" : "upload",
          archivo_url: dbDoc.archivo_url,
        };
      }
      return { ...req, status: "pending", statusText: "Pendiente", actionType: "upload" };
    });
  };

  const getPipelineSteps = (paso: number) => {
    return [
      { id: 1, label: "Preparación", icon: "edit_document", status: paso >= 1 ? (paso === 1 ? "active" : "completed") : "pending" },
      { id: 2, label: "Enviada", icon: "send", status: paso >= 2 ? (paso === 2 ? "active" : "completed") : "pending" },
      { id: 3, label: "Evaluación", icon: "fact_check", status: paso >= 3 ? (paso === 3 ? "active" : "completed") : "pending" },
      { id: 4, label: "Resultados", icon: "emoji_events", status: paso >= 4 ? (paso === 4 ? "active" : "completed") : "pending" },
    ];
  };

  interface DailyMatch {
    id: string;
    titulo: string;
    matchPercentage: number;
    cobertura: string;
    requirementIcon: string;
    requirementLabel: string;
  }

  const topMatches = useMemo(() => {
    const sorted = [...becas]
      .filter((b) => b.id !== "BEC-01" && b.id !== "BEC-02")
      .sort((a, b) => (b.afinidad || 85) - (a.afinidad || 85))
      .slice(0, 5);

    return sorted.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      matchPercentage: row.afinidad || 85,
      cobertura: row.cobertura.includes("100%") ? "100%" : row.cobertura.includes("80%") ? "80%" : "50%",
      requirementIcon: row.icono || "school",
      requirementLabel: row.requisitos ? (row.requisitos.split(",")[0] || "Requisito mínimo") : "Requisito mínimo"
    }));
  }, [becas]);

  const [dailyRecommendation, setDailyRecommendation] = useState<DailyMatch | null>(null);
  useEffect(() => {
    if (topMatches.length > 0) {
      const today = new Date().toDateString();
      const stored = localStorage.getItem("pathfinder_daily_recommendation");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.date === today && topMatches.find((m) => m.id === parsed.id)) {
            setDailyRecommendation(topMatches.find((m) => m.id === parsed.id)!);
            return;
          }
        } catch { /* ignore */ }
      }
      const idx = Math.floor(Math.random() * topMatches.length);
      const pick = topMatches[idx];
      localStorage.setItem("pathfinder_daily_recommendation", JSON.stringify({ date: today, id: pick.id }));
      setDailyRecommendation(pick);
    }
  }, [topMatches]);

  const currentCharlas = charlas
    .map((c) => ({
      id: c.id,
      title: c.titulo,
      sponsor: c.sponsor,
      modality: c.modalidad,
      dateTime: c.fecha_hora,
      actionText: c.texto_accion
    }))
    .sort((a, b) => getEventWeight(a.dateTime) - getEventWeight(b.dateTime));

  const currentTalleres = talleres
    .map((t) => ({
      id: t.id,
      title: t.titulo,
      sponsor: t.sponsor,
      statusFrequency: t.frecuencia_estado,
      focus: t.enfoque,
      actionText: t.texto_accion
    }))
    .sort((a, b) => getEventWeight(a.statusFrequency) - getEventWeight(b.statusFrequency));

  const selectedPost = postulaciones.find(p => p.id === selectedPostId) || postulation;
  const activePaso = selectedPost ? selectedPost.paso_pipeline : null;
  const progressPercent = activePaso ? Math.round(((activePaso - 1) / 3) * 100) : 0;
  const activeBeca = selectedPost ? becas.find(b => b.id === selectedPost.beca_id) : null;
  const activeBecaTitle = activeBeca ? activeBeca.titulo : "Beca 18";

  const selectedDocs = selectedPostId ? (postDocsMap[selectedPostId] || dbDocs) : dbDocs;
  const docsListos = selectedDocs.filter(d => ["Validado", "Listo", "Aprobado"].includes(d.estado)).length;
  const docsTotal = selectedDocs.length;
  const diasCierre = activeBeca?.fecha_cierre
    ? Math.floor((new Date(activeBeca.fecha_cierre).getTime() - now) / 86400000)
    : null;

  const pasoLabels = ["", "Preparación", "Enviada", "Evaluación", "Resultados"];
  const badgeColors: Record<number, { bg: string; color: string }> = {
    1: { bg: "bg-warning-bg", color: "text-warning-text" },
    2: { bg: "bg-info-bg", color: "text-info-text" },
    3: { bg: "bg-success-bg", color: "text-success-text" },
    4: { bg: "bg-secondary-background", color: "text-text-tertiary" },
  };

  const beca18 = becas.find(b => b.id === "BEC-01");
  const beca18DeadlineText = beca18?.fecha_cierre ? `el ${formatLongDate(beca18.fecha_cierre)}` : "pronto";

  const hasRejectedDoc = dbDocs.some(d => d.estado === "Rechazado");

  return (
    <div className="w-full flex-1 bg-bg-base px-4 sm:px-6 md:px-10 pb-6 md:pb-10 flex flex-col gap-6 md:gap-8 font-sans animate-fade-in">

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-[32px] font-black tracking-tight text-text-primary">Hola {profileName}, ¡listo para tu próxima misión?</h2>
        <p className="text-sm sm:text-[16px] font-bold text-text-tertiary">Resumen de tu progreso en Pathfinder.</p>
      </div>

      {hasRejectedDoc && (
        <Card className="bg-white border-danger-text p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <CardContent className="flex items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-full bg-danger-bg border-2 border-danger-text flex items-center justify-center shrink-0">
              <div className="w-4 h-4 rounded-full bg-danger-text" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-black text-danger-text">Misión Urgente: Ficha SISFOH faltante</p>
              <p className="text-[14px] font-bold text-danger-text opacity-90">Requerido para Beca 18. Súbelo antes del viernes.</p>
            </div>
          </CardContent>
          <Button variant="default" className="bg-brand-coral border-border text-white hover:bg-brand-coral/90">
            Resolver Ahora
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white p-6 shadow-shadow border-2 border-border">
          <CardContent className="flex flex-col gap-4 p-0">
            <div className="w-10 h-10 rounded-lg bg-info-bg border-2 border-brand-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-brand-blue">my_location</span>
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-[32px] font-black text-foreground leading-none mb-1">{postulaciones.length || 1}</p>
              <p className="text-[14px] font-extrabold text-muted-foreground">Postulación Activa</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white p-6 shadow-shadow border-2 border-border">
          <CardContent className="flex flex-col gap-4 p-0">
            <div className="w-10 h-10 rounded-lg bg-success-bg border-2 border-success-text flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-success-text">cases</span>
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-[32px] font-black text-foreground leading-none mb-1">{docsTotal > 0 ? `${docsListos} / ${docsTotal}` : "3 / 5"}</p>
              <p className="text-[14px] font-extrabold text-muted-foreground">Documentos Validados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white p-6 shadow-shadow border-2 border-border">
          <CardContent className="flex flex-col gap-4 p-0">
            <div className="w-10 h-10 rounded-lg bg-warning-bg border-2 border-warning-text flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-warning-text">chat_bubble</span>
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-[32px] font-black text-foreground leading-none mb-1">2</p>
              <p className="text-[14px] font-extrabold text-muted-foreground">Mensajes de IA sin leer</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-5 mt-2">
        <h3 className="text-[20px] font-black text-foreground">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            asChild
            variant="default"
            className="h-auto p-5 justify-start bg-brand-blue text-white"
          >
            <a href="/buscar">
              <span className="material-symbols-outlined text-white text-[24px]">explore</span>
              <span className="text-[16px] font-black text-white">Explorar Becas</span>
            </a>
          </Button>
          
          <Button
            onClick={() => navigate("/asesor")}
            variant="neutral"
            className="h-auto p-5 justify-start"
          >
            <span className="material-symbols-outlined text-foreground text-[24px]">smart_toy</span>
            <span className="text-[16px] font-black">Hablar con Motibot</span>
          </Button>
          
          <Button
            asChild
            variant="neutral"
            className="h-auto p-5 justify-start"
          >
            <a href="/documentos">
              <span className="material-symbols-outlined text-foreground text-[24px]">upload_file</span>
              <span className="text-[16px] font-black">Subir un Documento</span>
            </a>
          </Button>
        </div>
      </div>

      {dailyRecommendation && (
        <Card
          className="bg-white shadow-shadow border-brand-blue p-6 mt-4 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer"
          onClick={() => navigate("/buscar", { state: { openBecaId: dailyRecommendation.id } })}
        >
          <CardContent className="flex flex-col gap-3 p-0">
            <div className="flex items-center gap-2">
              <span className="bg-brand-coral text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border-2 border-border">
                Recomendación del Día
              </span>
            </div>
            <h4 className="text-[20px] font-black text-brand-blue leading-tight">
              {dailyRecommendation.titulo}
            </h4>
            <p className="text-[14px] font-bold text-text-secondary max-w-[600px] leading-snug">
              Basado en tu interés por {profile?.area_interes || "nuevas oportunidades"}, creemos que esta beca {dailyRecommendation.cobertura.toLowerCase()} es ideal para ti.
            </p>
          </CardContent>
          <Button
            variant="default"
            className="border-border bg-brand-blue text-white pointer-events-none"
          >
            Ver Detalles
          </Button>
        </Card>
      )}

      {showNotification && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-[99] bg-text-primary text-white py-3 px-4 rounded-2xl shadow-shadow flex items-center gap-3 border-2 border-white/20 animate-fade-in animate-in slide-in-from-right-4 duration-300 sm:max-w-sm">
          <span className="material-symbols-outlined text-[20px] text-success-text shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Notificación</p>
            <p className="text-[10px] text-white/90 mt-0.5 leading-snug">{notificationMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
