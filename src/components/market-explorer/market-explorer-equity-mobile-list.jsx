import { getAccentClass } from "../../pages/market-explorer/market-explorer-utils.js";

export function MarketExplorerEquityMobileList({
  rows,
  formatPrice,
  percentFormatter,
  dateFormatter,
}) {

  function renderValueRow(label, value) {
    return (
      <div>
        {label}: <span className="text-ink">{value}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:hidden">
      {rows.map(function (asset) {
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
                  {asset.symbol?.toUpperCase()} · {asset.sector || "Equity"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-ink">
                  {formatPrice(asset.last, currency)}
                </div>
                <div className={`text-xs ${changeAccentClass}`}>
                  {asset.change_1d_pct != null
                    ? `${percentFormatter.format(asset.change_1d_pct)}%`
                    : "--"}
                </div>
              </div>
            </summary>
            <div className="space-y-2 border-t border-border px-4 py-2 text-sm text-muted">
              {renderValueRow(
                "1D change",
                formatPrice(asset.change_1d, currency),
              )}
              {renderValueRow(
                "1W change %",
                asset.change_1w_pct != null
                  ? `${percentFormatter.format(asset.change_1w_pct)}%`
                  : "--",
              )}
              {renderValueRow(
                "1M change %",
                asset.change_1m_pct != null
                  ? `${percentFormatter.format(asset.change_1m_pct)}%`
                  : "--",
              )}
              {renderValueRow(
                "1Y change %",
                asset.change_1y_pct != null
                  ? `${percentFormatter.format(asset.change_1y_pct)}%`
                  : "--",
              )}
              {renderValueRow(
                "Bid / Ask",
                `${formatPrice(asset.bid, currency)} / ${formatPrice(
                  asset.ask,
                  currency,
                )}`,
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
