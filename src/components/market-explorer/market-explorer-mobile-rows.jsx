import { formatDateValue } from "../../utils/formatters.js";
import { getAccentClass } from "../../utils/market-explorer-utils.js";

export default function MarketExplorerMobileRows({
  rows,
  variant = "crypto",
  formatPrice,
  percentFormatter,
  compactFormatter,
  dateFormatter,
}) {
  const isCryptoVariant = variant === "crypto";

  function renderValueRow(label, value) {
    // Small helper to keep label/value rows consistent.
    return (
      <div>
        {label}: <span className="text-ink">{value}</span>
      </div>
    );
  }

  function formatPercentValue(value) {
    return value != null ? `${percentFormatter.format(value)}%` : "--";
  }

  function renderCryptoRow(asset) {
    // Details/summary keeps the list compact on small screens.
    // Accent colors reflect 24h change direction.
    const priceAccentClass = getAccentClass(asset.price_change_percentage_24h);
    const marketCapAccentClass = getAccentClass(
      asset.market_cap_change_percentage_24h,
    );
    const iconSrc = asset.image || "";
    const marketCapValue =
      asset.market_cap != null && compactFormatter
        ? compactFormatter.format(asset.market_cap)
        : "--";
    const volumeValue =
      asset.total_volume != null && compactFormatter
        ? compactFormatter.format(asset.total_volume)
        : "--";

    return (
      <details key={asset.id} className="rounded-lg border border-border">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm">
          <div className="flex items-center gap-3">
            {iconSrc ? (
              <img
                src={iconSrc}
                alt={asset.name}
                className="h-8 w-8 rounded-md"
                loading="lazy"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs">
                {asset.symbol?.toUpperCase()}
              </span>
            )}
            <div>
              <div className="font-semibold">{asset.name}</div>
              <div className="text-xs text-muted">
                {asset.symbol?.toUpperCase()} - Market Cap Rank{" "}
                {asset.market_cap_rank || "--"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-ink">{formatPrice(asset.current_price)}</div>
            <div className={`text-xs ${priceAccentClass}`}>
              {formatPercentValue(asset.price_change_percentage_24h)}
            </div>
          </div>
        </summary>
        <div className="space-y-2 border-t border-border px-4 py-2 text-sm text-muted">
          {renderValueRow("Market cap", marketCapValue)}
          <div>
            Market cap 24h %:{" "}
            <span className={marketCapAccentClass}>
              {formatPercentValue(asset.market_cap_change_percentage_24h)}
            </span>
          </div>
          {renderValueRow("24h volume", volumeValue)}
          <div>
            Price change 24h:{" "}
            <span className={priceAccentClass}>
              {formatPrice(asset.price_change_24h)}
            </span>
          </div>
          {renderValueRow(
            "High / Low 24h",
            `${formatPrice(asset.high_24h)} / ${formatPrice(asset.low_24h)}`,
          )}
          {renderValueRow(
            "Last updated",
            formatDateValue(asset.last_updated, dateFormatter),
          )}
        </div>
      </details>
    );
  }

  function renderNonCryptoRow(asset) {
    const changeAccentClass = getAccentClass(asset.change_1d_pct);
    const currency = asset.currency || "USD";

    return (
      <details
        key={asset.id || asset.symbol}
        className="rounded-lg border border-border"
      >
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm">
          <div>
            <div className="font-semibold">{asset.name}</div>
            <div className="text-xs text-muted">
              {asset.symbol?.toUpperCase()} · {asset.group || "Equity"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-ink">
              {formatPrice(asset.last, currency)}
            </div>
            <div className={`text-xs ${changeAccentClass}`}>
              {formatPercentValue(asset.change_1d_pct)}
            </div>
          </div>
        </summary>
        <div className="space-y-2 border-t border-border px-4 py-2 text-sm text-muted">
          {renderValueRow("1D change", formatPrice(asset.change_1d, currency))}
          {renderValueRow("1W change %", formatPercentValue(asset.change_1w_pct))}
          {renderValueRow("1M change %", formatPercentValue(asset.change_1m_pct))}
          {renderValueRow("1Y change %", formatPercentValue(asset.change_1y_pct))}
          {renderValueRow(
            "Bid / Ask",
            `${formatPrice(asset.bid, currency)} / ${formatPrice(
              asset.ask,
              currency,
            )}`,
          )}
          {renderValueRow(
            "Last updated",
            formatDateValue(asset.last_updated, dateFormatter),
          )}
        </div>
      </details>
    );
  }

  const renderRow = isCryptoVariant ? renderCryptoRow : renderNonCryptoRow;

  return (
    <div className="space-y-2 md:hidden">{rows.map(renderRow)}</div>
  );
}

