import { TablePagination } from "../ui/table/table-pagination.jsx";
import { TableToolbar } from "../ui/table/table-toolbar.jsx";

export function MarketExplorerToolbar({
  segments,
  activeSegment,
  onSegmentChange,
  groupFilter,
  onGroupFilterChange,
  groupFilterOptions,
  showGroupFilters,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  isCrypto,
  currency,
  supportedCurrencies,
  onCurrencyChange,
  onRefresh,
  isRefreshing,
  refreshNotice,
  refreshError,
}) {
  const handleSegmentClick = (event) => {
    const nextSegment = event.currentTarget.dataset.segment;
    if (!nextSegment) return;
    onSegmentChange(nextSegment);
  };

  const handleGroupFilterClick = (event) => {
    const nextFilter = event.currentTarget.dataset.filter;
    if (!nextFilter) return;
    onGroupFilterChange(nextFilter);
    onPageChange(1);
  };

  const handleSearchChange = (event) => {
    onSearchChange(event.target.value);
  };

  const handleCurrencyChange = (event) => {
    onCurrencyChange(event.target.value);
  };

  const handleRefreshClick = () => {
    onRefresh();
  };

  const renderSegmentButton = (segmentOption) => {
    const isActive = segmentOption.id === activeSegment;
    return (
      <button
        key={segmentOption.id}
        type="button"
        data-segment={segmentOption.id}
        className={`cursor-pointer rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
          isActive ? "text-ink" : "text-muted opacity-60"
        }`}
        onClick={handleSegmentClick}
        aria-current={isActive ? "page" : undefined}
      >
        {segmentOption.label}
      </button>
    );
  };

  const renderGroupFilterButton = (option) => {
    const isActive = option.id === groupFilter;
    return (
      <button
        key={option.id}
        type="button"
        data-filter={option.id}
        className={`cursor-pointer rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
          isActive ? "text-ink" : "text-muted opacity-60"
        }`}
        onClick={handleGroupFilterClick}
        aria-pressed={isActive}
      >
        {option.label}
      </button>
    );
  };

  const showFilters = showGroupFilters && groupFilterOptions.length > 0;

  return (
    <TableToolbar
      topLeft={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            {segments.map(renderSegmentButton)}
          </div>
          {showFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-filter="all"
                className={`cursor-pointer rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
                  groupFilter === "all"
                    ? "text-ink"
                    : "text-muted opacity-60"
                }`}
                onClick={handleGroupFilterClick}
                aria-pressed={groupFilter === "all"}
              >
                No filter
              </button>
              {groupFilterOptions.map(renderGroupFilterButton)}
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
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="h-9 w-56 rounded-md border border-border bg-bg px-3 text-sm text-ink placeholder:text-muted"
          />
        </>
      }
      bottomCenter={
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
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
                onChange={handleCurrencyChange}
                className="h-9 rounded-md border border-border bg-bg px-2 text-sm text-ink"
              >
                {supportedCurrencies.map((ccy) => {
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
              onClick={handleRefreshClick}
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
  );
}
