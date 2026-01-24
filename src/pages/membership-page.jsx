import { PageLayout } from "../components/layout/index.js";
import { PageHeader } from "../components/ui/page-header.jsx";

export function MembershipPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Membership" subtitle="Public page." />
      </div>
    </PageLayout>
  );
}


