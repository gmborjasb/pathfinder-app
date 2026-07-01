import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PostulacionCardProps {
  variant: "active" | "inactive";
  title: string;
  statusLabel: string;
  badge?: string;
  matchLabel?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function PostulacionCard({
  variant,
  title,
  statusLabel,
  badge,
  matchLabel,
  onClick,
  isSelected,
}: PostulacionCardProps) {
  if (variant === "active") {
    return (
      <Card
        onClick={onClick}
        className={`rounded-2xl cursor-pointer hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all ${
          isSelected ? "bg-info-bg shadow-[6px_6px_0px_0px_#1e293b]" : "bg-info-bg shadow-light"
        }`}
      >
        <CardContent className="p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {badge && <Badge variant="neutral">{badge}</Badge>}
            {matchLabel && (
              <Badge variant="success" className="ml-auto">{matchLabel}</Badge>
            )}
          </div>
          <h4 className="text-base font-black text-text-primary">{title}</h4>
          <p className="text-xs font-extrabold text-info-text">{statusLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={`rounded-2xl cursor-pointer hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all ${
        isSelected
          ? "bg-info-bg shadow-[3px_3px_0px_0px_#1e293b]"
          : "bg-white border-2 border-border"
      }`}
    >
      <CardContent className="p-2.5 flex flex-col gap-1.5">
        {badge && (
          <div className="flex items-center justify-between">
            <Badge variant="neutral" className="text-[9px]">
              {badge}
            </Badge>
          </div>
        )}
        <h4 className="text-sm font-black text-text-primary line-clamp-2">
          {title}
        </h4>
        <p className="text-[11px] font-extrabold text-slate-500">{statusLabel}</p>
      </CardContent>
    </Card>
  );
}
