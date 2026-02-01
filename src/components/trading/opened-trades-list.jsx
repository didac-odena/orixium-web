import { useEffect, useState } from "react";
import {
    closeManualTrade,
    getOpenTrades,
    loadGlobalMarketAssets,
} from "../../services/index.js";
import {
    buildSymbolOptions,
    filterBySymbol,
    normalizeSymbol,
} from "../../utils/symbol-search.js";
import { GlobalAssetSearch } from "../ui";
import AdvertiseModal from "./new-trade/advertise-modal.jsx";
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
    const [isRefreshing, setIsRefreshing] = useState(false);
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

    const getQuoteFromSymbol = (symbol) => {
        const raw = String(symbol || "");
        if (!raw) return "";
        if (raw.includes("/")) return raw.split("/")[1] || "";
        if (raw.includes("-")) return raw.split("-")[1] || "";
        return "";
    };

    const formatPnlLabel = (trade) => {
        const pnl = calcTradePnl(trade);
        const pnlPercent = calcTradePnlPercent(trade);
        const quoteCurrency = getQuoteFromSymbol(trade.symbol).toUpperCase();
        return `${moneyFormatter.format(pnl)} ${quoteCurrency} (${percentFormatter.format(
            pnlPercent,
        )}%)`;
    };

    const isManualTrade = (trade) => {
        return String(trade?.id || "").startsWith("manual-trade-");
    };

    const getBaseSymbol = (symbol) => {
        const raw = String(symbol || "");
        if (!raw) return "";
        if (raw.includes("/")) return raw.split("/")[0] || "";
        if (raw.includes("-")) return raw.split("-")[0] || "";
        return raw;
    };

    const normalizeSymbolKey = (value) => {
        return String(value || "")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "");
    };

    const buildPriceLookup = (marketData) => {
        const priceMap = new Map();
        const lists = Object.values(marketData || {});

        lists.forEach((items) => {
            items.forEach((item) => {
                const rawPrice =
                    item?.current_price ?? item?.last ?? item?.close ?? null;
                const price = Number(rawPrice);
                const symbolKey = normalizeSymbolKey(item?.symbol);
                if (!symbolKey || !Number.isFinite(price)) return;
                priceMap.set(symbolKey, price);
            });
        });

        return priceMap;
    };

    const refreshCurrentPrices = async () => {
        setIsRefreshing(true);
        setError("");

        try {
            const marketData = await loadGlobalMarketAssets();
            const priceMap = buildPriceLookup(marketData);

            setTrades((prevTrades) => {
                return prevTrades.map((trade) => {
                    const baseSymbol = getBaseSymbol(trade.symbol);
                    const baseKey = normalizeSymbolKey(baseSymbol);
                    const fullKey = normalizeSymbolKey(trade.symbol);
                    const nextPrice =
                        priceMap.get(fullKey) ?? priceMap.get(baseKey);

                    if (!Number.isFinite(nextPrice)) {
                        return trade;
                    }

                    return { ...trade, currentPrice: nextPrice };
                });
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to refresh prices.",
            );
        } finally {
            setIsRefreshing(false);
        }
    };

    const [pendingCloseTrade, setPendingCloseTrade] = useState(null);
    const isConfirmOpen = Boolean(pendingCloseTrade);

    const requestCloseTrade = (trade) => {
        if (!isManualTrade(trade)) {
            setError("Only manual trades can be closed in demo.");
            return;
        }
        setPendingCloseTrade(trade);
    };

    const handleConfirmClose = async () => {
        if (!pendingCloseTrade) return;
        setStatus("loading");
        closeManualTrade(pendingCloseTrade.id, {
            exitPrice: pendingCloseTrade.currentPrice,
        });

        try {
            const openTrades = await getOpenTrades();
            setTrades(openTrades);
            setStatus("ready");
            setError("");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load trades.",
            );
            setStatus("error");
        } finally {
            setPendingCloseTrade(null);
        }
    };

    const handleCancelClose = () => {
        setPendingCloseTrade(null);
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

    const [symbolQuery, setSymbolQuery] = useState("");

    const handleSymbolSearchChange = (nextValue) => {
        setSymbolQuery(nextValue);
    };

    const handleSymbolSearchSelect = (option) => {
        if (!option) return;
        setSymbolQuery(option.symbol);
    };

    const searchOptions = buildSymbolOptions(trades);
    const filteredTrades = filterBySymbol(trades, symbolQuery);
    const getOpenedAtValue = (trade) => {
        return new Date(trade.openedAt || trade.createdAt || 0).getTime();
    };
    const sortedTrades = [...filteredTrades].sort((a, b) => {
        return getOpenedAtValue(b) - getOpenedAtValue(a);
    });
    const hasTrades = trades.length > 0;
    const hasFilteredTrades = filteredTrades.length > 0;
    const hasSearchQuery = Boolean(normalizeSymbol(symbolQuery));

    return (
        <>
            {status === "loading" ? <p>Loading...</p> : null}
            {status === "error" ? <p className="text-danger">{error}</p> : null}

            {status === "ready" ? (
                hasTrades ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <GlobalAssetSearch
                                options={searchOptions}
                                onSelect={handleSymbolSearchSelect}
                                onQueryChange={handleSymbolSearchChange}
                                placeholder="Search symbol..."
                            />

                            <button
                                type="button"
                                onClick={refreshCurrentPrices}
                                className={`group inline-flex h-9 items-center justify-center rounded-md border border-border px-2 text-sm text-ink hover:text-accent ${
                                    isRefreshing ? "opacity-50" : ""
                                }`}
                                aria-disabled={isRefreshing}
                                aria-label="Refresh prices"
                                title="Refresh prices"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 text-muted transition-colors group-hover:text-accent"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M4 4v6h6M20 20v-6h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M20 10a8 8 0 0 0-14-4M4 14a8 8 0 0 0 14 4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {!hasFilteredTrades && hasSearchQuery ? (
                            <p className="text-muted">
                                No trades match this symbol.
                            </p>
                        ) : null}
                        <div className="space-y-2 md:hidden">
                            {sortedTrades.map((trade) => {
                                const pnl = calcTradePnl(trade);
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
                                const pnlLabel = formatPnlLabel(trade);

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
                                                {pnlLabel}
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
                                                {pnlLabel}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    requestCloseTrade(trade)
                                                }
                                                className="mt-2 w-full rounded border border-border bg-bg px-2 py-1 text-xs uppercase tracking-wide text-muted hover:border-accent-2 hover:text-accent-2"
                                            >
                                                Close trade
                                            </button>
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
                                            { key: "close", label: "" },
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
                                    {sortedTrades.map((trade) => {
                                        const pnl = calcTradePnl(trade);
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
                                        const pnlLabel = formatPnlLabel(trade);
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
                                                content: pnlLabel,
                                            },
                                            {
                                                key: "close",
                                                className:
                                                    "px-4 py-3 text-right",
                                                content: (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            requestCloseTrade(
                                                                trade,
                                                            )
                                                        }
                                                        className="rounded border border-border bg-bg px-2 py-1 text-xs uppercase tracking-wide text-muted hover:border-accent-2 hover:text-accent-2"
                                                    >
                                                        Close
                                                    </button>
                                                ),
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
            <AdvertiseModal
                isOpen={isConfirmOpen}
                title="Close trade"
                message={
                    pendingCloseTrade
                        ? `Close ${pendingCloseTrade.symbol} position?`
                        : "Close this trade?"
                }
                onClose={handleCancelClose}
                onConfirm={handleConfirmClose}
                confirmLabel="Close"
                cancelLabel="Cancel"
            />
        </>
    );
}
