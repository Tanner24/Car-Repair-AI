import { PageHeader } from "@/components/page-header";
import { MaintenanceScheduler } from "@/components/maintenance-scheduler";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Maintenance Scheduler"
        description="Track and manage maintenance tasks for your fleet."
      />
      <MaintenanceScheduler />
    </div>
  );
}
