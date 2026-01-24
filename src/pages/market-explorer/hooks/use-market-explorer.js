import { useEffect, useRef, useState } from "react";
import {
  getCryptoMarketMeta,
  getCryptoMarketSnapshots,
  hasCachedCryptoMarketSnapshots,
  refreshCryptoMarketSnapshots,
  getEquityMarketMeta,
  getEquityMarketSnapshots,
  hasCachedEquityMarketSnapshots,
  refreshEquityMarketSnapshots,
  getRatesMarketMeta,
  getRatesMarketSnapshots,
  hasCachedRatesMarketSnapshots,
  refreshRatesMarketSnapshots,
  getForexMarketMeta,
  getForexMarketSnapshots,
  hasCachedForexMarketSnapshots,
  refreshForexMarketSnapshots,
  getCommoditiesMarketMeta,
  getCommoditiesMarketSnapshots,
  hasCachedCommoditiesMarketSnapshots,
  refreshCommoditiesMarketSnapshots,
} from "../../../services/index.js";

const MANUAL_REFRESH_SCRIPTS = {
  equity:
    "E:\\Orixium\\scripts\\IBKR\\data-market\\update-equity-snapshots.ps1",
  rates: "E:\\Orixium\\scripts\\IBKR\\data-market\\update-rates-snapshots.ps1",
  forex: "E:\\Orixium\\scripts\\IBKR\\data-market\\update-forex-snapshots.ps1",
  commodities:
    "E:\\Orixium\\scripts\\IBKR\\data-market\\update-commodities-snapshots.ps1",
};

function hasMarketCache(market, currency) {
  switch (market) {
    case "crypto":
      return hasCachedCryptoMarketSnapshots(currency);
    case "equity":
      return hasCachedEquityMarketSnapshots();
    case "rates":
      return hasCachedRatesMarketSnapshots();
    case "forex":
      return hasCachedForexMarketSnapshots();
    case "commodities":
      return hasCachedCommoditiesMarketSnapshots();
    default:
      return false;
  }
}

function getMarketSnapshots(market, currency) {
  switch (market) {
    case "crypto":
      return getCryptoMarketSnapshots(currency);
    case "equity":
      return getEquityMarketSnapshots();
    case "rates":
      return getRatesMarketSnapshots();
    case "forex":
      return getForexMarketSnapshots();
    case "commodities":
      return getCommoditiesMarketSnapshots();
    default:
      return [];
  }
}

function getMarketMeta(market, currency) {
  switch (market) {
    case "crypto":
      return getCryptoMarketMeta(currency);
    case "equity":
      return getEquityMarketMeta();
    case "rates":
      return getRatesMarketMeta();
    case "forex":
      return getForexMarketMeta();
    case "commodities":
      return getCommoditiesMarketMeta();
    default:
      return null;
  }
}

async function refreshMarketSnapshots(market, currency) {
  switch (market) {
    case "crypto":
      return refreshCryptoMarketSnapshots(currency);
    case "equity":
      return refreshEquityMarketSnapshots();
    case "rates":
      return refreshRatesMarketSnapshots();
    case "forex":
      return refreshForexMarketSnapshots();
    case "commodities":
      return refreshCommoditiesMarketSnapshots();
    default:
      return [];
  }
}

export function useMarketExplorer(options) {
  const {
    market = "crypto",
    currency,
    intervalMs = 5 * 60 * 1000,
    cooldownMs = 60 * 1000,
  } = options;

  const [snapshots, setSnapshots] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");
  const [refreshError, setRefreshError] = useState("");

  // Track last manual refresh attempt for cooldown checks.
  const lastRefreshAtRef = useRef(0);
  const noticeTimerRef = useRef(null);

  const clearNoticeTimer = () => {
    if (!noticeTimerRef.current) return;
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = null;
  };

  const showNotice = (message, durationMs = 2000) => {
    // Short-lived tooltip message for cooldown feedback.
    setRefreshNotice(message);
    clearNoticeTimer();
    noticeTimerRef.current = setTimeout(() => {
      setRefreshNotice("");
    }, durationMs);
  };

  async function refreshNow(params = {}) {
    const force = Boolean(params.force);
    const silent = Boolean(params.silent);
    const manualScript = MANUAL_REFRESH_SCRIPTS[market];
    if (manualScript) {
      if (!silent && force) {
        showNotice(
          `Manual refresh only (backend TODO). Run: ${manualScript}`,
          6000,
        );
      }
      return;
    }
    const hasCache = hasMarketCache(market, currency);
    const meta = getMarketMeta(market, currency);
    const lastFetched = meta?.fetched_at ? Date.parse(meta.fetched_at) : 0;
    const now = Date.now();
    // Refresh if forced, missing cache, or stale beyond interval.
    const isStale = !lastFetched || now - lastFetched >= intervalMs;
    const shouldRefresh = force || !hasCache || isStale;
    // Cooldown is enforced on manual refresh attempts.
    const cooldownRemaining = cooldownMs - (now - lastRefreshAtRef.current);

    if (cooldownRemaining > 0) {
      if (force && !silent) {
        const seconds = Math.ceil(cooldownRemaining / 1000);
        showNotice(`Please wait ${seconds}s before refreshing again.`);
      }
      return;
    }

    if (!shouldRefresh) return;

    // Only surface errors/notices when not in silent mode.
    setRefreshError("");
    if (!silent) setRefreshNotice("");
    // Stamp the attempt time even before the network call.
    lastRefreshAtRef.current = Date.now();
    setIsRefreshing(true);
    try {
      const refreshedSnapshots = await refreshMarketSnapshots(
        market,
        currency,
      );
      setSnapshots(
        Array.isArray(refreshedSnapshots) ? refreshedSnapshots : [],
      );
    } catch (err) {
      if (!silent) {
        setRefreshError(
          err instanceof Error ? err.message : "Failed to refresh market data.",
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load cached data first to avoid blank UI.
    let isActive = true;
    try {
      const snapshotRows = getMarketSnapshots(market, currency);
      setSnapshots(Array.isArray(snapshotRows) ? snapshotRows : []);
      if (!isActive) return;
      setStatus("ready");
    } catch (err) {
      if (!isActive) return;
      setError(
        err instanceof Error ? err.message : "Failed to load market data.",
      );
      setStatus("error");
    }

    return () => {
      isActive = false;
    };
  }, [currency, market]);

  useEffect(() => {
    // Reset manual refresh cooldown when switching market segments.
    lastRefreshAtRef.current = 0;
    setRefreshNotice("");
    setRefreshError("");
  }, [market]);

  useEffect(() => {
    // Refresh once when entering or switching market.
    refreshNow({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, intervalMs, market]);

  useEffect(() => {
    return () => {
      clearNoticeTimer();
    };
  }, []);

  return {
    snapshots,
    status,
    error,
    isRefreshing,
    refreshNotice,
    refreshError,
    refreshNow,
  };
}
