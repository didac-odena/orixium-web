import { GlobalAssetSearch } from "../ui";
import { TablePagination, TableToolbar } from "../tables";

export default function MarketExplorerToolbar({
    segments,
    activeSegment,
    onSegmentChange,
    segmentFilter,
    onSegmentFilterChange,
    segmentOptions,
    showSegmentFilters,
    searchItemsBySegment,
    onSearchSelect,
    onSearchQueryChange,
    searchPlaceholder,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
}) {
    const handleSegmentButtonClick = (segmentId) => {
        onSegmentChange(segmentId);
    };

    const handleSegmentFilterButtonClick = (filterId) => {
        onSegmentFilterChange(filterId);
        onPageChange(1);
    };

    const renderSegmentButton = (segmentOption) => {
        const isActive = segmentOption.id === activeSegment;
        return (
            <button
                key={segmentOption.id}
                type="button"
                className={`cursor-pointer rounded-full border px-2 py-1 text-xs uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
                    isActive
                        ? "border-ink bg-surface text-ink"
                        : "border-border text-muted opacity-60"
                }`}
                onClick={() => handleSegmentButtonClick(segmentOption.id)}
                aria-current={isActive ? "page" : undefined}
            >
                {segmentOption.label}
            </button>
        );
    };

    const renderSegmentFilterButton = (option) => {
        const isActive = option.id === segmentFilter;
        return (
            <button
                key={option.id}
                type="button"
                className={`cursor-pointer rounded-full border px-2 py-1 text-xs uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
                    isActive
                        ? "border-ink bg-surface text-ink"
                        : "border-border text-muted opacity-60"
                }`}
                onClick={() => handleSegmentFilterButtonClick(option.id)}
                aria-pressed={isActive}
            >
                {option.label}
            </button>
        );
    };

    return (
        <TableToolbar
            topLeft={
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        {segments.map(renderSegmentButton)}
                    </div>
                    {showSegmentFilters && segmentOptions.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                className={`cursor-pointer rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
                                    segmentFilter === "all"
                                        ? "text-ink"
                                        : "text-muted opacity-60"
                                }`}
                                onClick={() => handleSegmentFilterButtonClick("all")}
                                aria-pressed={segmentFilter === "all"}
                            >
                                No filter
                            </button>
                            {segmentOptions.map(renderSegmentFilterButton)}
                        </div>
                    ) : null}
                </div>
            }
            bottomLeft={
                <>
                    <label className="text-xs uppercase tracking-wide text-muted">
                        Search
                    </label>
                    <GlobalAssetSearch
                        itemsByMarket={searchItemsBySegment}
                        onSelect={onSearchSelect}
                        onQueryChange={onSearchQueryChange}
                        placeholder={searchPlaceholder}
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
        />
    );
}
