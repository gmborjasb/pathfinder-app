import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { getBecasRecomendadas } from "../services/recomendaciones";
import type { BecaRecomendada } from "../services/recomendaciones";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface BecaCtx {
  titulo: string;
  sponsor: string;
  fecha_cierre: string | null;
}

let globalLocalFallback = false;

export default function Asesor() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const [recomendaciones, setRecomendaciones] = useState<BecaRecomendada[]>([]);

  // Rename state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState(() => {
    return localStorage.getItem("pathfinder_ollama_url") || "";
  });

  // Context data from BD
  const [becaCtx, setBecaCtx] = useState<BecaCtx | null>(null);
  const [docsRechazados, setDocsRechazados] = useState(0);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close three-dot menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Fetch context data from Supabase ─────────────────────────────────────
  useEffect(() => {
    const fetchContext = async () => {
      const isMock = !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
      if (isMock || !user) return;

      try {
        const becaId = localStorage.getItem("pathfinder_active_meta");
        if (!becaId) return;

        const { data: beca } = await supabase
          .from("becas")
          .select("titulo, sponsor, fecha_cierre")
          .eq("id", becaId)
          .maybeSingle();

        if (beca) {
          setBecaCtx(beca);
          if (beca.fecha_cierre) {
            const dias = Math.floor(
              (new Date(beca.fecha_cierre).getTime() - Date.now()) / 86400000
            );
            setDiasRestantes(dias);
          }

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
        console.error("Error fetching asesor context:", err);
      }
    };

    fetchContext();
  }, [user]);

  // ── Fetch top recommended becas for advisor context ───────────────────────
  useEffect(() => {
    const fetchRecomendaciones = async () => {
      if (!user) return;
      try {
        const data = await getBecasRecomendadas(user.id);
        setRecomendaciones(data.slice(0, 5));
      } catch (err) {
        console.error("Error al cargar becas afines para el chat:", err);
      }
    };
    fetchRecomendaciones();
  }, [user]);

  // ── Session helpers ───────────────────────────────────────────────────────
  const getWelcomeMessage = () => {
    const name = profile?.nombres ? profile.nombres.split(" ")[0] : "Marcelo";
    return {
      id: "welcome-" + Date.now(),
      sender: "ai" as const,
      text: `Hola ${name}. Soy tu asesor de postulación${becaCtx ? ` para la ${becaCtx.titulo}` : ""}.\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
    };
  };

  const loadLocalSessions = () => {
    const defaultWelcome = getWelcomeMessage();
    const local = localStorage.getItem("pathfinder_chat_sessions");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped = parsed.map((s: any) => ({
            ...s,
            mensajes: Array.isArray(s.mensajes)
              ? s.mensajes.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
              : [defaultWelcome],
            created_at: new Date(s.created_at),
            updated_at: new Date(s.updated_at),
          }));
          setSessions(mapped);
          if (!currentSessionId) {
            setCurrentSessionId(mapped[0].id);
            setMessages(mapped[0].mensajes);
          } else {
            const active = mapped.find((s: any) => s.id === currentSessionId);
            if (active) setMessages(active.mensajes);
          }
          return;
        }
      } catch (e) {
        console.error("Error parsing local sessions", e);
      }
    }
    const newId = "session-" + Date.now();
    const defaultSessions = [{
      id: newId,
      usuario_id: user?.id || "anonymous",
      titulo: "Conversación Nueva",
      mensajes: [defaultWelcome],
      created_at: new Date(),
      updated_at: new Date(),
    }];
    setSessions(defaultSessions);
    setCurrentSessionId(newId);
    setMessages([defaultWelcome]);
    localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(defaultSessions));
  };

  const loadChatSessions = async () => {
    globalLocalFallback = false;
    const defaultWelcome = getWelcomeMessage();
    const isMock = !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

    if (isMock || !user) {
      globalLocalFallback = true;
      setUseLocalFallback(true);
      loadLocalSessions();
      return;
    }

    try {
      const { data, error } = await supabase
        .from("chat_sesiones")
        .select("*")
        .eq("usuario_id", user.id)
        .order("updated_at", { ascending: false });

      if (error || (data && data.length > 0 && data[0].id === undefined)) {
        globalLocalFallback = true;
        setUseLocalFallback(true);
        loadLocalSessions();
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map((s: any) => ({
          ...s,
          mensajes: Array.isArray(s.mensajes)
            ? s.mensajes.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
            : [defaultWelcome],
          created_at: new Date(s.created_at),
          updated_at: new Date(s.updated_at),
        }));
        setSessions(mapped);
        if (!currentSessionId) {
          setCurrentSessionId(mapped[0].id);
          setMessages(mapped[0].mensajes);
        } else {
          const active = mapped.find((s: any) => s.id === currentSessionId);
          setCurrentSessionId(active ? active.id : mapped[0].id);
          setMessages(active ? active.mensajes : mapped[0].mensajes);
        }
      } else {
        const newId = crypto.randomUUID ? crypto.randomUUID() : "session-" + Date.now();
        const { data: inserted, error: insertErr } = await supabase
          .from("chat_sesiones")
          .insert({ id: newId, usuario_id: user.id, titulo: "Conversación Nueva", mensajes: [defaultWelcome] })
          .select("*")
          .single();
        if (insertErr) { globalLocalFallback = true; setUseLocalFallback(true); loadLocalSessions(); return; }
        const newSession = { ...inserted, mensajes: [defaultWelcome], created_at: new Date(inserted.created_at), updated_at: new Date(inserted.updated_at) };
        setSessions([newSession]);
        setCurrentSessionId(inserted.id);
        setMessages([defaultWelcome]);
      }
    } catch {
      globalLocalFallback = true;
      setUseLocalFallback(true);
      loadLocalSessions();
    }
  };

  useEffect(() => { loadChatSessions(); }, [user, profile]);
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const createNewSession = async () => {
    const defaultWelcome = getWelcomeMessage();
    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    const newId = crypto.randomUUID ? crypto.randomUUID() : "session-" + Date.now();

    if (isMock || !user || useLocalFallback || globalLocalFallback) {
      const newSession = { id: newId, usuario_id: user?.id || "anonymous", titulo: "Conversación Nueva", mensajes: [defaultWelcome], created_at: new Date(), updated_at: new Date() };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      setCurrentSessionId(newId);
      setMessages([defaultWelcome]);
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
      return;
    }
    try {
      const { data, error } = await supabase
        .from("chat_sesiones")
        .insert({ id: newId, usuario_id: user.id, titulo: "Conversación Nueva", mensajes: [defaultWelcome] })
        .select("*").single();
      if (error) { globalLocalFallback = true; setUseLocalFallback(true); return; }
      const newSession = { ...data, mensajes: [defaultWelcome], created_at: new Date(data.created_at), updated_at: new Date(data.updated_at) };
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(data.id);
      setMessages([defaultWelcome]);
    } catch { console.error("Error creating session"); }
  };

  const deleteSession = async (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    const updated = sessions.filter((s) => s.id !== idToDelete);

    const afterDelete = () => {
      setSessions(updated);
      if (currentSessionId === idToDelete) {
        if (updated.length > 0) { setCurrentSessionId(updated[0].id); setMessages(updated[0].mensajes); }
        else setTimeout(() => createNewSession(), 100);
      }
    };

    if (isMock || !user || useLocalFallback || globalLocalFallback) {
      afterDelete();
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
      return;
    }
    try {
      await supabase.from("chat_sesiones").delete().eq("id", idToDelete);
      afterDelete();
    } catch { console.error("Error deleting session"); }
  };

  const selectSession = (id: string) => {
    const active = sessions.find((s) => s.id === id);
    if (active) { setCurrentSessionId(id); setMessages(active.mensajes); }
  };

  const renameSession = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, titulo: trimmed, updated_at: new Date() } : s
    );
    setSessions(updated);
    setRenamingId(null);

    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    if (isMock || !user || useLocalFallback || globalLocalFallback) {
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
      return;
    }
    try {
      await supabase.from("chat_sesiones").update({ titulo: trimmed }).eq("id", id);
    } catch {
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
    }
  };

  const saveChatSession = async (updatedMessages: Message[]) => {
    if (!currentSessionId) return;
    const activeSession = sessions.find((s) => s.id === currentSessionId);
    let newTitle = activeSession?.titulo || "Conversación Nueva";
    if (newTitle === "Conversación Nueva") {
      const firstUser = updatedMessages.find((m) => m.sender === "user");
      if (firstUser) {
        const words = firstUser.text.split(" ");
        newTitle = words.slice(0, 5).join(" ");
        if (words.length > 5) newTitle += "...";
      }
    }
    const updated = sessions.map((s) =>
      s.id === currentSessionId ? { ...s, titulo: newTitle, mensajes: updatedMessages, updated_at: new Date() } : s
    );
    setSessions(updated);

    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    if (isMock || !user || useLocalFallback || globalLocalFallback) {
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
      return;
    }
    try {
      const { error } = await supabase.from("chat_sesiones")
        .update({ titulo: newTitle, mensajes: updatedMessages, updated_at: new Date().toISOString() })
        .eq("id", currentSessionId);
      if (error) { globalLocalFallback = true; setUseLocalFallback(true); localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated)); }
    } catch {
      globalLocalFallback = true; setUseLocalFallback(true);
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
    }
  };

  // ── AI response ───────────────────────────────────────────────────────────
  const simulateAiResponseFallback = (userText: string, currentMessages: Message[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const name = profile?.nombres ? profile.nombres.split(" ")[0] : "Marcelo";
      const t = userText.toLowerCase().trim();
      let aiText = "";

      if (t.includes("carta") || t.includes("motivacion") || t.includes("motivación") || t.includes("ensayo")) {
        aiText = `Por supuesto, ${name}. Una buena carta de motivación es uno de los factores más importantes en la evaluación.\n\nCopia y pega tu borrador aquí. Revisaré su estructura, tono y me aseguraré de que resalte tus fortalezas académicas y por qué mereces la beca.\n\nSi aún no la has empezado, puedo darte una estructura paso a paso.`;
      } else if (t.includes("entrevista") || t.includes("practicar") || t.includes("preguntas") || t.includes("simulacro")) {
        aiText = `Excelente iniciativa, ${name}. La preparación es fundamental.\n\nHagamos un simulacro interactivo: yo seré el evaluador y tú el postulante. Te haré preguntas una por una.\n\n¿Estás listo/a? Empecemos con la primera:\n\n"¿Cómo piensas utilizar los conocimientos de tu carrera para contribuir al desarrollo de tu comunidad?"`;
      } else if (t.includes("requisito") || t.includes("documento") || t.includes("sisfoh") || t.includes("mochila")) {
        aiText = `Los requisitos principales para Beca 18 de PRONABEC son:\n\n1. Ser peruano/a de nacimiento.\n2. Estar cursando o haber egresado del 5° de secundaria en el tercio superior.\n3. Clasificación de pobreza o pobreza extrema en el SISFOH (modalidad ordinaria).\n4. Constancia de ingreso a una universidad o instituto elegible.\n\n¿Tienes dudas sobre alguno de estos puntos?`;
      } else if (t.includes("carrera") || t.includes("vocacion") || t.includes("vocación") || t.includes("estudiar")) {
        aiText = `Con tu perfil académico actual tienes un buen punto de partida para evaluar opciones universitarias.\n\nCuéntame cuáles son tus materias favoritas y qué actividades te apasionan. Con eso puedo ayudarte a identificar las carreras que mejor se alinean con tu perfil.`;
      } else {
        aiText = `Entendido, ${name}. Estoy aquí para guiarte en tu postulación${becaCtx ? ` a la ${becaCtx.titulo}` : ""}.\n\n¿Te gustaría que revisemos tu carta de motivación, practiquemos una entrevista, o que verifiquemos los documentos de tu mochila?`;
      }

      const nextMessages: Message[] = [
        ...currentMessages,
        { id: `ai-${Date.now()}`, sender: "ai", text: aiText, timestamp: new Date() },
      ];
      setMessages(nextMessages);
      setIsTyping(false);
      saveChatSession(nextMessages);
    }, 1200);
  };

  const fetchOllamaResponse = async (userText: string, currentMessages: Message[]) => {
    setIsTyping(true);
    const savedUrl = localStorage.getItem("pathfinder_ollama_url") || "";
    if (!savedUrl) { simulateAiResponseFallback(userText, currentMessages); return; }

    let endpoint = savedUrl.trim();
    if (!endpoint.endsWith("/api/chat")) endpoint = endpoint.replace(/\/$/, "") + "/api/chat";

    const name = profile?.nombres ? profile.nombres.split(" ")[0] : "Marcelo";
    const ollamaMessages = [
      {
        role: "system",
        content: `Eres un asesor de postulaciones académicas para la plataforma Pathfinder. Tu función es guiar al estudiante "${name}" en su proceso de postulación a becas peruanas${becaCtx ? `, especialmente ${becaCtx.titulo}` : ""}. Usa un tono amigable pero profesional. No uses emojis. Responde siempre en español.`,
      },
      ...currentMessages.map((msg) => ({
        role: (msg.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.text,
      })),
      { role: "user" as const, content: userText },
    ];

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3.2:3b", messages: ollamaMessages, stream: false }),
      });
      if (!response.ok) throw new Error("Ollama error");
      const data = await response.json();
      const aiText = data.message?.content || "No pude obtener una respuesta.";
      const nextMessages: Message[] = [
        ...currentMessages,
        { id: `ai-${Date.now()}`, sender: "ai", text: aiText, timestamp: new Date() },
      ];
      setMessages(nextMessages);
      setIsTyping(false);
      saveChatSession(nextMessages);
    } catch {
      simulateAiResponseFallback(userText, currentMessages);
    }
  };

  const fetchIAContextualResponse = async (userText: string, currentMessages: Message[]) => {
    setIsTyping(true);

    const apiKey = import.meta.env.VITE_AI_API_KEY;

    // Si no hay API Key de Groq, intentamos usar Ollama como fallback secundario o el simulador local
    if (!apiKey) {
      const savedUrl = localStorage.getItem("pathfinder_ollama_url") || "";
      if (savedUrl) {
        await fetchOllamaResponse(userText, currentMessages);
      } else {
        simulateAiResponseFallback(userText, currentMessages);
      }
      return;
    }

    const name = profile?.nombres || "Estudiante";
    const gpa = profile?.perfil_detalles?.notas?.gpa || "No registrado";
    const sisfoh = profile?.perfil_detalles?.sisfoh || "No registrado";
    const colegio = profile?.perfil_detalles?.tipo_colegio || "No registrado";
    const merito = profile?.merito_academico || "No registrado";
    const voluntariado = profile?.hace_voluntariado ? "Sí" : "No";
    const deportista = profile?.es_deportista ? "Sí" : "No";
    const ingles = profile?.perfil_detalles?.idiomas?.nivelIngles || "No registrado";

    let promptSistema = `Eres Motibot, un mentor virtual y asistente motivacional diseñado exclusivamente para apoyar a estudiantes de colegio en su camino académico y personal. Tu propósito es ser un guía inspirador que ayude a los alumnos a mantener el enfoque, superar obstáculos, conseguir becas y recordar por qué sus metas son importantes.

Al contestar, debes seguir estas reglas estrictas:

- Tono y Lenguaje: Debes usar un lenguaje cercano, empático y muy alentador. No hables de forma demasiado rígida, sino como un mentor joven y sabio que entiende las presiones escolares y la búsqueda de oportunidades.
- Uso de Emojis: ¡Es obligatorio! Usa emojis que transmitan energía positiva y estudio (🚀, 📚, ✨, 💪, 🎓) para que la conversación sea visualmente atractiva para los jóvenes.
- Enfoque en Metas y Becas: Siempre que el estudiante mencione un objetivo (ej. "quiero pasar matemáticas", "ser ingeniero" o "ganar una beca"), recuérdale su capacidad y dale un pequeño consejo práctico o una frase motivadora relacionada.
- Restricción de Contenido: No debes responder preguntas que no tengan que ver con estudios, becas, motivación, gestión del tiempo, bienestar estudiantil o crecimiento personal. Si te preguntan algo fuera de este ámbito, redirige la charla hacia sus metas académicas de forma amable. NO RESPONDAS PREGUNTAS QUE NO TENGAN QUE VER CON ESTUDIOS, SI TE PREGUNTAN ALGO AJENO SIMPLEMENTE DÍ QUE TU PROPOSITO ES SER UN AYUDANTE ACADÉMICO.
- Identidad: Siempre preséntate o actúa como Motibot, el compañero que nunca deja que se rindan.

Te estás comunicando con el estudiante ${name}. Aquí tienes su perfil académico y personal actual:
- Promedio académico (GPA): ${gpa}
- Clasificación socioeconómica (SISFOH): ${sisfoh}
- Colegio de procedencia: ${colegio}
- Mérito académico: ${merito}
- Realiza voluntariado: ${voluntariado}
- Deportista calificado: ${deportista}
- Nivel de inglés: ${ingles}

`;

    if (becaCtx) {
      promptSistema += `El estudiante tiene una beca objetivo activa a la que está postulando:
- Beca objetivo: "${becaCtx.titulo}" (Sponsor: ${becaCtx.sponsor})
`;
      if (diasRestantes !== null) {
        promptSistema += `- Días restantes para el cierre: ${diasRestantes} días.
`;
      }
      if (docsRechazados > 0) {
        promptSistema += `- ALERTA CRÍTICA: Tiene ${docsRechazados} documento(s) RECHAZADO(S) en su mochila. Recuérdale con mucho ánimo que debe corregirlos a tiempo para no perder esta gran oportunidad.
`;
      }
    }

    if (recomendaciones && recomendaciones.length > 0) {
      promptSistema += `
Aquí tienes las 5 becas de la base de datos de Pathfinder más afines a su perfil (ordenadas de mayor a menor afinidad). Úsalas para sugerírselas de forma motivadora si te pregunta por becas o si se alinean con sus metas académicas:
`;
      recomendaciones.forEach((b, index) => {
        promptSistema += `${index + 1}. "${b.titulo}" (Sponsor: ${b.sponsor}) | Afinidad: ${b.afinidad_calculada}% | Cobertura: ${b.cobertura} | Requisitos: ${b.requisitos}
`;
      });
    }

    // Unimos el historial en el formato esperado por Groq (OpenAI format)
    const mensajesParaEnviar = [
      { role: "system", content: promptSistema },
      ...currentMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }))
    ];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: mensajesParaEnviar,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const datos = await response.json();
      const textoRespuesta = datos.choices[0].message.content || "No pude generar una respuesta. 🤖";

      const nextMessages: Message[] = [
        ...currentMessages,
        { id: `ai-${Date.now()}`, sender: "ai", text: textoRespuesta, timestamp: new Date() }
      ];

      setMessages(nextMessages);
      setIsTyping(false);
      saveChatSession(nextMessages);

    } catch (error) {
      console.error("Error al conectar con Groq API:", error);
      // Fallback a Ollama si está configurado, o simulador local
      const savedUrl = localStorage.getItem("pathfinder_ollama_url") || "";
      if (savedUrl) {
        await fetchOllamaResponse(userText, currentMessages);
      } else {
        setIsTyping(false);
        const errorMsg: Message = {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "Ups, tuve un problema técnico al conectarme con Motibot. ¿Podrías intentar enviar tu mensaje de nuevo? 🤖",
          timestamp: new Date()
        };
        setMessages([...currentMessages, errorMsg]);
      }
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = { id: `user-${Date.now()}`, sender: "user", text, timestamp: new Date() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputValue("");
    saveChatSession(updated);
    fetchIAContextualResponse(text, updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(inputValue); }
  };

  const quickActions = [
    { title: "Revisar mi carta de motivación", icon: "description" },
    { title: "Practicar para mi entrevista", icon: "record_voice_over" },
    { title: "Entender un requisito o documento", icon: "help_center" },
    { title: "Explorar opciones de carreras", icon: "explore" },
  ];

  // ── Derived values ────────────────────────────────────────────────────────
  const gpa = profile?.perfil_detalles?.notas?.gpa;
  const firstName = profile?.nombres ? profile.nombres.split(" ")[0] : "Marcelo";
  const showUrgencia = docsRechazados > 0 || (diasRestantes !== null && diasRestantes <= 10 && diasRestantes >= 0);

  const relativeDate = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    return `Hace ${diff} días`;
  };

const renderMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i} style={{ whiteSpace: "pre-line" }}>{part}</span>;
      })}
    </>
  );
};

// ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-3 relative -mt-3 -mx-3 lg:m-0 h-[calc(100dvh-60px)] lg:h-[calc(100dvh-120px)]" style={{ minHeight: 480, overflow: 'hidden' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}

      {/* Mobile overlay backdrop */}
      {showMobileSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Aside — hidden on mobile unless drawer open */}
      <aside
        className={`flex-col gap-2 flex-shrink-0 lg:flex
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-[240px] lg:w-[220px]
          bg-[#f8fafd] lg:bg-transparent
          p-3 lg:p-0
          overflow-y-auto lg:overflow-visible
          transition-transform duration-300 ease-in-out
          ${showMobileSidebar ? 'flex translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ gap: 8 }}
      >

        {/* Contexto activo */}
        <div className="card" style={{ padding: "12px" }}>
          <p className="lbl" style={{ marginBottom: 8 }}>Tu contexto activo</p>

          {/* Beca */}
          <div className="ctx-row">
            <div className="ctx-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>school</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="ctx-label">Beca objetivo</p>
              <p className="ctx-val" style={{ color: "var(--navy)" }}>
                {becaCtx?.titulo || localStorage.getItem("pathfinder_active_meta") ? (becaCtx?.titulo || "Cargando...") : "Sin beca activa"}
              </p>
            </div>
          </div>

          {/* Promedio */}
          <div className="ctx-row">
            <div className="ctx-icon" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>trending_up</span>
            </div>
            <div>
              <p className="ctx-label">Promedio</p>
              <p className="ctx-val" style={{ color: "var(--green)" }}>
                {gpa ? `${gpa} GPA` : "Sin registrar"}
              </p>
            </div>
          </div>

          {/* Cierre */}
          <div className="ctx-row">
            <div className="ctx-icon" style={
              diasRestantes !== null && diasRestantes <= 10
                ? { background: "var(--amber-bg)", color: "var(--amber)" }
                : {}
            }>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>alarm</span>
            </div>
            <div>
              <p className="ctx-label">Cierre</p>
              <p className="ctx-val" style={{
                color: diasRestantes === null ? "var(--slate)" :
                  diasRestantes <= 7 ? "var(--red)" :
                  diasRestantes <= 30 ? "var(--amber)" : "var(--green)"
              }}>
                {diasRestantes === null ? "Sin fecha" :
                  diasRestantes < 0 ? "Cerrada" :
                  diasRestantes === 0 ? "Hoy" :
                  `En ${diasRestantes} días`}
              </p>
            </div>
          </div>

          {/* Documentos */}
          <div className="ctx-row" style={{ marginBottom: 0 }}>
            <div className="ctx-icon" style={
              docsRechazados > 0
                ? { background: "var(--red-bg)", color: "var(--red)" }
                : { background: "var(--green-bg)", color: "var(--green)" }
            }>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                {docsRechazados > 0 ? "file_present" : "check_circle"}
              </span>
            </div>
            <div>
              <p className="ctx-label">Documentos</p>
              <p className="ctx-val" style={{ color: docsRechazados > 0 ? "var(--red)" : "var(--green)" }}>
                {docsRechazados > 0 ? `${docsRechazados} rechazado${docsRechazados > 1 ? "s" : ""}` : "Al día"}
              </p>
            </div>
          </div>
        </div>

        {/* Historial de conversaciones */}
        <div className="card" style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <p className="lbl" style={{ marginBottom: 8 }}>Conversaciones</p>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
            {sessions.map((s) => {
              const isActive = s.id === currentSessionId;
              const isRenaming = renamingId === s.id;
              const isMenuOpen = openMenuId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => { if (!isRenaming) selectSession(s.id); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "7px 8px",
                    borderRadius: 8, cursor: isRenaming ? "default" : "pointer",
                    background: isActive ? "#e8eef8" : "transparent",
                    border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                    position: "relative",
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: isActive ? "var(--navy)" : "var(--slate-2)",
                  }} />

                  {/* Título o input de renombrado */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameSession(s.id, renameValue);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => renameSession(s.id, renameValue)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "100%", fontSize: 10, color: "var(--navy)", border: "1px solid var(--navy)",
                          borderRadius: 5, padding: "2px 5px", background: "var(--white)", outline: "none",
                        }}
                      />
                    ) : (
                      <>
                        <p style={{ fontSize: 10, color: "var(--navy)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.titulo}
                        </p>
                        <p style={{ fontSize: 9, color: "var(--slate-2)", marginTop: 1 }}>
                          {relativeDate(s.updated_at instanceof Date ? s.updated_at : new Date(s.updated_at))}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Botón tres puntos */}
                  {!isRenaming && (
                    <div ref={isMenuOpen ? menuRef : null} style={{ position: "relative", flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : s.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 2px", color: "var(--slate-2)", display: "flex", alignItems: "center", borderRadius: 4 }}
                        title="Opciones"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>more_vert</span>
                      </button>

                      {isMenuOpen && (
                        <div style={{
                          position: "absolute", right: 0, top: "calc(100% + 2px)", zIndex: 50,
                          background: "var(--white)", border: "1px solid var(--border)", borderRadius: 10,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.10)", overflow: "hidden", minWidth: 130,
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameValue(s.titulo);
                              setRenamingId(s.id);
                              setOpenMenuId(null);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 12px", fontSize: 11, fontWeight: 500, color: "var(--navy)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                            Renombrar
                          </button>
                          <button
                            onClick={(e) => { setOpenMenuId(null); deleteSession(s.id, e); }}
                            style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 12px", fontSize: 11, fontWeight: 500, color: "var(--red)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={createNewSession}
            style={{
              marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 5, padding: "7px", border: "1.5px dashed var(--border)", borderRadius: 9,
              fontSize: 11, fontWeight: 500, color: "var(--navy)", background: "transparent", cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
            Nueva conversación
          </button>
        </div>
      </aside>

      {/* ── Chat area ────────────────────────────────────────────────────── */}
      <section className="card border-0 lg:border lg:border-[#e2e8f0] rounded-none lg:rounded-[16px]" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Hamburger — only on mobile */}
            <button
              className="lg:hidden"
              onClick={() => setShowMobileSidebar(true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 8, color: "var(--slate-2)", display: "flex", alignItems: "center" }}
              title="Historial"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu</span>
            </button>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--navy)" }}>Motibot</p>
              <p style={{ fontSize: 10, color: "var(--slate)", marginTop: 1 }}>
                Especializado en becas peruanas
                {becaCtx ? ` · ${becaCtx.titulo} activa` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 5, borderRadius: 8, color: "var(--slate-2)" }}
            title="Configuración"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
          </button>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "#f8fafd" }}>

          {messages.length === 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, background: "var(--navy-light, #e8eef8)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--navy)", fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                  Hola {firstName}, ¿en qué puedo ayudarte?
                </p>
                <p style={{ fontSize: 12, color: "var(--slate)" }}>Tu asesor de postulaciones está listo.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, width: "100%", maxWidth: 520 }}>
                {quickActions.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(a.title)}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6, padding: 14,
                      background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14,
                      textAlign: "left", cursor: "pointer",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--navy)" }}>{a.icon}</span>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>{a.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{ display: "flex", gap: 8, maxWidth: "90%", alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", flexDirection: msg.sender === "user" ? "row-reverse" : "row" }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
                    background: msg.sender === "user" ? "var(--navy)" : "var(--navy-light, #e8eef8)",
                    color: msg.sender === "user" ? "#fff" : "var(--navy)",
                  }}>
                    {msg.sender === "user" ? firstName[0].toUpperCase() : "IA"}
                  </div>
                  <div style={{
                    padding: "10px 13px", fontSize: 13, lineHeight: 1.6,
                    borderRadius: msg.sender === "user" ? "12px 0 12px 12px" : "0 12px 12px 12px",
                    background: msg.sender === "user" ? "var(--navy)" : "var(--white)",
                    color: msg.sender === "user" ? "#fff" : "var(--navy)",
                    border: msg.sender === "user" ? "none" : "1px solid var(--border)",
                  }}>
                    {renderMarkdown(msg.text)}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: "flex", gap: 8, alignSelf: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--navy-light, #e8eef8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "var(--navy)" }}>IA</div>
                  <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "0 12px 12px 12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: 4 }}>
                    {[0, 200, 400].map((d, i) => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--slate-2)", display: "inline-block", animation: `bounce 1.2s ${d}ms infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Urgencia alert */}
        {showUrgencia && messages.length > 1 && (
          <div style={{
            margin: "0 16px", padding: "9px 12px", background: "var(--amber-bg)", border: "1px solid #fcd34d",
            borderRadius: 10, display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--amber)", flexShrink: 0 }}>alarm</span>
            <p style={{ fontSize: 10, color: "var(--amber)", flex: 1, lineHeight: 1.5 }}>
              {docsRechazados > 0 && diasRestantes !== null && diasRestantes <= 10
                ? <><strong>Cierre en {diasRestantes} días.</strong> Tienes {docsRechazados} documento{docsRechazados > 1 ? "s" : ""} rechazado{docsRechazados > 1 ? "s" : ""}. Sin resolverlos tu postulación queda incompleta.</>
                : docsRechazados > 0
                  ? <>Tienes <strong>{docsRechazados} documento{docsRechazados > 1 ? "s" : ""} rechazado{docsRechazados > 1 ? "s" : ""}</strong> en tu mochila. Resuélvelos antes del cierre.</>
                  : <><strong>Cierre en {diasRestantes} días.</strong> Verifica que todos tus documentos estén en orden.</>
              }
            </p>
            <button
              onClick={() => navigate("/documentos")}
              style={{ fontSize: 9, fontWeight: 600, padding: "4px 10px", border: "1px solid var(--amber)", borderRadius: 6, color: "var(--amber)", background: "var(--white)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Ver documento →
            </button>
          </div>
        )}

        {/* Quick suggestions */}
        {messages.length > 1 && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => handleSend(a.title)}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
                  border: "1px solid var(--border)", borderRadius: 99, fontSize: 10, fontWeight: 500,
                  color: "var(--navy)", background: "var(--white)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{a.icon}</span>
                {a.title}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--border)", background: "var(--white)", flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--slate-3)", borderRadius: 10, padding: "8px 12px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--slate-2)", cursor: "pointer" }}>attach_file</span>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntame sobre tus becas, documentos o ensayos..."
              rows={1}
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "var(--navy)", outline: "none", resize: "none", maxHeight: 80, minHeight: 20, padding: "2px 0" }}
            />
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--slate-2)", cursor: "pointer" }}>mic</span>
          </div>
          <button
            onClick={() => handleSend(inputValue)}
            style={{ width: 36, height: 36, borderRadius: 9, background: "var(--navy)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, cursor: "pointer", flexShrink: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 9, color: "var(--slate-2)", padding: "4px 16px 8px", background: "var(--white)" }}>
          La IA puede cometer errores. Verifica siempre la información crítica con PRONABEC.
        </p>
      </section>

      {/* Settings modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="t-md bold text-[#0F2554]">Configuración del Asesor IA</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-[#64748b] hover:text-[#0F2554] bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="t-label text-[#64748b] block mb-1">
                URL del Servidor Ollama / Colab (Gradio/Ngrok/Cloudflare)
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="https://tu-url.trycloudflare.com"
                className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none text-[#0F2554]"
              />
              <p className="t-xs leading-relaxed text-[#64748b]">
                Ingresa la URL pública de tu túnel Cloudflare, ngrok o localtunnel. Dejar en blanco para usar respuestas simuladas.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowSettingsModal(false)} className="btn-sub px-3 py-1.5">Cancelar</button>
              <button
                onClick={() => { localStorage.setItem("pathfinder_ollama_url", ollamaUrl.trim()); setShowSettingsModal(false); }}
                className="bg-[#0F2554] text-white px-3 py-1.5 rounded-[8px] t-xs bold hover:bg-[#1a3a7c] border-none cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
