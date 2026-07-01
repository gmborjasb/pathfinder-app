import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  tag: string;
  title: string;
  duration: string;
  buttonLabel: string;
  isEnrolled?: boolean;
  onClick: () => void;
}

export function CourseCard({
  tag,
  title,
  duration,
  buttonLabel,
  isEnrolled,
  onClick,
}: CourseCardProps) {
  return (
    <Card className="w-full flex flex-col gap-4 p-6 rounded-2xl">
      <Badge className="w-fit bg-info-bg text-info-text hover:bg-info-bg">
        {tag}
      </Badge>
      <h4 className="text-lg font-black text-text-primary">{title}</h4>
      <p className="text-xs font-bold text-text-tertiary">{duration}</p>
      <Button
        onClick={onClick}
        className={`w-fit px-4 py-3 h-auto border-2 border-border rounded-none shadow-light hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer ${
          isEnrolled
            ? "bg-success-bg text-success-text hover:bg-success-bg"
            : "bg-main text-main-foreground hover:bg-main"
        }`}
      >
        <span className="text-sm font-black">
          {isEnrolled ? "Inscrito" : buttonLabel}
        </span>
      </Button>
    </Card>
  );
}
