import { PageHeader } from "@/components/page-header";
import { SchematicsViewer } from "@/components/schematics-viewer";

export default function SchematicsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Thư viện sơ đồ"
        description="Xem sơ đồ dây và mạch thủy lực cho các kiểu xe khác nhau."
      />
      <SchematicsViewer />
    </div>
  );
}
