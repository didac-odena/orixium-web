export function normalizeSnapshot(item, defaultGroup) {
  const snapshot = item?.snapshot || {};
  const symbol = String(item?.symbol || "");
  const group = String(item?.group || item?.sector || defaultGroup || "");
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

export function buildSnapshotCache(snapshotPayload, defaultGroup) {
  const items = Array.isArray(snapshotPayload?.items)
    ? snapshotPayload.items.map((item) => {
        return normalizeSnapshot(item, defaultGroup);
      })
    : [];

  const generatedAt =
    snapshotPayload?.generated_at_utc ||
    snapshotPayload?.started_at_utc ||
    "";

  return { items, generatedAt };
}
