import axios from "axios";

const httpClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

function buildTradesEndpoint(path, params) {
  const queryParams = new URLSearchParams();
  if (params.broker) queryParams.set("broker", params.broker);
  if (params.accountId) queryParams.set("accountId", params.accountId);
  const queryString = queryParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function getOpenTrades(params = {}) {
  // Build optional query params for the mock API.
  const endpoint = buildTradesEndpoint("/trades/open", params);
  const response = await httpClient.get(endpoint);
  return response.data;
}

export async function getTradeHistory(params = {}) {
  // Build optional query params for the mock API.
  const endpoint = buildTradesEndpoint("/trades/history", params);
  const response = await httpClient.get(endpoint);
  return response.data;
}
