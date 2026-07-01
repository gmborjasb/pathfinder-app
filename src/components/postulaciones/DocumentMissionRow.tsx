type MissionVariant = "success" | "warning" | "danger";

interface DocumentMissionRowProps {
  variant: MissionVariant;
  icon: string;
  title: string;
  statusLabel: string;
}

const VARIANT_STYLES: Record<MissionVariant, { bg: string; iconColor: string }> = {
  success: { bg: "#dcfce7", iconColor: "var(--color-success-text)" },
  warning: { bg: "#fef9c3", iconColor: "var(--color-warning-text)" },
  danger: { bg: "#fee2e2", iconColor: "var(--color-danger-text)" },
};

export function DocumentMissionRow({ variant, icon, title, statusLabel }: DocumentMissionRowProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      style={{ backgroundColor: styles.bg }}
      className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-border shadow-[3px_3px_0px_0px_#1e293b]"
    >
      <span className="material-symbols-outlined text-xl shrink-0" style={{ color: styles.iconColor }}>
        {icon}
      </span>
      <div className="min-w-0">
        <h4 className="text-sm font-[800] text-foreground">{title}</h4>
        <p className="text-[11px] font-bold text-muted-foreground mt-0.5">{statusLabel}</p>
      </div>
    </div>
  );
}
