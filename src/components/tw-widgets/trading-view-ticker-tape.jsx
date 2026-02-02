import { useEffect, useRef } from "react";

const WIDGET_SCRIPT_SRC =
  "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";

const DEFAULT_SYMBOLS =
  "FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD,TVC:SILVER,NASDAQ:AAPL,BME:TES,NASDAQ:NVDA,NASDAQ:AAPL,FPMARKETS:GBPUSD,NSE:NIFTY";

export default function TradingViewTickerTape({
  symbols = DEFAULT_SYMBOLS,
  containerClassName = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mountWidget = () => {
      container.innerHTML = "";
      const widget = document.createElement("tv-ticker-tape");
      widget.setAttribute("symbols", symbols);
      widget.setAttribute("hide-chart", "");
      widget.setAttribute("item-size", "compact");
      widget.setAttribute("show-hover", "");
      container.appendChild(widget);
    };

    if (customElements.get("tv-ticker-tape")) {
      mountWidget();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${WIDGET_SCRIPT_SRC}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener("load", mountWidget, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", mountWidget, { once: true });
    document.head.appendChild(script);
  }, [symbols]);

  return (
    <div className={`tradingview-widget-container ${containerClassName}`}>
      <div ref={containerRef} />
    </div>
  );
}
