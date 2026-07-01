import { useMemo, useRef, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";
import { ConversationsPanel } from "../components/asesor/ConversationsPanel";
import { ChatContextBanner } from "../components/asesor/ChatContextBanner";
import { WelcomeBubble } from "../components/asesor/WelcomeBubble";
import { ChatBubbleAI } from "../components/asesor/ChatBubbleAI";
import { ChatBubbleUser } from "../components/asesor/ChatBubbleUser";
import { QuickActionPill } from "../components/asesor/QuickActionPill";
import { ChatInputBar } from "../components/asesor/ChatInputBar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Asesor() {
  const { profile } = useAuth();

  const topBecas = useMemo(() => [], []);

  const {
    conversations,
    activeConversationId,
    activeConversation,
    isLoading,
    sendMessage,
    createConversation,
    switchConversation,
    deleteConversation,
    getRelativeTime,
  } = useChat(profile as Record<string, unknown> | null, topBecas);

  const messages = activeConversation?.messages ?? [];
  const userName = ((profile?.nombres as string) || "Alex").split(" ")[0];

  const [isConversationsOpen, setIsConversationsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const conversationItems = useMemo(
    () =>
      conversations.map((c) => ({
        id: c.id,
        icon: c.messages.length === 0 ? "smart_toy" : "chat",
        title: c.title,
        timeLabel: getRelativeTime(c.updatedAt),
        active: c.id === activeConversationId,
      })),
    [conversations, activeConversationId, getRelativeTime],
  );

  return (
    <div className="flex w-full flex-1 min-h-0 border-3 border-slate-900 rounded-none overflow-hidden shadow-[8px_8px_0px_0px_#0f172a] bg-white">
      {/* ── Columna A: Conversaciones ─────────────────────────────────────── */}
      <ConversationsPanel
        conversations={conversationItems}
        onNewConversation={createConversation}
        onSelectConversation={switchConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* ── Columna B: Chat ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-bg-base min-w-0 min-h-0">
        <div className="relative">
          <ChatContextBanner text="🎯 Asistente Motibot · Becas peruanas" />
          <button
            onClick={() => setIsConversationsOpen(true)}
            className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 text-white"
            title="Ver conversaciones"
          >
            <span className="material-symbols-outlined text-xl">forum</span>
          </button>
        </div>

        <Sheet open={isConversationsOpen} onOpenChange={setIsConversationsOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Conversaciones</SheetTitle>
            </SheetHeader>
            <ConversationsPanel
              variant="mobile"
              conversations={conversationItems}
              onNewConversation={() => {
                createConversation();
                setIsConversationsOpen(false);
              }}
              onSelectConversation={(id) => {
                switchConversation(id);
                setIsConversationsOpen(false);
              }}
              onDeleteConversation={deleteConversation}
            />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col gap-2 p-3 md:p-4 overflow-y-auto min-h-0 scrollbar-none">
          {messages.length === 0 ? (
            <WelcomeBubble
              avatarInitial={userName.charAt(0).toUpperCase()}
              statusLabel="Motibot Ready"
              message={`¡Hola ${userName}! Soy Motibot 🤖, tu asistente para becas peruanas. ¿En qué te ayudo hoy?`}
            />
          ) : (
            messages.map((msg, idx) =>
              msg.role === "user" ? (
                <div key={idx} className="flex justify-end">
                  <ChatBubbleUser message={msg.content} />
                </div>
              ) : (
                <ChatBubbleAI
                  key={idx}
                  senderLabel="Motibot"
                  message={msg.content}
                />
              ),
            )
          )}

          {isLoading && (
            <div className="flex gap-2 px-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-col gap-2 p-3 md:p-4">
          <div className="flex gap-2 [&>button]:flex-1 [&>button]:min-w-0">
            <QuickActionPill
              icon="edit"
              label="Revisar carta"
              onClick={() => sendMessage("Necesito ayuda con mi carta de motivación")}
            />
            <QuickActionPill
              icon="mic"
              label="Entrevista"
              onClick={() => sendMessage("Ayúdame a practicar para una entrevista")}
            />
            <QuickActionPill
              icon="description"
              label="Requisitos"
              onClick={() => sendMessage("¿Qué requisitos necesito para postular a una beca?")}
            />
          </div>

          <ChatInputBar
            placeholder="Escribe tu mensaje aquí..."
            disclaimer="Motibot puede cometer errores. Verifica siempre los requisitos oficiales."
            onSend={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
