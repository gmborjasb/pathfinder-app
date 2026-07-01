import type { PostulacionRow } from "../../lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MochilaSelectorCardProps {
  postulaciones: PostulacionRow[];
  activePostulacionId: string | null;
  onSelectPostulacion: (id: string) => void;
  readyCount: number;
  total: number;
  matchLabel: string;
  deadlineLabel: string;
}

function getBecaLabel(becaId: string): string {
  const labels: Record<string, string> = {
    "BEC-01": "Beca 18 - Objetivo",
    "BEC-02": "Beca Permanencia",
    "BEC-03": "Beca Hijos de Docentes",
    "BEC-04": "Beca Técnico Productiva",
    "BEC-05": "Beca Alianza del Pacífico",
    "BEC-06": "Beca Generación Bicentenario",
    "BEC-07": "Beca Continuidad de Estudios",
    "BEC-08": "Beca Protección Social",
    "BEC-09": "Beca Excelencia Académica",
    "BEC-10": "Beca Deportiva",
  };
  return labels[becaId] || becaId;
}

export function MochilaSelectorCard({
  postulaciones,
  activePostulacionId,
  onSelectPostulacion,
  readyCount,
  total,
  matchLabel,
  deadlineLabel,
}: MochilaSelectorCardProps) {
  return (
    <div className="w-full flex flex-col gap-6 p-6 bg-white border-2 border-border rounded-2xl shadow-light">
      <Select
        value={activePostulacionId ?? ""}
        onValueChange={(val) => onSelectPostulacion(val)}
      >
        <SelectTrigger className="w-full px-4 py-2.5 bg-slate-100 border-2 border-border rounded-lg text-sm font-black text-text-primary h-auto">
          <SelectValue placeholder="Selecciona una beca" />
        </SelectTrigger>
        <SelectContent>
          {postulaciones.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {getBecaLabel(p.beca_id)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-2 items-center">
        <div className="text-5xl font-black text-text-primary">
          {readyCount}/{total}
        </div>
        <div className="text-sm font-black text-text-tertiary">
          Docs. Listos
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <span className="px-3 py-1.5 bg-success-bg border-2 border-border rounded-full text-[11px] font-black text-success-text">
          {matchLabel}
        </span>
        <span className="px-3 py-1.5 bg-warning-bg border-2 border-border rounded-full text-[11px] font-black text-warning-text">
          {deadlineLabel}
        </span>
      </div>
    </div>
  );
}
