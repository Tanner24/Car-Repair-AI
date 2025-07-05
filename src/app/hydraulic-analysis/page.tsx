import { PageHeader } from "@/components/page-header";
import { HydraulicAnalysis } from "@/components/hydraulic-analysis";

export default function HydraulicAnalysisPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Phân tích hệ thống thủy lực"
        description="Mô tả sự cố thủy lực để nhận các đề xuất chẩn đoán."
      />
      <HydraulicAnalysis />
    </div>
  );
}
