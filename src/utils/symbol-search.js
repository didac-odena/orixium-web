const defaultGetSymbol = (item) => item?.symbol;
const defaultGetName = (item) => item?.name;

const SYMBOL_ALIASES = {
  BTC: "BITCOIN",
  ETH: "ETHEREUM",
  XRP: "RIPPLE",
  SOL: "SOLANA",
  LTC: "LITECOIN",
  ADA: "CARDANO",
  DOT: "POLKADOT",
  BNB: "BINANCE COIN",
  DOGE: "DOGECOIN",
  AVAX: "AVALANCHE",
  MATIC: "POLYGON",
  LINK: "CHAINLINK",
};

export const normalizeSymbol = (value) => {
  return String(value || "").toUpperCase().trim();
};

const splitSymbolParts = (symbol) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return { base: "", quote: "" };
  if (normalized.includes("/")) {
    const [base, quote] = normalized.split("/");
    return { base: base || "", quote: quote || "" };
  }
  if (normalized.includes("-")) {
    const [base, quote] = normalized.split("-");
    return { base: base || "", quote: quote || "" };
  }
  return { base: normalized, quote: "" };
};

const getAliasFromSymbol = (symbol) => {
  const { base } = splitSymbolParts(symbol);
  return SYMBOL_ALIASES[base] || "";
};

const buildSearchText = (symbol, name) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedName = normalizeSymbol(name);
  const { base, quote } = splitSymbolParts(normalizedSymbol);
  const alias = getAliasFromSymbol(normalizedSymbol);
  return [
    normalizedSymbol,
    base,
    quote,
    normalizeSymbol(alias),
    normalizedName,
  ]
    .filter(Boolean)
    .join(" ");
};

export const buildSymbolOptions = (
  items,
  getSymbol = defaultGetSymbol,
  getName = defaultGetName
) => {
  const seen = new Set();
  const options = [];
  items.forEach((item) => {
    const symbol = normalizeSymbol(getSymbol(item));
    if (!symbol || seen.has(symbol)) return;
    seen.add(symbol);
    const name = String(getName(item) || getAliasFromSymbol(symbol) || "");
    const secondaryLabel =
      name && normalizeSymbol(name) !== symbol ? name : "";
    options.push({
      value: symbol,
      label: symbol,
      symbol,
      name,
      secondaryLabel,
    });
  });
  return options.sort((a, b) => a.symbol.localeCompare(b.symbol));
};

export const filterBySymbol = (
  items,
  query,
  getSymbol = defaultGetSymbol,
  getName = defaultGetName
) => {
  const normalizedQuery = normalizeSymbol(query);
  if (!normalizedQuery) return items;
  return items.filter((item) => {
    const symbol = getSymbol(item);
    const name = getName(item);
    const searchText = buildSearchText(symbol, name);
    return searchText.includes(normalizedQuery);
  });
};
