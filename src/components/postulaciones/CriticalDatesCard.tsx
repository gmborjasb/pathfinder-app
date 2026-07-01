import { Card, CardContent } from "@/components/ui/card";

export interface CriticalDateItem {
  date: string;
  title: string;
  completed: boolean;
  isCurrent: boolean;
}

interface CriticalDatesCardProps {
  dates: CriticalDateItem[];
  alertText: string;
}

export function CriticalDatesCard({ dates, alertText }: CriticalDatesCardProps) {
  return (
    <Card className="flex flex-col gap-3 bg-white p-4">
      <CardContent className="p-0 flex flex-col gap-3">
        <h3 className="text-base font-black flex items-center gap-2 text-foreground">
          <span className="material-symbols-outlined text-lg">event</span>
          Fechas críticas
        </h3>

        <div className="relative space-y-3 pl-8 pb-1">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border z-0" />

          {dates.map((date, idx) => (
            <div key={idx} className="relative">
              <div
                className={`absolute -left-[28px] top-1 w-3.5 h-3.5 rounded-full border-2 border-border z-10 flex items-center justify-center ${
                  date.completed ? "bg-main" : date.isCurrent ? "bg-main" : "bg-secondary-background"
                }`}
              >
                {date.completed && (
                  <span className="material-symbols-outlined text-white text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                )}
              </div>

              <div className="text-[10px]">
                <strong className="font-black text-foreground">{date.date}</strong>
              </div>
              <p className="text-[11px] font-bold text-muted-foreground mt-0.5 leading-tight">{date.title}</p>
            </div>
          ))}
        </div>

        {alertText && (
          <div className="flex items-center gap-2 p-2.5 bg-[#fee2e2] border-2 border-danger-text rounded-lg">
            <span className="text-[10px] font-black text-danger-text leading-tight">{alertText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
