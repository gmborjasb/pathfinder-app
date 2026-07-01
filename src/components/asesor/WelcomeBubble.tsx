import { Card, CardContent } from "@/components/ui/card";

interface WelcomeBubbleProps {
  avatarInitial: string;
  statusLabel: string;
  message: string;
}

export function WelcomeBubble({ avatarInitial, statusLabel, message }: WelcomeBubbleProps) {
  return (
    <Card className="w-fit flex items-center gap-4 p-5 px-6 rounded-none border-3 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] bg-white">
      <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-brand-blue border-3 border-slate-900 rounded-none shadow-none">
        <span className="text-2xl font-black text-white">{avatarInitial}</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-success-text border-2 border-slate-900 rounded-none" />
          <span className="text-[10px] font-black uppercase tracking-wider text-success-text">{statusLabel}</span>
        </div>
        <span className="text-[15px] font-black text-text-primary">{message}</span>
      </div>
    </Card>
  );
}
