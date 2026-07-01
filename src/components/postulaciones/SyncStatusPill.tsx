import { Button } from "@/components/ui/button";

interface SyncStatusPillProps {
  label: string;
  onClick?: () => void;
  isRefreshing?: boolean;
}

export function SyncStatusPill({
  label,
  onClick,
  isRefreshing,
}: SyncStatusPillProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isRefreshing}
      variant="neutral"
      size="sm"
      className="w-full text-[11px]"
    >
      <span
        className={`material-symbols-outlined text-sm ${isRefreshing ? "animate-spin" : ""}`}
      >
        sync
      </span>
      {isRefreshing ? "Sincronizando..." : label}
    </Button>
  );
}
