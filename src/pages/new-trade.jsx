import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  DEFAULT_QUOTE_CURRENCY,
  SUPPORTED_QUOTE_CURRENCIES,
  createManualTrade,
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
  loadGlobalMarketAssets,
} from "../services";
import { PageLayout } from "../components/layout";
import {
  PageHeader,
  SelectField,
  GlobalAssetSearch,
  InfoTooltip,
} from "../components/ui";
import { formatGroupLabel } from "../utils/market-explorer-utils.js";
import {
  createFiatPriceFormatter,
  createCryptoAmountFormatter,
} from "../utils/formatters.js";
import {
  StopLossPanel,
  TakeProfitPanel,
  TradeConfirmModal,
  AdvertiseModal,
  NewTradeChartPanel,
  NewTradeFiltersPanel,
  NewTradeOrderForm,
  NewTradeSubmitPanel,
} from "../components/new-trade";

const MARKET_SEGMENTS = [
  { value: "crypto", label: "Crypto" },
  { value: "equity", label: "Equity" },
  { value: "rates", label: "Rates" },
  { value: "forex", label: "Forex" },
  { value: "commodities", label: "Commodities" },
];
const ACCOUNT_OPTIONS = [
  { value: "ibkr-test", label: "IBKR-test" },
  { value: "binance-test", label: "Binance-test" },
];
const DEFAULT_ACCOUNT_ID = ACCOUNT_OPTIONS[0]?.value || "";

const DEFAULT_BASE_ASSET = "BTC";
const MAX_AMOUNT_DECIMALS = 8;
const CRYPTO_AMOUNT_FORMATTER = createCryptoAmountFormatter();
const FIAT_AMOUNT_FORMATTER = createFiatPriceFormatter();

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

const buildQuoteOptionsFromItems = (items) => {
  const used = new Set();
  const options = [];
  items.forEach((item) => {
    const currency = String(item?.currency || "").toUpperCase();
    if (!currency || used.has(currency)) return;
    used.add(currency);
    options.push({ value: currency.toLowerCase(), label: currency });
  });
  return options;
};

const QUOTE_OPTIONS = buildQuoteOptions();

const fetchMarketSnapshots = async (marketType, quoteCurrency) => {
  if (marketType === "crypto") {
    const quoteLower = String(quoteCurrency || DEFAULT_QUOTE_CURRENCY).toLowerCase();
    let items = getCryptoMarketSnapshots(quoteLower);
    if (!items.length) {
      items = await refreshCryptoMarketSnapshots(quoteLower);
    }
    return items;
  }
  if (marketType === "equity") {
    let items = getEquityMarketSnapshots();
    if (!items.length) {
      items = await refreshEquityMarketSnapshots();
    }
    return items;
  }
  if (marketType === "rates") {
    let items = getRatesMarketSnapshots();
    if (!items.length) {
      items = await refreshRatesMarketSnapshots();
    }
    return items;
  }
  if (marketType === "forex") {
    let items = getForexMarketSnapshots();
    if (!items.length) {
      items = await refreshForexMarketSnapshots();
    }
    return items;
  }
  if (marketType === "commodities") {
    let items = getCommoditiesMarketSnapshots();
    if (!items.length) {
      items = await refreshCommoditiesMarketSnapshots();
    }
    return items;
  }
  return [];
};

const resolveMarketPrice = (marketType, snapshot) => {
  if (!snapshot) return null;
  if (marketType === "crypto") return snapshot.current_price ?? null;
  return snapshot.last ?? null;
};

const TRADING_VIEW_EXCHANGE_FALLBACKS = {
  equity: "NYSE",
  rates: "CBOT",
  forex: "FX",
  commodities: "ARCA",
  crypto: "CRYPTO",
};

const normalizeTradingViewPair = (value) => {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
};

