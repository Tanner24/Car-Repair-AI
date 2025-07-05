import { PageHeader } from "@/components/page-header";
import { GuidedDiagnostics } from "@/components/guided-diagnostics";

export default function GuidedDiagnosticsPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <PageHeader
        title="Chẩn đoán Hướng dẫn"
        description="Tương tác với trợ lý AI để được hướng dẫn chẩn đoán sự cố theo từng bước."
      />
      <GuidedDiagnostics />
    </div>
  );
}
