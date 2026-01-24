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

const MARKET_PROVIDERS = {
  crypto: {
    hasCache: hasCachedCryptoMarketSnapshots,
    getSnapshots: getCryptoMarketSnapshots,
    getMeta: getCryptoMarketMeta,
    refreshSnapshots: refreshCryptoMarketSnapshots,
  },
  equity: {
    hasCache: hasCachedEquityMarketSnapshots,
    getSnapshots: getEquityMarketSnapshots,
    getMeta: getEquityMarketMeta,
    refreshSnapshots: refreshEquityMarketSnapshots,
  },
  rates: {
    hasCache: hasCachedRatesMarketSnapshots,
    getSnapshots: getRatesMarketSnapshots,
    getMeta: getRatesMarketMeta,
    refreshSnapshots: refreshRatesMarketSnapshots,
  },
  forex: {
    hasCache: hasCachedForexMarketSnapshots,
    getSnapshots: getForexMarketSnapshots,
    getMeta: getForexMarketMeta,
    refreshSnapshots: refreshForexMarketSnapshots,
  },
  commodities: {
    hasCache: hasCachedCommoditiesMarketSnapshots,
    getSnapshots: getCommoditiesMarketSnapshots,
    getMeta: getCommoditiesMarketMeta,
    refreshSnapshots: refreshCommoditiesMarketSnapshots,
  },
};

const EMPTY_PROVIDER = {
  hasCache: () => {
    return false;
  },
  getSnapshots: () => {
    return [];
  },
  getMeta: () => {
    return null;
  },
  refreshSnapshots: async () => {
    return [];
  },
};

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

  const provider = MARKET_PROVIDERS[market] || EMPTY_PROVIDER;

  function loadSnapshots(targetCurrency) {
    // Pull cached snapshots for the selected market.
    const data = provider.getSnapshots(targetCurrency);
    setSnapshots(Array.isArray(data) ? data : []);
  }

  const refreshNow = async (params = {}) => {
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
    const hasCache = provider.hasCache(currency);
    const meta = provider.getMeta(currency);
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
      const updated = await provider.refreshSnapshots(currency);
      setSnapshots(Array.isArray(updated) ? updated : []);
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
      loadSnapshots(currency);
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
    // Background refresh interval (stale-only unless forced).
    refreshNow({ silent: true });
    const intervalId = setInterval(() => {
      refreshNow({ silent: true });
    }, intervalMs);
    return () => {
      clearInterval(intervalId);
    };
  }, [currency, intervalMs, cooldownMs, market]);

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
