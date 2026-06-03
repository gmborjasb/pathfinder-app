import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

let globalLocalFallback = false;

export default function Asesor() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState(() => {
    return localStorage.getItem("pathfinder_ollama_url") || "";
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };
    if (showHistoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistoryDropdown]);

  // Helper to generate the default welcome message
  const getWelcomeMessage = () => {
    const name = profile?.nombres ? profile.nombres.split(" ")[0] : "Marcelo";
    return {
      id: "welcome-" + Date.now(),
      sender: "ai" as const,
      text: `¡Hola ${name}! ¿En qué puedo ayudarte hoy? Tu asistente académico personalizado está listo para guiarte en tu camino a la universidad y tu postulación a la Beca 18.`,
      timestamp: new Date(),
    };
  };

  // Local storage sessions loader (fail-safe fallback)
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
            updated_at: new Date(s.updated_at)
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
    
    const newSessionId = "session-" + Date.now();
    const defaultSessions = [{
      id: newSessionId,
      usuario_id: user?.id || "anonymous",
      titulo: "Conversación Nueva",
      mensajes: [defaultWelcome],
      created_at: new Date(),
      updated_at: new Date()
    }];
    setSessions(defaultSessions);
    setCurrentSessionId(newSessionId);
    setMessages([defaultWelcome]);
    localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(defaultSessions));
  };

  // Load chat sessions from Supabase/localStorage
  const loadChatSessions = async () => {
    globalLocalFallback = false;
    const defaultWelcome = getWelcomeMessage();
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

    if (isMockMode || !user) {
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

      if (error) {
        console.error("Error loading chat sessions from Supabase, falling back to local storage:", error);
        globalLocalFallback = true;
        setUseLocalFallback(true);
        loadLocalSessions();
        return;
      }

      // Check if data is missing the 'id' or 'titulo' column (legacy single-session schema)
      if (data && data.length > 0 && (data[0].id === undefined || data[0].titulo === undefined)) {
        console.warn("Legacy Supabase chat_sesiones schema detected. Falling back to local storage for multi-session support.");
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
          updated_at: new Date(s.updated_at)
        }));
        setSessions(mapped);
        
        if (!currentSessionId) {
          setCurrentSessionId(mapped[0].id);
          setMessages(mapped[0].mensajes);
        } else {
          const active = mapped.find((s: any) => s.id === currentSessionId);
          if (active) {
            setMessages(active.mensajes);
          } else {
            setCurrentSessionId(mapped[0].id);
            setMessages(mapped[0].mensajes);
          }
        }
      } else {
        const newSessionId = crypto.randomUUID ? crypto.randomUUID() : "session-" + Date.now();
        const { data: inserted, error: insertErr } = await supabase
          .from("chat_sesiones")
          .insert({
            id: newSessionId,
            usuario_id: user.id,
            titulo: "Conversación Nueva",
            mensajes: [defaultWelcome]
          })
          .select("*")
          .single();

        if (insertErr) {
          console.error("Error creating default session in Supabase, falling back to local storage:", insertErr);
          globalLocalFallback = true;
          setUseLocalFallback(true);
          loadLocalSessions();
          return;
        }

        const newSession = {
          ...inserted,
          mensajes: [defaultWelcome],
          created_at: new Date(inserted.created_at),
          updated_at: new Date(inserted.updated_at)
        };
        setSessions([newSession]);
        setCurrentSessionId(inserted.id);
        setMessages([defaultWelcome]);
      }
    } catch (err) {
      console.error("Unexpected error loading chat sessions, falling back to local storage:", err);
      globalLocalFallback = true;
      setUseLocalFallback(true);
      loadLocalSessions();
    }
  };

  useEffect(() => {
    loadChatSessions();
  }, [user, profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const createNewSession = async () => {
    const defaultWelcome = getWelcomeMessage();
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    const newSessionId = crypto.randomUUID ? crypto.randomUUID() : "session-" + Date.now();

    if (isMockMode || !user || useLocalFallback || globalLocalFallback) {
      const newSession = {
        id: newSessionId,
        usuario_id: user?.id || "anonymous",
        titulo: "Conversación Nueva",
        mensajes: [defaultWelcome],
        created_at: new Date(),
        updated_at: new Date()
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      setCurrentSessionId(newSessionId);
      setMessages([defaultWelcome]);
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("chat_sesiones")
        .insert({
          id: newSessionId,
          usuario_id: user.id,
          titulo: "Conversación Nueva",
          mensajes: [defaultWelcome]
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error creating new session in Supabase, switching to local storage fallback:", error);
        globalLocalFallback = true;
        setUseLocalFallback(true);
        const newSession = {
          id: newSessionId,
          usuario_id: user.id,
          titulo: "Conversación Nueva",
          mensajes: [defaultWelcome],
          created_at: new Date(),
          updated_at: new Date()
        };
        const updated = [newSession, ...sessions];
        setSessions(updated);
        setCurrentSessionId(newSessionId);
        setMessages([defaultWelcome]);
        localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
        return;
      }

      const newSession = {
        ...data,
        mensajes: [defaultWelcome],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setSessions([newSession, ...sessions]);
      setCurrentSessionId(data.id);
      setMessages([defaultWelcome]);
    } catch (err) {
      console.error("Unexpected error creating new session:", err);
    }
  };

  const deleteSession = async (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    const updatedSessions = sessions.filter((s) => s.id !== idToDelete);

    if (isMockMode || !user || useLocalFallback || globalLocalFallback) {
      setSessions(updatedSessions);
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updatedSessions));
      if (currentSessionId === idToDelete) {
        if (updatedSessions.length > 0) {
          setCurrentSessionId(updatedSessions[0].id);
          setMessages(updatedSessions[0].mensajes);
        } else {
          setTimeout(() => createNewSession(), 100);
        }
      }
      return;
    }

    try {
      const { error } = await supabase
        .from("chat_sesiones")
        .delete()
        .eq("id", idToDelete);

      if (error) {
        console.error("Error deleting session in Supabase, switching to local storage fallback:", error);
        globalLocalFallback = true;
        setUseLocalFallback(true);
        setSessions(updatedSessions);
        localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updatedSessions));
        if (currentSessionId === idToDelete) {
          if (updatedSessions.length > 0) {
            setCurrentSessionId(updatedSessions[0].id);
            setMessages(updatedSessions[0].mensajes);
          } else {
            setTimeout(() => createNewSession(), 100);
          }
        }
        return;
      }

      setSessions(updatedSessions);
      if (currentSessionId === idToDelete) {
        if (updatedSessions.length > 0) {
          setCurrentSessionId(updatedSessions[0].id);
          setMessages(updatedSessions[0].mensajes);
        } else {
          setTimeout(() => createNewSession(), 100);
        }
      }
    } catch (err) {
      console.error("Unexpected error deleting session:", err);
    }
  };

  const selectSession = (id: string) => {
    const active = sessions.find((s) => s.id === id);
    if (active) {
      setCurrentSessionId(id);
      setMessages(active.mensajes);
    }
    setShowHistoryDropdown(false);
  };

  const saveChatSession = async (updatedMessages: Message[]) => {
    if (!currentSessionId) return;

    const activeSession = sessions.find((s) => s.id === currentSessionId);
    let newTitle = activeSession?.titulo || "Conversación Nueva";

    if (newTitle === "Conversación Nueva") {
      const firstUserMsg = updatedMessages.find((m) => m.sender === "user");
      if (firstUserMsg) {
        const words = firstUserMsg.text.split(" ");
        newTitle = words.slice(0, 4).join(" ");
        if (firstUserMsg.text.length > newTitle.length) {
          newTitle += "...";
        }
      }
    }

    const updated = sessions.map((s) => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          titulo: newTitle,
          mensajes: updatedMessages,
          updated_at: new Date()
        };
      }
      return s;
    });
    setSessions(updated);

    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");
    if (isMockMode || !user || useLocalFallback || globalLocalFallback) {
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from("chat_sesiones")
        .update({
          titulo: newTitle,
          mensajes: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentSessionId);

      if (error) {
        console.error("Error updating chat session messages in Supabase, switching to local storage fallback:", error);
        globalLocalFallback = true;
        setUseLocalFallback(true);
        localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Unexpected error saving messages:", err);
      globalLocalFallback = true;
      setUseLocalFallback(true);
      localStorage.setItem("pathfinder_chat_sessions", JSON.stringify(updated));
    }
  };

  const simulateAiResponseFallback = (userText: string, currentMessages: Message[]) => {
    setIsTyping(true);
    
    // Simulate thinking delay
    setTimeout(() => {
      const name = profile?.nombres ? profile.nombres.split(" ")[0] : "Marcelo";
      const textLower = userText.toLowerCase().trim();
      let aiText = "";

      if (textLower.includes("carta") || textLower.includes("motivacion") || textLower.includes("motivación") || textLower.includes("ensayo")) {
        aiText = `¡Por supuesto, ${name}! Una buena carta de motivación es clave para destacar. Por favor, copia y pega el borrador que tengas aquí. Analizaré su estructura, tono y me aseguraré de que resalte tus fortalezas académicas, liderazgo y por qué mereces la Beca 18. Si aún no la has empezado, dime y te daré una estructura paso a paso. 📝✨`;
      } else if (textLower.includes("entrevista") || textLower.includes("practicar") || textLower.includes("preguntas") || textLower.includes("simulacro")) {
        aiText = `¡Excelente iniciativa, ${name}! La preparación es fundamental. Hagamos un simulacro interactivo. Yo seré el evaluador de la beca y tú el postulante. Te haré preguntas una por una. ¿Lista/o? Empecemos con la primera:\n\n*¿Cómo piensas utilizar los conocimientos de tu carrera profesional para contribuir al desarrollo de tu comunidad una vez termines tus estudios?*\n\nTómate tu tiempo y respóndeme aquí. 🎓💪`;
      } else if (textLower.includes("requisito") || textLower.includes("documento") || textLower.includes("sinfoh") || textLower.includes("mochila") || textLower.includes("papel")) {
        aiText = `Hola ${name}, los requisitos principales para Beca 18 de PRONABEC son: \n1. Ser peruana/o de nacimiento. 🇵🇪\n2. Estar cursando o haber egresado del 5° de secundaria con alto rendimiento académico (tercio superior). 📚\n3. Clasificación de pobreza o pobreza extrema en el SISFOH (para la modalidad ordinaria). 🏠\n4. Constancia de ingreso a una universidad o instituto elegible.\n\n¿Tienes dudas específicas con respecto a alguno de estos puntos o la acreditación en tu mochila de documentos?`;
      } else if (textLower.includes("carrera") || textLower.includes("vocacion") || textLower.includes("vocación") || textLower.includes("estudiar")) {
        aiText = `¡Qué gran paso, ${name}! Con tu promedio actual de 18.5 GPA, tienes un perfil académico sobresaliente para postular a cualquier carrera universitaria. 🎓✨ Cuéntame un poco más: ¿cuáles son tus materias escolares favoritas y qué actividades te apasionan hacer en tu tiempo libre? Así podremos perfilar algunas opciones ideales para ti. 🚀`;
      } else {
        // Dynamic fallback that acknowledges what the user typed
        aiText = `¡Entendido, ${name}! He recibido tu mensaje: "${userText}". Estoy aquí para guiarte en tu postulación a la Beca 18. Como nos encontramos a solo 5 días del cierre de la convocatoria, te sugiero priorizar las tareas clave. ¿Te gustaría que revisemos tu carta de motivación o que verifiquemos los documentos de tu mochila? 🚀`;
      }

      const nextMessages: Message[] = [
        ...currentMessages,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiText,
          timestamp: new Date(),
        },
      ];
      setMessages(nextMessages);
      setIsTyping(false);
      saveChatSession(nextMessages);
    }, 1200);
  };

  const fetchOllamaResponse = async (userText: string, currentMessages: Message[]) => {
    setIsTyping(true);

    const savedUrl = localStorage.getItem("pathfinder_ollama_url") || "";
    if (!savedUrl) {
      simulateAiResponseFallback(userText, currentMessages);
      return;
    }

    // Clean URL to make sure it ends with /api/chat if it doesn't already
    let endpoint = savedUrl.trim();
    if (!endpoint.endsWith("/api/chat") && !endpoint.endsWith("/api/chat/")) {
      endpoint = endpoint.replace(/\/$/, "") + "/api/chat";
    }

    const name = profile?.nombres ? profile.nombres.split(" ")[0] : "Marcelo";
    const ollamaMessages = [
      {
        role: "system",
        content: `Eres Motibot, un mentor virtual y asistente motivacional diseñado exclusivamente para apoyar a la estudiante "${name}" en su postulación académica y de becas (especialmente Beca 18 de PRONABEC). Tu propósito es ser un guía inspirador que la ayude a mantener el enfoque, superar obstáculos y recordar por qué sus metas son importantes.

Datos de ${name}:
- Promedio académico: 18.5 GPA (sobresaliente, tercio superior) 📚.
- Meta global: Ingresar a la Universidad 🎓.
- Convocatoria prioritaria: Beca 18 (Convocatoria 2026) 🚀.
- Estado actual de documentos: Faltan firmar las declaraciones juradas de sus padres y subir su certificado de inglés.

Reglas obligatorias de comportamiento:
1. Tono y Lenguaje: Usa un lenguaje cercano, empático y muy alentador 💪. No hables de forma rígida, sino como un mentor joven y sabio que entiende las presiones escolares ✨.
2. Uso de Emojis: ¡Es obligatorio! Usa emojis que transmitan energía positiva y estudio (🚀, 📚, ✨, 💪, 🎓) en cada mensaje para que sea atractivo visualmente.
3. Enfoque en Metas: Siempre recuérdale su capacidad y dale pequeños consejos prácticos o frases motivadoras para su postulación a Beca 18.
4. Restricción de Contenido: No respondas preguntas fuera de estudios, motivación, gestión de tiempo o bienestar estudiantil. Redirige amablemente hacia sus metas.
5. Identidad: Actúa siempre como Motibot, el compañero de Pathfinder que nunca deja que se rinda.`,
      },
      ...currentMessages.map((msg) => ({
        role: (msg.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.text,
      })),
      {
        role: "user",
        content: userText,
      },
    ];

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:3b", // Align with the model from the user's Colab
          messages: ollamaMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Ollama server returned an error");
      }

      const data = await response.json();
      const aiText = data.message?.content || "No pude obtener una respuesta de mi núcleo local.";

      const nextMessages: Message[] = [
        ...currentMessages,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiText,
          timestamp: new Date(),
        },
      ];

      setMessages(nextMessages);
      setIsTyping(false);
      saveChatSession(nextMessages);
    } catch (error) {
      console.warn("Ollama remote server not available, falling back to mock response.", error);
      simulateAiResponseFallback(userText, currentMessages);
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    };

    // Save user message and clear input
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue("");
    saveChatSession(updatedMessages);

    // Intentar responder usando la URL de Ollama o caer en la simulación dinámica
    fetchOllamaResponse(text, updatedMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const quickActions = [
    {
      title: "Revisar mi carta de motivación",
      desc: "Mejora el impacto y la gramática de tus ensayos.",
      icon: "description",
    },
    {
      title: "Practicar para mi entrevista personal",
      desc: "Simula preguntas reales de becas y universidades.",
      icon: "record_voice_over",
    },
    {
      title: "Entender un requisito o documento",
      desc: "Resuelve tus dudas sobre trámites legales o académicos.",
      icon: "help_center",
    },
    {
      title: "Explorar opciones de carreras",
      desc: "Descubre qué estudiar basado en tu perfil actual.",
      icon: "explore",
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] min-h-[550px] overflow-hidden">
      {/* Left Panel: Contexto Activo */}
      <aside className="w-full lg:w-72 bg-[#f1f5f9] border border-[#e2e8f0] p-4 rounded-[16px] flex flex-col gap-4 shrink-0 overflow-y-auto no-scrollbar">
        <div>
          <h2 className="t-label text-[#0F2554] mb-2">
            Tu Contexto Activo
          </h2>
          <div className="flex flex-col gap-2">
            {/* Context Card 1 */}
            <div className="bg-white p-3 rounded-[12px] border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-[#e8eef8] rounded-[8px] text-[#1a3a7c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] font-fill">school</span>
                </div>
                <div>
                  <p className="t-xs bold">Meta</p>
                  <p className="t-sm bold text-[#0F2554] leading-tight">
                    Ingresar a la Universidad
                  </p>
                </div>
              </div>
            </div>
            {/* Context Card 2 */}
            <div className="bg-white p-3 rounded-[12px] border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-[#fef3c7] rounded-[8px] text-[#92400e] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                </div>
                <div>
                  <p className="t-xs bold">Pipeline</p>
                  <p className="t-sm bold text-[#92400e] leading-tight">
                    Beca 18
                  </p>
                </div>
              </div>
            </div>
            {/* Context Card 3 */}
            <div className="bg-white p-3 rounded-[12px] border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-[#dcfce7] rounded-[8px] text-[#166534] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </div>
                <div>
                  <p className="t-xs bold">Promedio</p>
                  <p className="t-sm bold text-[#166534] leading-tight">
                    18.5 GPA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion Mini Card */}
        <div className="mt-auto bg-[#0F2554] p-4 rounded-[16px] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform scale-150 pointer-events-none">
            <span className="material-symbols-outlined text-6xl">lightbulb</span>
          </div>
          <p className="t-sm bold text-white mb-1">Tip de IA:</p>
          <p className="t-xs text-white/90 leading-relaxed">
            Faltan 5 días para el cierre de la convocatoria de Beca 18. ¿Quieres revisar tu ensayo hoy?
          </p>
          <button 
            onClick={() => handleSend("Revisar mi ensayo hoy")}
            className="mt-3 w-full bg-white text-[#0F2554] py-1.5 rounded-[8px] t-xs bold hover:bg-[#e8eef8] hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          >
            Priorizar Ensayo
          </button>
        </div>
      </aside>

      {/* Right Area: Chat Window */}
      <section className="flex-1 bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <header className="sticky top-0 w-full h-14 border-b border-[#e2e8f0] flex items-center justify-between px-4 bg-white/90 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#166534] rounded-full animate-pulse"></div>
            <p className="t-base bold text-[#0F2554]">Asesor IA Pathfinder</p>
          </div>
          <div ref={dropdownRef} className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className={`p-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-full transition-colors bg-transparent border-none cursor-pointer ${showHistoryDropdown ? "bg-[#e8eef8] text-[#1a3a7c]" : ""}`}
              title="Historial de Chats"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
            </button>

            {/* Dropdown de Historial de Chats */}
            {showHistoryDropdown && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-[#e2e8f0] rounded-[16px] shadow-xl z-20 overflow-hidden">
                <div className="p-3 border-b border-[#e2e8f0] bg-[#f1f5f9] flex justify-between items-center">
                  <span className="t-label text-[#0F2554]">Tus Chats</span>
                  <button 
                    onClick={createNewSession}
                    className="flex items-center gap-1 t-xs bold text-[#1a3a7c] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Crear nuevo chat
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto no-scrollbar divide-y divide-[#e2e8f0]">
                  {sessions.length === 0 ? (
                    <div className="p-3 text-center t-xs">
                      No tienes chats activos.
                    </div>
                  ) : (
                    sessions.map((s) => (
                      <div 
                        key={s.id}
                        onClick={() => selectSession(s.id)}
                        className={`flex items-center justify-between p-3 hover:bg-[#f1f5f9] cursor-pointer transition-colors border-none bg-transparent ${s.id === currentSessionId ? "bg-[#e8eef8] bold text-[#1a3a7c]" : "text-[#0F2554]"}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                            chat_bubble
                          </span>
                          <span className="t-xs text-[#0F2554] truncate">{s.titulo}</span>
                        </div>
                        <button 
                          onClick={(e) => deleteSession(s.id, e)}
                          className="text-[#64748b] hover:text-[#991b1b] transition-colors p-1 flex items-center justify-center shrink-0 bg-transparent border-none cursor-pointer"
                          title="Eliminar chat"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-full transition-colors bg-transparent border-none cursor-pointer"
              title="Configuración del Asesor"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </button>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar bg-[#f1f5f9]/30">
          {messages.length === 1 && (
            /* Welcome Content (only shows when there's only the welcome message) */
            <div className="max-w-5xl w-full mx-auto flex flex-col items-center justify-center my-auto py-8">
              <div className="mb-4 text-center">
                <div className="w-12 h-12 bg-[#e8eef8] rounded-[12px] flex items-center justify-center mb-3 mx-auto border border-[#e2e8f0]">
                  <span className="material-symbols-outlined text-[28px] text-[#1a3a7c]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    psychology
                  </span>
                </div>
                <h1 className="t-lg bold text-[#0F2554] mb-1 px-4 text-center">
                  ¡Hola {profile?.nombres ? profile.nombres.split(" ")[0] : "Camila"}! ¿En qué puedo ayudarte hoy?
                </h1>
                <p className="t-sm text-center">
                  Tu asistente académico personalizado está listo.
                </p>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full px-2 mt-4">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action.title)}
                    className="flex flex-col gap-1.5 p-4 bg-white border border-[#e2e8f0] rounded-[16px] text-left hover:border-[#1a3a7c] hover:bg-[#e8eef8]/50 transition-all group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#1a3a7c] text-[20px] group-hover:scale-110 transition-transform">
                      {action.icon}
                    </span>
                    <div>
                      <p className="t-sm bold text-[#0F2554] group-hover:text-[#1a3a7c] transition-colors">
                        {action.title}
                      </p>
                      <p className="t-xs mt-1 leading-snug">
                        {action.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 1 && (
            /* Chat messages list */
            <div className="w-full flex flex-col gap-3 px-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 max-w-[80%] ${
                    message.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] bold ${
                      message.sender === "user" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#e8eef8] text-[#1a3a7c]"
                    }`}
                  >
                    {message.sender === "user" ? "C" : "IA"}
                  </div>
                  {/* Bubble */}
                  <div
                    className={`p-3 rounded-[12px] shadow-sm leading-relaxed t-base whitespace-pre-line ${
                      message.sender === "user"
                        ? "bg-[#e8eef8] text-[#0F2554] rounded-tr-none"
                        : "bg-white border border-[#e2e8f0] text-[#0F2554] rounded-tl-none"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 self-start max-w-[80%] items-center">
                  <div className="w-7 h-7 rounded-full bg-[#e8eef8] text-[#1a3a7c] shrink-0 flex items-center justify-center text-[10px] bold">
                    IA
                  </div>
                  <div className="bg-white border border-[#e2e8f0] p-3 rounded-[12px] rounded-tl-none shadow-sm flex items-center gap-1.5 py-2.5">
                    <span className="w-1.5 h-1.5 bg-[#1a3a7c] rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-[#1a3a7c] rounded-full animate-bounce delay-200"></span>
                    <span className="w-1.5 h-1.5 bg-[#1a3a7c] rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Input Area */}
        <div className="p-4 bg-white border-t border-[#e2e8f0] shrink-0">
          {/* Suggestion Chips */}
          {messages.length > 1 && (
            <div className="w-full mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action.title)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#f1f5f9] border border-[#e2e8f0] rounded-full t-xs bold text-[#64748b] hover:text-[#1a3a7c] hover:border-[#1a3a7c]/30 hover:bg-[#e8eef8] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#1a3a7c] text-[14px]">
                    {action.icon}
                  </span>
                  <span>{action.title}</span>
                </button>
              ))}
            </div>
          )}

          <div className="w-full flex items-end gap-3 px-4">
            <div className="flex-1 bg-[#f1f5f9] rounded-[12px] border border-[#e2e8f0] flex items-center px-3 py-1 gap-2 focus-within:border-[#1a3a7c] transition-all shadow-sm">
              <button className="text-[#64748b] hover:text-[#1a3a7c] transition-colors p-1 bg-transparent border-none cursor-pointer flex items-center">
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none focus:ring-0 t-base placeholder:text-[#94a3b8] resize-none py-1 outline-none max-h-24 min-h-[20px] text-[#0F2554]"
                placeholder="Pregúntame sobre tus trámites, becas o pídeme ayuda para tus ensayos..."
                rows={1}
              />
              <button className="text-[#64748b] hover:text-[#1a3a7c] transition-colors p-1 bg-transparent border-none cursor-pointer flex items-center">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
            <button
              onClick={() => handleSend(inputValue)}
              className="bg-[#0F2554] text-white w-9 h-9 rounded-[8px] flex items-center justify-center shadow-md hover:bg-[#1a3a7c] active:scale-95 transition-all shrink-0 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
          <div className="mt-2 text-center">
            <p className="t-xs uppercase tracking-[0.15em] text-[#94a3b8] font-medium">
              La IA puede cometer errores. Por favor, verifica la información crítica.
            </p>
          </div>
        </div>
      </section>

      {/* Settings Modal overlay */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6 max-w-md w-full shadow-2xl space-y-4 text-[#0F2554]">
            <div className="flex justify-between items-center">
              <h3 className="t-md bold text-[#0F2554]">Configuración del Asesor IA</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-[#64748b] hover:text-[#0F2554] bg-transparent border-none cursor-pointer"
              >
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
                placeholder="https://tu-url-de-ngrok-o-cloudflare.trycloudflare.com"
                className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
              />
              <p className="t-xs leading-relaxed text-[#64748b]">
                Ingresa la URL pública generada por tu túnel de Cloudflare, ngrok o localtunnel conectado a Ollama. Dejar en blanco para usar respuestas simuladas locales.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn-sub px-3 py-1.5 hover:scale-105 active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("pathfinder_ollama_url", ollamaUrl.trim());
                  setShowSettingsModal(false);
                }}
                className="bg-[#0F2554] text-white px-3 py-1.5 rounded-[8px] t-xs bold hover:bg-[#1a3a7c] shadow-md hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
