// LocalStorage key versioned for future schema changes.
const STORAGE_KEY = "orixium.market.crypto.markets.v1";
const EMPTY_CACHE = { byCurrency: {} };

function getCurrencyKey(currency) {
  return String(currency || "").toLowerCase();
}

function getCacheEntry(currency) {
  const key = getCurrencyKey(currency);
  const cache = readCache();
  return cache.byCurrency?.[key] || null;
}

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CACHE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_CACHE;
    // Expected shape: { byCurrency: { [ccy]: { items: [], fetched_at } } }.
    if (!parsed.byCurrency || typeof parsed.byCurrency !== "object") {
      return EMPTY_CACHE;
    }
    return { byCurrency: parsed.byCurrency };
  } catch {
    return EMPTY_CACHE;
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("[CryptoMarketCache] write failed", error);
  }
}

export function hasCachedMarketList(currency) {
  const entry = getCacheEntry(currency);
  return Boolean(entry?.items?.length);
}

export function getCachedMarketList(currency) {
  const entry = getCacheEntry(currency);
  return Array.isArray(entry?.items) ? entry.items : null;
}

export function getCachedMarketMeta(currency) {
  const entry = getCacheEntry(currency);
  // Only expose metadata to avoid leaking full cache.
  return entry?.fetched_at ? { fetched_at: entry.fetched_at } : null;
}

export function setCachedMarketList(currency, items, fetchedAt) {
  const key = getCurrencyKey(currency);
  const cache = readCache();
  // Overwrite the snapshot list per currency with a single page.
  const nextCache = {
    byCurrency: {
      ...cache.byCurrency,
      [key]: {
        items: Array.isArray(items) ? items : [],
        fetched_at: fetchedAt || "",
      },
    },
  };
  writeCache(nextCache);
}
