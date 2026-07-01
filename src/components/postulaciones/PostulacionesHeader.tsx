import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterTab = "activas" | "curso" | "cerradas";

interface PostulacionesHeaderProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  activasCount: number;
  cursoCount: number;
  cerradasCount: number;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "activas", label: "Activas" },
  { key: "curso", label: "En curso" },
  { key: "cerradas", label: "Cerradas" },
];

export function PostulacionesHeader({
  activeTab,
  onTabChange,
  activasCount,
  cursoCount,
  cerradasCount,
}: PostulacionesHeaderProps) {
  const getCount = (key: FilterTab) => {
    if (key === "activas") return activasCount;
    if (key === "curso") return cursoCount;
    return cerradasCount;
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[22px] font-black text-text-primary">
        Mis Postulaciones
      </h2>
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as FilterTab)}>
        <TabsList className="w-full h-auto justify-between">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex-1 whitespace-nowrap">
              {tab.label} ({getCount(tab.key)})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
