import SearchableSelect from "./searchable-select";

const getAssetSymbol = (item) => {
  return String(item?.symbol || "").toUpperCase();
};

const getAssetName = (item) => {
  return String(
    item?.name || item?.full_name || item?.description || item?.long_name || ""
  ).trim();
};

const getAssetConid = (item) => {
  return item?.conid ?? item?.conId ?? null;
};

const getAssetCurrency = (item) => {
  return String(item?.currency || item?.quote_currency || "").toUpperCase();
};

const buildOptionLabel = (symbol, name, conid) => {
  const nameText = name ? ` — ${name}` : "";
  const conidText = conid ? ` (conid: ${conid})` : "";
  return `${symbol}${nameText}${conidText}`;
};

const buildGlobalSearchOptions = (itemsByMarket) => {
  const options = [];
  const used = new Set();

  Object.entries(itemsByMarket || {}).forEach(([market, items]) => {
    (items || []).forEach((item) => {
      const symbol = getAssetSymbol(item);
      if (!symbol) return;

      const conid = getAssetConid(item);
      const key = `${market}:${symbol}:${conid || ""}`;
      if (used.has(key)) return;
      used.add(key);

      const name = getAssetName(item);
      const label = buildOptionLabel(symbol, name, conid);

      options.push({
        value: `${market}:${symbol}`,
        label,
        market,
        symbol,
        name,
        conid,
        currency: getAssetCurrency(item),
        group: item?.group || "",
      });
    });
  });

  return options;
};

export default function GlobalAssetSearch({
  itemsByMarket,
  value,
  onSelect,
  placeholder = "Search assets...",
  align = "left",
}) {
  const options = buildGlobalSearchOptions(itemsByMarket);

  const handleChange = (nextValue) => {
    const selected = options.find((option) => option.value === nextValue);
    if (!selected) return;
    onSelect(selected);
  };

  return (
    <SearchableSelect
      value={value}
      options={options}
      onChange={handleChange}
      placeholder={placeholder}
      align={align}
    />
  );
}
