import { http, HttpResponse, delay } from "msw";
import PortfolioSummary from "../fixtures/portfolio-summary.json";
import TradesOpen from "../fixtures/trades-open.json";
import TradesHistory from "../fixtures/trades-history.json";

const SESSION_STORAGE_KEY = "orixium.mock.session";

// Reuse the auth mock session to scope data to a user.
function getSession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function filterByUserId(items, userId) {
  return items.filter((item) => item.userId === userId);
}

// Allow optional filtering by broker/account via query params.
function filterByAccount(items, searchParams) {
  const broker = searchParams.get("broker");
  const accountId = searchParams.get("accountId");

  return items.filter((item) => {
    if (broker && item.broker !== broker) return false;
    if (accountId && item.accountId !== accountId) return false;
    return true;
  });
}

function respondWithUserData(request, rows) {
  const session = getSession();
  if (!session?.userId) {
    return HttpResponse.json([], { status: 200 });
  }
  const url = new URL(request.url);
  const userRows = filterByUserId(rows, session.userId);
  const filteredRows = filterByAccount(userRows, url.searchParams);
  return HttpResponse.json(filteredRows);
}

export const tradingHandlers = [
  http.get("/api/portfolio/summary", async ({ request }) => {
    await delay(200);
    return respondWithUserData(request, PortfolioSummary);
  }),

  http.get("/api/trades/open", async ({ request }) => {
    await delay(200);
    return respondWithUserData(request, TradesOpen);
  }),

  http.get("/api/trades/history", async ({ request }) => {
    await delay(200);
    return respondWithUserData(request, TradesHistory);
  }),
];

