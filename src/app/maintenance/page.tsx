import { PageHeader } from "@/components/page-header";
import { MaintenanceScheduler } from "@/components/maintenance-scheduler";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Lập lịch bảo trì"
        description="Theo dõi và quản lý các công việc bảo trì cho đội xe của bạn."
      />
      <MaintenanceScheduler />
    </div>
  );
}
