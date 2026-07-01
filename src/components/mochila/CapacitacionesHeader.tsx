import { Button } from "@/components/ui/button";

interface CapacitacionesHeaderProps {
  title: string;
  activeTab: "disponibles" | "obtenidas";
  disponiblesCount: number;
  obtenidasCount: number;
  onTabChange: (tab: "disponibles" | "obtenidas") => void;
}

export function CapacitacionesHeader({
  title,
  activeTab,
  disponiblesCount,
  obtenidasCount,
  onTabChange,
}: CapacitacionesHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between">
      <h3 className="text-2xl font-black text-text-primary">{title}</h3>
      <div className="flex gap-2 p-1 bg-slate-200 rounded-none">
        <Button
          variant="noShadow"
          onClick={() => onTabChange("disponibles")}
          className={`px-3 py-2 h-auto rounded-lg text-[13px] font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "disponibles"
              ? "bg-white border-2 border-border shadow-light text-text-primary hover:bg-white"
              : "bg-transparent border-transparent text-text-tertiary font-bold hover:bg-transparent"
          }`}
        >
          Disponibles ({disponiblesCount})
        </Button>
        <Button
          variant="noShadow"
          onClick={() => onTabChange("obtenidas")}
          className={`px-3 py-2 h-auto rounded-lg text-[13px] font-black whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "obtenidas"
              ? "bg-white border-2 border-border shadow-light text-text-primary hover:bg-white"
              : "bg-transparent border-transparent text-text-tertiary font-bold hover:bg-transparent"
          }`}
        >
          Obtenidas ({obtenidasCount})
        </Button>
      </div>
    </div>
  );
}
