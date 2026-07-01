export interface PipelineStep {
  label: string;
  icon: string;
  status: "completed" | "active" | "pending";
}

interface MissionPipelineProps {
  steps: PipelineStep[];
}

export function MissionPipeline({ steps }: MissionPipelineProps) {
  const advancedCount = steps.filter((s) => s.status !== "pending").length;
  const connectorPercent = steps.length > 1
    ? (Math.max(advancedCount - 1, 0) / (steps.length - 1)) * 90
    : 0;

  return (
    <div className="flex flex-col gap-4 items-center">
      <h3 className="text-xl font-black text-foreground">Progreso de Misión</h3>

      <div className="relative py-3 w-full">
        <div className="absolute top-[30px] left-[5%] right-[5%] h-1 bg-border -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute top-[30px] left-[5%] h-1 bg-foreground -translate-y-1/2 z-0 rounded-full"
          style={{ width: `${connectorPercent}%` }}
        />

        <div className="relative z-10 flex justify-between px-1">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 w-[22%]">
              <div
                className={`flex items-center justify-center rounded-full border-2 border-border ${
                  step.status === "completed"
                    ? "w-8 h-8 bg-success-bg text-foreground"
                    : step.status === "active"
                      ? "w-10 h-10 bg-main text-main-foreground shadow-[3px_3px_0px_0px_#1e293b]"
                      : "w-8 h-8 bg-secondary-background text-muted-foreground"
                }`}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={step.status === "completed" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {step.icon}
                </span>
              </div>
              <span className="text-[10px] font-black text-center leading-tight text-foreground">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
