import { httpClient } from "../../adapters/mock/http-client.js";

export async function getOpenTrades(params = {}) {
  // Build optional query params for the mock API.
  const queryParams = new URLSearchParams();
  if (params.broker) queryParams.set("broker", params.broker);
  if (params.accountId) queryParams.set("accountId", params.accountId);
  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/trades/open?${queryString}`
    : "/trades/open";
  const response = await httpClient.get(endpoint);
  return response.data;
}

export async function getTradeHistory(params = {}) {
  // Build optional query params for the mock API.
  const queryParams = new URLSearchParams();
  if (params.broker) queryParams.set("broker", params.broker);
  if (params.accountId) queryParams.set("accountId", params.accountId);
  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/trades/history?${queryString}`
    : "/trades/history";
  const response = await httpClient.get(endpoint);
  return response.data;
}
