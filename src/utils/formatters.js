export const DEFAULT_CURRENCY_FORMAT_LOCALE = "en-US";

export function createPercentFormatter() {
  // Fixed 2-decimal percent display for UI stats.
  return new Intl.NumberFormat(DEFAULT_CURRENCY_FORMAT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function createMoneyFormatter() {
  return new Intl.NumberFormat(DEFAULT_CURRENCY_FORMAT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function createCompactCurrencyFormatter(currency) {
  // Compact currency (K/M/B) for market cap/volume.
  return new Intl.NumberFormat(DEFAULT_CURRENCY_FORMAT_LOCALE, {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
    notation: "compact",
    maximumFractionDigits: 2,
  });
}

export function createNumberFormatter({
  minimumFractionDigits = 0,
  maximumFractionDigits = 8,
} = {}) {
  return new Intl.NumberFormat(DEFAULT_CURRENCY_FORMAT_LOCALE, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

export function createFiatPriceFormatter() {
  return createNumberFormatter({
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function createCryptoAmountFormatter() {
  return createNumberFormatter({ maximumFractionDigits: 8 });
}

export function createDateTimeFormatter() {
  // Short date + time for last-updated labels.
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
