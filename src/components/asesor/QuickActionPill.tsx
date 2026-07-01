import { Button } from "@/components/ui/button";

interface QuickActionPillProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export function QuickActionPill({ icon, label, onClick }: QuickActionPillProps) {
  return (
    <Button
      variant="noShadow"
      onClick={onClick}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-slate-900 rounded-none text-text-primary shadow-[3px_3px_0px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer h-auto min-w-0"
    >
      <span className="material-symbols-outlined text-sm text-text-primary shrink-0">
        {icon}
      </span>
      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-text-primary truncate">
        {label}
      </span>
    </Button>
  );
}
