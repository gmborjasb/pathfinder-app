import React from 'react';
import type { Oportunidad } from "../../lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ScholarshipCardProps {
  oportunidad: Oportunidad;
  activeTab: "explorar" | "guardadas" | "postuladas";
  onClick: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onDeletePostulacion?: (e: React.MouseEvent) => void;
}

export function ScholarshipCard({
  oportunidad,
  activeTab,
  onClick,
  isSaved,
  onToggleSave,
  onDeletePostulacion,
}: ScholarshipCardProps) {

  const getAffinityVariant = (affinity: number): "success" | "info" | "warning" => {
    if (affinity >= 80) return "success";
    if (affinity >= 60) return "info";
    return "warning";
  };

  const getAffinityLabel = (affinity: number) => {
    if (affinity >= 80) return `${affinity}% Match`;
    if (affinity >= 60) return `${affinity}% Afín`;
    return `${affinity}% Compatibilidad`;
  };

  const getDestino = (o: Oportunidad) => {
    const text = (o.title + " " + o.sponsor + " " + (o.sobre || "")).toLowerCase();
    if (
      text.includes("extranjero") ||
      text.includes("ee.uu.") ||
      text.includes("embajada") ||
      text.includes("francia") ||
      text.includes("internacional")
    ) {
      return "Extranjero";
    }
    if (text.includes("provincia") || text.includes("regiones")) {
      return "Provincias";
    }
    return "Lima";
  };

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none bg-white p-4 min-h-[250px] flex flex-col justify-between gap-0"
    >
      <CardContent className="p-0 flex flex-col flex-1">
        {/* Sponsor + Affinity */}
        <div className="shrink-0 flex justify-between items-start">
          <div className="flex flex-col gap-1 items-start">
            <div className="text-[10px] text-text-tertiary font-black uppercase">
              {oportunidad.sponsor}
            </div>
            <Badge variant={getAffinityVariant(oportunidad.affinity)} className="rounded-full">
              {getAffinityLabel(oportunidad.affinity)}
            </Badge>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(oportunidad.id); }}
              className={`w-[28px] h-[28px] rounded-lg border-2 border-border flex items-center justify-center shadow-[2px_2px_0_#1e293b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer shrink-0 ${
                isSaved ? "bg-danger-text" : "bg-white hover:bg-slate-100"
              }`}
              title={isSaved ? "Quitar de guardados" : "Guardar beca"}
            >
              <span className={`material-symbols-outlined text-[16px] ${isSaved ? "text-white" : "text-danger-text"}`}
                style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                favorite
              </span>
            </button>
            {activeTab === "postuladas" && onDeletePostulacion && (
              <button
                className="text-danger-text p-1 hover:bg-danger-bg rounded-lg transition-colors shrink-0"
                title="Cancelar postulación"
                onClick={onDeletePostulacion}
              >
                <span className="material-symbols-outlined text-[22px]">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Title + Description */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-h-0 mt-2 mb-3">
          <div className="text-[18px] text-text-primary font-black leading-tight line-clamp-2">
            {oportunidad.title}
          </div>
          <div className="text-[12px] text-text-tertiary font-bold leading-snug line-clamp-2">
            {oportunidad.sobre || "Oportunidad educativa."}
          </div>
        </div>

        {/* Key info icons */}
        <div className="shrink-0 flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1 min-w-0">
            <span className="material-symbols-outlined text-[14px] text-brand-blue shrink-0">
              school
            </span>
            <span className="text-[11px] text-text-tertiary font-bold truncate">
              {oportunidad.level}
            </span>
          </div>
          {oportunidad.coverage && (
            <div className="flex items-center gap-1 min-w-0">
              <span className="material-symbols-outlined text-[14px] text-brand-blue shrink-0">
                payments
              </span>
              <span className="text-[11px] text-text-tertiary font-bold truncate">
                {oportunidad.coverage}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 min-w-0">
            <span className="material-symbols-outlined text-[14px] text-brand-blue shrink-0">
              location_on
            </span>
            <span className="text-[11px] text-text-tertiary font-bold truncate">
              {getDestino(oportunidad)}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-0 shrink-0 flex-col items-stretch">
        <div className="w-full h-[2px] bg-border mb-3"></div>
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-muted-foreground">
              hourglass_bottom
            </span>
            <div className="text-[13px] text-muted-foreground font-black">
              {oportunidad.deadline.replace('Cierra en ', '').replace('Cierra ', '')}
            </div>
          </div>

          <Button variant="default" size="sm" className="text-[13px]">
            Postular
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
