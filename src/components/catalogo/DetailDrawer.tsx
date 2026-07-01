import type { Oportunidad } from '../../lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface RequirementMatch {
  campo: string;
  perfil: string;
  estado: "Cumple" | "NoCumple" | "Pendiente";
}

interface DetailDrawerProps {
  oportunidad: Oportunidad | null;
  isOpen: boolean;
  isSaved: boolean;
  isApplied: boolean;
  hasProfile: boolean;
  requisitos: RequirementMatch[];
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onApply: (id: string) => void;
}

export function DetailDrawer({
  oportunidad,
  isOpen,
  isSaved,
  isApplied,
  hasProfile,
  requisitos,
  onClose,
  onToggleSave,
  onApply,
}: DetailDrawerProps) {
  // El padre retiene la última oportunidad no nula mientras el drawer se
  // desliza hacia afuera, así que "oportunidad" solo es null antes de la
  // primera selección.
  if (!oportunidad) return null;
  const displayed = oportunidad;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 gap-0">
        <SheetHeader className="flex-row items-center justify-between border-b-2 border-border p-6 pr-14">
          <SheetTitle className="text-[18px]">Detalles de la Beca</SheetTitle>
          <button
            onClick={() => onToggleSave(displayed.id)}
            className={`w-[32px] h-[32px] rounded-lg border-2 border-border flex items-center justify-center shadow-[2px_2px_0_#1e293b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer shrink-0 ${
              isSaved ? "bg-brand-blue" : "bg-white hover:bg-slate-100"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${isSaved ? "text-white" : "text-text-primary"}`}
              style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </button>
        </SheetHeader>

        <div className="px-4 lg:px-6 pt-4 lg:pt-6 shrink-0">
          <div className="flex flex-wrap gap-2">
            {displayed.affinity >= 80 && (
              <Badge variant="success">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Match Perfecto
              </Badge>
            )}
            <Badge variant="info">{displayed.level}</Badge>
            <Badge variant="danger">Nacional</Badge>
            <Badge variant="warning">{displayed.deadline}</Badge>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <h1 className="text-[24px] font-black text-text-primary leading-tight">
              {displayed.title}
            </h1>
            <p className="text-[14px] font-bold text-text-secondary">{displayed.sponsor}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-6 custom-scrollbar">
          {/* Cross Match Requirements Section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] bg-brand-yellow rounded-lg border-2 border-border flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-text-primary">checklist</span>
              </div>
              <h3 className="text-[18px] font-black text-text-primary">Cruce de Requisitos</h3>
            </div>

            {!hasProfile && (
              <div className="flex items-center gap-3 bg-warning-bg border-2 border-warning-text rounded-xl p-4 shadow-[2px_2px_0_#b45309]">
                <span className="material-symbols-outlined text-warning-text text-[24px]">info</span>
                <p className="text-sm text-warning-text font-bold">
                  Completa tu perfil para ver el cruce real de requisitos con tus datos.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {requisitos.map((req, idx) => {
                let bgClass = "bg-secondary-background";
                let borderClass = "border-border";
                let textClass = "text-text-secondary";
                let icon = "pending";

                if (req.estado === "Cumple") {
                  bgClass = "bg-success-bg";
                  borderClass = "border-success-text";
                  textClass = "text-success-text";
                  icon = "check_circle";
                } else if (req.estado === "NoCumple") {
                  bgClass = "bg-danger-bg";
                  borderClass = "border-danger-text";
                  textClass = "text-danger-text";
                  icon = "cancel";
                }

                return (
                  <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border-2 ${borderClass} ${bgClass} min-h-[48px]`}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className={`text-[10px] font-bold ${textClass} truncate`}>{req.campo}</p>
                      <p className="text-[12px] font-black text-text-primary truncate">{req.perfil}</p>
                    </div>
                    <div className={`flex items-center justify-center w-[20px] h-[20px] rounded-full border-2 ${borderClass} bg-white shrink-0 ml-1`}>
                      <span className={`material-symbols-outlined text-[12px] ${textClass}`}>{icon}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* About section */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[18px] font-black text-text-primary">Sobre esta Beca</h3>
            <p className="text-[14px] font-medium text-text-secondary leading-relaxed">
              {displayed.sobre}
            </p>
          </section>

          {/* Benefits Section */}
          <section className="flex flex-col gap-4 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] bg-brand-blue rounded-lg border-2 border-border flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-white">stars</span>
              </div>
              <h3 className="text-[18px] font-black text-text-primary">Beneficios de la Beca</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {displayed.beneficios.map((ben, idx) => {
                let icon = "school";
                if (ben.toLowerCase().includes("manutención") || ben.toLowerCase().includes("estipendio")) icon = "payments";
                if (ben.toLowerCase().includes("transporte") || ben.toLowerCase().includes("pasaje")) icon = "flight";
                if (ben.toLowerCase().includes("seguro") || ben.toLowerCase().includes("salud")) icon = "health_and_safety";
                if (ben.toLowerCase().includes("matrícula") || ben.toLowerCase().includes("pensiones")) icon = "account_balance";
                if (ben.toLowerCase().includes("materiales") || ben.toLowerCase().includes("laptop") || ben.toLowerCase().includes("equipo")) icon = "laptop_mac";
                if (ben.toLowerCase().includes("alojamiento") || ben.toLowerCase().includes("vivienda")) icon = "home";
                if (ben.toLowerCase().includes("alimentación") || ben.toLowerCase().includes("comida")) icon = "restaurant";

                return (
                  <div key={idx} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border-2 border-border rounded-xl shadow-shadow text-center">
                    <span className="material-symbols-outlined text-[24px] text-brand-blue">{icon}</span>
                    <span className="text-[12px] font-bold text-text-primary leading-tight">{ben}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <SheetFooter className="border-t-2 border-border p-6">
          <Button
            onClick={() => onApply(displayed.id)}
            disabled={isApplied}
            variant={isApplied ? "neutral" : "default"}
            className="w-full py-6 text-[16px]"
          >
            {isApplied ? "Ya Postulaste" : "Postular Ahora"}
            {!isApplied && (
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
