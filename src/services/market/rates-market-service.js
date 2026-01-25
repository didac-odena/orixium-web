import ratesSnapshots from "../../mocks/fixtures/market-place/rates-snapshots.json";
import { buildSnapshotCache } from "./market-snapshot-utils.js";

const { items: ratesItems, generatedAt } = buildSnapshotCache(
  ratesSnapshots,
  "rates",
);

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
