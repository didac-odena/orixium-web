import { useState } from "react";

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
      const label = `${name ? `${name} ` : ""}${symbol} ${market}`.trim();
      options.push({
        value: `${market}:${symbol}`,
        label,
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

export default function GlobalAssetSearch({
  itemsByMarket,
  onSelect,
  placeholder = "Search assets...",
}) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const options = buildGlobalSearchOptions(itemsByMarket);
  const searchText = query.trim().toLowerCase();

  const filteredOptions = searchText
    ? options.filter((option) => {
        const haystack = [
          option.symbol,
          option.name,
          option.market,
          option.currency,
          option.group,
          option.value,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchText);
      })
    : [];

  const visibleOptions = filteredOptions.slice(0, 12);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setShowResults(true);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setQuery(option.symbol);
    setShowResults(false);
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
              visibleOptions.map((option) => {
                const handleClick = () => handleSelect(option);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={handleClick}
                    className="w-full px-3 py-2 text-left text-xs text-ink hover:bg-surface"
                  >
                    <span className="text-xs text-ink">{option.name || option.symbol} - </span>
                    <span className="text-xs text-muted uppercase tracking-wide">
                      {option.symbol} [{option.market}]
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-muted">No results</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