const resolveTradingViewExchange = (asset, market) => {
  const fallback = TRADING_VIEW_EXCHANGE_FALLBACKS[market] || "";
  const primaryExchange = String(asset?.primaryExchange || "").toUpperCase();
  if (primaryExchange && primaryExchange !== "SMART") {
    return primaryExchange;
  }
  const exchange = String(asset?.exchange || "").toUpperCase();
  if (exchange && exchange !== "SMART") {
    return exchange;
  }
  return fallback;
};

const resolveTradingViewSymbol = ({ marketType, baseAsset, quoteAsset, asset }) => {
  const normalizedMarket = String(marketType || "").toLowerCase();
  const baseValue = String(baseAsset || "").toUpperCase();
  if (!baseValue) return "";

  const quoteValue = String(quoteAsset || DEFAULT_QUOTE_CURRENCY).toUpperCase();

  if (normalizedMarket === "crypto") {
    return `CRYPTO:${baseValue}${quoteValue}`;
  }

  if (normalizedMarket === "forex") {
    const rawPair = baseValue.includes("/") ? baseValue : `${baseValue}${quoteValue}`;
    const normalizedPair = normalizeTradingViewPair(rawPair);
    return normalizedPair ? `FX:${normalizedPair}` : "";
  }

  const exchange = resolveTradingViewExchange(asset, normalizedMarket);
  return exchange ? `${exchange}:${baseValue}` : baseValue;
};

const findMarketAssetBySymbol = (assetsByMarket, marketType, baseAsset) => {
  const items = assetsByMarket?.[marketType] || [];
  const targetSymbol = String(baseAsset || "").toUpperCase();
  if (!targetSymbol) return null;
  for (const item of items) {
    const itemSymbol = String(item?.symbol || "").toUpperCase();
    if (itemSymbol === targetSymbol) return item;
  }
  return null;
};

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

