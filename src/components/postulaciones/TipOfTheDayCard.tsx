import { Card, CardContent } from "@/components/ui/card";

interface TipOfTheDayCardProps {
  text: string;
}

export function TipOfTheDayCard({ text }: TipOfTheDayCardProps) {
  return (
    <Card className="bg-slate-100 p-3 border-2 border-border shadow-none">
      <CardContent className="p-0">
        <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
          <span className="material-symbols-outlined text-lg text-warning-text">lightbulb</span>
          <span className="font-black text-foreground">Tip del día</span>
          <br />
          {text}
        </p>
      </CardContent>
    </Card>
  );
}
