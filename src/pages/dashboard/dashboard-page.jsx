import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "../../components/layout/index.js";
import { getOpenTrades, getPortfolioSummary } from "../../services/index.js";

export function DashboardPage() {
  const [summaries, setSummaries] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [openTrades, setOpenTrades] = useState([]);
  const [openStatus, setOpenStatus] = useState("loading");
  const [openError, setOpenError] = useState("");

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

  function getPnlPercent(trade) {
    const direction = trade.side === "short" ? -1 : 1;
    return (
      ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) *
      100 *
      direction
    );
  }

  const totals = useMemo(function () {
    const list = Array.isArray(summaries) ? summaries : [];
    return list.reduce(
      function (acc, summary) {
        return {
          equity: acc.equity + summary.equity,
          balance: acc.balance + summary.balance,
          openPnl: acc.openPnl + summary.openPnl,
          dayPnl: acc.dayPnl + summary.dayPnl,
          accounts: acc.accounts + 1,
        };
      },
      { equity: 0, balance: 0, openPnl: 0, dayPnl: 0, accounts: 0 }
    );
  }, [summaries]);

  useEffect(function () {
    let isActive = true;

    async function loadSummary() {
      try {
    const data = await getPortfolioSummary();
        if (!isActive) return;
        setSummaries(Array.isArray(data) ? data : []);
        setStatus("ready");
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Failed to load summary.");
        setStatus("error");
      }
    }

    loadSummary();

    return function () {
      isActive = false;
    };
  }, []);

  useEffect(function () {
    let isActive = true;

    async function loadOpenTrades() {
      try {
        const data = await getOpenTrades();
        if (!isActive) return;
        setOpenTrades(data);
        setOpenStatus("ready");
      } catch (err) {
        if (!isActive) return;
        setOpenError(
          err instanceof Error ? err.message : "Failed to load open trades."
        );
        setOpenStatus("error");
      }
    }

    loadOpenTrades();

    return function () {
      isActive = false;
    };
  }, []);

  return (
    <PageLayout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted">Quick overview</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-lg border border-border bg-bg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Portfolio</h2>
                <p className="text-sm text-muted">Summary by account.</p>
              </div>
              <Link
                to="/portfolio"
                className="text-sm text-accent hover:text-accent-2"
              >
                View
              </Link>
            </div>
            <div className="mt-4">
              {status === "loading" ? (
                <p className="text-sm text-muted">Loading summary...</p>
              ) : null}
              {status === "error" ? (
                <p className="text-sm text-danger">{error}</p>
              ) : null}
              {status === "ready" ? (
                <div className="grid gap-2 text-sm text-muted">
                  <div>
                    Equity:{" "}
                    <span className="text-ink">
                      {moneyFormatter.format(totals.equity)}
                    </span>
                  </div>
                  <div>
                    Balance:{" "}
                    <span className="text-ink">
                      {moneyFormatter.format(totals.balance)}
                    </span>
                  </div>
                  <div>
                    Open P&amp;L:{" "}
                    <span
                      className={
                        totals.openPnl >= 0 ? "text-accent" : "text-accent-2"
                      }
                    >
                      {moneyFormatter.format(totals.openPnl)}
                    </span>
                  </div>
                  <div>
                    Day P&amp;L:{" "}
                    <span
                      className={
                        totals.dayPnl >= 0 ? "text-accent" : "text-accent-2"
                      }
                    >
                      {moneyFormatter.format(totals.dayPnl)}
                    </span>
                  </div>
                  <div>
                    Accounts:{" "}
                    <span className="text-ink">{totals.accounts}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
          <article className="rounded-lg border border-border bg-bg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Open Trades</h2>
                <p className="text-sm text-muted">Latest active positions.</p>
              </div>
              <Link
                to="/trading"
                className="text-sm text-accent hover:text-accent-2"
              >
                View
              </Link>
            </div>
            <div className="mt-4">
              {openStatus === "loading" ? (
                <p className="text-sm text-muted">Loading open trades...</p>
              ) : null}
              {openStatus === "error" ? (
                <p className="text-sm text-danger">{openError}</p>
              ) : null}
              {openStatus === "ready" ? (
                openTrades.length ? (
                  <div className="space-y-2 text-sm">
                    {openTrades.slice(0, 3).map(function (trade) {
                      const pnlPercent = getPnlPercent(trade);
                      const accentClass =
                        pnlPercent >= 0 ? "text-accent" : "text-accent-2";
                      return (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between border-b border-border pb-2 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <div className="font-semibold">{trade.symbol}</div>
                            <div className="text-xs text-muted">
                              {dateFormatter.format(
                                new Date(trade.openedAt)
                              )}
                            </div>
                          </div>
                          <div className={`text-sm ${accentClass}`}>
                            {percentFormatter.format(pnlPercent)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No open trades.</p>
                )
              ) : null}
            </div>
          </article>
        </div>
      </section>
    </PageLayout>
  );
}
