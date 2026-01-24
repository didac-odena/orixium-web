import { getAccentClass } from "../../pages/market-explorer/market-explorer-utils.js";

export function MarketExplorerMobileList({
  rows,
  formatPrice,
  percentFormatter,
  compactFormatter,
  dateFormatter,
}) {

  function renderValueRow(label, value) {
    // Small helper to keep label/value rows consistent.
    return (
      <div>
        {label}: <span className="text-ink">{value}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:hidden">
      {rows.map(function (asset) {
        // Details/summary keeps the list compact on small screens.
        // Accent colors reflect 24h change direction.
        const priceAccentClass = getAccentClass(
          asset.price_change_percentage_24h,
        );
        const marketCapAccentClass = getAccentClass(
          asset.market_cap_change_percentage_24h,
        );
        const iconSrc = asset.image || "";

        return (
          <details
            key={asset.id}
            className="rounded-lg border border-border"
          >
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
                <div className="text-sm text-ink">
                  {formatPrice(asset.current_price)}
                </div>
                <div className={`text-xs ${priceAccentClass}`}>
                  {asset.price_change_percentage_24h != null
                    ? `${percentFormatter.format(
                        asset.price_change_percentage_24h,
                      )}%`
                    : "--"}
                </div>
              </div>
            </summary>
            <div className="space-y-2 border-t border-border px-4 py-2 text-sm text-muted">
              {renderValueRow(
                "Market cap",
                asset.market_cap != null
                  ? compactFormatter.format(asset.market_cap)
                  : "--",
              )}
              <div>
                Market cap 24h %:{" "}
                <span className={marketCapAccentClass}>
                  {asset.market_cap_change_percentage_24h != null
                    ? `${percentFormatter.format(
                        asset.market_cap_change_percentage_24h,
                      )}%`
                    : "--"}
                </span>
              </div>
              {renderValueRow(
                "24h volume",
                asset.total_volume != null
                  ? compactFormatter.format(asset.total_volume)
                  : "--",
              )}
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
                asset.last_updated
                  ? dateFormatter.format(new Date(asset.last_updated))
                  : "--",
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
