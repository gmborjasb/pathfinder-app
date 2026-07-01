import { Button } from "@/components/ui/button";

interface MissionFooterProgressProps {
  readyCount: number;
  total: number;
  buttonLabel: string;
  onClick?: () => void;
}

export function MissionFooterProgress({
  readyCount,
  total,
  buttonLabel,
  onClick,
}: MissionFooterProgressProps) {
  const percentage = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 p-6 bg-slate-100 border-t-2 border-slate-200">
      <p className="text-sm font-black text-text-primary">
        {total > 0 ? `${readyCount} de ${total} documentos listos` : "No se requieren documentos para esta beca"}
      </p>
      {total > 0 && (
        <>
          <div className="h-3 rounded-full bg-text-primary overflow-hidden">
            <div
              className="h-full bg-brand-yellow rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <Button
            onClick={onClick}
            variant="neutral"
            className="w-full h-12"
          >
            {buttonLabel}
          </Button>
        </>
      )}
    </div>
  );
}
