import { Button } from "@/components/ui/button";

export interface CategoryFilter {
  label: string;
  active?: boolean;
}

interface DocumentCategoryFiltersProps {
  filters: CategoryFilter[];
  onFilterChange: (label: string) => void;
}

export function DocumentCategoryFilters({
  filters,
  onFilterChange,
}: DocumentCategoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {filters.map((filter) => (
        <Button
          variant="noShadow"
          key={filter.label}
          onClick={() => onFilterChange(filter.label)}
          className={`px-3 py-1.5 md:px-4 md:py-2 h-auto rounded-full text-[11px] md:text-xs font-extrabold border-2 border-border whitespace-nowrap transition-all cursor-pointer ${
            filter.active
              ? "bg-text-primary text-white shadow-light hover:bg-text-primary"
              : "bg-white text-text-primary hover:bg-slate-50"
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
