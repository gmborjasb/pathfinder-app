import { ConversationListItem } from "./ConversationListItem";

import { Button } from "@/components/ui/button";

interface ConversationItem {
  id: string;
  icon: string;
  title: string;
  timeLabel: string;
  active?: boolean;
}

interface ConversationsPanelProps {
  conversations: ConversationItem[];
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  variant?: "desktop" | "mobile";
}

export function ConversationsPanel({
  conversations,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  variant = "desktop",
}: ConversationsPanelProps) {
  const outerCls =
    variant === "mobile"
      ? "w-full flex flex-col gap-4 bg-slate-50 min-h-0 p-6 pb-0"
      : "w-[240px] shrink-0 hidden md:flex flex-col gap-4 bg-slate-50 border-r-4 border-slate-900 min-h-0 p-6 pb-0";

  return (
    <div className={outerCls}>
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-text-primary">
            forum
          </span>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wide">
            Conversaciones
          </h3>
        </div>
        <span className="w-fit px-2 py-1 bg-success-text/10 border-2 border-success-text rounded-none text-[10px] font-black text-success-text">
          ● En línea
        </span>
      </div>

      <Button
        onClick={onNewConversation}
        className="w-full py-3 h-auto bg-brand-blue border-3 border-slate-900 rounded-none shadow-[4px_4px_0px_0px_#0f172a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer text-[13px] font-black text-white uppercase tracking-wider shrink-0"
      >
        + Nueva Misión
      </Button>

      <div className="flex flex-col gap-2 overflow-y-auto min-h-0 flex-1 pb-6 scrollbar-none">
        {conversations.map((conv) => (
          <ConversationListItem
            key={conv.id}
            variant={conv.active ? "active" : "inactive"}
            icon={conv.icon}
            title={conv.title}
            timeLabel={conv.timeLabel}
            onClick={() => onSelectConversation(conv.id)}
            onDelete={() => onDeleteConversation(conv.id)}
          />
        ))}
      </div>
    </div>
  );
}
