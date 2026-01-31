import { useState } from "react";

const MAX_RESULTS = 12;

const getAssetSymbol = (item) => {
  return String(item?.symbol || "").toUpperCase();
};

const getAssetName = (item) => {
  return String(item?.name || item?.full_name || item?.description || item?.long_name || "").trim();
};

const getAssetCurrency = (item) => {
  return String(item?.currency || item?.quote_currency || "").toUpperCase();
};

const buildGlobalSearchOptions = (itemsByMarket) => {
  const options = [];
  const used = new Set();

  Object.entries(itemsByMarket || {}).forEach(([market, items]) => {
    (items || []).forEach((item) => {
      const symbol = getAssetSymbol(item);
      if (!symbol) return;

      const key = `${market}:${symbol}`;
      if (used.has(key)) return;
      used.add(key);

      const name = getAssetName(item);
      const label = name || symbol;
      const secondaryLabel = name ? `${symbol} [${market}]` : `[${market}]`;
      options.push({
        value: `${market}:${symbol}`,
        label,
        secondaryLabel,
        market,
        symbol,
        name,
        currency: getAssetCurrency(item),
        group: item?.group || "",
      });
    });
  });

  return options;
};

const buildSearchText = (option) => {
  return [
    option.symbol,
    option.name,
    option.market,
    option.currency,
    option.group,
    option.value,
    option.label,
    option.secondaryLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export default function GlobalAssetSearch({
  itemsByMarket,
  options,
  onSelect,
  onQueryChange,
  placeholder = "Search assets...",
}) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const resolvedOptions = Array.isArray(options)
    ? options
    : buildGlobalSearchOptions(itemsByMarket);
  const searchText = query.trim().toLowerCase();

  const filteredOptions = searchText
    ? resolvedOptions.filter((option) => {
        return buildSearchText(option).includes(searchText);
      })
    : [];

  const visibleOptions = filteredOptions.slice(0, MAX_RESULTS);

  const handleQueryChange = (event) => {
    const nextValue = event.target.value;
    setQuery(nextValue);
    setShowResults(true);
    if (onQueryChange) {
      onQueryChange(nextValue);
    }
  };

  const handleSelect = (option) => {
    if (onSelect) {
      onSelect(option);
    }
    const nextQuery = option.symbol || option.label || option.value;
    setQuery(nextQuery);
    setShowResults(false);
    if (onQueryChange) {
      onQueryChange(nextQuery);
    }
  };

  const renderOption = (option) => {
    const optionKey = option.value || option.symbol || option.label;
    const handleClick = () => handleSelect(option);
    return (
      <button
        key={optionKey}
        type="button"
        onClick={handleClick}
        className="w-full px-3 py-2 text-left text-xs text-ink hover:bg-surface"
      >
        <span className="text-xs text-ink">{option.label || option.symbol}</span>
        {option.secondaryLabel ? (
          <>
            <span className="text-xs text-ink"> - </span>
            <span className="text-xs text-muted uppercase tracking-wide">
              {option.secondaryLabel}
            </span>
          </>
        ) : null}
      </button>
    );
  };

  return (
    <div className="relative w-full max-w-[24rem]">
      <input
        type="search"
        value={query}
        onChange={handleQueryChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm text-ink placeholder:text-muted"
      />

      {showResults && searchText ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 w-full rounded border border-border bg-bg shadow">
          <div className="max-h-60 overflow-y-auto overflow-x-hidden">
            {visibleOptions.length ? (
              visibleOptions.map(renderOption)
            ) : (
              <div className="px-3 py-2 text-xs text-muted">No results</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
