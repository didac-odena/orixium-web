export default function NewTradeSubmitPanel({
  side,
  baseAmountText,
  baseLabel,
  quoteAmountText,
  quoteLabel,
}) {
  return (
    <div className="flex flex-col border border-border bg-surface-2 rounded w-full space-y-2 py-1 px-2">
      <p className="text-xs text-muted text-center">
        {side === "BUY" ? "Buying" : "Selling"} {baseAmountText} {baseLabel} for{" "}
        {quoteAmountText} {quoteLabel}
      </p>

      <div className="flex justify-center">
        <button
          type="submit"
          className="flex-1 px-2 py-1 rounded cursor-pointer border border-border bg-bg uppercase tracking-wide transition-colors hover:border-accent hover:text-accent text-xs"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
