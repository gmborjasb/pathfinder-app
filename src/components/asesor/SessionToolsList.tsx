import { Button } from "@/components/ui/button";

interface SessionTool {
  icon: string;
  label: string;
}

interface SessionToolsListProps {
  title: string;
  tools: SessionTool[];
}

export function SessionToolsList({ title, tools }: SessionToolsListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[13px] font-black uppercase tracking-wider text-text-primary">{title}</h3>
      <div className="flex flex-col gap-2">
        {tools.map((tool, idx) => (
          <Button
            variant="noShadow"
            key={idx}
            className="w-full h-auto flex items-center justify-start gap-2.5 px-3 py-2.5 bg-white border-2 border-slate-900 rounded-none shadow-[2px_2px_0px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer text-text-primary"
          >
            <span className="material-symbols-outlined text-base">{tool.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-wider">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
