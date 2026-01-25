import equitySnapshots from "../../mocks/fixtures/market-place/equity-snapshots.json";
import { buildSnapshotCache } from "./market-snapshot-utils.js";

const { items: equityItems, generatedAt } = buildSnapshotCache(
  equitySnapshots,
  "equity",
);

export function hasCachedEquityMarketSnapshots() {
  return equityItems.length > 0;
}

export function getEquityMarketSnapshots() {
  return equityItems;
}

export function getEquityMarketMeta() {
  return generatedAt ? { fetched_at: generatedAt } : null;
}

export async function refreshEquityMarketSnapshots() {
  return equityItems;
}
