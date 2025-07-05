import { PageHeader } from "@/components/page-header";
import { ElectricalAnalysis } from "@/components/hydraulic-analysis";

export default function ElectricalAnalysisPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tra cứu mạch điện"
        description="Mô tả sự cố điện để nhận sơ đồ liên quan và hướng xử lý."
      />
      <ElectricalAnalysis />
    </div>
  );
}
