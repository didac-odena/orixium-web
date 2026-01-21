import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCryptoMarketMeta,
  getCryptoMarketSnapshots,
  hasCachedCryptoMarketSnapshots,
  refreshCryptoMarketSnapshots,
} from "../../../services/index.js";

export function useMarketExplorer(options) {
  const {
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

  const clearNoticeTimer = useCallback(function () {
    if (!noticeTimerRef.current) return;
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = null;
  }, []);

  const showNotice = useCallback(
    function (message) {
      // Short-lived tooltip message for cooldown feedback.
      setRefreshNotice(message);
      clearNoticeTimer();
      noticeTimerRef.current = setTimeout(function () {
        setRefreshNotice("");
      }, 2000);
    },
    [clearNoticeTimer],
  );

  function loadSnapshots(targetCurrency) {
    // Pull cached snapshots for the selected currency.
    const data = getCryptoMarketSnapshots(targetCurrency);
    setSnapshots(Array.isArray(data) ? data : []);
  }

  const refreshNow = useCallback(
    async function (params = {}) {
      const force = Boolean(params.force);
      const silent = Boolean(params.silent);
      const hasCache = hasCachedCryptoMarketSnapshots(currency);
      const meta = getCryptoMarketMeta(currency);
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
        const updated = await refreshCryptoMarketSnapshots(currency);
        setSnapshots(Array.isArray(updated) ? updated : []);
      } catch (err) {
        if (!silent) {
          setRefreshError(
            err instanceof Error
              ? err.message
              : "Failed to refresh market data.",
          );
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [currency, intervalMs, cooldownMs, showNotice],
  );

  useEffect(
    function () {
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

      return function () {
        isActive = false;
      };
    },
    [currency],
  );

  useEffect(
    function () {
      // Background refresh interval (stale-only unless forced).
      refreshNow({ silent: true });
      const intervalId = setInterval(function () {
        refreshNow({ silent: true });
      }, intervalMs);
      return function () {
        clearInterval(intervalId);
      };
    },
    [refreshNow, intervalMs],
  );

  useEffect(function () {
    return function () {
      clearNoticeTimer();
    };
  }, [clearNoticeTimer]);

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
