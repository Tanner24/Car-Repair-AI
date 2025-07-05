import { PageHeader } from "@/components/page-header";
import { TechnicalDataViewer } from "@/components/schematics-viewer";

export default function SchematicsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dữ liệu Kỹ thuật AI"
        description="Tạo sơ đồ kỹ thuật hoặc dữ liệu sửa chữa bằng AI theo yêu cầu."
      />
      <TechnicalDataViewer />
    </div>
  );
}
