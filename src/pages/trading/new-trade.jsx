import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  DEFAULT_QUOTE_CURRENCY,
  SUPPORTED_QUOTE_CURRENCIES,
  getCryptoMarketSnapshots,
  refreshCryptoMarketSnapshots,
  getEquityMarketSnapshots,
  refreshEquityMarketSnapshots,
  getRatesMarketSnapshots,
  refreshRatesMarketSnapshots,
  getForexMarketSnapshots,
  refreshForexMarketSnapshots,
  getCommoditiesMarketSnapshots,
  refreshCommoditiesMarketSnapshots,
} from "../../services";
import { PageLayout } from "../../components/layout";
import { PageHeader, SelectField, ToggleField, GlobalAssetSearch } from "../../components/ui";
import { formatGroupLabel } from "../market-explorer/market-explorer-utils.js";

const MARKET_SEGMENTS = [
  { value: "crypto", label: "Crypto" },
  { value: "equity", label: "Equity" },
  { value: "rates", label: "Rates" },
  { value: "forex", label: "Forex" },
  { value: "commodities", label: "Commodities" },
];
const ACCOUNT_OPTIONS = [
  { value: "ibkr-test", label: "IBKR-test1" },
  { value: "binance-test", label: "Binance-test2" },
];

const DEFAULT_BASE_ASSET = "BTC";
const MAX_AMOUNT_DECIMALS = 8;

const buildBaseOptions = (items) => {
  const used = new Set();
  const options = [];
  items.forEach((item) => {
    const symbol = String(item?.symbol || "").toUpperCase();
    if (!symbol || used.has(symbol)) return;
    used.add(symbol);
    options.push({ value: symbol, label: symbol });
  });
  return options;
};

const buildQuoteOptions = () => {
  return SUPPORTED_QUOTE_CURRENCIES.map((currency) => {
    const value = String(currency || "").toLowerCase();
    return { value, label: value.toUpperCase() };
  });
};

const QUOTE_OPTIONS = buildQuoteOptions();
const PRICE_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8,
});

const buildGroupFilterOptions = (items) => {
  const seen = new Set();
  const options = [];
  items.forEach((asset) => {
    const groupValue = asset?.group;
    if (!groupValue) return;
    const key = String(groupValue);
    if (seen.has(key)) return;
    seen.add(key);
    options.push({ value: key, label: formatGroupLabel(key) });
  });
  return options;
};

const parseAmountValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const roundUpAmount = (value, decimals = MAX_AMOUNT_DECIMALS) => {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.ceil(value * factor) / factor;
};

const formatAmount = (value, decimals = MAX_AMOUNT_DECIMALS) => {
  if (!Number.isFinite(value)) return "";
  const rounded = roundUpAmount(value, decimals);
  if (rounded == null) return "";
  return rounded.toFixed(decimals).replace(/\.?0+$/, "");
};

