import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DocumentItemCardProps {
  variant: "validado" | "pendiente" | "rechazado" | "faltante";
  title: string;
  icon?: string;
  onUpload?: (file: File) => void;
  onView?: () => void;
  isUploading?: boolean;
}

const VARIANT_STYLES: Record<string, { bg: string; bar: string; label: string; btn: string }> = {
  validado: { bg: "bg-success-bg", bar: "w-full", label: "VALIDADO", btn: "bg-white" },
  pendiente: { bg: "bg-warning-bg", bar: "w-1/2", label: "EN REVISIÓN", btn: "bg-main text-main-foreground" },
  rechazado: { bg: "bg-danger-bg", bar: "w-3/4 bg-danger-text", label: "RECHAZADO", btn: "bg-main text-main-foreground" },
  faltante: { bg: "bg-white", bar: "w-0", label: "FALTANTE", btn: "bg-main text-main-foreground" },
};

export function DocumentItemCard({
  variant,
  title,
  icon = "description",
  onUpload,
  onView,
  isUploading,
}: DocumentItemCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.faltante;
  const isActionable = variant === "faltante" || variant === "rechazado";

  const handleClick = () => {
    if (isActionable && onUpload) {
      inputRef.current?.click();
    } else if (onView) {
      onView();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file);
    e.target.value = "";
  };

  return (
    <Card
      className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-white shadow-light"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-text-primary shrink-0">
          {icon}
        </span>
        <h4 className="text-[13px] font-black text-text-primary flex-1 leading-tight">
          {title}
        </h4>
      </div>

      <div className="w-full h-3 bg-white border-2 border-border rounded-full overflow-hidden">
        <div
          className={`h-full ${styles.bar} ${
            variant === "rechazado" ? "bg-danger-text" : "bg-text-primary"
          }`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-black ${
            variant === "rechazado"
              ? "text-danger-text"
              : "text-text-primary"
          }`}
        >
          {styles.label}
        </span>
        <Button
          variant="noShadow"
          onClick={handleClick}
          disabled={isUploading}
          className={`px-3 py-2 h-auto border-2 border-border rounded-lg text-[11px] font-black hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles.btn}`}
        >
          {isUploading
            ? "Subiendo..."
            : isActionable
              ? "Subir"
              : "Ver"}
        </Button>
      </div>
    </Card>
  );
}
