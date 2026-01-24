import { PageLayout } from "../components/layout/index.js";
import { PageHeader } from "../components/ui/page-header.jsx";

export function PortfolioPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Portfolio" subtitle="Coming soon." />
        <div>Portfolio (coming soon)</div>
      </div>
    </PageLayout>
  );
}


