import { fetchCoinMarkets } from "../../adapters/market/crypto-market-adapter.js";
import {
  getCachedMarketList,
  getCachedMarketMeta,
  hasCachedMarketList,
  setCachedMarketList,
} from "./crypto-market-cache.js";

// Default UI currency used when no selection is provided.
export const DEFAULT_QUOTE_CURRENCY = "usd";
export const SUPPORTED_QUOTE_CURRENCIES = ["usd", "eur", "gbp"];

function normalizeMarketItem(data, currency) {
  // Keep only the fields needed by the UI to keep cache light.
  return {
    id: String(data?.id || ""),
    symbol: String(data?.symbol || "").toLowerCase(),
    name: String(data?.name || ""),
    image: String(data?.image || ""),
    quote_currency: String(currency || DEFAULT_QUOTE_CURRENCY),
    current_price: Number(data?.current_price ?? 0),
    price_change_24h: Number(data?.price_change_24h ?? 0),
    price_change_percentage_24h: Number(
      data?.price_change_percentage_24h ?? 0
    ),
    market_cap: Number(data?.market_cap ?? 0),
    market_cap_rank: Number(data?.market_cap_rank ?? 0),
    market_cap_change_percentage_24h: Number(
      data?.market_cap_change_percentage_24h ?? 0
    ),
    total_volume: Number(data?.total_volume ?? 0),
    high_24h: Number(data?.high_24h ?? 0),
    low_24h: Number(data?.low_24h ?? 0),
    last_updated: String(data?.last_updated || ""),
  };
}

export function hasCachedCryptoMarketSnapshots(
  currency = DEFAULT_QUOTE_CURRENCY
) {
  const key = String(currency || DEFAULT_QUOTE_CURRENCY).toLowerCase();
  return hasCachedMarketList(key);
}

export function getCryptoMarketSnapshots(currency = DEFAULT_QUOTE_CURRENCY) {
  const key = String(currency || DEFAULT_QUOTE_CURRENCY).toLowerCase();
  const cached = getCachedMarketList(key);
  // Always return an array so UI can render safely.
  return cached && cached.length ? cached : [];
}

export function getCryptoMarketMeta(currency = DEFAULT_QUOTE_CURRENCY) {
  const key = String(currency || DEFAULT_QUOTE_CURRENCY).toLowerCase();
  return getCachedMarketMeta(key);
}

export async function refreshCryptoMarketSnapshots(
  currency = DEFAULT_QUOTE_CURRENCY
) {
  const key = String(currency || DEFAULT_QUOTE_CURRENCY).toLowerCase();
  // fetchedAt is stored to drive stale checks and UI timestamps.
  const fetchedAt = new Date().toISOString();
  // CoinGecko returns a full market list ordered by market cap.
  const data = await fetchCoinMarkets({ vsCurrency: key, perPage: 250 });
  if (!Array.isArray(data)) throw new Error("Invalid market response.");
  const normalized = data.map((item) => {
    return normalizeMarketItem(item, key);
  });
  setCachedMarketList(key, normalized, fetchedAt);
  return normalized;
}

