import { PageLayout } from "../components/layout/index.js";
import { PageHeader } from "../components/ui/page-header.jsx";

export function DashboardPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Dashboard" subtitle="Coming soon." />
        <div>Dashboard (coming soon)</div>
      </div>
    </PageLayout>
  );
}


