import { PageLayout } from "../components/layout";
import PageHeader from "../components/ui/page-header";

export default function SettingsPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Settings" subtitle="Private area." />
      </div>
    </PageLayout>
  );
}


