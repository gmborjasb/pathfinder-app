export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

function buildSystemPrompt(
  profile: Record<string, unknown> | null,
  topBecas: { titulo?: string; title?: string; sponsor: string; afinidad_calculada?: number; affinity?: number; afinidad?: number }[],
): string {
  const pd = (profile?.perfil_detalles as Record<string, unknown>) || {};
  const name =
    ((profile?.nombres as string) || "").split(" ")[0] || "estudiante";
  const gpa =
    ((pd?.notas as Record<string, unknown>)?.gpa as string) ||
    "no especificado";
  const colegio = (pd?.tipo_colegio as string) || "no especificado";
  const sisfoh = (pd?.sisfoh as string) || "no especificado";
  const merito =
    (profile?.merito_academico as string) ||
    (pd?.merito_academico as string) ||
    "no especificado";
  const voluntariado =
    profile?.hace_voluntariado || pd?.hace_voluntariado ? "Sí" : "No";
  const deporte =
    profile?.es_deportista || pd?.es_deportista ? "Sí" : "No";
  const ingles =
    ((pd?.idiomas as Record<string, unknown>)?.nivelIngles as string) ||
    "no especificado";

  const becasText =
    topBecas
      ?.slice(0, 5)
      .map((b) => {
        const title = b.titulo || b.title;
        const affinity = b.afinidad_calculada ?? b.affinity ?? b.afinidad ?? 0;
        return `- ${title} (${b.sponsor}) - ${Math.round(Number(affinity))}% de afinidad`;
      })
      .join("\n") || "No hay becas destacadas disponibles en la base de datos.";

  return (
    `Eres Motibot, un asistente experto en becas peruanas, especializado en ayudar a estudiantes peruanos a encontrar y postular a becas de nuestra base de datos. Tu tono es amigable, motivador y práctico.` +
    `\n\n## Datos del estudiante\n` +
    `- Nombre: ${name}\n- GPA/Promedio: ${gpa}\n- Tipo de colegio: ${colegio}\n- SISFOH: ${sisfoh}\n- Mérito académico: ${merito}\n- Voluntariado: ${voluntariado}\n- Deportista: ${deporte}\n- Nivel de inglés: ${ingles}` +
    `\n\n## Becas recomendadas (Base de datos oficial)\n${becasText}` +
    `\n\n## Instrucciones Estrictas\n1. RESPONDE ÚNICAMENTE sobre las becas listadas arriba en "Becas recomendadas". NO inventes, no alucines, y no sugieras becas, entidades o fundaciones que no se encuentren en la lista de arriba.\n2. Sé breve y práctico: máximo 2-3 párrafos. Resalta la afinidad con la beca si es relevante.\n3. Si te preguntan por requisitos, usa la información del perfil para personalizar la respuesta.\n4. Usa **negritas** para resaltar información clave y algún emoji para ser amigable.\n5. NO inventes fechas, montos ni procesos que no conozcas con certeza.`
  );
}

async function sendToGroq(
  messages: { role: string; content: string }[],
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  if (!apiKey || apiKey === "gsk_..." || apiKey === "placeholder") return null;

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
        }),
      },
    );

    if (!res.ok) {
      console.warn("[ChatService] Groq responded", res.status);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn("[ChatService] Groq error:", err);
    return null;
  }
}

async function sendToOllama(
  messages: { role: string; content: string }[],
): Promise<string | null> {
  const ollamaUrl = localStorage.getItem("pathfinder_ollama_url");
  if (!ollamaUrl) return null;

  try {
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        messages,
        stream: false,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.message?.content || null;
  } catch {
    return null;
  }
}

function localFallback(text: string): string {
  const lower = text.toLowerCase();

  if (
    lower.includes("carta") ||
    lower.includes("ensayo") ||
    lower.includes("motivación") ||
    lower.includes("motivacion")
  ) {
    return (
      "¡Claro! Te ayudo con tu carta de motivación. 🎯\n\n" +
      "**Estructura recomendada:**\n" +
      "1. **Introducción:** Quién eres y a qué postulas\n" +
      "2. **Motivación personal:** Por qué mereces la beca\n" +
      "3. **Logros académicos:** Tus notas y méritos principales\n" +
      "4. **Proyección:** Cómo impactará la beca en tu futuro\n\n" +
      "¿Quieres que desarrollemos algún párrafo en particular?"
    );
  }

  if (
    lower.includes("entrevista") ||
    lower.includes("practicar") ||
    lower.includes("prácticar")
  ) {
    return (
      "¡Preparémonos para la entrevista! 🎤\n\n" +
      "**Preguntas frecuentes:**\n" +
      "1. ¿Por qué elegiste esta carrera?\n" +
      "2. ¿Cuáles son tus fortalezas y debilidades?\n" +
      "3. ¿Cómo te ves en 5 años?\n" +
      "4. ¿Por qué mereces esta beca?\n\n" +
      "¿Quieres practicar alguna pregunta en específico?"
    );
  }

  if (lower.includes("requisito") || lower.includes("documento")) {
    return (
      "**Documentos típicos para becas:** 📋\n\n" +
      "- DNI o carné de extranjería\n" +
      "- Constancia de estudios\n" +
      "- Ficha SISFOH vigente\n" +
      "- Carta de motivación\n" +
      "- Certificado de notas\n\n" +
      "¿Sobre qué beca en particular necesitas información?"
    );
  }

  if (
    lower.includes("carrera") ||
    lower.includes("profesión") ||
    lower.includes("profesion") ||
    lower.includes("estudiar")
  ) {
    return (
      "**Carreras con mayor demanda de becas:** 🎓\n\n" +
      "- Ingenierías (Software, Civil, Industrial)\n" +
      "- Ciencias de la Salud (Medicina, Enfermería)\n" +
      "- Educación y Pedagogía\n" +
      "- Administración y Negocios\n" +
      "- Ciencias Sociales\n\n" +
      "¿Te gustaría saber más sobre alguna carrera en específico?"
    );
  }

  return (
    "¡Hola! Soy Motibot 🤖, tu asistente para becas peruanas.\n\n" +
    "Puedo ayudarte con:\n" +
    "- ✅ **Revisar tu carta de motivación**\n" +
    "- ✅ **Practicar entrevistas**\n" +
    "- ✅ **Entender requisitos de becas**\n" +
    "- ✅ **Explorar carreras**\n\n" +
    "¿En qué te ayudo hoy?"
  );
}

export async function sendMessage(
  history: ChatMessage[],
  profile: Record<string, unknown> | null,
  topBecas: { titulo?: string; title?: string; sponsor: string; afinidad_calculada?: number; affinity?: number; afinidad?: number }[],
): Promise<string> {
  const systemMsg = {
    role: "system",
    content: buildSystemPrompt(profile, topBecas),
  };
  const apiMessages = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const groqResult = await sendToGroq([systemMsg, ...apiMessages]);
  if (groqResult) return groqResult;

  const ollamaResult = await sendToOllama([systemMsg, ...apiMessages]);
  if (ollamaResult) return ollamaResult;

  const lastUser =
    [...history].reverse().find((m) => m.role === "user")?.content || "";
  return localFallback(lastUser);
}
