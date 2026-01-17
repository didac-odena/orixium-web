import { useEffect, useState } from "react";
import { PageLayout } from "../../components/layout/index.js";
import { getTradeHistory } from "../../services/index.js";

export function HistorialPage() {
  const [trades, setTrades] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(function () {
    let isActive = true;

    async function loadHistory() {
      try {
        const data = await getTradeHistory();
        if (!isActive) return;
        setTrades(data);
        setStatus("ready");
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Failed to load history.");
        setStatus("error");
      }
    }

    loadHistory();

    return function () {
      isActive = false;
    };
  }, []);

  return (
    <PageLayout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Historial</h1>
          <p className="text-muted">Closed trades (private)</p>
        </header>

        {status === "loading" ? <p>Loading...</p> : null}
        {status === "error" ? <p className="text-danger">{error}</p> : null}

        {status === "ready" ? (
          trades.length ? (
            <div className="space-y-3">
              {trades.map(function (trade) {
                return (
                  <article
                    key={trade.id}
                    className="rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{trade.symbol}</div>
                      <div className="text-sm text-muted">
                        {trade.side.toUpperCase()} · {trade.orderType}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted">
                      Entry: {trade.entryPrice} · Exit: {trade.exitPrice} · Qty:{" "}
                      {trade.qty}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="text-muted">No history yet.</p>
          )
        ) : null}
      </section>
    </PageLayout>
  );
}
