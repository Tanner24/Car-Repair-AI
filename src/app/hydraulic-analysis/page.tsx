import { PageHeader } from "@/components/page-header";
import { HydraulicAnalysis } from "@/components/hydraulic-analysis";

export default function HydraulicAnalysisPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hydraulic System Analysis"
        description="Describe a hydraulic issue to receive diagnostic suggestions."
      />
      <HydraulicAnalysis />
    </div>
  );
}
