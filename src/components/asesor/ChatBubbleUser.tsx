import { Card } from "@/components/ui/card";

interface ChatBubbleUserProps {
  message: string;
}

export function ChatBubbleUser({ message }: ChatBubbleUserProps) {
  return (
    <Card className="w-fit max-w-[85%] p-4 px-5 bg-brand-blue text-white rounded-none border-3 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a]">
      <p className="text-[14px] font-bold leading-relaxed whitespace-pre-line">{message}</p>
    </Card>
  );
}
