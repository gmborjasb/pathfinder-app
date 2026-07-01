import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActiveMissionCardProps {
  sectionTitle: string;
  becaTitle: string;
  matchLabel: string;
  deadlineLabel: string;
}

export function ActiveMissionCard({ sectionTitle, becaTitle, matchLabel, deadlineLabel }: ActiveMissionCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[13px] font-black uppercase tracking-wider text-text-primary">{sectionTitle}</h3>
      <Card className="flex flex-col gap-3 p-5 rounded-none border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] bg-white">
        <h4 className="text-[14px] font-black text-text-primary">{becaTitle}</h4>
        <div className="flex items-center gap-2">
          <Badge className="rounded-none border-2 border-slate-900 bg-success-bg text-success-text hover:bg-success-bg font-black uppercase text-[9px] px-2 py-0.5 shadow-none">{matchLabel}</Badge>
          <span className="material-symbols-outlined text-sm text-warning-text">timer</span> {deadlineLabel}
        </div>
      </Card>
    </div>
  );
}
