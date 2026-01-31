import {
  createFiatPriceFormatter,
  createCryptoAmountFormatter,
  createNumberFormatter,
} from "../../../utils/formatters.js";

const priceFormatter = createFiatPriceFormatter();
const amountFormatter = createCryptoAmountFormatter();
const percentFormatter = createNumberFormatter({ maximumFractionDigits: 2 });

const formatValue = (value) => {
  if (value == null || value === "") return "--";
  return String(value);
};

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "--";
  return priceFormatter.format(numericValue);
};

const formatAmount = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "--";
  return amountFormatter.format(numericValue);
};

const formatSignedPercent = (value) => {
  if (!Number.isFinite(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${percentFormatter.format(value)}%`;
};

const formatPercent = (value) => {
  if (!Number.isFinite(value)) return "--";
  return `${percentFormatter.format(value)}%`;
};

export default function TradeConfirmModal({ isOpen, data, onConfirm, onCancel }) {
  if (!isOpen || !data) return null;

  const takeProfitLevels = Array.isArray(data.takeProfits) ? data.takeProfits : [];
  const hasTakeProfits = takeProfitLevels.length > 0;

  const entryPriceValue = Number(data.entryPrice);
  const baseAmountValue = Number(data.baseAmount);
  const stopLossPriceValue = Number(data.stopLossPrice);
  const stopLossDeviation =
    Number.isFinite(entryPriceValue) && entryPriceValue !== 0
      ? ((stopLossPriceValue - entryPriceValue) / entryPriceValue) * 100
      : null;
  const stopLossText = Number.isFinite(stopLossPriceValue)
    ? `${formatPrice(stopLossPriceValue)} ${formatValue(data.quoteLabel)} (${formatSignedPercent(
        stopLossDeviation,
      )})`
    : "--";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-110 rounded border border-border bg-surface-2 px-4 py-3 text-ink">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-ink">Confirm Trade</h3>
        </div>

        <div className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Account</span>
            <span>{formatValue(data.accountId)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Market</span>
            <span>{formatValue(data.marketType)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Side</span>
            <span>{formatValue(data.side)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Order Type</span>
            <span>{formatValue(data.orderType)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Entry Price</span>
            <span>
              {formatPrice(data.entryPrice)} {formatValue(data.quoteLabel)}
            </span>
          </div>
          {data.orderType === "LIMIT" ? (
            <div className="flex justify-between">
              <span className="text-muted">Limit Price</span>
              <span>
                {formatPrice(data.limitPrice)} {formatValue(data.quoteLabel)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted">Base Amount</span>
            <span>
              {formatAmount(data.baseAmount)} {formatValue(data.baseLabel)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Quote Amount</span>
            <span>
              {formatAmount(data.quoteAmount)} {formatValue(data.quoteLabel)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Stop Loss</span>
            <span>{stopLossText}</span>
          </div>

          <div className="border-t border-border pt-2">
            <span className="text-muted">Take Profits</span>
            {hasTakeProfits ? (
              <div className="mt-2 space-y-1">
                {takeProfitLevels.map((level, index) => {
                  const targetText = formatPrice(level.targetPrice);
                  const amountText = formatAmount(level.sellAmount);
                  const deviationPercent =
                    Number.isFinite(entryPriceValue) && entryPriceValue !== 0
                      ? ((level.targetPrice - entryPriceValue) / entryPriceValue) * 100
                      : null;
                  const sellPercent =
                    Number.isFinite(baseAmountValue) && baseAmountValue !== 0
                      ? (level.sellAmount / baseAmountValue) * 100
                      : null;
                  return (
                    <div key={level.levelId} className="flex justify-between">
                      <span>TP{index + 1}</span>
                      <span>
                        Target: {targetText} {formatValue(data.quoteLabel)} (
                        {formatSignedPercent(deviationPercent)}) · Amount: {amountText}{" "}
                        {formatValue(data.baseLabel)} ({formatPercent(sellPercent)})
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-1 text-xs text-muted">No take profits</div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded border border-border bg-bg px-2 py-1 text-xs uppercase tracking-wide text-muted hover:border-accent-2 hover:text-accent-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded border border-border bg-bg px-2 py-1 text-xs uppercase tracking-wide text-ink hover:border-accent hover:text-accent"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
