import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage, ChatSession } from "../services/chatService";
import { sendMessage as sendToAI } from "../services/chatService";

const STORAGE_KEY = "pathfinder_chat_sessions";

function generateId(): string {
  return crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function autoTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Nueva conversación";
  const words = first.content.trim().split(/\s+/).slice(0, 5);
  return words.join(" ") + (first.content.trim().split(/\s+/).length > 5 ? "..." : "");
}

interface UseChatReturn {
  conversations: ChatSession[];
  activeConversationId: string | null;
  activeConversation: ChatSession | undefined;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  createConversation: () => string;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  getRelativeTime: (dateStr: string) => string;
}

export function useChat(
  profile: Record<string, unknown> | null,
  topBecas: { titulo?: string; title?: string; sponsor: string; afinidad_calculada?: number; affinity?: number; afinidad?: number }[],
): UseChatReturn {
  const [conversations, setConversations] = useState<ChatSession[]>(() => loadSessions());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  // Persist on change
  useEffect(() => {
    saveSessions(conversations);
  }, [conversations]);

  // Auto-create first conversation
  useEffect(() => {
    if (conversations.length === 0) {
      const id = generateId();
      const now = new Date().toISOString();
      const session: ChatSession = {
        id,
        title: "Nueva conversación",
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      setConversations([session]);
      setActiveConversationId(id);
    } else if (!activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const createConversation = useCallback(() => {
    const id = generateId();
    const now = new Date().toISOString();
    const session: ChatSession = {
      id,
      title: "Nueva conversación",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => [session, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (updated.length === 0) {
        const now = new Date().toISOString();
        const newSession: ChatSession = {
          id: generateId(),
          title: "Nueva conversación",
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        return [newSession];
      }
      return updated;
    });
    setActiveConversationId((prev) => prev === id ? null : prev);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);

      let targetId = activeConversationId;
      if (!targetId) {
        targetId = createConversation();
      }

      const userMsg: ChatMessage = { role: "user", content: text.trim() };

      setConversations((prev) => {
        let updated = [...prev];
        const idx = updated.findIndex((c) => c.id === targetId);

        if (idx === -1) {
          // Conversation was deleted, create new
          const now = new Date().toISOString();
          updated.unshift({
            id: targetId!,
            title: "Nueva conversación",
            messages: [userMsg],
            createdAt: now,
            updatedAt: now,
          });
        } else {
          const conv = { ...updated[idx] };
          conv.messages = [...conv.messages, userMsg];
          conv.updatedAt = new Date().toISOString();
          if (conv.title === "Nueva conversación" || conv.messages.length === 1) {
            conv.title = autoTitle(conv.messages);
          }
          updated = [...updated];
          updated[idx] = conv;
        }
        return updated;
      });

      // Get updated conversation for API call
      let msgs: ChatMessage[] = [];
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === targetId);
        msgs = conv?.messages ?? [];
        return prev; // don't change state in this pass
      });

      // slight delay to let state propagate
      await new Promise((r) => setTimeout(r, 50));

      try {
        const reply = await sendToAI(msgs, profile, topBecas);

        const aiMsg: ChatMessage = { role: "assistant", content: reply };

        setConversations((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((c) => c.id === targetId);
          if (idx !== -1) {
            const conv = { ...updated[idx] };
            conv.messages = [...conv.messages, aiMsg];
            conv.updatedAt = new Date().toISOString();
            updated[idx] = conv;
          }
          return updated;
        });
      } catch {
        const errMsg: ChatMessage = {
          role: "assistant",
          content: "Lo siento, ocurrió un error. Por favor intenta de nuevo.",
        };
        setConversations((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((c) => c.id === targetId);
          if (idx !== -1) {
            const conv = { ...updated[idx] };
            conv.messages = [...conv.messages, errMsg];
            conv.updatedAt = new Date().toISOString();
            updated[idx] = conv;
          }
          return updated;
        });
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    },
    [activeConversationId, createConversation, profile, topBecas],
  );

  return {
    conversations,
    activeConversationId,
    activeConversation,
    isLoading,
    sendMessage,
    createConversation,
    switchConversation,
    deleteConversation,
    getRelativeTime,
  };
}
