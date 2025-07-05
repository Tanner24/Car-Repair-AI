import { PageHeader } from "@/components/page-header";
import { ApiSettings } from "@/components/api-settings";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cài đặt API"
        description="Quản lý khóa API của bạn để tích hợp."
      />
      <ApiSettings />
    </div>
  );
}
