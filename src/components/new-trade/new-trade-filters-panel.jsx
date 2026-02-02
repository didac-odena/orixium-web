import { InfoTooltip, SelectField } from "../ui";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function NewTradeFiltersPanel({
  showFilters,
  onToggleFilters,
  segments,
  marketType,
  onMarketTypeChange,
  subgroupValue,
  subgroupOptions,
  onSubgroupChange,
}) {
  const handleMarketSegmentClick = (event) => {
    const nextSegment = event.currentTarget.dataset.segment;
    if (!nextSegment) return;
    onMarketTypeChange(nextSegment);
  };

  const renderMarketSegmentButton = (segmentOption) => {
    const isActive = marketType === segmentOption.value;
    const baseClass =
      "cursor-pointer rounded-full border px-2 py-1 text-xs uppercase tracking-wider transition-colors";
    const activeClass = "border-ink bg-surface text-ink";
    const inactiveClass =
      "border-border text-muted bg-bg hover:border-accent hover:text-accent";
    const buttonClass = `${baseClass} ${isActive ? activeClass : inactiveClass}`;

    return (
      <button
        key={segmentOption.value}
        type="button"
        data-segment={segmentOption.value}
        onClick={handleMarketSegmentClick}
        className={buttonClass}
      >
        {segmentOption.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col border border-border bg-surface-2 rounded w-full py-1 px-2">
      <div className="flex justify-between">
        <header className="text-ink text-sm ">
          Filters{" "}
          <InfoTooltip message="Filter markets and subgroups to narrow the asset lists." />
        </header>
        <button onClick={onToggleFilters} type="button">
          {showFilters ? (
            <MinusIcon className="h-4 w-4 hover:text-accent-2" />
          ) : (
            <PlusIcon className="h-4 w-4 hover:text-accent" />
          )}
        </button>
      </div>
      {showFilters ? (
        <div className="space-y-1">
          <label className="text-xs text-muted">Markets</label>
          <div className="flex flex-wrap gap-1">
            {segments.map(renderMarketSegmentButton)}
          </div>
          {/* Subgroup select */}
          <div className="w-full sm:min-w-[11rem]">
            <label className="text-xs text-muted">Subgroup</label>
            <SelectField
              value={subgroupValue}
              options={subgroupOptions}
              onChange={onSubgroupChange}
              placeholder="Select subgroup"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
