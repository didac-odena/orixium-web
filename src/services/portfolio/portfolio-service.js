import { httpClient } from "../../adapters/mock/http-client.js";

export async function getPortfolioSummary(params = {}) {
  const search = new URLSearchParams();
  if (params.broker) search.set("broker", params.broker);
  if (params.accountId) search.set("accountId", params.accountId);
  const query = search.toString();
  const url = query ? `/portfolio/summary?${query}` : "/portfolio/summary";
  const res = await httpClient.get(url);
  return res.data;
}
