import { TradingViewAdvancedChart } from "../tw-widgets";

export default function NewTradeChartPanel({ symbol }) {
  return (
    <div className="flex-1 w-full min-w-0">
      <div className="flex flex-col border border-border bg-bg rounded p-0.5">
        <TradingViewAdvancedChart
          symbol={symbol}
          className="h-[40vh] w-full sm:h-[55vh] lg:h-[65vh]"
        />
      </div>
    </div>
  );
}
