// LocalStorage key versioned for future schema changes.
const STORAGE_KEY = "orixium.market.crypto.markets.v1";

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { byCurrency: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { byCurrency: {} };
    // Expected shape: { byCurrency: { [ccy]: { items: [], fetched_at } } }.
    if (!parsed.byCurrency || typeof parsed.byCurrency !== "object") {
      return { byCurrency: {} };
    }
    return { byCurrency: parsed.byCurrency };
  } catch {
    return { byCurrency: {} };
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
  const key = String(currency || "").toLowerCase();
  const cache = readCache();
  return Boolean(cache.byCurrency?.[key]?.items?.length);
}

export function getCachedMarketList(currency) {
  const key = String(currency || "").toLowerCase();
  const cache = readCache();
  const entry = cache.byCurrency?.[key];
  return Array.isArray(entry?.items) ? entry.items : null;
}

export function getCachedMarketMeta(currency) {
  const key = String(currency || "").toLowerCase();
  const cache = readCache();
  const entry = cache.byCurrency?.[key];
  // Only expose metadata to avoid leaking full cache.
  return entry?.fetched_at ? { fetched_at: entry.fetched_at } : null;
}

export function setCachedMarketList(currency, items, fetchedAt) {
  const key = String(currency || "").toLowerCase();
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
  return items;
}
