import { PageHeader } from "@/components/page-header";
import { SchematicsViewer } from "@/components/schematics-viewer";

export default function SchematicsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Trình tạo sơ đồ AI"
        description="Sử dụng AI để tạo sơ đồ dây và mạch thủy lực theo yêu cầu."
      />
      <SchematicsViewer />
    </div>
  );
}
