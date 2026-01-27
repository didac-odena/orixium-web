import { PageLayout } from "../components/layout";
import { PageHeader } from "../components/ui";


export default function HomePage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Home" subtitle="Public page." />
        <div>Home (public)</div>
      </div>
    </PageLayout>
  );
}


