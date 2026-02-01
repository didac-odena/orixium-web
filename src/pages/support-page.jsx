import { PageLayout } from "../components/layout";
import { PageHeader } from "../components/ui";

const NEW_TRADE_QUICK_GUIDE = [
  {
    id: "market-filter",
    title: "Filter the market",
    description: "Use Markets and Subgroup or Global search to narrow the list.",
  },
  {
    id: "assets",
    title: "Pick the pair",
    description: "Select Base asset and Quote asset.",
  },
  {
    id: "side",
    title: "Choose Side",
    description: "Pick Buy or Sell.",
  },
  {
    id: "amount",
    title: "Set amount",
    description: "Enter Base amount or Quote amount and switch with Amount in.",
  },
  {
    id: "order-type",
    title: "Set Order Type",
    description: "Choose Market or Limit. If Limit, enter Limit Price.",
  },
  {
    id: "risk",
    title: "Add risk controls",
    description: "Configure Take Profit and Stop Loss.",
  },
  {
    id: "submit",
    title: "Review and Submit",
    description: "Check the summary and click Submit.",
  },
];

const NEW_TRADE_CHECKLIST = [
  "Base asset / Quote asset match the pair you want.",
  "Amount is correct for your risk.",
  "Order Type and Limit Price (if needed) are set.",
  "Stop Loss and Take Profit are reviewed.",
];

const SUPPORT_FAQ = [
  {
    id: "what-is-new-trade",
    question: "What is New Trade?",
    answer: "It is the manual order ticket used to create trades with entry, size, and risk controls.",
  },
  {
    id: "market-vs-limit",
    question: "Market vs Limit — what’s the difference?",
    answer:
      "Market executes immediately at the best available price. Limit waits until your price (or better) is reached.",
  },
  {
    id: "base-quote",
    question: "What’s Base asset and Quote asset?",
    answer: "Base asset is what you buy or sell. Quote asset is the currency you pay or receive.",
  },
  {
    id: "submit-blocked",
    question: "Why can’t I submit my order?",
    answer:
      "Check required fields: Base asset, Quote asset, Side, Amount > 0, Order Type, and Limit Price if you chose Limit.",
  },
  {
    id: "multi-tp",
    question: "Can I set multiple Take Profit levels?",
    answer: "Yes. In Take Profit, add multiple TP levels and split your sell amount across them.",
  },
  {
    id: "stop-loss-required",
    question: "Is Stop Loss required?",
    answer: "No, it’s optional — but recommended for risk control.",
  },
  {
    id: "manage-open-trades",
    question: "Where do I manage open trades?",
    answer: "Go to Current Trades to monitor active positions after submitting.",
  },
];

const renderQuickGuideStep = (step) => (
  <li key={step.id} className="text-sm text-ink">
    <span className="font-semibold text-ink">{step.title}</span>
    <span className="text-muted"> — {step.description}</span>
  </li>
);

const renderChecklistItem = (item) => (
  <li key={item} className="text-xs text-muted">
    {item}
  </li>
);

const renderFaqItem = (item, index) => (
  <details
    key={item.id}
    className="rounded border border-border bg-surface-3 px-3 py-2"
    open={index === 0}
  >
    <summary className="cursor-pointer text-sm font-semibold text-ink">
      {item.question}
    </summary>
    <p className="mt-2 text-sm text-muted">{item.answer}</p>
  </details>
);

export default function SupportPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageHeader title="Support" subtitle="FAQs and a quick guide for New Trade." />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-3 rounded border border-border bg-surface-2 p-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-ink">New Trade quick guide</h2>
              <p className="text-xs text-muted">
                Follow these steps to place an order using the New Trade form.
              </p>
            </div>
            <ol className="list-decimal list-inside space-y-2">
              {NEW_TRADE_QUICK_GUIDE.map(renderQuickGuideStep)}
            </ol>
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-semibold text-ink">Before you submit</p>
              <ul className="list-disc list-inside space-y-1">
                {NEW_TRADE_CHECKLIST.map(renderChecklistItem)}
              </ul>
            </div>
          </section>

          <section className="space-y-3 rounded border border-border bg-surface-2 p-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-ink">FAQ</h2>
              <p className="text-xs text-muted">Common questions about New Trade.</p>
            </div>
            <div className="space-y-2">
              {SUPPORT_FAQ.map(renderFaqItem)}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}


