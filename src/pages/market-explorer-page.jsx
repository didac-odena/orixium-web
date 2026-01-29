import { useState } from "react";
import { PageLayout } from "../components/layout";
import {
  MarketExplorerMobileList,
  MarketExplorerEquityMobileList,
  MarketExplorerToolbar,
  buildCryptoColumns,
  buildNonCryptoColumns,
} from "../components/market-explorer";
import { DataTable, TablePagination, PageHeader } from "../components/ui";

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
  nextSortState,
} from "./market-explorer/market-explorer-utils.js";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE = 50;
const MARKET_SEGMENTS = [
  { id: "crypto", label: "Crypto" },
  { id: "equity", label: "Equity" },
  { id: "rates", label: "Rates" },
  { id: "forex", label: "Forex" },
  { id: "commodities", label: "Commodities" },
];
const SEGMENT_COPY = {
  crypto: {
    searchPlaceholder: "Bitcoin, BTC, bitcoin...",
    emptyMessage: "No crypto assets found.",
    subtitle:
      "Market data for UI testing only. Snapshots persist in localStorage.",
  },
  equity: {
    searchPlaceholder: "Apple, AAPL, technology...",
    emptyMessage: "No equity assets found.",
    subtitle: "Market data for UI testing only. Snapshots loaded from fixtures.",
  },
  rates: {
    searchPlaceholder: "Treasury, TLT, ZN...",
    emptyMessage: "No rates assets found.",
    subtitle: "Market data for UI testing only. Snapshots loaded from fixtures.",
  },
  forex: {
    searchPlaceholder: "EUR/USD, USD/JPY...",
    emptyMessage: "No FX pairs found.",
    subtitle: "Market data for UI testing only. Snapshots loaded from fixtures.",
  },
  commodities: {
    searchPlaceholder: "Gold, Oil, COFF...",
    emptyMessage: "No commodities found.",
    subtitle: "Market data for UI testing only. Snapshots loaded from fixtures.",
  },
};
const DEFAULT_SEGMENT_COPY = {
  searchPlaceholder: "Search assets...",
  emptyMessage: "No market data available yet.",
  subtitle: "Market data for UI testing only. Snapshots loaded from fixtures.",
};

function buildGroupFilterOptions(items, groupKey) {
  if (!groupKey) return [];
  const seen = new Set();
  const options = [];
  items.forEach((asset) => {
    const groupValue = asset?.[groupKey];
    if (!groupValue) return;
    const key = String(groupValue);
    if (seen.has(key)) return;
    seen.add(key);
    options.push({ id: key, label: formatGroupLabel(key) });
  });
  return options;
}

export default function MarketExplorerPage() {
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
  } = useMarketExplorer({ market: segment, currency });

  const formatPrice = createPriceFormatter(currency);
  const formatEquityPrice = createRowPriceFormatter();
  const percentFormatter = createPercentFormatter();
  const compactFormatter = createCompactCurrencyFormatter(currency);
  const dateFormatter = createDateTimeFormatter();

  const isCryptoSegment = segment === "crypto";
  const groupFilterKey = isCryptoSegment
    ? ""
    : "group";
  const groupFilterOptions = buildGroupFilterOptions(
    snapshots,
    groupFilterKey,
  );
  const showGroupFilters = groupFilterOptions.length > 0;
  const isValidGroupFilter = groupFilterOptions.some((option) => {
    return option.id === groupFilter;
  });
  const resolvedGroupFilter =
    showGroupFilters && isValidGroupFilter ? groupFilter : "all";
  const segmentCopy = SEGMENT_COPY[segment] || DEFAULT_SEGMENT_COPY;
  const searchPlaceholder = segmentCopy.searchPlaceholder;
  const emptyMessage = segmentCopy.emptyMessage;
  const subtitle = segmentCopy.subtitle;

  const filteredByGroup =
    !groupFilterKey || resolvedGroupFilter === "all"
      ? snapshots
      : snapshots.filter((asset) => {
          return (
            String(asset?.[groupFilterKey] || "") === resolvedGroupFilter
          );
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
    rows: filteredByGroup,
    pageSize: PAGE_SIZE,
    // Simple client filter by id/symbol/name.
    filterFn: (item, term) => {
      return (
        item.id?.toLowerCase().includes(term) ||
        item.symbol?.toLowerCase().includes(term) ||
        item.name?.toLowerCase().includes(term) ||
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
  const cryptoColumns = buildCryptoColumns({
    formatPrice,
    percentFormatter,
    compactFormatter,
    dateFormatter,
  });
  const nonCryptoColumns = buildNonCryptoColumns({
    formatEquityPrice,
    percentFormatter,
    dateFormatter,
  });

  const columns = isCryptoSegment ? cryptoColumns : nonCryptoColumns;

  const handleRefresh = () => {
    // Force refresh respects cooldown in the hook.
    refreshNow({ force: true });
  };

  const handleSegmentChange = (nextSegment) => {
    setSegment(nextSegment);
    setGroupFilter("all");
  };

  return (
    <PageLayout>
      <section className="space-y-2">
        <PageHeader
          title="Market Explorer"
          subtitle={subtitle}
          subtitleClassName="text-xs text-muted"
        />

        <MarketExplorerToolbar
          segments={MARKET_SEGMENTS}
          activeSegment={segment}
          onSegmentChange={handleSegmentChange}
          groupFilter={resolvedGroupFilter}
          onGroupFilterChange={setGroupFilter}
          groupFilterOptions={groupFilterOptions}
          showGroupFilters={showGroupFilters}
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder={searchPlaceholder}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          isCrypto={isCryptoSegment}
          currency={currency}
          supportedCurrencies={SUPPORTED_QUOTE_CURRENCIES}
          onCurrencyChange={setCurrency}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          refreshNotice={refreshNotice}
          refreshError={refreshError}
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
              {isCryptoSegment ? (
                <MarketExplorerMobileList
                  rows={paginatedRows}
                  formatPrice={formatPrice}
                  percentFormatter={percentFormatter}
                  compactFormatter={compactFormatter}
                  dateFormatter={dateFormatter}
                />
              ) : (
                <MarketExplorerEquityMobileList
                  rows={paginatedRows}
                  formatPrice={formatEquityPrice}
                  percentFormatter={percentFormatter}
                  dateFormatter={dateFormatter}
                />
              )}
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



