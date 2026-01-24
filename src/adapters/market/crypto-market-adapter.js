import axios from "axios";

const coingeckoClient = axios.create({
  // Direct public API client for CoinGecko market data.
  baseURL: "https://api.coingecko.com/api/v3",
  headers: { "Content-Type": "application/json" },
  timeout: 12000,
});

export async function fetchCoinMarkets(params) {
  // CoinGecko market list endpoint (single page).
  const response = await coingeckoClient.get("/coins/markets", {
    params: {
      vs_currency: params.vsCurrency,
      order: "market_cap_desc",
      per_page: params.perPage || 250,
      page: 1,
      sparkline: "false",
    },
  });
  return response.data;
}
