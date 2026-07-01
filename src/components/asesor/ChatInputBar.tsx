import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputBarProps {
  placeholder: string;
  disclaimer: string;
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInputBar({
  placeholder,
  disclaimer,
  onSend,
  isLoading,
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-4">
      <div className="w-full flex items-end gap-2 sm:gap-4">
        <div className="flex-1 min-w-0 flex items-end gap-2 sm:gap-3 py-2.5 sm:py-3 px-3 sm:px-5 bg-white border-4 border-slate-900 rounded-none shadow-[6px_6px_0px_0px_#0f172a]">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustHeight(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 text-[16px] font-black text-slate-900 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none placeholder:text-slate-400 leading-relaxed py-1 min-h-[28px] max-h-[140px]"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="noShadow"
            size="icon"
            className="shrink-0 bg-transparent border-0 hover:bg-slate-100 rounded-none transition-colors text-slate-500"
            title="Adjuntar archivo"
          >
            <span className="material-symbols-outlined text-2xl">
              attach_file
            </span>
          </Button>
        </div>
        <Button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          className="shrink-0 w-12 h-12 sm:w-[64px] sm:h-[64px] bg-brand-coral border-4 border-slate-900 rounded-none shadow-[6px_6px_0px_0px_#0f172a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[22px] sm:text-[32px]">
            send
          </span>
        </Button>
      </div>
      <p className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wide">
        {disclaimer}
      </p>
    </div>
  );
}
