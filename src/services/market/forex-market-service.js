import forexSnapshots from "../../mocks/fixtures/market-place/forex-snapshots.json";
import { buildSnapshotCache } from "./market-snapshot-utils.js";

const { items: forexItems, generatedAt } = buildSnapshotCache(
  forexSnapshots,
  "forex",
);

export function hasCachedForexMarketSnapshots() {
  return forexItems.length > 0;
}

export function getForexMarketSnapshots() {
  return forexItems;
}

export function getForexMarketMeta() {
  return generatedAt ? { fetched_at: generatedAt } : null;
}

export async function refreshForexMarketSnapshots() {
  return forexItems;
}
