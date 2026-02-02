import { useState } from "react";
import {
  createFiatPriceFormatter,
  createCryptoAmountFormatter,
  createNumberFormatter,
} from "../../utils/formatters.js";
import { TrashIcon } from "@heroicons/react/24/outline";
import { InfoTooltip } from "../ui";

const priceFormatter = createFiatPriceFormatter();
const amountFormatter = createCryptoAmountFormatter();
const percentValueFormatter = createNumberFormatter({ maximumFractionDigits: 2 });

const formatSignedPercent = (value) => {
  if (!Number.isFinite(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${percentValueFormatter.format(value)}%`;
};

const formatAvailablePercentLabel = (value) => {
  if (!Number.isFinite(value)) return "--";
  return `${percentValueFormatter.format(value)}% available`;
};

const getDeviationPercent = (targetPrice, entryPrice) => {
  if (!Number.isFinite(entryPrice) || entryPrice === 0) return null;
  return ((targetPrice - entryPrice) / entryPrice) * 100;
};

const getSellPercent = (sellAmount, baseAmount) => {
  if (!Number.isFinite(baseAmount) || baseAmount === 0) return null;
  return (sellAmount / baseAmount) * 100;
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

const parseTargetValue = (rawInput, entryPrice) => {
  if (!rawInput || !Number.isFinite(entryPrice)) return null;

  const inputText = String(rawInput).trim();
  if (inputText.endsWith("%")) {
    const percent = parseNumberValue(inputText);
    if (percent == null) return null;
    return entryPrice * (1 + percent / 100);
  }

  return parseNumberValue(inputText);
};

const parseSellAmountValue = (rawInput, baseAmount) => {
  if (!rawInput || !Number.isFinite(baseAmount)) return null;

  const inputText = String(rawInput).trim();
  if (inputText.endsWith("%")) {
    const percent = parseNumberValue(inputText);
    if (percent == null) return null;
    return baseAmount * (percent / 100);
  }

  return parseNumberValue(inputText);
};

const normalizePercentOrText = (rawInput) => {
  return rawInput.trim().endsWith("%")
    ? normalizePercentValue(rawInput)
    : rawInput;
};

export default function TakeProfitPanel({
  entryPrice,
  side,
  baseAmount,
  baseLabel,
  quoteLabel,
  onChange,
  register,
  errors,
  setError,
  clearErrors,
}) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [targetInputValue, setTargetInputValue] = useState("");
  const [sellAmountInputValue, setSellAmountInputValue] = useState("");
  const [takeProfitLevels, setTakeProfitLevels] = useState([]);

  const totalSellAmountValue = takeProfitLevels.reduce((sum, level) => {
    return sum + level.sellAmount;
  }, 0);
  const remainingAmount =
    Number.isFinite(baseAmount) && baseAmount > 0
      ? Math.max(baseAmount - totalSellAmountValue, 0)
      : null;
  const availablePercent =
    Number.isFinite(remainingAmount) && baseAmount
      ? (remainingAmount / baseAmount) * 100
      : null;

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
        setTakeProfitLevels([]);
        setTargetInputValue("");
        setSellAmountInputValue("");
        onChange([]);
        clearFieldError("takeProfitTargetInput");
        clearFieldError("takeProfitSellAmountInput");
      }
      return nextState;
    });
  };

  const handleAddLevel = () => {
    const targetPrice = parseTargetValue(targetInputValue, entryPrice);
    const sellAmount = parseSellAmountValue(sellAmountInputValue, baseAmount);

    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      setFieldError("takeProfitSellAmountInput", "Set an order amount before adding TP.");
      return;
    }

    if (!targetInputValue) {
      setFieldError("takeProfitTargetInput", "Target is required.");
      return;
    }
    clearFieldError("takeProfitTargetInput");

    if (!sellAmountInputValue) {
      setFieldError("takeProfitSellAmountInput", "Sell amount is required.");
      return;
    }
    clearFieldError("takeProfitSellAmountInput");

    if (!Number.isFinite(targetPrice) || !Number.isFinite(sellAmount)) return;
    if (Number.isFinite(entryPrice)) {
      if (side === "BUY" && targetPrice <= entryPrice) {
        setFieldError("takeProfitTargetInput", "Target must be above entry price.");
        return;
      }
      if (side === "SELL" && targetPrice >= entryPrice) {
        setFieldError("takeProfitTargetInput", "Target must be below entry price.");
        return;
      }
      clearFieldError("takeProfitTargetInput");
    }

    const nextTotal = totalSellAmountValue + sellAmount;
    if (nextTotal > baseAmount) {
      setFieldError("takeProfitSellAmountInput", "Total TP amount exceeds order amount.");
      return;
    }

    clearFieldError("takeProfitTargetInput");
    clearFieldError("takeProfitSellAmountInput");

    const nextTakeProfitLevels = [
      ...takeProfitLevels,
      {
        levelId: Date.now(),
        targetPrice,
        sellAmount,
      },
    ];

    setTakeProfitLevels(nextTakeProfitLevels);
    onChange(nextTakeProfitLevels);
    setTargetInputValue("");
    setSellAmountInputValue("");
  };

  const handleTargetInputChange = (event) => {
    setTargetInputValue(normalizePercentOrText(event.target.value));
  };

  const handleAmountInputChange = (event) => {
    setSellAmountInputValue(normalizePercentOrText(event.target.value));
  };

  const handleRemoveLevel = (levelId) => {
    const nextTakeProfitLevels = takeProfitLevels.filter((level) => {
      return level.levelId !== levelId;
    });
    setTakeProfitLevels(nextTakeProfitLevels);
    onChange(nextTakeProfitLevels);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink">
          Take Profit{" "}
          <InfoTooltip message="Set one or more target levels to take partial profit. Each level sells a portion of the base amount." />
        </span>
        <button
          type="button"
          onClick={handleToggle}
          className={`px-2 py-1 w-10 min-5 rounded-full text-xs uppercase tracking-wide border ${
            isEnabled
              ? "border-ink bg-surface text-ink"
              : "border-border bg-bg text-muted hover:border-accent hover:text-accent"
          }`}
        >
          {isEnabled ? "On" : "Off"}
        </button>
      </div>

      {isEnabled ? (
        <div className="space-y-2">
          <input type="hidden" {...register?.("takeProfitTargetInput")} />
          <input type="hidden" {...register?.("takeProfitSellAmountInput")} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted">Target Price ({quoteLabel})</label>
              <input
                value={targetInputValue}
                onChange={handleTargetInputChange}
                placeholder="+% or price"
                className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink"
              />
              {errors?.takeProfitTargetInput?.message ? (
                <p className="text-danger text-xs">{errors.takeProfitTargetInput.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Sell base amount ({baseLabel})</label>
              <input
                value={sellAmountInputValue}
                onChange={handleAmountInputChange}
                placeholder="Amount or %"
                className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink"
              />
              <p className="text-xs text-muted">
                {formatAvailablePercentLabel(availablePercent)}
              </p>
              {errors?.takeProfitSellAmountInput?.message ? (
                <p className="text-danger text-xs">{errors.takeProfitSellAmountInput.message}</p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddLevel}
            className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink uppercase tracking-wide hover:border-accent hover:text-accent"
          >
            Add TP
          </button>

          {takeProfitLevels.length ? (
            <div className="space-y-1">
              {takeProfitLevels.map((level, index) => {
                const deviationPercent = getDeviationPercent(level.targetPrice, entryPrice);
                const sellPercent = getSellPercent(level.sellAmount, baseAmount);

                const handleRemoveClick = () => {
                  handleRemoveLevel(level.levelId);
                };

                return (
                  <div
                    key={level.levelId}
                    className="flex items-center justify-between rounded border border-ink bg-surface px-2 py-1 text-xs text-ink"
                  >
                    <div className="flex flex-wrap">
                    <span className="text-accent mr-1">TP{index + 1} </span>

                      <span>
                        - Target Price: {priceFormatter.format(level.targetPrice)} {quoteLabel} (
                        {formatSignedPercent(deviationPercent)})
                      </span>
                      <span>
                        - Amount sell: {amountFormatter.format(level.sellAmount)} {baseLabel} (
                        {formatSignedPercent(sellPercent)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveClick}
                      className="text-muted hover:text-accent-2"
                    >
                      <TrashIcon className="h-4 w-4 hover:text-accent-2" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
