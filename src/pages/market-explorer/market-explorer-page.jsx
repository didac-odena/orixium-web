import { useMemo, useState } from "react";
import { PageLayout } from "../../components/layout/index.js";
import { MarketExplorerMobileList } from "../../components/market-explorer/market-explorer-mobile-list.jsx";
import { DataTable } from "../../components/ui/data-table.jsx";
import { TablePagination } from "../../components/ui/table-pagination.jsx";
import { TableToolbar } from "../../components/ui/table-toolbar.jsx";
import {
  DEFAULT_QUOTE_CURRENCY,
  SUPPORTED_QUOTE_CURRENCIES,
} from "../../services/index.js";
import {
  createCompactCurrencyFormatter,
  createDateTimeFormatter,
  createPercentFormatter,
} from "../../utils/formatters.js";
import { useMarketExplorer } from "./hooks/use-market-explorer.js";
import { usePaginatedTable } from "../../hooks/use-paginated-table.js";
import {
  compareAssets,
  createPriceFormatter,
  getAccentClass,
  nextSortState,
} from "./market-explorer-utils.js";
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
    currency,
    intervalMs: 5 * 60 * 1000,
    cooldownMs: 60 * 1000,
  });

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
    rows: snapshots,
    pageSize: PAGE_SIZE,
    // Simple client filter by id/symbol/name.
    filterFn: function (item, term) {
      return (
        item.id?.toLowerCase().includes(term) ||
        item.symbol?.toLowerCase().includes(term) ||
        item.name?.toLowerCase().includes(term)
      );
    },
    compareFn: compareAssets,
    getNextSortState: nextSortState,
    // Jump to page 1 when switching into global sort.
    shouldResetPage: function (nextState) {
      return nextState.mode === "global";
    },
  });

  // Formatters are memoized to avoid recreating on every render.
  const formatPrice = useMemo(
    function () {
      return createPriceFormatter(currency);
    },
    [currency],
  );

  const percentFormatter = useMemo(function () {
    return createPercentFormatter();
  }, []);

  const compactFormatter = useMemo(
    function () {
      return createCompactCurrencyFormatter(currency);
    },
    [currency],
  );

  const dateFormatter = useMemo(function () {
    return createDateTimeFormatter();
  }, []);

  // Market segments are visual for now; only crypto is active.
  //TODO: implementar resto de mercados con apì de stooq.
  const segments = [
    { label: "Crypto", isActive: true },
    { label: "Indexes", isActive: false },
    { label: "Forex", isActive: false },
    { label: "Commodities", isActive: false },
  ];

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
  const columns = useMemo(
    function () {
      return [
        {
          key: "rank",
          label: "Market Cap Ranking",
          className: "px-4 py-2 w-28 text-muted",
          renderCell: function (asset) {
            return asset.market_cap_rank || "--";
          },
        },
        {
          key: "asset",
          label: "Asset",
          className: "px-4 py-2 w-60",
          renderCell: function (asset) {
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
          renderCell: function (asset) {
            return formatPrice(asset.current_price);
          },
        },
        {
          key: "change",
          label: "Price 24h %",
          className: "px-4 py-2",
          renderCell: function (asset) {
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
          renderCell: function (asset) {
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
          renderCell: function (asset) {
            return formatPrice(asset.high_24h);
          },
        },
        {
          key: "low",
          label: "Low 24h",
          className: "px-4 py-2",
          renderCell: function (asset) {
            return formatPrice(asset.low_24h);
          },
        },
        {
          key: "marketCap",
          label: "Market cap",
          className: "px-4 py-2",
          renderCell: function (asset) {
            return asset.market_cap != null
              ? compactFormatter.format(asset.market_cap)
              : "--";
          },
        },
        {
          key: "marketCapChange",
          label: "Market cap 24h %",
          className: "px-4 py-2",
          renderCell: function (asset) {
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
          renderCell: function (asset) {
            return asset.total_volume != null
              ? compactFormatter.format(asset.total_volume)
              : "--";
          },
        },
        {
          key: "updated",
          label: "Last updated",
          className: "px-4 py-2 text-muted whitespace-nowrap",
          renderCell: function (asset) {
            return asset.last_updated
              ? dateFormatter.format(new Date(asset.last_updated))
              : "--";
          },
        },
      ];
    },
    [compactFormatter, dateFormatter, formatPrice, percentFormatter],
  );

  return (
    <PageLayout>
      <section className="space-y-2">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Market Explorer</h1>
          <p className="text-xs text-muted">
            Market data for UI testing only. Snapshots persist in localStorage.
          </p>
        </header>

        <TableToolbar
          topLeft={segments.map(function (segment) {
            return (
              <button
                key={segment.label}
                type="button"
                className={`rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide ${
                  segment.isActive ? "text-ink" : "text-muted opacity-60"
                }`}
                disabled={!segment.isActive}
                aria-current={segment.isActive ? "page" : undefined}
              >
                {segment.label}
              </button>
            );
          })}
          bottomLeft={
            <>
              <label className="text-xs uppercase tracking-wide text-muted">
                Search
              </label>
              <input
                type="search"
                value={query}
                onChange={function (event) {
                  setQuery(event.target.value);
                }}
                placeholder="Bitcoin, BTC, bitcoin..."
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
              <label className="text-xs uppercase tracking-wide text-muted">
                Quote
              </label>
              <select
                value={currency}
                onChange={function (event) {
                  setCurrency(event.target.value);
                }}
                className="h-9 rounded-md border border-border bg-bg px-2 text-sm text-ink"
              >
                {SUPPORTED_QUOTE_CURRENCIES.map(function (ccy) {
                  return (
                    <option key={ccy} value={ccy}>
                      {ccy.toUpperCase()}
                    </option>
                  );
                })}
              </select>
              <div className="relative flex flex-col items-start">
                <button
                  type="button"
                  onClick={function () {
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
                  <span className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-danger/40 bg-bg px-2 py-1 text-xs text-danger shadow-lg">
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
              <MarketExplorerMobileList
                rows={paginatedRows}
                formatPrice={formatPrice}
                percentFormatter={percentFormatter}
                compactFormatter={compactFormatter}
                dateFormatter={dateFormatter}
              />
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
            <p className="text-muted">No crypto assets found.</p>
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
