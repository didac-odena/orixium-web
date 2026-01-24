import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "../components/layout/index.js";
import { MarketExplorerMobileList } from "../components/market-explorer/market-explorer-mobile-list.jsx";
import { MarketExplorerEquityMobileList } from "../components/market-explorer/market-explorer-equity-mobile-list.jsx";
import { DataTable } from "../components/ui/table/data-table.jsx";
import { TablePagination } from "../components/ui/table/table-pagination.jsx";
import { TableToolbar } from "../components/ui/table/table-toolbar.jsx";
import { PageHeader } from "../components/ui/page-header.jsx";
import {
  DEFAULT_QUOTE_CURRENCY,
  SUPPORTED_QUOTE_CURRENCIES,
} from "../services/index.js";
import {
  createCompactCurrencyFormatter,
  createDateTimeFormatter,
  createPercentFormatter,
} from "../utils/formatters.js";
import { useMarketExplorer } from "./market-explorer/hooks/use-market-explorer.js";
import { usePaginatedTable } from "../hooks/use-paginated-table.js";
import {
  compareAssets,
  createPriceFormatter,
  createRowPriceFormatter,
  formatGroupLabel,
  getAccentClass,
  nextSortState,
} from "./market-explorer/market-explorer-utils.js";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE = 50;

export function MarketExplorerPage() {
  // UI-selected quote currency (usd/eur/gbp) drives formatting + fetch.
  const [currency, setCurrency] = useState(DEFAULT_QUOTE_CURRENCY);
  const [segment, setSegment] = useState("crypto");
  const [groupFilter, setGroupFilter] = useState("all");

  // Data source + refresh state (cooldown + notices).
  const {
    snapshots,
    status,
    error,
    isRefreshing,
    refreshNotice,
    refreshError,
    refreshNow,
  } = useMarketExplorer({
    market: segment,
    currency,
    intervalMs: 5 * 60 * 1000,
    cooldownMs: 60 * 1000,
  });

  // Formatters are memoized to avoid recreating on every render.
  const formatPrice = useMemo(
    () => {
      return createPriceFormatter(currency);
    },
    [currency],
  );

  const formatEquityPrice = useMemo(() => {
    return createRowPriceFormatter();
  }, []);

  const percentFormatter = useMemo(() => {
    return createPercentFormatter();
  }, []);

  const compactFormatter = useMemo(
    () => {
      return createCompactCurrencyFormatter(currency);
    },
    [currency],
  );

  const dateFormatter = useMemo(() => {
    return createDateTimeFormatter();
  }, []);

  const segments = [
    { id: "crypto", label: "Crypto" },
    { id: "equity", label: "Equity" },
    { id: "rates", label: "Rates" },
    { id: "forex", label: "Forex" },
    { id: "commodities", label: "Commodities" },
  ];

  const isCrypto = segment === "crypto";
  const isEquity = segment === "equity";
  const isRates = segment === "rates";
  const isForex = segment === "forex";
  const isCommodities = segment === "commodities";
  const isNonCrypto = !isCrypto;
  const groupFilterKey = isEquity
    ? "sector"
    : isRates || isForex || isCommodities
      ? "group"
      : "";
  const groupFilterOptions = useMemo(
    () => {
      if (!groupFilterKey) return [];
      const seen = new Set();
      const options = [];
      snapshots.forEach((row) => {
        const value = row?.[groupFilterKey];
        if (!value) return;
        const key = String(value);
        if (seen.has(key)) return;
        seen.add(key);
        options.push({ id: key, label: formatGroupLabel(key) });
      });
      return options;
    },
    [groupFilterKey, snapshots],
  );
  const showGroupFilters = groupFilterOptions.length > 0;
  const searchPlaceholder = isCrypto
    ? "Bitcoin, BTC, bitcoin..."
    : isEquity
      ? "Apple, AAPL, technology..."
      : isRates
        ? "Treasury, TLT, ZN..."
        : isForex
          ? "EUR/USD, USD/JPY..."
          : isCommodities
            ? "Gold, Oil, COFF..."
            : "Search assets...";
  const emptyMessage = isCrypto
    ? "No crypto assets found."
    : isEquity
      ? "No equity assets found."
      : isRates
        ? "No rates assets found."
        : isForex
          ? "No FX pairs found."
          : isCommodities
            ? "No commodities found."
            : "No market data available yet.";
  const subtitle = isCrypto
    ? "Market data for UI testing only. Snapshots persist in localStorage."
    : "Market data for UI testing only. Snapshots loaded from fixtures.";

  const filteredByGroup = useMemo(
    () => {
      if (!groupFilterKey || groupFilter === "all") return snapshots;
      return snapshots.filter((row) => {
        return String(row?.[groupFilterKey] || "") === groupFilter;
      });
    },
    [groupFilter, groupFilterKey, snapshots],
  );

  // Client-side filtering, plus page/global sorting and pagination.
  const {
    query,
    setQuery,
    setPage,
    totalPages,
    currentPage,
    filteredRows,
    paginatedRows,
    sortKey,
    sortMode,
    sortDir,
    handleSort,
  } = usePaginatedTable({
    rows: filteredByGroup,
    pageSize: PAGE_SIZE,
    // Simple client filter by id/symbol/name.
    filterFn: (item, term) => {
      return (
        item.id?.toLowerCase().includes(term) ||
        item.symbol?.toLowerCase().includes(term) ||
        item.name?.toLowerCase().includes(term) ||
        item.sector?.toLowerCase().includes(term) ||
        item.group?.toLowerCase().includes(term)
      );
    },
    compareFn: compareAssets,
    getNextSortState: nextSortState,
    // Jump to page 1 when switching into global sort.
    shouldResetPage: (nextState) => {
      return nextState.mode === "global";
    },
  });

  // Shape expected by DataTable for showing sort icons.
  const sortState = { key: sortKey, mode: sortMode, dir: sortDir };

  function renderSortIcon(key, state) {
    if (!state || state.key !== key) return null;
    const isDesc = state.dir === "desc";
    // Green for desc, red for asc to mirror market gain/loss colors.
    const iconClass = `h-3 w-3 ${isDesc ? "text-accent" : "text-danger"}`;

    // Single chevrons = page sort, double chevrons = global sort.
    if (state.mode === "global") {
      return isDesc ? (
        <ChevronDoubleDownIcon className={iconClass} aria-hidden="true" />
      ) : (
        <ChevronDoubleUpIcon className={iconClass} aria-hidden="true" />
      );
    }

    return isDesc ? (
      <ChevronDownIcon className={iconClass} aria-hidden="true" />
    ) : (
      <ChevronUpIcon className={iconClass} aria-hidden="true" />
    );
  }

  // Column definitions wire labels, sort keys, and formatters.
  const cryptoColumns = useMemo(
    () => {
      return [
        {
          key: "rank",
          label: "Market Cap Ranking",
          className: "px-4 py-2 w-28 text-muted",
          renderCell: (asset) => {
            return asset.market_cap_rank || "--";
          },
        },
        {
          key: "asset",
          label: "Asset",
          className: "px-4 py-2 w-60",
          renderCell: (asset) => {
            const iconSrc = asset.image || "";
            return (
              <div className="flex items-center gap-3">
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={asset.name}
                    className="h-8 w-8 rounded-md"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs">
                    {asset.symbol?.toUpperCase()}
                  </span>
                )}
                <div>
                  <div className="font-semibold">{asset.name}</div>
                  <div className="text-xs text-muted">
                    {asset.symbol?.toUpperCase()}
                  </div>
                </div>
              </div>
            );
          },
        },
        {
          key: "price",
          label: "Price",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return formatPrice(asset.current_price);
          },
        },
        {
          key: "change",
          label: "Price 24h %",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(
              asset.price_change_percentage_24h,
            );
            return (
              <span className={accentClass}>
                {asset.price_change_percentage_24h != null
                  ? `${percentFormatter.format(
                      asset.price_change_percentage_24h,
                    )}%`
                  : "--"}
              </span>
            );
          },
        },
        {
          key: "priceChange",
          label: "Price 24h",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(
              asset.price_change_percentage_24h,
            );
            return (
              <span className={accentClass}>
                {formatPrice(asset.price_change_24h)}
              </span>
            );
          },
        },
        {
          key: "high",
          label: "High 24h",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return formatPrice(asset.high_24h);
          },
        },
        {
          key: "low",
          label: "Low 24h",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return formatPrice(asset.low_24h);
          },
        },
        {
          key: "marketCap",
          label: "Market cap",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return asset.market_cap != null
              ? compactFormatter.format(asset.market_cap)
              : "--";
          },
        },
        {
          key: "marketCapChange",
          label: "Market cap 24h %",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(
              asset.market_cap_change_percentage_24h,
            );
            return (
              <span className={accentClass}>
                {asset.market_cap_change_percentage_24h != null
                  ? `${percentFormatter.format(
                      asset.market_cap_change_percentage_24h,
                    )}%`
                  : "--"}
              </span>
            );
          },
        },
        {
          key: "volume",
          label: "24h volume",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return asset.total_volume != null
              ? compactFormatter.format(asset.total_volume)
              : "--";
          },
        },
        {
          key: "updated",
          label: "Last updated",
          className: "px-4 py-2 text-muted whitespace-nowrap",
          renderCell: (asset) => {
            return asset.last_updated
              ? dateFormatter.format(new Date(asset.last_updated))
              : "--";
          },
        },
      ];
    },
    [compactFormatter, dateFormatter, formatPrice, percentFormatter],
  );

  const equityColumns = useMemo(
    () => {
      return [
        {
          key: "asset",
          label: "Asset",
          className: "px-4 py-2 w-64",
          renderCell: (asset) => {
            return (
              <div>
                <div className="font-semibold">{asset.name}</div>
                <div className="text-xs text-muted">
                  {asset.symbol?.toUpperCase()} · {asset.sector || "Equity"}
                </div>
              </div>
            );
          },
        },
        {
          key: "price",
          label: "Price",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return formatEquityPrice(asset.last, asset.currency);
          },
        },
        {
          key: "change",
          label: "1D %",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(asset.change_1d_pct);
            return (
              <span className={accentClass}>
                {asset.change_1d_pct != null
                  ? `${percentFormatter.format(asset.change_1d_pct)}%`
                  : "--"}
              </span>
            );
          },
        },
        {
          key: "priceChange",
          label: "1D",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(asset.change_1d_pct);
            return (
              <span className={accentClass}>
                {formatEquityPrice(asset.change_1d, asset.currency)}
              </span>
            );
          },
        },
        {
          key: "change1w",
          label: "1W %",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(asset.change_1w_pct);
            return (
              <span className={accentClass}>
                {asset.change_1w_pct != null
                  ? `${percentFormatter.format(asset.change_1w_pct)}%`
                  : "--"}
              </span>
            );
          },
        },
        {
          key: "change1m",
          label: "1M %",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(asset.change_1m_pct);
            return (
              <span className={accentClass}>
                {asset.change_1m_pct != null
                  ? `${percentFormatter.format(asset.change_1m_pct)}%`
                  : "--"}
              </span>
            );
          },
        },
        {
          key: "change1y",
          label: "1Y %",
          className: "px-4 py-2",
          renderCell: (asset) => {
            const accentClass = getAccentClass(asset.change_1y_pct);
            return (
              <span className={accentClass}>
                {asset.change_1y_pct != null
                  ? `${percentFormatter.format(asset.change_1y_pct)}%`
                  : "--"}
              </span>
            );
          },
        },
        {
          key: "bid",
          label: "Bid",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return formatEquityPrice(asset.bid, asset.currency);
          },
        },
        {
          key: "ask",
          label: "Ask",
          className: "px-4 py-2",
          renderCell: (asset) => {
            return formatEquityPrice(asset.ask, asset.currency);
          },
        },
        {
          key: "updated",
          label: "Last updated",
          className: "px-4 py-2 text-muted whitespace-nowrap",
          renderCell: (asset) => {
            return asset.last_updated
              ? dateFormatter.format(new Date(asset.last_updated))
              : "--";
          },
        },
      ];
    },
    [dateFormatter, formatEquityPrice, percentFormatter],
  );

  const columns = isCrypto ? cryptoColumns : equityColumns;

  useEffect(
    () => {
      setGroupFilter("all");
    },
    [segment],
  );

  useEffect(
    () => {
      if (!showGroupFilters || groupFilter === "all") return;
      const exists = groupFilterOptions.some((option) => {
        return option.id === groupFilter;
      });
      if (!exists) setGroupFilter("all");
    },
    [groupFilter, groupFilterOptions, showGroupFilters],
  );

  return (
    <PageLayout>
      <section className="space-y-2">
        <PageHeader
          title="Market Explorer"
          subtitle={subtitle}
          subtitleClassName="text-xs text-muted"
        />

        <TableToolbar
          topLeft={
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                {segments.map((segmentOption) => {
                  const isActive = segmentOption.id === segment;
                  return (
                    <button
                      key={segmentOption.id}
                      type="button"
                      className={`rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
                        isActive ? "text-ink" : "text-muted opacity-60"
                      }`}
                      onClick={() => {
                        setSegment(segmentOption.id);
                      }}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {segmentOption.label}
                    </button>
                  );
                })}
              </div>
              {showGroupFilters ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={`rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
                      groupFilter === "all"
                        ? "text-ink"
                        : "text-muted opacity-60"
                    }`}
                    onClick={() => {
                      setGroupFilter("all");
                      setPage(1);
                    }}
                    aria-pressed={groupFilter === "all"}
                  >
                    No filter
                  </button>
                  {groupFilterOptions.map((option) => {
                    const isActive = option.id === groupFilter;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
                          isActive ? "text-ink" : "text-muted opacity-60"
                        }`}
                        onClick={() => {
                          setGroupFilter(option.id);
                          setPage(1);
                        }}
                        aria-pressed={isActive}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          }
          bottomLeft={
            <>
              <label className="text-xs uppercase tracking-wide text-muted">
                Search
              </label>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-56 rounded-md border border-border bg-bg px-3 text-sm text-ink placeholder:text-muted"
              />
            </>
          }
          bottomCenter={
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={filteredRows.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          }
          bottomRight={
            <>
              {isCrypto ? (
                <>
                  <label className="text-xs uppercase tracking-wide text-muted">
                    Quote
                  </label>
                  <select
                    value={currency}
                    onChange={(event) => {
                      setCurrency(event.target.value);
                    }}
                    className="h-9 rounded-md border border-border bg-bg px-2 text-sm text-ink"
                  >
                    {SUPPORTED_QUOTE_CURRENCIES.map((ccy) => {
                      return (
                        <option key={ccy} value={ccy}>
                          {ccy.toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                </>
              ) : null}
              <div className="relative flex flex-col items-start">
                <button
                  type="button"
                  onClick={() => {
                    // Force refresh respects cooldown in the hook.
                    refreshNow({ force: true });
                  }}
                  className={`group inline-flex h-9 items-center justify-center rounded-md border border-border px-2 text-sm text-ink hover:text-accent ${
                    isRefreshing ? "opacity-50" : ""
                  }`}
                  aria-disabled={isRefreshing}
                  aria-label="Refresh all"
                  title="Refresh all"
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
                {refreshNotice ? (
                  <span className="absolute right-0 top-full z-50 mt-2 w-56 break-all rounded-md border border-danger/40 bg-bg px-2 py-1 text-xs text-danger shadow-lg">
                    {refreshNotice}
                  </span>
                ) : null}
              </div>
              {refreshError ? (
                <span className="text-xs text-danger">{refreshError}</span>
              ) : null}
            </>
          }
        />

        {status === "loading" ? (
          <p className="text-sm text-muted">Loading market data...</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-danger">{error}</p>
        ) : null}

        {status === "ready" ? (
          filteredRows.length ? (
            <div className="space-y-3">
              {/* Mobile uses a collapsible list; desktop uses the data table. */}
              {isNonCrypto ? (
                <MarketExplorerEquityMobileList
                  rows={paginatedRows}
                  formatPrice={formatEquityPrice}
                  percentFormatter={percentFormatter}
                  dateFormatter={dateFormatter}
                />
              ) : isCrypto ? (
                <MarketExplorerMobileList
                  rows={paginatedRows}
                  formatPrice={formatPrice}
                  percentFormatter={percentFormatter}
                  compactFormatter={compactFormatter}
                  dateFormatter={dateFormatter}
                />
              ) : null}
              <DataTable
                columns={columns}
                rows={paginatedRows}
                rowKey="id"
                onSort={handleSort}
                sortState={sortState}
                renderSortIcon={renderSortIcon}
                className="hidden md:block overflow-x-visible"
                tableClassName="w-full border-collapse text-sm"
                headerRowClassName="border-b border-border text-left text-xs uppercase tracking-wide text-muted"
                rowClassName="border-b border-border"
              />
            </div>
          ) : (
            <p className="text-muted">{emptyMessage}</p>
          )
        ) : null}

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </section>
    </PageLayout>
  );
}



