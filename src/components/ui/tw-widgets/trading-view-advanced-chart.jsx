import { useEffect, useRef } from "react";
import { useTheme } from "../../../contexts";

const WIDGET_SCRIPT_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const DEFAULT_WIDGET_OPTIONS = {
  interval: "240",
  timezone: localTimezone,
  style: "1",
  locale: "en",
  withdateranges: true,
  hide_side_toolbar: false,
  allow_symbol_change: true,
  save_image: false,
  details: false,
  hotlist: false,
  calendar: false,
  autosize: true,
  support_host: "https://www.tradingview.com",
};

const buildWidgetOptions = (symbol, theme, overrides) => {
  return {
    ...DEFAULT_WIDGET_OPTIONS,
    symbol,
    theme: theme === "dark" ? "dark" : "light",
    ...(overrides || {}),
  };
};

export default function TradingViewAdvancedChart({
  symbol,
  className = " w-full",
  containerClassName = "",
  overrides,
}) {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const normalizedSymbol = String(symbol || "").trim();
  const widgetOverrides =
    overrides && typeof overrides === "object" ? overrides : null;
  const overridesKey = widgetOverrides
    ? JSON.stringify(widgetOverrides)
    : "";

  const mountWidget = () => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    if (!normalizedSymbol) return;

    const widgetOptions = buildWidgetOptions(
      normalizedSymbol,
      theme,
      widgetOverrides,
    );

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.innerHTML = JSON.stringify(widgetOptions);
    container.appendChild(script);
  };

  useEffect(mountWidget, [normalizedSymbol, theme, overridesKey]);

  return (
    <div className={`tradingview-widget-container ${containerClassName}`}>
      {normalizedSymbol ? (
        <div ref={containerRef} className={className} />
      ) : (
        <div
          className={`flex items-center justify-center text-xs text-muted ${className}`}
        >
          Select an asset to load the chart.
        </div>
      )}
    </div>
  );
}
