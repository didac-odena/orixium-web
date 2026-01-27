import { PageLayout } from "../components/layout";
import { PageHeader } from "../components/ui";


export default function DashboardPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Dashboard" subtitle="Coming soon." />
        <div>Dashboard (coming soon)</div>
      </div>
    </PageLayout>
  );
}


