import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DropZoneCardProps {
  label: string;
  formats: string[];
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export function DropZoneCard({
  label,
  formats,
  onUpload,
  isUploading,
}: DropZoneCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const allowed = formats.map((f) => f.toLowerCase());
    if (!allowed.some((f) => ext === f.replace("jpg/png", "jpg").replace("jpg/png", "png") || ext === "." + f.toLowerCase().replace("jpg/png", "jpg").replace("jpg/png", "png"))) {
      return;
    }
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <Card
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`w-full flex flex-col gap-3 items-center p-6 rounded-2xl cursor-pointer transition-colors ${
        isDragOver
          ? "bg-info-bg border-info-text border-dashed"
          : "bg-slate-100 border-slate-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={formats.join(",")}
        className="hidden"
        onChange={handleChange}
        disabled={isUploading}
      />
      <span className="text-base font-black text-text-tertiary">
            {isUploading ? "Subiendo..." : label}
      </span>
      <div className="flex gap-2">
        {formats.map((format) => (
          <Badge
            key={format}
            variant="neutral"
          >
            {format}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
