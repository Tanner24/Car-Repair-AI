import { PageHeader } from "@/components/page-header";
import ErrorCodeTroubleshooting from "@/components/error-code-troubleshooting";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Error Code Analysis"
        description="Input an error code to get potential causes and troubleshooting steps."
      />
      <ErrorCodeTroubleshooting />
    </div>
  );
}
