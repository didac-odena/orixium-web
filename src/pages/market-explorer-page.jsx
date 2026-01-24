import { useEffect, useState } from "react";
import { PageLayout } from "../components/layout/index.js";
import { MarketExplorerMobileList } from "../components/market-explorer/market-explorer-mobile-list.jsx";
import { MarketExplorerEquityMobileList } from "../components/market-explorer/market-explorer-equity-mobile-list.jsx";
import { MarketExplorerToolbar } from "../components/market-explorer/market-explorer-toolbar.jsx";
import { DataTable } from "../components/ui/table/data-table.jsx";
import { TablePagination } from "../components/ui/table/table-pagination.jsx";
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
  buildCryptoColumns,
  buildNonCryptoColumns,
} from "../components/market-explorer/market-explorer-columns.jsx";
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

  const formatPrice = createPriceFormatter(currency);
  const formatEquityPrice = createRowPriceFormatter();
  const percentFormatter = createPercentFormatter();
  const compactFormatter = createCompactCurrencyFormatter(currency);
  const dateFormatter = createDateTimeFormatter();

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
  const groupFilterOptions = [];
  if (groupFilterKey) {
    const seen = new Set();
    snapshots.forEach((row) => {
      const value = row?.[groupFilterKey];
      if (!value) return;
      const key = String(value);
      if (seen.has(key)) return;
      seen.add(key);
      groupFilterOptions.push({ id: key, label: formatGroupLabel(key) });
    });
  }
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

  const filteredByGroup =
    !groupFilterKey || groupFilter === "all"
      ? snapshots
      : snapshots.filter((row) => {
          return String(row?.[groupFilterKey] || "") === groupFilter;
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

  const columns = isCrypto ? cryptoColumns : nonCryptoColumns;

  const handleRefresh = () => {
    // Force refresh respects cooldown in the hook.
    refreshNow({ force: true });
  };

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

        <MarketExplorerToolbar
          segments={segments}
          activeSegment={segment}
          onSegmentChange={setSegment}
          groupFilter={groupFilter}
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
          isCrypto={isCrypto}
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



