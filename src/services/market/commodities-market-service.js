import commoditiesSnapshots from "../../mocks/fixtures/market-place/commodities-snapshots.json";

function normalizeCommoditiesSnapshot(item) {
  const snapshot = item?.snapshot || {};
  const symbol = String(item?.symbol || "");
  const group = String(item?.group || "commodities");
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

const commoditiesItems = Array.isArray(commoditiesSnapshots?.items)
  ? commoditiesSnapshots.items.map(normalizeCommoditiesSnapshot)
  : [];

const generatedAt =
  commoditiesSnapshots?.generated_at_utc ||
  commoditiesSnapshots?.started_at_utc ||
  "";

export function hasCachedCommoditiesMarketSnapshots() {
  return commoditiesItems.length > 0;
}

export function getCommoditiesMarketSnapshots() {
  return commoditiesItems;
}

export function getCommoditiesMarketMeta() {
  return generatedAt ? { fetched_at: generatedAt } : null;
}

export async function refreshCommoditiesMarketSnapshots() {
  return commoditiesItems;
}
