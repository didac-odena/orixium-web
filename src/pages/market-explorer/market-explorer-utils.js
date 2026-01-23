export function createPriceFormatter(currency) {
  // >1 uses 2 decimals, <=1 uses up to 8 for small prices.
  const shortFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const longFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });

  return function formatPrice(value) {
    if (value == null || Number.isNaN(value)) return "--";
    const useShort = Math.abs(value) > 1;
    return useShort
      ? shortFormatter.format(value)
      : longFormatter.format(value);
  };
}

export function createRowPriceFormatter() {
  const cache = new Map();

  function getFormatters(currency) {
    const key = String(currency || "USD").toUpperCase();
    if (cache.has(key)) return cache.get(key);
    const shortFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: key,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const longFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: key,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
    const formatters = { shortFormatter, longFormatter };
    cache.set(key, formatters);
    return formatters;
  }

  return function formatPrice(value, currency) {
    if (value == null || Number.isNaN(value)) return "--";
    const { shortFormatter, longFormatter } = getFormatters(currency);
    const useShort = Math.abs(value) > 1;
    return useShort
      ? shortFormatter.format(value)
      : longFormatter.format(value);
  };
}

export function getAccentClass(value) {
  // Positive/zero = green, negative = red.
  return (value || 0) >= 0 ? "text-accent" : "text-accent-2";
}

export function formatGroupLabel(value) {
  if (!value) return "";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
}

export function nextSortState(current, nextKey) {
  // Cycle: page asc -> page desc -> global asc -> global desc -> page asc.
  if (current.key !== nextKey) {
    return { key: nextKey, mode: "page", dir: "asc" };
  }

  if (current.mode === "page" && current.dir === "asc") {
    return { key: nextKey, mode: "page", dir: "desc" };
  }
  if (current.mode === "page" && current.dir === "desc") {
    return { key: nextKey, mode: "global", dir: "asc" };
  }
  if (current.mode === "global" && current.dir === "asc") {
    return { key: nextKey, mode: "global", dir: "desc" };
  }
  return { key: nextKey, mode: "page", dir: "asc" };
}

export function getSortValue(asset, key) {
  // Map UI sort keys to raw numeric/string values.
  switch (key) {
    case "rank":
      return asset.market_cap_rank;
    case "asset":
      return asset.name || asset.symbol;
    case "price":
      return asset.current_price ?? asset.last;
    case "priceChange":
      return asset.price_change_24h ?? asset.change_1d;
    case "change":
      return asset.price_change_percentage_24h ?? asset.change_1d_pct;
    case "change1w":
      return asset.change_1w_pct;
    case "change1m":
      return asset.change_1m_pct;
    case "change1y":
      return asset.change_1y_pct;
    case "marketCap":
      return asset.market_cap;
    case "marketCapChange":
      return asset.market_cap_change_percentage_24h;
    case "volume":
      return asset.total_volume;
    case "high":
      return asset.high_24h;
    case "low":
      return asset.low_24h;
    case "bid":
      return asset.bid;
    case "ask":
      return asset.ask;
    case "updated":
      if (asset.last_updated) return Date.parse(asset.last_updated);
      return asset.captured_at_utc ? Date.parse(asset.captured_at_utc) : null;
    default:
      return null;
  }
}

export function compareAssets(a, b, key, dir) {
  // Generic comparator used by the table hook.
  const direction = dir === "asc" ? 1 : -1;
  const aValue = getSortValue(a, key);
  const bValue = getSortValue(b, key);
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;
  if (typeof aValue === "string") {
    return direction * aValue.localeCompare(String(bValue));
  }
  return direction * (aValue - bValue);
}
