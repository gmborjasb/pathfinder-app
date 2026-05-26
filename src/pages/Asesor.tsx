import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function Asesor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "¡Hola Camila! ¿En qué puedo ayudarte hoy? Tu asistente académico personalizado está listo para guiarte en tu camino a la universidad y tu postulación a la Beca 18.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateAiResponseFallback = (userText: string) => {
    setIsTyping(true);
    
    // Simulate thinking delay
    setTimeout(() => {
      let aiText = "";
      const textLower = userText.toLowerCase();

      if (textLower.includes("carta") || textLower.includes("motivacion") || textLower.includes("motivación")) {
        aiText = "¡Por supuesto, Camila! Una buena carta de motivación es clave. Por favor, copia y pega el borrador que tengas aquí. Analizaré su estructura, tono y me aseguraré de que resalte tus fortalezas académicas, liderazgo y por qué mereces la Beca 18. Si aún no la has empezado, dime y te daré una estructura paso a paso.";
      } else if (textLower.includes("entrevista") || textLower.includes("practicar")) {
        aiText = "¡Excelente iniciativa! La preparación es fundamental. Hagamos un simulacro. Yo seré el evaluador de la beca. Te haré preguntas y tú respondes. ¿Lista? Empecemos con esta:\n\n*¿Cómo piensas utilizar los conocimientos de tu carrera profesional para contribuir al desarrollo de tu comunidad una vez termines tus estudios?*\n\nTómate tu tiempo y respóndeme aquí.";
      } else if (textLower.includes("requisito") || textLower.includes("documento") || textLower.includes("sinfoh")) {
        aiText = "Los requisitos principales para Beca 18 de PRONABEC son: \n1. Ser peruano de nacimiento.\n2. Estar cursando o haber egresado del 5° de secundaria con alto rendimiento académico (tercio superior).\n3. Clasificación de pobreza o pobreza extrema en el SISFOH (para la modalidad ordinaria).\n4. Constancia de ingreso a una universidad o instituto elegible.\n\n¿Tienes dudas específicas con respecto a alguno de estos puntos o la acreditación en tu portal?";
      } else if (textLower.includes("carrera") || textLower.includes("vocacion") || textLower.includes("vocación")) {
        aiText = "¡Qué gran paso! Con tu promedio actual de 18.5 GPA, tienes un perfil académico sobresaliente para postular a cualquier carrera. Cuéntame un poco más: ¿cuáles son tus materias escolares favoritas y qué actividades te apasionan hacer en tu tiempo libre? Así podremos perfilar algunas opciones ideales para ti.";
      } else {
        aiText = "¡Entendido, Camila! Estoy procesando tu consulta sobre tu postulación a la Beca 18. Como faltan solo 5 días para el cierre, te sugiero que revisemos con prioridad los documentos pendientes o tu ensayo de postulación. ¿Quieres que veamos el ensayo de motivación o la mochila de documentos?";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiText,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const fetchOllamaResponse = async (userText: string, currentMessages: Message[]) => {
    setIsTyping(true);

    const ollamaMessages = [
      {
        role: "system",
        content: `Eres Motibot, un mentor virtual y asistente motivacional diseñado exclusivamente para apoyar a la estudiante "Camila" en su postulación académica y de becas (especialmente Beca 18 de PRONABEC). Tu propósito es ser un guía inspirador que la ayude a mantener el enfoque, superar obstáculos y recordar por qué sus metas son importantes.

Datos de Camila:
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
      const response = await fetch("https://lynn-capture-worcester-printers.trycloudflare.com/api/chat", {
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
        throw new Error("Local Ollama server returned an error");
      }

      const data = await response.json();
      const aiText = data.message?.content || "No pude obtener una respuesta de mi núcleo local.";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiText,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.warn("Ollama local no disponible o error de CORS, recurriendo a simulación mock.", error);
      simulateAiResponseFallback(userText);
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

    // Try calling Ollama locally with history, fall back to mock if offline
    fetchOllamaResponse(text, messages);
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
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-lg h-[calc(100vh-140px)] min-h-[550px] overflow-hidden">
      {/* Left Panel: Contexto Activo */}
      <aside className="w-full lg:w-72 bg-surface-container-low border border-border-subtle p-md lg:p-lg rounded-2xl flex flex-col gap-md lg:gap-lg shrink-0 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-label-caps text-primary uppercase font-bold tracking-wider mb-sm">
            Tu Contexto Activo
          </h2>
          <div className="flex flex-col gap-sm">
            {/* Context Card 1 */}
            <div className="bg-surface p-md rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-sm">
                <div className="p-2 bg-primary-fixed rounded-lg text-primary">
                  <span className="material-symbols-outlined text-[20px] font-fill">school</span>
                </div>
                <div>
                  <p className="text-[12px] text-muted-slate font-semibold">Meta</p>
                  <p className="font-body-bold text-sm text-primary leading-tight">
                    Ingresar a la Universidad
                  </p>
                </div>
              </div>
            </div>
            {/* Context Card 2 */}
            <div className="bg-surface p-md rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-sm">
                <div className="p-2 bg-secondary-fixed rounded-lg text-secondary">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div>
                  <p className="text-[12px] text-muted-slate font-semibold">Pipeline</p>
                  <p className="font-body-bold text-sm text-secondary leading-tight">
                    Beca 18
                  </p>
                </div>
              </div>
            </div>
            {/* Context Card 3 */}
            <div className="bg-surface p-md rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-sm">
                <div className="p-2 bg-tertiary-fixed rounded-lg text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                </div>
                <div>
                  <p className="text-[12px] text-muted-slate font-semibold">Promedio</p>
                  <p className="font-body-bold text-sm text-tertiary leading-tight">
                    18.5 GPA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion Mini Card */}
        <div className="mt-auto bg-primary-container p-md rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform scale-150">
            <span className="material-symbols-outlined text-6xl">lightbulb</span>
          </div>
          <p className="text-body-sm font-bold mb-xs">Tip de IA:</p>
          <p className="text-[12px] opacity-90 leading-relaxed">
            Faltan 5 días para el cierre de la convocatoria de Beca 18. ¿Quieres revisar tu ensayo hoy?
          </p>
          <button 
            onClick={() => handleSend("Revisar mi ensayo hoy")}
            className="mt-md w-full bg-white text-primary py-2 rounded-xl text-body-sm font-bold hover:bg-surface-dim hover:scale-105 active:scale-95 transition-all shadow"
          >
            Priorizar Ensayo
          </button>
        </div>
      </aside>

      {/* Right Area: Chat Window */}
      <section className="flex-1 bg-surface border border-border-subtle rounded-2xl flex flex-col overflow-hidden shadow-sm relative">
        {/* Chat Header */}
        <header className="sticky top-0 w-full h-16 border-b border-border-subtle flex items-center justify-between px-md lg:px-lg bg-surface/90 backdrop-blur z-10">
          <div className="flex items-center gap-sm">
            <div className="w-2.5 h-2.5 bg-tertiary rounded-full animate-pulse"></div>
            <p className="font-body-bold text-primary text-sm lg:text-base">Asesor IA Pathfinder</p>
          </div>
          <div className="flex items-center gap-sm">
            <button className="p-2 text-muted-slate hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </button>
            <button className="p-2 text-muted-slate hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-md lg:p-lg flex flex-col gap-md custom-scrollbar bg-slate-50/50">
          {messages.length === 1 && (
            /* Welcome Content (only shows when there's only the welcome message) */
            <div className="max-w-3xl w-full mx-auto flex flex-col items-center justify-center my-auto py-8">
              <div className="mb-lg text-center">
                <div className="w-16 h-16 bg-primary-fixed-dim rounded-2xl flex items-center justify-center mb-md mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    psychology
                  </span>
                </div>
                <h1 className="text-headline-md font-headline-md text-on-surface mb-xs px-4">
                  ¡Hola Camila! ¿En qué puedo ayudarte hoy?
                </h1>
                <p className="text-muted-slate text-sm lg:text-base">
                  Tu asistente académico personalizado está listo.
                </p>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md w-full px-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action.title)}
                    className="flex flex-col gap-xs p-md lg:p-lg bg-surface border border-border-subtle rounded-2xl text-left hover:border-primary hover:bg-surface-container-low transition-all group shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                      {action.icon}
                    </span>
                    <div>
                      <p className="font-body-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {action.title}
                      </p>
                      <p className="text-[12px] text-muted-slate mt-1 leading-snug">
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
            <div className="max-w-4xl w-full mx-auto flex flex-col gap-md">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-sm max-w-[85%] ${
                    message.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-[12px] font-bold ${
                      message.sender === "user" ? "bg-secondary-container text-on-secondary-container" : "bg-primary"
                    }`}
                  >
                    {message.sender === "user" ? "C" : "IA"}
                  </div>
                  {/* Bubble */}
                  <div
                    className={`p-md rounded-2xl shadow-sm leading-relaxed text-sm whitespace-pre-line ${
                      message.sender === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-surface border border-border-subtle text-on-surface rounded-tl-none"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-sm self-start max-w-[85%] items-center">
                  <div className="w-8 h-8 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-[12px] font-bold">
                    IA
                  </div>
                  <div className="bg-surface border border-border-subtle p-md rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 py-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Input Area */}
        <div className="p-md lg:p-lg bg-surface border-t border-border-subtle shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-md">
            <div className="flex-1 bg-surface-container-low rounded-2xl border border-border-subtle flex items-center px-md py-2 gap-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
              <button className="text-muted-slate hover:text-primary transition-colors p-1">
                <span className="material-symbols-outlined text-[22px]">attach_file</span>
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-muted-slate resize-none py-1.5 outline-none font-body-base max-h-24 min-h-[28px]"
                placeholder="Pregúntame sobre tus trámites, becas o pídeme ayuda para tus ensayos..."
                rows={1}
              />
              <button className="text-muted-slate hover:text-primary transition-colors p-1">
                <span className="material-symbols-outlined text-[22px]">mic</span>
              </button>
            </div>
            <button
              onClick={() => handleSend(inputValue)}
              className="bg-primary text-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-md hover:bg-primary-container active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
          <div className="mt-xs text-center">
            <p className="text-[9px] text-muted-slate font-medium uppercase tracking-[0.1em]">
              La IA puede cometer errores. Por favor, verifica la información crítica.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
