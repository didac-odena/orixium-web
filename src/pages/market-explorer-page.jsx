import { useEffect, useState } from "react";
import { PageLayout } from "../components/layout";
import {
  MarketExplorerMobileRows,
  MarketExplorerToolbar,
  buildCryptoColumns,
  buildNonCryptoColumns,
} from "../components/market-explorer";
import { PageHeader } from "../components/ui";
import { DataTable } from "../components/tables";

import {
  DEFAULT_QUOTE_CURRENCY,
  getCryptoMarketMeta,
  getCryptoMarketSnapshots,
  hasCachedCryptoMarketSnapshots,
  refreshCryptoMarketSnapshots,
  getEquityMarketMeta,
  getEquityMarketSnapshots,
  hasCachedEquityMarketSnapshots,
  refreshEquityMarketSnapshots,
  getRatesMarketMeta,
  getRatesMarketSnapshots,
  hasCachedRatesMarketSnapshots,
  refreshRatesMarketSnapshots,
  getForexMarketMeta,
  getForexMarketSnapshots,
  hasCachedForexMarketSnapshots,
  refreshForexMarketSnapshots,
  getCommoditiesMarketMeta,
  getCommoditiesMarketSnapshots,
  hasCachedCommoditiesMarketSnapshots,
  refreshCommoditiesMarketSnapshots,
  loadGlobalMarketAssets,
} from "../services/index.js";
import { createDateTimeFormatter, createPercentFormatter } from "../utils/formatters.js";
import {
  compareAssets,
  createCompactCurrencyFormatter,
  createPriceFormatter,
  createRowPriceFormatter,
  formatGroupLabel,
  nextSortState,
} from "../utils/market-explorer-utils.js";
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

const STALE_INTERVAL_MS = 5 * 60 * 1000;

function filterMarketRows(item, term) {
  return (
    String(item.id ?? "").toLowerCase().includes(term) ||
    String(item.symbol ?? "").toLowerCase().includes(term) ||
    String(item.name ?? "").toLowerCase().includes(term) ||
    String(item.group ?? "").toLowerCase().includes(term)
  );
}

function shouldResetPageOnSort(nextState) {
  // Jump to page 1 when switching into global sort.
  return nextState.mode === "global";
}

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

function usePaginatedTable(options) {
  const {
    rows,
    pageSize,
    filterFn,
    compareFn,
    getNextSortState,
    shouldResetPage,
  } = options;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortMode, setSortMode] = useState("page");
  const [sortDir, setSortDir] = useState("asc");

  function handleQueryChange(nextQuery) {
    setQuery(nextQuery);
    setPage(1);
  }

  const term = query.trim().toLowerCase();
  const filteredRows =
    !filterFn || !term
      ? rows
      : rows.filter((item) => {
          return filterFn(item, term);
        });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  // Global sort reorders the full filtered list.
  const sortedRows =
    !sortKey || sortMode !== "global" || !compareFn
      ? filteredRows
      : filteredRows.slice().sort((a, b) => {
          return compareFn(a, b, sortKey, sortDir);
        });

  const start = (currentPage - 1) * pageSize;
  const pageItems = sortedRows.slice(start, start + pageSize);
  // Page sort only reorders the current slice.
  const paginatedRows =
    !sortKey || sortMode !== "page" || !compareFn
      ? pageItems
      : pageItems.slice().sort((a, b) => {
          return compareFn(a, b, sortKey, sortDir);
        });

  function handleSort(nextKey) {
    const currentState = { key: sortKey, mode: sortMode, dir: sortDir };
    // Delegate to feature-provided sort cycle when available.
    const nextState = getNextSortState
      ? getNextSortState(currentState, nextKey)
      : {
          key: nextKey,
          mode: "page",
          dir:
            currentState.key === nextKey && currentState.dir === "asc"
              ? "desc"
              : "asc",
        };

    setSortKey(nextState.key);
    setSortMode(nextState.mode);
    setSortDir(nextState.dir);
    if (shouldResetPage && shouldResetPage(nextState)) {
      setPage(1);
    }
  }

  return {
    query,
    setQuery: handleQueryChange,
    page,
    setPage,
    totalPages,
    currentPage,
    filteredRows,
    paginatedRows,
    sortKey,
    sortMode,
    sortDir,
    handleSort,
  };
}

