import { Card, CardContent } from "@/components/ui/card";

interface ExpedienteItem {
  variant: "success" | "warning" | "danger" | "info";
  icon: string;
  label: string;
  note: string;
}

interface ExpedienteStatusListProps {
  title: string;
  items: ExpedienteItem[];
  viewAllLabel: string;
}

const ICON_COLOR: Record<string, string> = {
  success: "var(--color-success-text)",
  warning: "var(--color-warning-text)",
  danger: "var(--color-danger-text)",
  info: "var(--color-info-text)",
};

export function ExpedienteStatusList({ title, items, viewAllLabel }: ExpedienteStatusListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[13px] font-black uppercase tracking-wider text-text-primary">{title}</h3>
      <Card className="flex flex-col gap-3 p-4 border-3 border-slate-900 rounded-none shadow-[4px_4px_0px_0px_#0f172a] bg-white">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]" style={{ color: ICON_COLOR[item.variant] }}>
                {item.icon}
              </span>
              <span className="text-xs font-black text-text-primary">{item.label}</span>
            </div>
            <span className="text-[10px] font-black text-info-text">{item.note}</span>
          </div>
        ))}

        <a
          href="/documentos"
          className="w-full py-2.5 bg-slate-100 border-2 border-slate-900 rounded-none text-center block shadow-[2px_2px_0px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-text-primary">{viewAllLabel}</span>
        </a>
      </Card>
    </div>
  );
}
