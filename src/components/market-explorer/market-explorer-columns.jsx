import { formatDateValue } from "../../utils/formatters.js";
import { getAccentClass } from "../../utils/market-explorer-utils.js";

function PercentCell({ value, formatter }) {
  const accentClass = getAccentClass(value);
  return (
    <span className={accentClass}>
      {value != null ? `${formatter.format(value)}%` : "--"}
    </span>
  );
}

function ChangeValueCell({ value, accentValue, formatValue, currency }) {
  const accentClass = getAccentClass(accentValue);
  return <span className={accentClass}>{formatValue(value, currency)}</span>;
}

export function buildCryptoColumns({
  formatPrice,
  percentFormatter,
  compactFormatter,
  dateFormatter,
}) {
  return [
    {
      key: "rank",
      label: "Market Cap Rank",
      className: "px-2 py-2 w-20 text-muted",
      renderCell: (asset) => asset.market_cap_rank || "--",
    },
    {
      key: "asset",
      label: "Asset",
      className: "px-4 py-2 w-60",
      renderCell: (asset) => {
        const iconSrc = asset.image || "";
        return (
          <div className="flex items-center gap-3">
            {iconSrc ? (
              <img src={iconSrc} alt={asset.name} className="h-8 w-8 rounded-md" loading="lazy" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs">
                {asset.symbol?.toUpperCase()}
              </span>
            )}
            <div>
              <div className="font-semibold">{asset.name}</div>
              <div className="text-xs text-muted">{asset.symbol?.toUpperCase()}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      className: "px-4 py-2",
      renderCell: (asset) => formatPrice(asset.current_price),
    },
    {
      key: "change",
      label: "Price 24h %",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return (
          <PercentCell value={asset.price_change_percentage_24h} formatter={percentFormatter} />
        );
      },
    },
    {
      key: "priceChange",
      label: "Price 24h",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return (
          <ChangeValueCell
            value={asset.price_change_24h}
            accentValue={asset.price_change_percentage_24h}
            formatValue={formatPrice}
          />
        );
      },
    },
    {
      key: "high",
      label: "High 24h",
      className: "px-4 py-2",
      renderCell: (asset) => formatPrice(asset.high_24h),
    },
    {
      key: "low",
      label: "Low 24h",
      className: "px-4 py-2",
      renderCell: (asset) => formatPrice(asset.low_24h),
    },
    {
      key: "marketCap",
      label: "Market cap",
      className: "px-4 py-2",
      renderCell: (asset) =>
        asset.market_cap != null ? compactFormatter.format(asset.market_cap) : "--",
    },
    {
      key: "marketCapChange",
      label: "Market cap 24h %",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return (
          <PercentCell
            value={asset.market_cap_change_percentage_24h}
            formatter={percentFormatter}
          />
        );
      },
    },
    {
      key: "volume",
      label: "24h volume",
      className: "px-4 py-2",
      renderCell: (asset) =>
        asset.total_volume != null ? compactFormatter.format(asset.total_volume) : "--",
    },
    {
      key: "updated",
      label: "Last updated",
      className: "px-4 py-2 text-muted whitespace-nowrap",
      renderCell: (asset) => formatDateValue(asset.last_updated, dateFormatter),
    },
  ];
}

export function buildNonCryptoColumns({
  formatEquityPrice,
  percentFormatter,
  dateFormatter,
}) {
  return [
    {
      key: "asset",
      label: "Asset",
      className: "px-4 py-2 w-64",
      renderCell: (asset) => {
        return (
          <div>
            <div className="font-semibold">{asset.name}</div>
            <div className="text-xs text-muted">
              {asset.symbol?.toUpperCase()} · {asset.group || "Equity"}
            </div>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      className: "px-4 py-2",
      renderCell: (asset) => formatEquityPrice(asset.last, asset.currency),
    },
    {
      key: "change",
      label: "1D %",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return <PercentCell value={asset.change_1d_pct} formatter={percentFormatter} />;
      },
    },
    {
      key: "priceChange",
      label: "1D",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return (
          <ChangeValueCell
            value={asset.change_1d}
            accentValue={asset.change_1d_pct}
            formatValue={formatEquityPrice}
            currency={asset.currency}
          />
        );
      },
    },
    {
      key: "change1w",
      label: "1W %",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return <PercentCell value={asset.change_1w_pct} formatter={percentFormatter} />;
      },
    },
    {
      key: "change1m",
      label: "1M %",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return <PercentCell value={asset.change_1m_pct} formatter={percentFormatter} />;
      },
    },
    {
      key: "change1y",
      label: "1Y %",
      className: "px-4 py-2",
      renderCell: (asset) => {
        return <PercentCell value={asset.change_1y_pct} formatter={percentFormatter} />;
      },
    },
    {
      key: "bid",
      label: "Bid",
      className: "px-4 py-2",
      renderCell: (asset) => formatEquityPrice(asset.bid, asset.currency),
    },
    {
      key: "ask",
      label: "Ask",
      className: "px-4 py-2",
      renderCell: (asset) => formatEquityPrice(asset.ask, asset.currency),
    },
    {
      key: "updated",
      label: "Last updated",
      className: "px-4 py-2 text-muted whitespace-nowrap",
      renderCell: (asset) => formatDateValue(asset.last_updated, dateFormatter),
    },
  ];
}