const buildMarketInfo = (asset, market) => {
  if (!asset) return null;

  if (market === "crypto") {
    return {
      conid: null,
      currency: String(asset?.quote_currency || "").toUpperCase() || null,
      exchange: "COINGECKO",
      primaryExchange: null,
      localSymbol: String(asset?.symbol || "").toUpperCase() || null,
      tradingClass: null,
      name: String(asset?.name || ""),
      group: null,
    };
  }

  const snapshot = asset?.snapshot || {};

  return {
    conid: snapshot.conid ?? null,
    currency: snapshot.currency ?? null,
    exchange: snapshot.exchange ?? null,
    primaryExchange: snapshot.primaryExchange ?? null,
    localSymbol: snapshot.localSymbol ?? null,
    tradingClass: snapshot.tradingClass ?? null,
    name: String(asset?.name || ""),
    group: asset?.group ?? null,
  };
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

const formatAmount = (
  value,
  decimals = MAX_AMOUNT_DECIMALS,
  formatter = CRYPTO_AMOUNT_FORMATTER
) => {
  if (!Number.isFinite(value)) return "";
  const rounded = roundUpAmount(value, decimals);
  if (rounded == null) return "";
  return formatter.format(rounded);
};

export default function NewTradePage() {
  const [pairPrice, setPairPrice] = useState(null);
  const [priceStatus, setPriceStatus] = useState("idle");
  const [priceError, setPriceError] = useState("");
  const [marketType, setMarketType] = useState("crypto");
  const [baseAsset, setBaseAsset] = useState("BTC");
  const [quoteAsset, setQuoteAsset] = useState(DEFAULT_QUOTE_CURRENCY);
  const [baseOptions, setBaseOptions] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [amountMode, setAmountMode] = useState("base");
  const [subgroupValue, setSubgroupValue] = useState("");
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [globalAssetsByMarket, setGlobalAssetsByMarket] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const isCryptoMarket = marketType === "crypto";
  const quoteOptions = isCryptoMarket
    ? QUOTE_OPTIONS
    : buildQuoteOptionsFromItems(marketItems);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      accountId: DEFAULT_ACCOUNT_ID,
      side: "BUY",
      orderType: "MARKET",
      limitPrice: "",
      baseAsset: DEFAULT_BASE_ASSET,
      baseAmount: "",
      quoteAsset: DEFAULT_QUOTE_CURRENCY,
      takeProfitTargetInput: "",
      takeProfitSellAmountInput: "",
      takeProfits: [],
      stopLossPrice: "",
    },
    mode: "onChange",
  });

  const side = watch("side");
  const orderType = watch("orderType");
  const baseAmount = watch("baseAmount");
  const limitPrice = watch("limitPrice");
  const selectedMarketItem = marketItems.find((item) => {
    return item.symbol?.toUpperCase() === String(baseAsset || "").toUpperCase();
  });

  const handleMarketTypeChange = (nextMarket) => {
    if (nextMarket === marketType) return;
    setMarketType(nextMarket);
    setBaseAsset("");
    setQuoteAsset(DEFAULT_QUOTE_CURRENCY);
    setBaseOptions([]);
    setMarketItems([]);
    setPairPrice(null);
    setPriceStatus("idle");
    setPriceError("");
    setSubgroupOptions([]);
    setSubgroupValue("");
    setValue("baseAsset", "", { shouldValidate: true });
    setValue("quoteAsset", DEFAULT_QUOTE_CURRENCY, { shouldValidate: true });
  };
  const handleAccountChange = (nextValue) => {
    setAccountId(nextValue);
    setValue("accountId", nextValue, { shouldValidate: true });
  };
  const handleBaseAssetChange = (nextValue) => {
    setBaseAsset(nextValue);
    setValue("baseAsset", nextValue, { shouldValidate: true });
  };
  const handleQuoteAssetChange = (nextValue) => {
    setQuoteAsset(nextValue);
    setValue("quoteAsset", nextValue, { shouldValidate: true });
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

  const handleAmountModeChange = (nextMode) => {
    setAmountMode(nextMode);
    const baseValue = parseAmountValue(baseAmount);
    if (!Number.isFinite(baseValue)) return;

    const safePriceValue = Number(pairPrice);
    if (!Number.isFinite(safePriceValue) || safePriceValue === 0) {
      setAmountInput(formatAmount(baseValue));
      return;
    }

    const nextInputValue = nextMode === "base" ? baseValue : baseValue * safePriceValue;

    setAmountInput(formatAmount(nextInputValue));
  };

  const handleSelectBaseAmountMode = () => {
    handleAmountModeChange("base");
  };

  const handleSelectQuoteAmountMode = () => {
    handleAmountModeChange("quote");
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => {
      return !prev;
    });
  };


  const handleAmountInputChange = (event) => {
    const nextValue = event.target.value;
    setAmountInput(nextValue);

    const parsed = parseAmountValue(nextValue);
    if (!Number.isFinite(parsed)) {
      setValue("baseAmount", "", { shouldValidate: true });
      return;
    }

    const safePriceValue = Number(pairPrice);
    const baseAmountValue =
      amountMode === "base"
        ? parsed
        : Number.isFinite(safePriceValue) && safePriceValue !== 0
          ? parsed / safePriceValue
          : 0;

    setValue("baseAmount", String(baseAmountValue), { shouldValidate: true });
  };

  const handleSubmitForm = (values) => {
    const entryPriceValue = Number(entryPrice);
    if (!Number.isFinite(entryPriceValue) || entryPriceValue <= 0) {
      setError(
        orderType === "LIMIT" ? "limitPrice" : "baseAmount",
        {
          type: "manual",
          message: "Price is not available yet.",
        },
        { shouldFocus: true }
      );
      return;
    }

    const symbol = `${baseLabel}/${quoteLabel}`.toUpperCase();
    const marketInfo = buildMarketInfo(selectedMarketItem, marketType);
    const payload = {
      accountId: values.accountId,
      side: values.side,
      orderType: values.orderType,
      limitPrice: values.orderType === "LIMIT" ? values.limitPrice : "",
      baseAsset: values.baseAsset,
      quoteAsset: values.quoteAsset,
      takeProfits: values.takeProfits,
      stopLossPrice: values.stopLossPrice,
      marketType,
      symbol,
      marketInfo,
      entryPrice: entryPriceValue,
      baseLabel,
      quoteLabel,
      baseAmount: baseAmountValue,
      quoteAmount: Number.isFinite(entryPriceValue)
        ? baseAmountValue * entryPriceValue
        : quoteAmountValue,
    };
    setConfirmPayload(payload);
    setIsConfirmOpen(true);
  };

  const handleGlobalAssetSelect = (asset) => {
    if (!asset) return;

    handleMarketTypeChange(asset.market);

    setBaseAsset(asset.symbol);
    setValue("baseAsset", asset.symbol, { shouldValidate: true });

    const nextQuote = asset.currency
      ? String(asset.currency).toLowerCase()
      : DEFAULT_QUOTE_CURRENCY;

    const safeQuote = SUPPORTED_QUOTE_CURRENCIES.includes(nextQuote)
      ? nextQuote
      : DEFAULT_QUOTE_CURRENCY;

    setQuoteAsset(safeQuote);
    setValue("quoteAsset", safeQuote, { shouldValidate: true });
    setSubgroupValue(asset.group || "");
  };

  const handleTakeProfitChange = (levels) => {
    setValue("takeProfits", levels, { shouldValidate: true });
  };
  const handleStopLossChange = (nextStopLoss) => {
    const nextValue = Number.isFinite(nextStopLoss) ? String(nextStopLoss) : "";
    setValue("stopLossPrice", nextValue, { shouldValidate: true });
  };
  const handleConfirmSubmit = () => {
    if (!confirmPayload) return;
    createManualTrade(confirmPayload);
    setIsConfirmOpen(false);
    setConfirmPayload(null);
    setIsSuccessOpen(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
    setConfirmPayload(null);
  };

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
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
        const items = await fetchMarketSnapshots(marketType, quoteLower);
        const match = items.find((item) => {
          return item.symbol?.toUpperCase() === String(baseAsset || "").toUpperCase();
        });
        const nextPrice = resolveMarketPrice(marketType, match);
        setPairPrice(nextPrice);
        setPriceStatus("ready");
      } catch {
        setPairPrice(null);
        setPriceStatus("error");
        setPriceError("Failed to load price for this pair.");
      }
    };

    loadMarketPrice();
  }, [marketType, baseAsset, quoteAsset]);

  useEffect(() => {
    if (marketType === "crypto") return;
    if (!selectedMarketItem?.currency) return;

    const nextQuote = String(selectedMarketItem.currency || DEFAULT_QUOTE_CURRENCY).toLowerCase();
    if (nextQuote === quoteAsset) return;

    setQuoteAsset(nextQuote);
    setValue("quoteAsset", nextQuote, { shouldValidate: true });
  }, [marketType, selectedMarketItem, quoteAsset, setValue]);

  useEffect(() => {
    if (orderType !== "LIMIT") return;
    if (pairPrice == null) return;
    if (limitPrice) return;

    setValue("limitPrice", String(pairPrice), {
      shouldValidate: true,
    });
  }, [orderType, pairPrice, limitPrice, setValue]);

  useEffect(() => {
    const loadBaseOptions = async () => {
      const quoteLower = String(quoteAsset || DEFAULT_QUOTE_CURRENCY).toLowerCase();

      const items = await fetchMarketSnapshots(marketType, quoteLower);

      setMarketItems(items);

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
    };

    loadBaseOptions();
  }, [marketType, quoteAsset]);

  useEffect(() => {
    if (!marketItems.length) {
      setBaseOptions([]);
      if (baseAsset) {
        setBaseAsset("");
        setValue("baseAsset", "", { shouldValidate: true });
      }
      return;
    }

    const filteredItems = subgroupValue
      ? marketItems.filter((item) => {
          return String(item?.group || "") === String(subgroupValue);
        })
      : marketItems;

    const nextBaseOptions = buildBaseOptions(filteredItems);
    setBaseOptions(nextBaseOptions);

    if (!nextBaseOptions.length) {
      if (baseAsset) {
        setBaseAsset("");
        setValue("baseAsset", "", { shouldValidate: true });
      }
      return;
    }

    const hasCurrent = nextBaseOptions.some((option) => {
      return option.value === baseAsset;
    });

    if (!hasCurrent) {
      const nextValue = nextBaseOptions[0].value;
      setBaseAsset(nextValue);
      setValue("baseAsset", nextValue, { shouldValidate: true });
    }
  }, [marketItems, subgroupValue, baseAsset, setValue]);

  useEffect(() => {
    const loadGlobalAssets = async () => {
      const assetsByMarket = await loadGlobalMarketAssets({
        quoteCurrency: DEFAULT_QUOTE_CURRENCY,
      });
      setGlobalAssetsByMarket(assetsByMarket);
    };

    loadGlobalAssets();
  }, []);

  const amountDecimals = isCryptoMarket ? MAX_AMOUNT_DECIMALS : 2;
  const amountFormatter = isCryptoMarket ? CRYPTO_AMOUNT_FORMATTER : FIAT_AMOUNT_FORMATTER;
  const selectedMarketAsset = findMarketAssetBySymbol(globalAssetsByMarket, marketType, baseAsset);
  const tradingViewSymbol = resolveTradingViewSymbol({
    marketType,
    baseAsset,
    quoteAsset,
    asset: selectedMarketAsset,
  });

  const baseAmountValue = parseAmountValue(baseAmount) ?? 0;
  const safePrice = Number(pairPrice);
  const quoteAmountValue = Number.isFinite(safePrice) ? baseAmountValue * safePrice : 0;

  const baseAmountText = formatAmount(baseAmountValue, amountDecimals, amountFormatter) || "--";
  const quoteAmountText = formatAmount(quoteAmountValue, amountDecimals, amountFormatter) || "--";
  const baseLabel = String(baseAsset || DEFAULT_BASE_ASSET).toUpperCase();
  const quoteLabel = String(quoteAsset || DEFAULT_QUOTE_CURRENCY).toUpperCase();
  const entryPrice = orderType === "LIMIT" ? Number(limitPrice) : Number(pairPrice);

  useEffect(() => {
    const parsedBase = parseAmountValue(baseAmount);
    if (!Number.isFinite(parsedBase)) {
      if (amountInput) {
        setAmountInput("");
      }
      return;
    }

    const priceValue = Number(pairPrice);
    const nextValue =
      amountMode === "base"
        ? parsedBase
        : Number.isFinite(priceValue) && priceValue !== 0
          ? parsedBase * priceValue
          : 0;

    const formatted = formatAmount(nextValue, amountDecimals, amountFormatter);
    if (formatted !== amountInput) {
      setAmountInput(formatted);
    }
  }, [baseAmount, pairPrice, amountMode, amountDecimals, amountFormatter, amountInput]);

  let lastPriceText = "Last price: --";
  if (priceStatus === "loading") {
    lastPriceText = "Loading price...";
  } else if (priceStatus === "error") {
    lastPriceText = priceError;
  } else if (priceStatus === "ready" && pairPrice != null) {
    lastPriceText = `Last price: ${amountFormatter.format(Number(pairPrice))} ${quoteLabel}`;
  }

  return (
    <PageLayout>
      <section className="space-y-1">
        <PageHeader title="New Trade" subtitle="Manual order trade" />

        {/* Top bar */}
        <div className="flex w-full flex-col gap-2 rounded border border-border bg-surface-2 px-2 py-1 sm:flex-row sm:items-end sm:justify-between">
          {/* Account select */}
          <div className="flex w-full flex-col gap-0 items-start sm:w-auto">
            <label className="flex items-center gap-1 py-1 text-xs text-muted">
              Account{" "}
              <InfoTooltip message="Select the broker/exchange account used for this order." />
            </label>
            <SelectField
              value={accountId}
              options={ACCOUNT_OPTIONS}
              onChange={handleAccountChange}
              placeholder="Select account"
            />
            <input type="hidden" {...register("accountId", { required: true })} />
            {errors.accountId ? <p className="text-danger text-xs">Account is required.</p> : null}
          </div>

          {/* Global search */}
          <div className="flex w-full flex-col gap-1 sm:flex-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
            <label className="text-xs text-muted sm:whitespace-nowrap">
              Global search
            </label>
            <GlobalAssetSearch
              itemsByMarket={globalAssetsByMarket}
              onSelect={handleGlobalAssetSelect}
              placeholder="Search any asset..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
          <NewTradeChartPanel symbol={tradingViewSymbol} />

          {/*//FORM*/}
          <div className="flex w-full min-w-0 flex-col gap-1 lg:w-[24rem] lg:shrink-0">
            {/*//Filters*/}
            <NewTradeFiltersPanel
              showFilters={showFilters}
              onToggleFilters={handleToggleFilters}
              segments={MARKET_SEGMENTS}
              marketType={marketType}
              onMarketTypeChange={handleMarketTypeChange}
              subgroupValue={subgroupValue}
              subgroupOptions={subgroupOptions}
              onSubgroupChange={setSubgroupValue}
            />

            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-1">
              {/*//setup*/}
              <NewTradeOrderForm
                baseAsset={baseAsset}
                quoteAsset={quoteAsset}
                baseOptions={baseOptions}
                quoteOptions={quoteOptions}
                onBaseAssetChange={handleBaseAssetChange}
                onQuoteAssetChange={handleQuoteAssetChange}
                side={side}
                onSideChange={handleSideChange}
                orderType={orderType}
                onOrderTypeChange={handleOrderTypeChange}
                amountMode={amountMode}
                onSelectBaseAmountMode={handleSelectBaseAmountMode}
                onSelectQuoteAmountMode={handleSelectQuoteAmountMode}
                amountInput={amountInput}
                onAmountInputChange={handleAmountInputChange}
                baseLabel={baseLabel}
                quoteLabel={quoteLabel}
                baseAmountText={baseAmountText}
                quoteAmountText={quoteAmountText}
                lastPriceText={lastPriceText}
                register={register}
                errors={errors}
              />
              <div className="flex flex-col border border-border bg-surface-2 rounded w-full space-y-2 py-1 px-2">
                <TakeProfitPanel
                  entryPrice={entryPrice}
                  side={side}
                  baseAmount={baseAmountValue}
                  baseLabel={baseLabel}
                  quoteLabel={quoteLabel}
                  onChange={handleTakeProfitChange}
                  register={register}
                  errors={errors}
                  setError={setError}
                  clearErrors={clearErrors}
                />
              </div>
              <div className="flex flex-col border border-border bg-surface-2 rounded w-full space-y-2 py-1 px-2">
                <StopLossPanel
                  entryPrice={entryPrice}
                  side={side}
                  quoteLabel={quoteLabel}
                  onChange={handleStopLossChange}
                  register={register}
                  errors={errors}
                  setError={setError}
                  clearErrors={clearErrors}
                />
              </div>

              {/*Submit*/}
              <NewTradeSubmitPanel
                side={side}
                baseAmountText={baseAmountText}
                baseLabel={baseLabel}
                quoteAmountText={quoteAmountText}
                quoteLabel={quoteLabel}
              />
            </form>
          </div>
        </div>
      </section>
      <TradeConfirmModal
        isOpen={isConfirmOpen}
        data={confirmPayload}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirm}
      />
      <AdvertiseModal
        isOpen={isSuccessOpen}
        onClose={handleCloseSuccess}
        message="Trade created successfully."
      />
    </PageLayout>
  );
}
