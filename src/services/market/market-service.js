import { httpClient } from "../../adapters/mock/http-client.js";

export async function getMarketMovers(params = {}) {
  // Build optional query params for the mock API.
  const search = new URLSearchParams();
  if (params.exchange) search.set("exchange", params.exchange);
  if (params.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  const url = query ? `/market/movers?${query}` : "/market/movers";
  const res = await httpClient.get(url);
  return res.data;
}
