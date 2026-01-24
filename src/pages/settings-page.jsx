import { PageLayout } from "../components/layout/index.js";
import { PageHeader } from "../components/ui/page-header.jsx";

export function SettingsPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Settings" subtitle="Private area." />
      </div>
    </PageLayout>
  );
}


