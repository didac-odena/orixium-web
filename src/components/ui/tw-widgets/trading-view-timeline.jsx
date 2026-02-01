import { useEffect, useRef } from "react";
import { useTheme } from "../../../contexts";

const WIDGET_SCRIPT_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";

const DEFAULT_WIDGET_OPTIONS = {
  displayMode: "adaptive",
  feedMode: "all_symbols",
  colorTheme: "dark",
  isTransparent: false,
  locale: "en",
  width: "100%",
  height: "100%",
};

const buildWidgetOptions = (theme, overrides) => {
  return {
    ...DEFAULT_WIDGET_OPTIONS,
    colorTheme: theme === "dark" ? "dark" : "light",
    ...(overrides || {}),
  };
};

export default function TradingViewTimeline({
  className = "h-96 w-full",
  containerClassName = "",
  overrides,
}) {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const overridesKey =
    overrides && typeof overrides === "object" ? JSON.stringify(overrides) : "";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetOptions = buildWidgetOptions(theme, overrides);
    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(widgetOptions);
    container.appendChild(script);
  }, [theme, overridesKey]);

  return (
    <div className={`tradingview-widget-container ${containerClassName}`}>
      <div ref={containerRef} className={className} />
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/news/top-providers/tradingview/"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          <span className="blue-text">Top stories</span>
        </a>
        <span className="trademark"> by TradingView</span>
      </div>
    </div>
  );
}
