import { httpClient } from "../../adapters/mock/http-client.js";

export async function getOpenTrades(params = {}) {
  // Build optional query params for the mock API.
  const search = new URLSearchParams();
  if (params.broker) search.set("broker", params.broker);
  if (params.accountId) search.set("accountId", params.accountId);
  const query = search.toString();
  const url = query ? `/trades/open?${query}` : "/trades/open";
  const res = await httpClient.get(url);
  return res.data;
}

export async function getTradeHistory(params = {}) {
  // Build optional query params for the mock API.
  const search = new URLSearchParams();
  if (params.broker) search.set("broker", params.broker);
  if (params.accountId) search.set("accountId", params.accountId);
  const query = search.toString();
  const url = query ? `/trades/history?${query}` : "/trades/history";
  const res = await httpClient.get(url);
  return res.data;
}