function useMarketExplorer(options = {}) {
  const { market = "crypto", currency } = options;

  const [snapshots, setSnapshots] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load cached data first to avoid blank UI.
    let isActive = true;
    let marketService = null;
    switch (market) {
      case "crypto":
        marketService = {
          hasCache: hasCachedCryptoMarketSnapshots,
          getSnapshots: getCryptoMarketSnapshots,
          getMeta: getCryptoMarketMeta,
          refresh: refreshCryptoMarketSnapshots,
        };
        break;
      case "equity":
        marketService = {
          hasCache: hasCachedEquityMarketSnapshots,
          getSnapshots: getEquityMarketSnapshots,
          getMeta: getEquityMarketMeta,
          refresh: refreshEquityMarketSnapshots,
        };
        break;
      case "rates":
        marketService = {
          hasCache: hasCachedRatesMarketSnapshots,
          getSnapshots: getRatesMarketSnapshots,
          getMeta: getRatesMarketMeta,
          refresh: refreshRatesMarketSnapshots,
        };
        break;
      case "forex":
        marketService = {
          hasCache: hasCachedForexMarketSnapshots,
          getSnapshots: getForexMarketSnapshots,
          getMeta: getForexMarketMeta,
          refresh: refreshForexMarketSnapshots,
        };
        break;
      case "commodities":
        marketService = {
          hasCache: hasCachedCommoditiesMarketSnapshots,
          getSnapshots: getCommoditiesMarketSnapshots,
          getMeta: getCommoditiesMarketMeta,
          refresh: refreshCommoditiesMarketSnapshots,
        };
        break;
      default:
        marketService = null;
    }
    const loadSnapshots = async () => {
      try {
        const snapshotRows = marketService
          ? marketService.getSnapshots(currency)
          : [];
        if (!isActive) return;
        setSnapshots(Array.isArray(snapshotRows) ? snapshotRows : []);
        setStatus("ready");
        setError("");
      } catch (err) {
        if (!isActive) return;
        setError(
          err instanceof Error ? err.message : "Failed to load market data.",
        );
        setStatus("error");
        return;
      }

      if (!marketService) return;
      const { hasCache, getMeta, refresh } = marketService;
      const hasCachedSnapshots = hasCache(currency);
      const meta = getMeta(currency);
      const lastFetched = meta?.fetched_at ? Date.parse(meta.fetched_at) : 0;
      const now = Date.now();
      const isStale = !lastFetched || now - lastFetched >= STALE_INTERVAL_MS;
      if (!hasCachedSnapshots || isStale) {
        try {
          const refreshedSnapshots = await refresh(currency);
          if (!isActive) return;
          setSnapshots(
            Array.isArray(refreshedSnapshots) ? refreshedSnapshots : [],
          );
        } catch {
          // Ignore refresh errors to keep cached data visible.
        }
      }
    };

    loadSnapshots();

    return () => {
      isActive = false;
    };
  }, [currency, market]);

  return { snapshots, status, error };
}

function buildSegmentOptions(items, segmentKey) {
  if (!segmentKey) return [];
  const seen = new Set();
  const options = [];
  items.forEach((asset) => {
    const segmentValue = asset?.[segmentKey];
    if (!segmentValue) return;
    const key = String(segmentValue);
    if (seen.has(key)) return;
    seen.add(key);
    options.push({ id: key, label: formatGroupLabel(key) });
  });
  return options;
}

