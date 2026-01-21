import { useEffect, useState } from "react";
import { PageLayout } from "../../components/layout/index.js";
import { getPortfolioSummary } from "../../services/index.js";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export function PortfolioPage() {
  const [summaries, setSummaries] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const percentFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });

  useEffect(function () {
    let isActive = true;
    // Avoid state updates if the component unmounts mid-request.

    async function loadSummary() {
      try {
        // Fetch full portfolio summary list.
        const data = await getPortfolioSummary();
        if (!isActive) return;
        setSummaries(data);
        setStatus("ready");
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Failed to load portfolio.");
        setStatus("error");
      }
    }

    loadSummary();

    return function () {
      isActive = false;
    };
  }, []);

  return (
    <PageLayout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Portfolio</h1>
          <p className="text-muted">Summary by account (private)</p>
        </header>

        {status === "loading" ? <p>Loading...</p> : null}
        {status === "error" ? <p className="text-danger">{error}</p> : null}

        {status === "ready" ? (
          summaries.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {summaries.map(function (summary) {
                const isPositive = summary.openPnl >= 0;
                const accentClass = isPositive
                  ? "text-accent"
                  : "text-accent-2";
                const badgeClass = isPositive
                  ? "border-accent/40 bg-accent/10"
                  : "border-accent-2/40 bg-accent-2/10";
                const Icon = isPositive
                  ? ArrowTrendingUpIcon
                  : ArrowTrendingDownIcon;

                return (
                  <article
                    key={summary.accountId}
                    className="rounded-lg border border-border bg-bg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex shrink-0 rounded-full border p-1 ${badgeClass}`}
                        >
                          <Icon
                            className={`h-4 w-4 ${accentClass}`}
                            aria-hidden="true"
                          />
                        </span>
                        <div>
                          <div className="font-semibold">{summary.broker}</div>
                          <div className="text-xs text-muted">
                            {summary.accountId}
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm ${accentClass}`}>
                        {moneyFormatter.format(summary.openPnl)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-muted">
                      <div>
                        Equity:{" "}
                        <span className="text-ink">
                          {moneyFormatter.format(summary.equity)}
                        </span>
                      </div>
                      <div>
                        Balance:{" "}
                        <span className="text-ink">
                          {moneyFormatter.format(summary.balance)}
                        </span>
                      </div>
                      <div>
                        Day P&amp;L:{" "}
                        <span className={accentClass}>
                          {moneyFormatter.format(summary.dayPnl)}
                        </span>
                      </div>
                      <div>
                        Exposure:{" "}
                        <span className="text-ink">
                          {percentFormatter.format(summary.exposure * 100)}%
                        </span>
                      </div>
                      <div>
                        Positions:{" "}
                        <span className="text-ink">{summary.positionsCount}</span>
                      </div>
                      <div>
                        Updated:{" "}
                        <span className="text-ink">
                          {dateFormatter.format(new Date(summary.updatedAt))}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="text-muted">No portfolio data yet.</p>
          )
        ) : null}
      </section>
    </PageLayout>
  );
}
