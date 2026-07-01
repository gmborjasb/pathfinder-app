import { useState } from "react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface ChatBubbleAIProps {
  senderLabel: string;
  message: string;
}

export function ChatBubbleAI({ senderLabel, message }: ChatBubbleAIProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-fit max-w-[85%] flex flex-col gap-3 p-5 rounded-none border-3 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] bg-white group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-none border-2 border-slate-900 shadow-none shrink-0">
            <span className="text-[14px]">🤖</span>
          </div>
          <span className="text-[14px] font-black text-slate-900 uppercase tracking-wider">{senderLabel}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-black uppercase text-text-primary hover:text-white bg-brand-yellow hover:bg-slate-900 border-2 border-slate-900 px-3 py-1.5 rounded-none shadow-[2px_2px_0px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'COPIADO' : 'COPIAR'}
        </button>
      </div>
      <div className="text-[14.5px] font-semibold text-slate-700 leading-relaxed max-w-none">
        <ReactMarkdown
          components={{
            strong: ({ node, ...props }) => (
              <strong className="font-black text-slate-950 underline decoration-brand-coral decoration-2" {...props} />
            ),
            p: ({ node, ...props }) => <p className="mb-2.5 last:mb-0" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-brand-blue underline font-black hover:text-blue-800" {...props} />
            ),
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2.5 flex flex-col gap-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2.5 flex flex-col gap-1" {...props} />,
            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    </Card>
  );
}
