import { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

interface CVPreviewPanelProps {
  latexCode: string;
  htmlCode: string;
  isGenerating: boolean;
  forceHtmlTab?: boolean; // kept for compatibility but ignored
}

export function CVPreviewPanel({ latexCode, htmlCode, isGenerating }: CVPreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const htmlRef = useRef<HTMLDivElement>(null);

  const handleCopyLatex = async () => {
    if (!latexCode) return;
    await navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!htmlRef.current || !htmlCode) return;
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const element = htmlRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('mi-cv-pathfinder.pdf');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  const isEmpty = !latexCode && !htmlCode && !isGenerating;

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-white border-2 border-border rounded-2xl shadow-light overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 bg-white border-b-2 border-border shrink-0 flex-wrap gap-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
            Vista Previa
          </span>
          {isGenerating && (
            <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-brand-blue/20 rounded-md">
              <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-ping" />
              Generando...
            </div>
          )}
        </div>

        {htmlCode ? (
          <div className="flex items-center gap-2 flex-wrap">
            {latexCode && (
              <button
                onClick={handleCopyLatex}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-border rounded-lg text-[11px] font-black text-text-primary hover:bg-slate-50 transition-colors shadow-light hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? '¡Copiado!' : 'Copiar LaTeX'}
              </button>
            )}

            <button
              onClick={handleExportPDF}
              disabled={exporting || !htmlCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-coral border-2 border-border rounded-lg text-[11px] font-black text-white hover:bg-brand-coral/90 shadow-light hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-60"
            >
              {exporting ? (
                <span className="w-3 h-3 border-2 border-border/30 border-t-text-primary rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
              )}
              Exportar PDF
            </button>
          </div>
        ) : null}
      </div>

      {/* ── Content ── */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center bg-slate-50">
          <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl shadow-light flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-slate-300">auto_awesome</span>
          </div>
          <p className="text-[16px] font-black text-slate-700">Tu CV aparecerá aquí</p>
          <p className="text-[13px] font-bold text-slate-400 max-w-[240px]">
            Completa el formulario y haz clic en "Generar CV con IA"
          </p>
        </div>
      ) : isGenerating && !latexCode ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-slate-50">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-brand-yellow rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-[16px] font-black text-slate-700 mb-1">La IA está redactando tu CV...</p>
            <p className="text-[13px] font-bold text-slate-400">Esto toma unos segundos</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {['Analizando perfil', 'Redactando secciones', 'Aplicando plantilla'].map((step, i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 300}ms` }}
                className="px-3 py-1 bg-white border-2 border-slate-200 rounded-full text-[11px] font-black text-slate-500 animate-pulse"
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mt-0 bg-slate-100 flex flex-col min-h-0">
          <div className="p-4 flex justify-center">
            <div ref={htmlRef} className="shadow-[0_4px_24px_rgba(0,0,0,0.15)] bg-white" dangerouslySetInnerHTML={{ __html: htmlCode }} />
          </div>
        </div>
      )}
    </div>
  );
}
