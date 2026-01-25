import commoditiesSnapshots from "../../mocks/fixtures/market-place/commodities-snapshots.json";
import { buildSnapshotCache } from "./market-snapshot-utils.js";

const { items: commoditiesItems, generatedAt } = buildSnapshotCache(
  commoditiesSnapshots,
  "commodities",
);

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
