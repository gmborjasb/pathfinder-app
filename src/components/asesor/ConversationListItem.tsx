import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ConversationListItemProps {
  variant: "active" | "inactive";
  icon: string;
  title: string;
  timeLabel: string;
  onClick: () => void;
  onDelete: () => void;
}

export function ConversationListItem({
  variant,
  icon,
  title,
  timeLabel,
  onClick,
  onDelete,
}: ConversationListItemProps) {
  const isActive = variant === "active";
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 p-3 rounded-none border-3 border-slate-900 cursor-pointer transition-all ${
        isActive
          ? "bg-brand-blue text-white shadow-none translate-x-1 translate-y-1"
          : "bg-white text-text-primary shadow-[4px_4px_0px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0f172a]"
      }`}
    >
      <span
        className={`material-symbols-outlined text-base shrink-0 ${
          isActive ? "text-white" : "text-slate-400"
        }`}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className={`text-xs font-black truncate ${
            isActive ? "text-white" : "text-text-secondary"
          }`}
        >
          {title}
        </span>
        <span className={`text-[10px] font-bold ${isActive ? "text-blue-200" : "text-slate-400"}`}>
          {timeLabel}
        </span>
      </div>
      <div className="relative shrink-0">
        <Button
          variant="noShadow"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`p-1 h-auto bg-transparent border-0 rounded-none transition-colors ${
            isActive ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 text-slate-400"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            more_vert
          </span>
        </Button>
        {showMenu && (
          <div className="absolute right-0 top-8 z-10 bg-white border-3 border-slate-900 rounded-none shadow-[3px_3px_0px_0px_#0f172a] overflow-hidden min-w-[130px]">
            <Button
              variant="noShadow"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="w-full h-auto flex items-center justify-start gap-2 px-3 py-2 bg-transparent border-0 hover:bg-danger-bg text-xs font-bold text-danger-text rounded-none transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Eliminar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
