import { useEffect, useState } from "react";
import { PageLayout } from "../components/layout";
import { PageHeader, TradingViewTickerTape, TradingViewTimeline } from "../components/ui";
import { getOpenTrades, getTradeHistory } from "../services/index.js";
import {
  createDateTimeFormatter,
  createMoneyFormatter,
  createPercentFormatter,
} from "../utils/formatters.js";

export default function DashboardPage() {
  const [openTrades, setOpenTrades] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const moneyFormatter = createMoneyFormatter();
  const percentFormatter = createPercentFormatter();
  const dateFormatter = createDateTimeFormatter();

  const calcOpenTradePnl = (trade) => {
    const direction = trade.side === "short" ? -1 : 1;
    return (trade.currentPrice - trade.entryPrice) * trade.qty * direction;
  };

  const calcOpenTradePnlPercent = (trade) => {
    const direction = trade.side === "short" ? -1 : 1;
    return ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100 * direction;
  };

  const buildPnlLabel = (pnlUsd, pnlPct) => {
    return `${moneyFormatter.format(pnlUsd)} (${percentFormatter.format(pnlPct)}%)`;
  };

  useEffect(() => {
    let isActive = true;

    const loadTrades = async () => {
      try {
        const [open, history] = await Promise.all([getOpenTrades(), getTradeHistory()]);
        if (!isActive) return;
        setOpenTrades(open);
        setClosedTrades(history);
        setStatus("ready");
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Failed to load trades.");
        setStatus("error");
      }
    };

    loadTrades();

    return () => {
      isActive = false;
    };
  }, []);

  const topOpenTrades = [...openTrades]
    .sort((a, b) => calcOpenTradePnl(b) - calcOpenTradePnl(a))
    .slice(0, 5);

  const lastClosedTrades = [...closedTrades]
    .sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))
    .slice(0, 5);

  const renderTopOpenTrade = (trade) => {
    const pnlUsd = calcOpenTradePnl(trade);
    const pnlPct = calcOpenTradePnlPercent(trade);
    const accentClass = pnlUsd >= 0 ? "text-accent" : "text-accent-2";
    return (
      <div
        key={trade.id}
        className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0"
      >
        <div>
          <div className="font-semibold text-ink">{trade.symbol}</div>
          <div className="text-xs text-muted">
            Opened: {dateFormatter.format(new Date(trade.openedAt))}
          </div>
        </div>
        <div className={`text-right text-sm ${accentClass}`}>{buildPnlLabel(pnlUsd, pnlPct)}</div>
      </div>
    );
  };

  const renderLastClosedTrade = (trade) => {
    const accentClass = trade.pnlUsd >= 0 ? "text-accent" : "text-accent-2";
    return (
      <div
        key={trade.id}
        className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0"
      >
        <div>
          <div className="font-semibold text-ink">{trade.symbol}</div>
          <div className="text-xs text-muted">
            Closed: {dateFormatter.format(new Date(trade.closedAt))}
          </div>
        </div>
        <div className={`text-right text-sm ${accentClass}`}>
          {buildPnlLabel(trade.pnlUsd, trade.pnlPct)}
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="space-y-2">
        <PageHeader title="Dashboard" />

        <div className="border border-border rounded p-0.5 bg bg-surface-2"
        >          <TradingViewTickerTape />
        </div>

        {status === "loading" ? <p>Loading...</p> : null}
        {status === "error" ? <p className="text-danger">{error}</p> : null}

        {status === "ready" ? (
          <div className="grid gap-2 lg:grid-cols-[1fr_1fr_1fr]">
            <div className="border p-0.5 border-border bg-surface-2 rounded">
              <TradingViewTimeline className="h-[55vh] w-full" />
            </div>

            <div className="rounded border border-border bg bg-surface-2 p-4">
              <div className="text-sm font-semibold text-ink">Top 5 Current Trades</div>
              <div className="mt-3 space-y-1">
                {topOpenTrades.length ? (
                  topOpenTrades.map(renderTopOpenTrade)
                ) : (
                  <p className="text-sm text-muted">No open trades yet.</p>
                )}
              </div>
            </div>
            <div className="rounded border border-border bg bg-surface-2 p-4">
              <div className="text-sm font-semibold text-ink">Last Trades Closed</div>
              <div className="mt-3 space-y-1">
                {lastClosedTrades.length ? (
                  lastClosedTrades.map(renderLastClosedTrade)
                ) : (
                  <p className="text-sm text-muted">No closed trades yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}
