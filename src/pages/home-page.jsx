import { PageLayout } from "../components/layout/index.js";
import { PageHeader } from "../components/ui/page-header.jsx";

export function HomePage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Home" subtitle="Public page." />
        <div>Home (public)</div>
      </div>
    </PageLayout>
  );
}


