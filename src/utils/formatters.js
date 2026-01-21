export function createPercentFormatter() {
  // Fixed 2-decimal percent display for UI stats.
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function createCompactCurrencyFormatter(currency) {
  // Compact currency (K/M/B) for market cap/volume.
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
    notation: "compact",
    maximumFractionDigits: 2,
  });
}

export function createDateTimeFormatter() {
  // Short date + time for last-updated labels.
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
