import { PageHeader } from "@/components/page-header";
import ErrorCodeTroubleshooting from "@/components/error-code-troubleshooting";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Phân tích mã lỗi"
        description="Nhập mã lỗi để nhận các nguyên nhân tiềm ẩn và các bước khắc phục sự cố."
      />
      <ErrorCodeTroubleshooting />
    </div>
  );
}
