import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IAReadyBannerProps {
  buttonLabel: string;
  onClick?: () => void;
}

export function IAReadyBanner({ buttonLabel, onClick }: IAReadyBannerProps) {
  return (
    <Card className="flex flex-col gap-3 items-center bg-warning-bg p-4 rounded-none border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a]">
      <CardContent className="p-0 flex flex-col items-center gap-3 w-full">
        <span className="text-2xl">🤖</span>
        <h4 className="text-text-primary font-black uppercase text-xs tracking-wider">Motibot Ready</h4>
        <Button
          onClick={onClick}
          variant="noShadow"
          className="w-full text-xs py-2 bg-brand-coral border-2 border-slate-900 text-white rounded-none shadow-[2px_2px_0px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-black uppercase tracking-wider"
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
