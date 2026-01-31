import axios from "axios";

const MANUAL_TRADES_STORAGE_KEY = "orixium.manualTrades";

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

function readManualTrades() {
  const raw = localStorage.getItem(MANUAL_TRADES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeManualTrades(trades) {
  localStorage.setItem(MANUAL_TRADES_STORAGE_KEY, JSON.stringify(trades));
}

function buildManualTradeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `manual-trade-${crypto.randomUUID()}`;
  }
  return `manual-trade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSourceTrade(accountId) {
  if (!accountId) return "orixium";
  const prefix = String(accountId).split("-")[0];
  return prefix || "orixium";
}

function filterManualTrades(trades, params) {
  return trades.filter((trade) => {
    if (params.broker && trade.sourceTrade !== params.broker) return false;
    if (params.accountId && trade.accountId !== params.accountId) return false;
    return true;
  });
}

function mapManualTradeToOpen(trade) {
  const fallbackSymbol =
    trade.baseAsset && trade.quoteAsset ? `${trade.baseAsset}/${trade.quoteAsset}` : "";
  const safeSymbol = String(trade.symbol || fallbackSymbol || "").toUpperCase();
  const entryPrice = Number(trade.entryPrice ?? trade.currentPrice ?? 0);
  return {
    id: trade.orixiumId || trade.id,
    broker: trade.sourceTrade || trade.broker,
    accountId: trade.accountId,
    symbol: safeSymbol,
    side: trade.side === "SELL" ? "short" : "long",
    orderType: String(trade.orderType || "market").toLowerCase(),
    entryPrice,
    currentPrice: entryPrice,
    qty: Number(trade.baseAmount ?? 0),
    notional: Number(trade.quoteAmount ?? 0),
    stopLoss: trade.stopLossPrice ?? null,
    takeProfit1: trade.takeProfits?.[0]?.targetPrice ?? null,
    takeProfit2: trade.takeProfits?.[1]?.targetPrice ?? null,
    openedAt: trade.openedAt ?? trade.createdAt,
    source: trade.sourceTrade ?? trade.source,
    origin: trade.internalOrigin ?? trade.origin,
  };
}

function mapManualTradeToHistory(trade) {
  const fallbackSymbol =
    trade.baseAsset && trade.quoteAsset ? `${trade.baseAsset}/${trade.quoteAsset}` : "";
  const safeSymbol = String(trade.symbol || fallbackSymbol || "").toUpperCase();
  const entryPrice = Number(trade.entryPrice ?? trade.currentPrice ?? 0);
  return {
    id: trade.orixiumId || trade.id,
    broker: trade.sourceTrade || trade.broker,
    accountId: trade.accountId,
    symbol: safeSymbol,
    side: trade.side === "SELL" ? "short" : "long",
    entryPrice,
    exitPrice: Number(trade.exitPrice ?? entryPrice),
    qty: Number(trade.baseAmount ?? 0),
    pnlUsd: trade.pnlUsd ?? 0,
    pnlPct: trade.pnlPct ?? 0,
    exitReason: trade.closeReason ?? "manual",
    closedAt: trade.closedAt ?? trade.createdAt,
    source: trade.sourceTrade ?? trade.source,
    origin: trade.internalOrigin ?? trade.origin,
  };
}

export function createManualTrade(payload) {
  const now = new Date().toISOString();
  const safeSymbol = String(payload.symbol || "").toUpperCase();
  const manualTrade = {
    orixiumId: buildManualTradeId(),
    providerTradeId: payload.providerTradeId || "test",
    sourceTrade: payload.sourceTrade || normalizeSourceTrade(payload.accountId),
    internalOrigin: payload.internalOrigin || "manual-trade",
    status: "open",
    createdAt: now,
    updatedAt: now,
    closedAt: null,
    accountId: payload.accountId,
    marketType: payload.marketType,
    symbol: safeSymbol,
    marketInfo: payload.marketInfo || null,
    side: payload.side,
    orderType: payload.orderType,
    entryPrice: Number(payload.entryPrice),
    limitPrice:
      payload.orderType === "LIMIT" && payload.limitPrice != null
        ? Number(payload.limitPrice)
        : null,
    baseAmount: Number(payload.baseAmount),
    quoteAmount: Number(payload.quoteAmount),
    takeProfits: Array.isArray(payload.takeProfits) ? payload.takeProfits : [],
    stopLossPrice: payload.stopLossPrice ? Number(payload.stopLossPrice) : null,
  };

  const trades = readManualTrades();
  trades.unshift(manualTrade);
  writeManualTrades(trades);
  return manualTrade;
}

export function closeManualTrade(orixiumId, overrides = {}) {
  if (!orixiumId) return null;
  const trades = readManualTrades();
  const index = trades.findIndex((trade) => {
    return trade.orixiumId === orixiumId || trade.id === orixiumId;
  });
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = trades[index];
  const entryPrice = Number(current.entryPrice ?? 0);
  const exitPrice = Number(
    overrides.exitPrice ?? current.exitPrice ?? current.entryPrice ?? 0
  );
  const qty = Number(current.baseAmount ?? 0);
  const direction = current.side === "SELL" ? -1 : 1;
  const pnlUsd =
    Number.isFinite(exitPrice) && Number.isFinite(entryPrice)
      ? (exitPrice - entryPrice) * qty * direction
      : 0;
  const pnlPct =
    Number.isFinite(entryPrice) && entryPrice !== 0
      ? ((exitPrice - entryPrice) / entryPrice) * 100 * direction
      : 0;

  const updated = {
    ...current,
    status: "closed",
    updatedAt: now,
    closedAt: now,
    exitPrice,
    pnlUsd,
    pnlPct,
    closeReason: overrides.closeReason || "manual",
  };

  trades[index] = updated;
  writeManualTrades(trades);
  return updated;
}

export async function getOpenTrades(params = {}) {
  // Build optional query params for the mock API.
  const endpoint = buildTradesEndpoint("/trades/open", params);
  const response = await httpClient.get(endpoint);
  const manualOpenTrades = filterManualTrades(readManualTrades(), params).filter((trade) => {
    return trade.status === "open";
  });
  const mappedManualTrades = manualOpenTrades.map(mapManualTradeToOpen);
  return [...response.data, ...mappedManualTrades];
}

export async function getTradeHistory(params = {}) {
  // Build optional query params for the mock API.
  const endpoint = buildTradesEndpoint("/trades/history", params);
  const response = await httpClient.get(endpoint);
  const manualClosedTrades = filterManualTrades(readManualTrades(), params).filter((trade) => {
    return trade.status === "closed";
  });
  const mappedManualTrades = manualClosedTrades.map(mapManualTradeToHistory);
  return [...response.data, ...mappedManualTrades];
}
