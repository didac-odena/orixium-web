import { useEffect, useState } from "react";
import { getOpenTrades } from "../../services/index.js";
import {
    createDateTimeFormatter,
    createMoneyFormatter,
    createPercentFormatter,
} from "../../utils/formatters.js";
import {
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export default function OpenedTradesList() {
    const [trades, setTrades] = useState([]);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");

    const moneyFormatter = createMoneyFormatter();
    const percentFormatter = createPercentFormatter();
    const dateFormatter = createDateTimeFormatter();

    const calcTradePnl = (trade) => {
        // P&L in quote currency; invert for shorts.
        const direction = trade.side === "short" ? -1 : 1;
        return (trade.currentPrice - trade.entryPrice) * trade.qty * direction;
    };

    const calcTradePnlPercent = (trade) => {
        // Percentage P&L relative to entry.
        const direction = trade.side === "short" ? -1 : 1;
        return (
            ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) *
            100 *
            direction
        );
    };

    useEffect(() => {
        let isActive = true;
        // Avoid state updates if the component unmounts mid-request.

        const loadOpenTrades = async () => {
            try {
                // Fetch current open positions.
                const openTrades = await getOpenTrades();
                if (!isActive) return;
                setTrades(openTrades);
                setStatus("ready");
            } catch (err) {
                if (!isActive) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load trades.",
                );
                setStatus("error");
            }
        };

        loadOpenTrades();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <>
            {status === "loading" ? <p>Loading...</p> : null}
            {status === "error" ? <p className="text-danger">{error}</p> : null}

            {status === "ready" ? (
                trades.length ? (
                    <div className="space-y-3">
                        <div className="space-y-2 md:hidden">
                            {trades.map((trade) => {
                                const pnl = calcTradePnl(trade);
                                const pnlPercent = calcTradePnlPercent(trade);
                                const isPositive = pnl >= 0;
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
                                                    <div className="font-semibold">
                                                        {trade.symbol}
                                                    </div>
                                                    <div className="text-xs text-muted">
                                                        {dateFormatter.format(
                                                            new Date(
                                                                trade.openedAt,
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`text-sm ${accentClass}`}
                                            >
                                                {percentFormatter.format(
                                                    pnlPercent,
                                                )}
                                                %
                                            </div>
                                        </summary>
                                        <div className="border-t border-border px-4 py-3 text-sm text-muted">
                                            <div>Side: {trade.side}</div>
                                            <div>Type: {trade.orderType}</div>
                                            <div>
                                                Entry:{" "}
                                                {moneyFormatter.format(
                                                    trade.entryPrice,
                                                )}
                                            </div>
                                            <div>
                                                Current:{" "}
                                                {moneyFormatter.format(
                                                    trade.currentPrice,
                                                )}
                                            </div>
                                            <div>Qty: {trade.qty}</div>
                                            <div className={accentClass}>
                                                P&amp;L:{" "}
                                                {moneyFormatter.format(pnl)}
                                            </div>
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
                                                key: "opened",
                                                label: "Opened",
                                                className:
                                                    "px-4 py-3 whitespace-nowrap w-40",
                                            },
                                            { key: "symbol", label: "Symbol" },
                                            { key: "side", label: "Side" },
                                            { key: "type", label: "Type" },
                                            { key: "entry", label: "Entry" },
                                            {
                                                key: "current",
                                                label: "Current",
                                            },
                                            { key: "qty", label: "Qty" },
                                            { key: "pnl", label: "P&L" },
                                            {
                                                key: "pnlPercent",
                                                label: "P&L %",
                                            },
                                        ].map((column) => {
                                            return (
                                                <th
                                                    key={column.key}
                                                    className={
                                                        column.className ||
                                                        "px-4 py-3"
                                                    }
                                                    aria-label={
                                                        column.label || "Trend"
                                                    }
                                                >
                                                    {column.label}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.map((trade) => {
                                        const pnl = calcTradePnl(trade);
                                        const pnlPercent =
                                            calcTradePnlPercent(trade);
                                        const isPositive = pnl >= 0;
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
                                                key: "opened",
                                                className:
                                                    "px-4 py-3 text-muted whitespace-nowrap w-40",
                                                content: dateFormatter.format(
                                                    new Date(trade.openedAt),
                                                ),
                                            },
                                            {
                                                key: "symbol",
                                                className:
                                                    "px-4 py-3 font-semibold",
                                                content: trade.symbol,
                                            },
                                            {
                                                key: "side",
                                                className:
                                                    "px-4 py-3 uppercase text-muted",
                                                content: trade.side,
                                            },
                                            {
                                                key: "type",
                                                className:
                                                    "px-4 py-3 uppercase text-muted",
                                                content: trade.orderType,
                                            },
                                            {
                                                key: "entry",
                                                className: "px-4 py-3",
                                                content: moneyFormatter.format(
                                                    trade.entryPrice,
                                                ),
                                            },
                                            {
                                                key: "current",
                                                className: "px-4 py-3",
                                                content: moneyFormatter.format(
                                                    trade.currentPrice,
                                                ),
                                            },
                                            {
                                                key: "qty",
                                                className: "px-4 py-3",
                                                content: trade.qty,
                                            },
                                            {
                                                key: "pnl",
                                                className: `px-4 py-3 ${accentClass}`,
                                                content:
                                                    moneyFormatter.format(pnl),
                                            },
                                            {
                                                key: "pnlPercent",
                                                className: `px-4 py-3 ${accentClass}`,
                                                content: `${percentFormatter.format(pnlPercent)}%`,
                                            },
                                        ];

                                        return (
                                            <tr
                                                key={trade.id}
                                                className="border-b border-border"
                                            >
                                                {cells.map((cell) => {
                                                    return (
                                                        <td
                                                            key={cell.key}
                                                            className={
                                                                cell.className
                                                            }
                                                        >
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
                    <p className="text-muted">No open trades yet.</p>
                )
            ) : null}
        </>
    );
}
