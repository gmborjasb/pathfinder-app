interface ChatContextBannerProps {
  text: string;
}

export function ChatContextBanner({ text }: ChatContextBannerProps) {
  return (
    <div className="w-full flex justify-center items-center py-3.5 px-6 bg-slate-900 border-b-4 border-slate-900 shadow-none">
      <span className="text-[12px] font-black uppercase tracking-widest text-white">{text}</span>
    </div>
  );
}
