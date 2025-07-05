import { PageHeader } from "@/components/page-header";
import { LookupTool } from "@/components/maintenance-scheduler";

export default function LookupPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tra cứu Tài liệu Kỹ thuật"
        description="Tra cứu, trích xuất và diễn giải tài liệu kỹ thuật gốc theo yêu cầu."
      />
      <LookupTool />
    </div>
  );
}
