import ratesSnapshots from "../../mocks/fixtures/market-place/rates-snapshots.json";

function normalizeRatesSnapshot(item) {
  const snapshot = item?.snapshot || {};
  const symbol = String(item?.symbol || "");
  const group = String(item?.group || "rates");
  return {
    id: `${group}:${symbol}`,
    symbol,
    name: String(item?.name || ""),
    sector: String(item?.sector || ""),
    group,
    currency: String(snapshot?.currency || "USD"),
    exchange: snapshot?.exchange || "",
    primaryExchange: snapshot?.primaryExchange || "",
    last: snapshot?.last ?? null,
    close: snapshot?.close ?? null,
    bid: snapshot?.bid ?? null,
    ask: snapshot?.ask ?? null,
    change_1d: snapshot?.change_1d ?? null,
    change_1d_pct: snapshot?.change_1d_pct ?? null,
    change_1w: snapshot?.change_1w ?? null,
    change_1w_pct: snapshot?.change_1w_pct ?? null,
    change_1m: snapshot?.change_1m ?? null,
    change_1m_pct: snapshot?.change_1m_pct ?? null,
    change_1y: snapshot?.change_1y ?? null,
    change_1y_pct: snapshot?.change_1y_pct ?? null,
    last_updated: item?.captured_at_utc || "",
    captured_at_utc: item?.captured_at_utc || "",
  };
}

const ratesItems = Array.isArray(ratesSnapshots?.items)
  ? ratesSnapshots.items.map(normalizeRatesSnapshot)
  : [];

const generatedAt =
  ratesSnapshots?.generated_at_utc || ratesSnapshots?.started_at_utc || "";

export function hasCachedRatesMarketSnapshots() {
  return ratesItems.length > 0;
}

export function getRatesMarketSnapshots() {
  return ratesItems;
}

export function getRatesMarketMeta() {
  return generatedAt ? { fetched_at: generatedAt } : null;
}

export async function refreshRatesMarketSnapshots() {
  return ratesItems;
}
