import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  createFiatPriceFormatter,
  createNumberFormatter,
} from "../../../utils/formatters.js";
import InfoTooltip from "../../ui/info-tooltip.jsx";

const priceFormatter = createFiatPriceFormatter();
const percentValueFormatter = createNumberFormatter({ maximumFractionDigits: 2 });

const formatSignedPercent = (value) => {
  if (!Number.isFinite(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${percentValueFormatter.format(value)}%`;
};

const getDeviationPercent = (targetPrice, entryPrice) => {
  if (!Number.isFinite(entryPrice) || entryPrice === 0) return null;
  return ((targetPrice - entryPrice) / entryPrice) * 100;
};

const parseNumberValue = (rawInput) => {
  const value = Number(String(rawInput).replace("%", ""));
  return Number.isFinite(value) ? value : null;
};

const normalizePercentValue = (rawInput) => {
  const cleaned = String(rawInput).replace(/[^0-9.%+-]/g, "");
  const [numberPart] = cleaned.split("%");
  const normalized = numberPart.includes(".")
    ? numberPart.replace(/^([+-]?\d+)\.(\d{0,2}).*$/, "$1.$2")
    : numberPart;
  return `${normalized}%`;
};

const parseStopLossPrice = (rawInput, entryPrice) => {
  if (!rawInput || !Number.isFinite(entryPrice)) return null;

  const inputText = String(rawInput).trim();
  if (inputText.endsWith("%")) {
    const percent = parseNumberValue(inputText);
    if (percent == null) return null;
    return entryPrice * (1 + percent / 100);
  }

  return parseNumberValue(inputText);
};

const normalizePercentOrText = (rawInput) => {
  return rawInput.trim().endsWith("%")
    ? normalizePercentValue(rawInput)
    : rawInput;
};

export default function StopLossPanel({
  entryPrice,
  side,
  quoteLabel,
  onChange,
  register,
  errors,
  setError,
  clearErrors,
}) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [stopLossInputValue, setStopLossInputValue] = useState("");
  const [stopLossPriceValue, setStopLossPriceValue] = useState(null);

  const setFieldError = (field, message) => {
    setError?.(field, { message });
  };

  const clearFieldError = (field) => {
    clearErrors?.(field);
  };

  const handleToggle = () => {
    setIsEnabled((prevState) => {
      const nextState = !prevState;
      if (!nextState) {
        setStopLossInputValue("");
        setStopLossPriceValue(null);
        onChange(null);
        clearFieldError("stopLossPrice");
      }
      return nextState;
    });
  };

  const handleApplyStopLoss = () => {
    if (!stopLossInputValue) {
      setFieldError("stopLossPrice", "Stop loss is required.");
      return;
    }
    if (!Number.isFinite(entryPrice)) {
      setFieldError("stopLossPrice", "Entry price is required.");
      return;
    }

    const nextPrice = parseStopLossPrice(stopLossInputValue, entryPrice);
    if (!Number.isFinite(nextPrice)) {
      setFieldError("stopLossPrice", "Stop loss is invalid.");
      return;
    }

    if (side === "BUY" && nextPrice >= entryPrice) {
      setFieldError("stopLossPrice", "Stop loss must be below entry price.");
      return;
    }
    if (side === "SELL" && nextPrice <= entryPrice) {
      setFieldError("stopLossPrice", "Stop loss must be above entry price.");
      return;
    }

    clearFieldError("stopLossPrice");
    setStopLossPriceValue(nextPrice);
    onChange(nextPrice);
  };

  const handleStopLossInputChange = (event) => {
    setStopLossInputValue(normalizePercentOrText(event.target.value));
  };

  const handleRemoveStopLoss = () => {
    setStopLossInputValue("");
    setStopLossPriceValue(null);
    onChange(null);
    clearFieldError("stopLossPrice");
  };

  const deviationPercent = getDeviationPercent(stopLossPriceValue, entryPrice);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink">
          Stop Loss{" "}
          <InfoTooltip message="Protective exit price. For Buy it must be below entry; for Sell it must be above." />
        </span>
        <button
          type="button"
          onClick={handleToggle}
          className={`px-2 py-1 w-10 min-5 rounded-full text-xs uppercase tracking-wide border ${
            isEnabled
              ? "border-ink bg-surface text-ink"
              : "border-border text-muted bg-bg hover:border-accent hover:text-accent"
          }`}
        >
          {isEnabled ? "On" : "Off"}
        </button>
      </div>

      {isEnabled ? (
        <div className="space-y-2">
          <input type="hidden" {...register?.("stopLossPrice")} />
          <div className="space-y-1">
            <label className="text-xs text-muted">Stop Loss ({quoteLabel})</label>
            <input
              value={stopLossInputValue}
              onChange={handleStopLossInputChange}
              placeholder="% or price"
              className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink"
            />
            <p className="text-xs text-muted">Move to breakeven: coming later.</p>
            {errors?.stopLossPrice?.message ? (
              <p className="text-danger text-xs">{errors.stopLossPrice.message}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleApplyStopLoss}
            className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink uppercase tracking-wide hover:border-accent hover:text-accent"
          >
            Set Stop Loss
          </button>

          {Number.isFinite(stopLossPriceValue) ? (
            <div className="flex items-center justify-between rounded border border-ink bg-surface px-2 py-1 text-xs text-ink">
              <div className="flex flex-wrap">
                <span className="text-accent mr-1">SL</span>
                <span>
                  - Price: {priceFormatter.format(stopLossPriceValue)} {quoteLabel} (
                  {formatSignedPercent(deviationPercent)})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveStopLoss}
                className="text-muted hover:text-accent-2"
              >
                <TrashIcon className="h-4 w-4 hover:text-accent-2" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
