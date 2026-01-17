import { useEffect, useState } from "react";
import { PageLayout } from "../../components/layout/index.js";
import { getTradeHistory } from "../../services/index.js";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export function HistorialPage() {
  const [trades, setTrades] = useState([]);
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
              <div className="space-y-2 md:hidden">
                {trades.map(function (trade) {
                  const isPositive = trade.pnlUsd >= 0;
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
                    <details
                      key={trade.id}
                      className="rounded-lg border border-border"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm">
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
                            <div className="font-semibold">{trade.symbol}</div>
                            <div className="text-xs text-muted">
                              {dateFormatter.format(new Date(trade.closedAt))}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm ${accentClass}`}>
                          {percentFormatter.format(trade.pnlPct)}%
                        </div>
                      </summary>
                      <div className="border-t border-border px-4 py-3 text-sm text-muted">
                        <div>Side: {trade.side}</div>
                        <div>Entry: {moneyFormatter.format(trade.entryPrice)}</div>
                        <div>Exit: {moneyFormatter.format(trade.exitPrice)}</div>
                        <div>Qty: {trade.qty}</div>
                        <div className={accentClass}>
                          P&amp;L: {moneyFormatter.format(trade.pnlUsd)}
                        </div>
                        <div>Reason: {trade.exitReason}</div>
                      </div>
                    </details>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                      {[
                        { key: "trend", label: "" },
                        {
                          key: "closed",
                          label: "Closed",
                          className: "px-4 py-3 whitespace-nowrap w-40",
                        },
                        { key: "symbol", label: "Symbol" },
                        { key: "side", label: "Side" },
                        { key: "entry", label: "Entry" },
                        { key: "exit", label: "Exit" },
                        { key: "qty", label: "Qty" },
                        { key: "pnl", label: "P&L" },
                        { key: "pnlPercent", label: "P&L %" },
                        { key: "reason", label: "Reason" },
                      ].map(function (column) {
                        return (
                          <th
                            key={column.key}
                            className={column.className || "px-4 py-3"}
                            aria-label={column.label || "Trend"}
                          >
                            {column.label}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(function (trade) {
                      const isPositive = trade.pnlUsd >= 0;
                      const accentClass = isPositive
                        ? "text-accent"
                        : "text-accent-2";
                      const badgeClass = isPositive
                        ? "border-accent/40 bg-accent/10"
                        : "border-accent-2/40 bg-accent-2/10";
                      const Icon = isPositive
                        ? ArrowTrendingUpIcon
                        : ArrowTrendingDownIcon;
                      const cells = [
                        {
                          key: "trend",
                          className: "px-4 py-3",
                          content: (
                            <span
                              className={`inline-flex shrink-0 rounded-full border p-1 ${badgeClass}`}
                            >
                              <Icon
                                className={`h-4 w-4 ${accentClass}`}
                                aria-hidden="true"
                              />
                            </span>
                          ),
                        },
                        {
                          key: "closed",
                          className: "px-4 py-3 text-muted whitespace-nowrap w-40",
                          content: dateFormatter.format(
                            new Date(trade.closedAt)
                          ),
                        },
                        {
                          key: "symbol",
                          className: "px-4 py-3 font-semibold",
                          content: trade.symbol,
                        },
                        {
                          key: "side",
                          className: "px-4 py-3 uppercase text-muted",
                          content: trade.side,
                        },
                        {
                          key: "entry",
                          className: "px-4 py-3",
                          content: moneyFormatter.format(trade.entryPrice),
                        },
                        {
                          key: "exit",
                          className: "px-4 py-3",
                          content: moneyFormatter.format(trade.exitPrice),
                        },
                        {
                          key: "qty",
                          className: "px-4 py-3",
                          content: trade.qty,
                        },
                        {
                          key: "pnl",
                          className: `px-4 py-3 ${accentClass}`,
                          content: moneyFormatter.format(trade.pnlUsd),
                        },
                        {
                          key: "pnlPercent",
                          className: `px-4 py-3 ${accentClass}`,
                          content: `${percentFormatter.format(trade.pnlPct)}%`,
                        },
                        {
                          key: "reason",
                          className: "px-4 py-3 uppercase text-muted",
                          content: trade.exitReason,
                        },
                      ];

                      return (
                        <tr key={trade.id} className="border-b border-border">
                          {cells.map(function (cell) {
                            return (
                              <td key={cell.key} className={cell.className}>
                                {cell.content}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-muted">No history yet.</p>
          )
        ) : null}
      </section>
    </PageLayout>
  );
}
