import { PageLayout } from "../../components/layout";
import { PageHeader } from "../../components/ui";

import OpenedTradesList from "../../components/trading/opened-trades-list";

export default function CurrentTradesPage() {
    return (
        <PageLayout>
            <section className="space-y-6">
                <PageHeader
                    title="Current Trades"
                    subtitle="Real-time view of active positions."
                    subtitleClassName="text-muted text-xs"
                />
                <OpenedTradesList />
            </section>
        </PageLayout>
    );
}
