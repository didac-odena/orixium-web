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

const buildOptionLabel = (symbol, name) => {
  const nameText = name ? `${name} — ` : "";
  return `${nameText}${symbol}`;
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
      const label = `${buildOptionLabel(symbol, name)} [${market.toUpperCase()}] `;
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
        const labelText = option.label.toLowerCase();
        const valueText = option.value.toLowerCase();
        return labelText.includes(searchText) || valueText.includes(searchText);
      })
    : [];

  const visibleOptions = filteredOptions.slice(0, 12);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setShowResults(true);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setQuery(option.label);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={handleQueryChange}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-border bg-bg px-3 text-sm text-ink placeholder:text-muted"
      />

      {showResults && searchText ? (
        <div className="absolute z-20 w-full rounded border border-border bg-bg shadow hover:text-accent2 ">
          <div className="max-h-60 overflow-y-auto overflow-x-hidden">
            {visibleOptions.length ? (
              visibleOptions.map((option) => {
                const handleClick = () => handleSelect(option);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={handleClick}
                    className="w-full px-2 py-2 text-left text-xs text-ink hover:bg-surface"
                  >
                    {option.name} -{" "}
                    <span className="text-2xs text-muted uppercase tracking-wide">
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