export default function MarketExplorerPage() {
  // Default quote currency drives formatting + fetch.
  const currency = DEFAULT_QUOTE_CURRENCY;
  const [marketSegment, setMarketSegment] = useState("crypto");
  const [segmentFilter, setSegmentFilter] = useState("all");

  // Data source state.
  const { snapshots, status, error } = useMarketExplorer({
    market: marketSegment,
    currency,
  });

  const [searchItemsBySegment, setSearchItemsBySegment] = useState({});

  const formatPrice = createPriceFormatter(currency);
  const formatEquityPrice = createRowPriceFormatter();
  const percentFormatter = createPercentFormatter();
  const compactFormatter = createCompactCurrencyFormatter(currency);
  const dateFormatter = createDateTimeFormatter();

  const isCryptoSegment = marketSegment === "crypto";
  const segmentKey = isCryptoSegment
    ? ""
    : "group";
  const segmentOptions = buildSegmentOptions(snapshots, segmentKey);
  const showSegmentFilters =
    Boolean(segmentKey) && segmentOptions.length > 0;
  const isValidSegmentFilter = showSegmentFilters
    ? segmentOptions.some((option) => {
        return option.id === segmentFilter;
      })
    : false;
  const activeGroupFilter =
    showSegmentFilters && isValidSegmentFilter ? segmentFilter : "all";
  const { searchPlaceholder, emptyMessage, subtitle } =
    SEGMENT_COPY[marketSegment];

  const filteredBySegment =
    !segmentKey || activeGroupFilter === "all"
      ? snapshots
      : snapshots.filter((asset) => {
          return String(asset?.[segmentKey] || "") === activeGroupFilter;
        });

  // Client-side filtering, plus page/global sorting and pagination.
  const {
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
    rows: filteredBySegment,
    pageSize: PAGE_SIZE,
    // Simple client filter by id/symbol/name.
    filterFn: filterMarketRows,
    compareFn: compareAssets,
    getNextSortState: nextSortState,
    shouldResetPage: shouldResetPageOnSort,
  });

  // Shape expected by DataTable for showing sort icons.
  const sortState = { key: sortKey, mode: sortMode, dir: sortDir };

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

  function renderResults() {
    if (status !== "ready") return null;
    if (!filteredRows.length) {
      return <p className="text-muted">{emptyMessage}</p>;
    }

    return (
      <div className="space-y-3">
        {/* Mobile uses a collapsible list; desktop uses the data table. */}
        {isCryptoSegment ? (
          <MarketExplorerMobileRows
            rows={paginatedRows}
            variant="crypto"
            formatPrice={formatPrice}
            percentFormatter={percentFormatter}
            compactFormatter={compactFormatter}
            dateFormatter={dateFormatter}
          />
        ) : (
          <MarketExplorerMobileRows
            rows={paginatedRows}
            variant="non-crypto"
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
    );
  }

  const handleMarketSegmentChange = (nextSegment) => {
    setMarketSegment(nextSegment);
    setSegmentFilter("all");
  };

  const handleGlobalSearchSelect = (option) => {
    if (!option) return;
    if (option.market) {
      handleMarketSegmentChange(option.market);
    }
    if (option.group) {
      setSegmentFilter(option.group);
      setPage(1);
    }
    if (option.symbol) {
      setQuery(option.symbol);
    }
  };

  const handleGlobalSearchQueryChange = (nextValue) => {
    if (!nextValue) {
      setQuery("");
    }
  };

  useEffect(() => {
    let isActive = true;
    const loadGlobalAssets = async () => {
      const assetsByMarket = await loadGlobalMarketAssets({
        quoteCurrency: DEFAULT_QUOTE_CURRENCY,
      });
      if (isActive) {
        setSearchItemsBySegment(assetsByMarket);
      }
    };

    loadGlobalAssets();
    return () => {
      isActive = false;
    };
  }, []);

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
          activeSegment={marketSegment}
          onSegmentChange={handleMarketSegmentChange}
          segmentFilter={activeGroupFilter}
          onSegmentFilterChange={setSegmentFilter}
          segmentOptions={segmentOptions}
          showSegmentFilters={showSegmentFilters}
          searchItemsBySegment={searchItemsBySegment}
          onSearchSelect={handleGlobalSearchSelect}
          onSearchQueryChange={handleGlobalSearchQueryChange}
          searchPlaceholder={searchPlaceholder}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />

        {status === "loading" ? (
          <p className="text-sm text-muted">Loading market data...</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-danger">{error}</p>
        ) : null}
        {renderResults()}

      </section>
    </PageLayout>
  );
}



