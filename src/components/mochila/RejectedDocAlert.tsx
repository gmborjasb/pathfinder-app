import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RejectedDocAlertProps {
  message: string;
  buttonLabel: string;
  onClick: () => void;
}

export function RejectedDocAlert({
  message,
  buttonLabel,
  onClick,
}: RejectedDocAlertProps) {
  if (!message) return null;

  return (
    <Alert className="w-full flex flex-col gap-3 p-5 bg-danger-bg border-2 border-danger-text rounded-2xl">
      <AlertDescription className="text-sm font-extrabold text-danger-text flex items-center gap-2">
        <span className="material-symbols-outlined">warning</span> {message}
      </AlertDescription>
      <Button
        onClick={onClick}
        className="w-fit px-4 py-2.5 h-auto bg-danger-text text-white border-2 border-border rounded-lg shadow-light hover:-translate-y-0.5 hover:bg-danger-text active:translate-y-0 active:shadow-none transition-all cursor-pointer"
      >
        <span className="text-[13px] font-black text-white">
          {buttonLabel}
        </span>
      </Button>
    </Alert>
  );
}
