import { PageHeader } from "@/components/page-header";
import { SchematicsViewer } from "@/components/schematics-viewer";

export default function SchematicsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Schematics Library"
        description="View wiring diagrams and hydraulic circuits for various models."
      />
      <SchematicsViewer />
    </div>
  );
}
