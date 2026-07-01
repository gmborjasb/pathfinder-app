import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  selectedProgramTypes: string[];
  setSelectedProgramTypes: (val: string[]) => void;
  selectedFinancing: string;
  setSelectedFinancing: (val: string) => void;
  selectedGestiones: string[];
  setSelectedGestiones: (val: string[]) => void;
  selectedDestinos: string[];
  setSelectedDestinos: (val: string[]) => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  onClear,
  selectedProgramTypes,
  setSelectedProgramTypes,
  selectedFinancing,
  setSelectedFinancing,
  selectedGestiones,
  setSelectedGestiones,
  selectedDestinos,
  setSelectedDestinos,
}: FilterDrawerProps) {
  const toggleInList = (list: string[], setList: (val: string[]) => void, value: string) => {
    if (list.includes(value)) setList(list.filter((v) => v !== value));
    else setList([...list, value]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[400px] p-0 gap-0">
        <SheetHeader className="flex-row items-center justify-between border-b-2 border-border p-6">
          <SheetTitle className="text-[18px]">Filtros Avanzados</SheetTitle>
          <button
            onClick={onClear}
            className="text-[13px] font-extrabold text-brand-blue hover:underline cursor-pointer bg-transparent border-none"
          >
            Limpiar
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Accordion
            type="multiple"
            defaultValue={["programa", "financiamiento", "gestion", "destino"]}
            className="flex flex-col gap-6"
          >
            <AccordionItem value="programa">
              <AccordionTrigger>Tipo de Programa</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  {["Universitarias", "Técnicas", "Postgrado", "Idiomas"].map((p) => (
                    <label key={p} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedProgramTypes.includes(p)}
                        onCheckedChange={() =>
                          toggleInList(selectedProgramTypes, setSelectedProgramTypes, p)
                        }
                      />
                      <span className="text-[13px] font-bold text-text-primary">{p}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="financiamiento">
              <AccordionTrigger>Financiamiento</AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={selectedFinancing}
                  onValueChange={setSelectedFinancing}
                  className="flex flex-col gap-4"
                >
                  {[
                    { value: "todos", label: "Todos" },
                    { value: "integral", label: "Beca Integral (100%)" },
                    { value: "parcial", label: "Beca Parcial" },
                  ].map((f) => (
                    <label key={f.value} className="flex items-center gap-3 cursor-pointer">
                      <RadioGroupItem value={f.value} />
                      <span className="text-[13px] font-bold text-text-primary">{f.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="gestion">
              <AccordionTrigger>Gestión</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  {["Pública", "Privada"].map((g) => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedGestiones.includes(g)}
                        onCheckedChange={() =>
                          toggleInList(selectedGestiones, setSelectedGestiones, g)
                        }
                      />
                      <span className="text-[13px] font-bold text-text-primary">{g}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="destino">
              <AccordionTrigger>Destino</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  {["Lima", "Provincias", "Extranjero"].map((d) => (
                    <label key={d} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedDestinos.includes(d)}
                        onCheckedChange={() =>
                          toggleInList(selectedDestinos, setSelectedDestinos, d)
                        }
                      />
                      <span className="text-[13px] font-bold text-text-primary">{d}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter className="border-t-2 border-border p-6">
          <Button onClick={onClose} className="w-full py-6 text-[16px]">
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
