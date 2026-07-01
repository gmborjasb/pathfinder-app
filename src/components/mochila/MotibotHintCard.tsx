import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MotibotHintCardProps {
  message: string;
  buttonLabel: string;
}

export function MotibotHintCard({
  message,
  buttonLabel,
}: MotibotHintCardProps) {
  const navigate = useNavigate();

  return (
    <Alert className="w-full flex flex-col gap-4 p-6 bg-brand-blue border-2 border-border rounded-2xl shadow-light">
      <AlertDescription className="text-sm font-black text-white">
        🤖 {message}
      </AlertDescription>
      <Button
        variant="noShadow"
        onClick={() => navigate("/asesor")}
        className="w-full py-2.5 px-4 h-auto bg-brand-coral border-2 border-border rounded-lg hover:-translate-y-0.5 hover:bg-brand-coral transition-all cursor-pointer"
      >
        <span className="text-[13px] font-black text-white">
          {buttonLabel}
        </span>
      </Button>
    </Alert>
  );
}
