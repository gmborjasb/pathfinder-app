import { MissionPipeline, type PipelineStep } from "./MissionPipeline";
import { DocumentMissionRow } from "./DocumentMissionRow";
import { MissionFooterProgress } from "./MissionFooterProgress";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentMission {
  variant: "success" | "warning" | "danger";
  icon: string;
  title: string;
  statusLabel: string;
}

interface MissionProgressCardProps {
  pipelineSteps: PipelineStep[];
  documentMissions: DocumentMission[];
  readyCount: number;
  totalDocuments: number;
  footerButtonLabel: string;
  onFooterClick?: () => void;
}

export function MissionProgressCard({
  pipelineSteps,
  documentMissions,
  readyCount,
  totalDocuments,
  footerButtonLabel,
  onFooterClick,
}: MissionProgressCardProps) {
  return (
    <Card className="flex flex-col bg-white overflow-hidden p-0 gap-0">
      <CardContent className="p-0 flex flex-col">
        <div className="p-6 pb-4">
          <MissionPipeline steps={pipelineSteps} />
        </div>

        <div className="h-0.5 bg-border mx-6" />

        <div className="flex flex-col gap-3 p-6">
          <h3 className="text-base font-black text-foreground">Misiones de Documentos</h3>
          {documentMissions.length > 0 ? (
            documentMissions.map((mission, idx) => (
              <DocumentMissionRow key={idx} {...mission} />
            ))
          ) : (
            <p className="text-xs font-bold text-muted-foreground">
              Esta beca no tiene documentos requeridos registrados.
            </p>
          )}
        </div>

        <MissionFooterProgress
          readyCount={readyCount}
          total={totalDocuments}
          buttonLabel={footerButtonLabel}
          onClick={onFooterClick}
        />
      </CardContent>
    </Card>
  );
}