export default function NewTradePage() {
  const [pairPrice, setPairPrice] = useState(null);
  const [priceStatus, setPriceStatus] = useState("idle");
  const [priceError, setPriceError] = useState("");
  const [marketType, setMarketType] = useState("crypto");
  const [baseAsset, setBaseAsset] = useState("BTC");
  const [quoteAsset, setQuoteAsset] = useState(DEFAULT_QUOTE_CURRENCY);
  const [baseOptions, setBaseOptions] = useState([]);
  const [amountMode, setAmountMode] = useState("base");
  const [subgroupValue, setSubgroupValue] = useState("");
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [accountId, setAccountId] = useState("ibkr");
  const [globalAssetsByMarket, setGlobalAssetsByMarket] = useState({});
  const [globalSearchValue, setGlobalSearchValue] = useState("");

  const quoteOptions = QUOTE_OPTIONS;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      side: "BUY",
      orderType: "MARKET",
      limitPrice: "",
      amount: "",
    },
    mode: "onChange",
  });

  const side = watch("side");
  const orderType = watch("orderType");
  const amount = watch("amount");

  const handleMarketTypeChange = (nextMarket) => {
    setMarketType(nextMarket);
    setBaseAsset("");
    setQuoteAsset(DEFAULT_QUOTE_CURRENCY);
    setBaseOptions([]);
    setPairPrice(null);
    setPriceStatus("idle");
    setPriceError("");
    setSubgroupOptions([]);
    setSubgroupValue("");
  };
  const handleBaseAssetChange = (nextValue) => {
    setBaseAsset(nextValue);
  };
  const handleQuoteAssetChange = (nextValue) => {
    setQuoteAsset(nextValue);
  };

  const handleSideChange = (nextSide) => {
    setValue("side", nextSide, { shouldValidate: true });
  };
  const handleOrderTypeChange = (nextType) => {
    setValue("orderType", nextType, { shouldValidate: true });
    if (nextType !== "LIMIT") {
      setValue("limitPrice", "");
    }
    if (nextType === "LIMIT" && pairPrice != null) {
      setValue("limitPrice", String(pairPrice), {
        shouldValidate: true,
      });
    }
  };

  const handleSubmitForm = (values) => {
    console.log("NEW_TRADE_FORM_SUBMIT", values);
  };

  const handleAmountModeChange = (nextMode) => {
    setAmountMode(nextMode);
  };

  const handleAccountChange = (nextValue) => {
    setAccountId(nextValue);
  };

  const handleGlobalAssetSelect = (asset) => {
    if (!asset) return;

    handleMarketTypeChange(asset.market);

    setGlobalSearchValue(asset.value);
    setBaseAsset(asset.symbol);

    const nextQuote = asset.currency
      ? String(asset.currency).toLowerCase()
      : DEFAULT_QUOTE_CURRENCY;

    const safeQuote = SUPPORTED_QUOTE_CURRENCIES.includes(nextQuote)
      ? nextQuote
      : DEFAULT_QUOTE_CURRENCY;

    setQuoteAsset(safeQuote);
    setSubgroupValue(asset.group || "");
  };

  useEffect(() => {
    const loadMarketPrice = async () => {
      const quoteLower = String(quoteAsset || DEFAULT_QUOTE_CURRENCY).toLowerCase();

      if (marketType === "crypto" && quoteLower === "usdt") {
        setPairPrice(null);
        setPriceError("USDT pricing is not wired yet.");
        setPriceStatus("idle");
        return;
      }

      setPriceStatus("loading");
      setPriceError("");

      try {
        let items = [];
        if (marketType === "crypto") {
          items = getCryptoMarketSnapshots(quoteLower);
          if (!items.length) {
            items = await refreshCryptoMarketSnapshots(quoteLower);
          }
        }
        if (marketType === "equity") {
          items = getEquityMarketSnapshots();
          if (!items.length) {
            items = await refreshEquityMarketSnapshots();
          }
        }
        if (marketType === "rates") {
          items = getRatesMarketSnapshots();
          if (!items.length) {
            items = await refreshRatesMarketSnapshots();
          }
        }
        if (marketType === "forex") {
          items = getForexMarketSnapshots();
          if (!items.length) {
            items = await refreshForexMarketSnapshots();
          }
        }
        if (marketType === "commodities") {
          items = getCommoditiesMarketSnapshots();
          if (!items.length) {
            items = await refreshCommoditiesMarketSnapshots();
          }
        }
        const match = items.find((item) => {
          return item.symbol?.toUpperCase() === String(baseAsset || "").toUpperCase();
        });
        let nextPrice = null;
        if (marketType === "crypto") {
          nextPrice = match?.current_price ?? null;
        }
        if (
          marketType === "equity" ||
          marketType === "rates" ||
          marketType === "forex" ||
          marketType === "commodities"
        ) {
          nextPrice = match?.last ?? null;
        }
        setPairPrice(nextPrice);
        setPriceStatus("ready");
      } catch (err) {
        setPairPrice(null);
        setPriceStatus("error");
        setPriceError("Failed to load price for this pair.");
      }
    };

    loadMarketPrice();
  }, [marketType, baseAsset, quoteAsset]);

  useEffect(() => {
    if (orderType !== "LIMIT") return;
    if (pairPrice == null) return;

    setValue("limitPrice", String(pairPrice), {
      shouldValidate: true,
    });
  }, [orderType, pairPrice, setValue]);

  useEffect(() => {
    const loadBaseOptions = async () => {
      if (
        marketType !== "crypto" &&
        marketType !== "equity" &&
        marketType !== "rates" &&
        marketType !== "forex" &&
        marketType !== "commodities"
      ) {
        setBaseOptions([]);
        return;
      }
      const quoteLower = String(quoteAsset || DEFAULT_QUOTE_CURRENCY).toLowerCase();

      let items = [];

      if (marketType === "crypto") {
        items = getCryptoMarketSnapshots(quoteLower);
        if (!items.length) {
          items = await refreshCryptoMarketSnapshots(quoteLower);
        }
      }
      if (marketType === "equity") {
        items = getEquityMarketSnapshots();
        if (!items.length) {
          items = await refreshEquityMarketSnapshots();
        }
      }
      if (marketType === "rates") {
        items = getRatesMarketSnapshots();
        if (!items.length) {
          items = await refreshRatesMarketSnapshots();
        }
      }
      if (marketType === "forex") {
        items = getForexMarketSnapshots();
        if (!items.length) {
          items = await refreshForexMarketSnapshots();
        }
      }
      if (marketType === "commodities") {
        items = getCommoditiesMarketSnapshots();
        if (!items.length) {
          items = await refreshCommoditiesMarketSnapshots();
        }
      }

      const nextSubgroupOptions = buildGroupFilterOptions(items);
      setSubgroupOptions(nextSubgroupOptions);
      if (!nextSubgroupOptions.length) {
        setSubgroupValue("");
      } else {
        const isValid = nextSubgroupOptions.some((option) => {
          return option.value === subgroupValue;
        });
        if (!isValid) {
          setSubgroupValue(nextSubgroupOptions[0].value);
        }
      }

      const nextBaseOptions = buildBaseOptions(items);
      setBaseOptions(nextBaseOptions);

      if (!baseAsset && nextBaseOptions.length) {
        setBaseAsset(nextBaseOptions[0].value);
      }
    };

    loadBaseOptions();
  }, [marketType, quoteAsset]);

  useEffect(() => {
    const loadGlobalAssets = async () => {
      const quoteLower = String(DEFAULT_QUOTE_CURRENCY).toLowerCase();

      let cryptoItems = getCryptoMarketSnapshots(quoteLower);
      if (!cryptoItems.length) {
        cryptoItems = await refreshCryptoMarketSnapshots(quoteLower);
      }

      let equityItems = getEquityMarketSnapshots();
      if (!equityItems.length) {
        equityItems = await refreshEquityMarketSnapshots();
      }

      let ratesItems = getRatesMarketSnapshots();
      if (!ratesItems.length) {
        ratesItems = await refreshRatesMarketSnapshots();
      }

      let forexItems = getForexMarketSnapshots();
      if (!forexItems.length) {
        forexItems = await refreshForexMarketSnapshots();
      }

      let commoditiesItems = getCommoditiesMarketSnapshots();
      if (!commoditiesItems.length) {
        commoditiesItems = await refreshCommoditiesMarketSnapshots();
      }

      setGlobalAssetsByMarket({
        crypto: cryptoItems,
        equity: equityItems,
        rates: ratesItems,
        forex: forexItems,
        commodities: commoditiesItems,
      });
    };

    loadGlobalAssets();
  }, []);

  const parsedAmount = parseAmountValue(amount) ?? 0;
  const safePrice = Number(pairPrice);
  const convertedAmount =
    amountMode === "base"
      ? parsedAmount * (Number.isFinite(safePrice) ? safePrice : 0)
      : Number.isFinite(safePrice) && safePrice !== 0
        ? parsedAmount / safePrice
        : 0;

  const convertedLabel = formatAmount(convertedAmount) || "0";

  const baseAmountText = amountMode === "base" ? amount || "--" : convertedLabel || "--";
  const quoteAmountText = amountMode === "base" ? convertedLabel || "--" : amount || "--";
  const baseLabel = String(baseAsset || DEFAULT_BASE_ASSET).toUpperCase();
  const quoteLabel = String(quoteAsset || DEFAULT_QUOTE_CURRENCY).toUpperCase();

  let lastPriceLabel = "";
  if (priceStatus === "loading") {
    lastPriceLabel = "Loading price...";
  }
  if (priceStatus === "error") {
    lastPriceLabel = priceError;
  }
  if (priceStatus === "ready" && pairPrice != null) {
    lastPriceLabel = `Last price: ${PRICE_FORMATTER.format(Number(pairPrice))} ${quoteLabel}`;
  }
  const lastPriceText = lastPriceLabel || "Last price: --";

  return (
    <PageLayout>
      <section className="space-y-1">
        <PageHeader title="New Trade" subtitle="Manual order trade" />

        {/* Top bar */}
        <div className="flex flex-wrap items-end justify-between gap-1 border border-border bg-surface-2 rounded px-1 py-2">
          <div className="flex flex-wrap items-end gap-4">
            {/* Account select */}
            <div className="min-w-35">
              <SelectField
                label="Account"
                value={accountId}
                options={ACCOUNT_OPTIONS}
                onChange={handleAccountChange}
                placeholder="Select account"
              />
            </div>

            {/*//Filters*/}
            <div className="space-y-1">
              <label className="text-xs text-muted">Markets</label>
              <div className="flex flex-wrap gap-1">
                {MARKET_SEGMENTS.map((segment) => {
                  const isActive = marketType === segment.value;

                  const baseClass =
                    "cursor-pointer rounded-full border px-2 py-1 text-xs uppercase tracking-wider transition-colors";
                  const activeClass = "border-ink bg-surface text-ink";
                  const inactiveClass =
                    "border-border text-muted bg-bg hover:border-accent hover:text-accent";

                  const buttonClass = `${baseClass} ${isActive ? activeClass : inactiveClass}`;

                  const handleClick = () => {
                    handleMarketTypeChange(segment.value);
                  };

                  return (
                    <button
                      key={segment.value}
                      type="button"
                      onClick={handleClick}
                      className={buttonClass}
                    >
                      {segment.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subgroup select (opcional) */}
            <div className="min-w-45">
              {subgroupOptions.length ? (
                <div className="min-w-45">
                  <SelectField
                    label="Subgroup"
                    value={subgroupValue}
                    options={subgroupOptions}
                    onChange={setSubgroupValue}
                    placeholder="Select subgroup"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {/* Global search */}
            <div className="min-w-55 space-y-1">
              <label className="text-xs text-muted">Global search</label>
              <GlobalAssetSearch
                itemsByMarket={globalAssetsByMarket}
                value={globalSearchValue}
                onSelect={handleGlobalAssetSelect}
                placeholder="Search any asset..."
              />
            </div>
            {/* Base asset */}
            <div className="min-w-20">
              <SelectField
                label="Base asset"
                value={baseAsset}
                options={baseOptions}
                onChange={handleBaseAssetChange}
                placeholder="Select base"
              />
            </div>

            {/* Quote asset */}
            <div className="min-w-20">
              <SelectField
                label="Quote asset"
                value={quoteAsset}
                options={quoteOptions}
                onChange={handleQuoteAssetChange}
                placeholder="Select quote"
              />
            </div>
          </div>
        </div>

        {/*//Form*/}
        <div className="flex flex-col border border-border bg-surface-2 rounded w-full max-w-[20%] py-1 px-2">
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-1">
            <ToggleField
              label="Side"
              name="side"
              value={side}
              options={[
                { value: "BUY", label: "Buy" },
                { value: "SELL", label: "Sell" },
              ]}
              onChange={handleSideChange}
              register={register}
              error={errors.side ? "Side is required." : ""}
            />
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-muted">
                  {amountMode === "base" ? "Base amount" : "Quote amount"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    {...register("amount", {
                      required: true,
                    })}
                    className="w-full bg-bg border border-ink rounded px-2 py-1 text-sm text-ink pr-9"
                    placeholder="0.00"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
                    {amountMode === "base" ? baseLabel : quoteLabel}
                  </span>
                </div>

                {errors.amount ? <p className="text-danger text-xs">Amount is required.</p> : null}
              </div>

              <div className="flex flex-col gap-1 items-end shrink-0">
                <label className="text-xs text-muted">Amount in</label>

                <div className="flex rounded  border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleAmountModeChange("base")}
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
                    onClick={() => handleAmountModeChange("quote")}
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
                  ? `${convertedLabel} ${quoteLabel}`
                  : `${convertedLabel} ${baseLabel}`}
              </span>
              <span>{lastPriceText}</span>
            </div>

            <ToggleField
              label="Order Type"
              name="orderType"
              value={orderType}
              options={[
                { value: "MARKET", label: "Market" },
                { value: "LIMIT", label: "Limit" },
              ]}
              onChange={handleOrderTypeChange}
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
                    {String(quoteAsset || DEFAULT_QUOTE_CURRENCY).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : null}

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
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
