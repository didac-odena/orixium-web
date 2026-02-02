import { InfoTooltip, SelectField } from "../ui";
import ToggleField from "./toggle-field";

export default function NewTradeOrderForm({
  baseAsset,
  quoteAsset,
  baseOptions,
  quoteOptions,
  onBaseAssetChange,
  onQuoteAssetChange,
  side,
  onSideChange,
  orderType,
  onOrderTypeChange,
  amountMode,
  onSelectBaseAmountMode,
  onSelectQuoteAmountMode,
  amountInput,
  onAmountInputChange,
  baseLabel,
  quoteLabel,
  baseAmountText,
  quoteAmountText,
  lastPriceText,
  register,
  errors,
}) {
  return (
    <div className="flex flex-col border border-border bg-surface-2 rounded w-full py-1 px-2">
      <div className="space-y-1">
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Base asset */}
          <div className="flex-1 min-w-0">
            <label className="flex items-center gap-1 py-1 text-xs text-muted">
              Base asset
              <InfoTooltip message="Asset you are trading (base). Order amount is stored in base units." />
            </label>
            <SelectField
              isSearchable={true}
              value={baseAsset}
              options={baseOptions}
              onChange={onBaseAssetChange}
              placeholder="Select base"
            />
            <input type="hidden" {...register("baseAsset", { required: true })} />
          </div>
          {/* Quote asset */}
          <div className="flex-1 min-w-0">
            <label className="flex items-center gap-1 py-1 text-xs text-muted">
              Quote asset
              <InfoTooltip message="Currency you pay/receive. Prices are shown in this currency." />
            </label>
            <SelectField
              isSearchable={true}
              value={quoteAsset}
              options={quoteOptions}
              onChange={onQuoteAssetChange}
              placeholder="Select quote"
            />
            <input type="hidden" {...register("quoteAsset", { required: true })} />
          </div>
        </div>

        {/* Side */}
        <label className="text-xs text-muted">Side</label>
        <ToggleField
          name="side"
          value={side}
          options={[
            { value: "BUY", label: "Buy" },
            { value: "SELL", label: "Sell" },
          ]}
          onChange={onSideChange}
          register={register}
          error={errors.side ? "Side is required." : ""}
        />

        {/* Quote/base */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-muted">
              {amountMode === "base" ? "Base amount" : "Quote amount"}
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amountInput}
                onChange={onAmountInputChange}
                className="w-full bg-bg border border-ink rounded px-2 py-1 text-sm text-ink pr-9"
                placeholder="0.00"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
                {amountMode === "base" ? baseLabel : quoteLabel}
              </span>
            </div>
            <input
              type="hidden"
              {...register("baseAmount", {
                required: "Amount is required.",
                validate: (value) =>
                  Number(value) > 0 || "Amount must be greater than 0.",
              })}
            />

            {errors.baseAmount ? (
              <p className="text-danger text-xs">
                {errors.baseAmount.message || "Amount is required."}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1 items-start sm:items-end shrink-0">
            <label className="text-xs text-muted">Amount in</label>

            <div className="flex rounded  border-border overflow-hidden">
              <button
                type="button"
                onClick={onSelectBaseAmountMode}
                className={`px-2 py-1.5 text-xs cursor-pointer border rounded uppercase ${
                  amountMode === "base"
                    ? "border-ink bg-surface text-ink"
                    : "border-border bg-bg text-muted transition-colors hover:border-accent hover:text-accent"
                }`}
              >
                {baseLabel || "BASE"}
              </button>
              <button
                type="button"
                onClick={onSelectQuoteAmountMode}
                className={`px-2 py-1.5 text-xs cursor-pointer border rounded uppercase ${
                  amountMode === "quote"
                    ? "border-ink bg-surface text-ink"
                    : "border-border bg-bg text-muted transition-colors hover:border-accent hover:text-accent"
                }`}
              >
                {quoteLabel || "QUOTE"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {amountMode === "base"
              ? `${quoteAmountText} ${quoteLabel}`
              : `${baseAmountText} ${baseLabel}`}
          </span>
          <span>{lastPriceText}</span>
        </div>

        <label className="flex items-center gap-1 py-1 text-xs text-muted">
          Order Type{" "}
          <InfoTooltip message="Market executes immediately at the best price. Limit waits for your price or better." />
        </label>
        <ToggleField
          name="orderType"
          value={orderType}
          options={[
            { value: "MARKET", label: "Market" },
            { value: "LIMIT", label: "Limit" },
          ]}
          onChange={onOrderTypeChange}
          register={register}
          error={errors.orderType ? "Order type is required." : ""}
        />

        {orderType === "LIMIT" ? (
          <div className="space-y-1">
            <label className="text-xs">Limit Price</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full rounded border border-border bg-bg px-2 py-1 pr-7 text-xs text-right text-ink"
                {...register("limitPrice", {
                  required: true,
                })}
              />
              {errors.limitPrice ? (
                <p className="text-danger text-xs">Limit price is required.</p>
              ) : null}
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-1 text-xs text-muted">
                {quoteLabel}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
