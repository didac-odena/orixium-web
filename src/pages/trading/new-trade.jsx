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
} from "../../services";
import { PageLayout } from "../../components/layout";
import {
  PageHeader,
  SelectField,
  ToggleField,
  GlobalAssetSearch,
  TradingViewAdvancedChart,
  InfoTooltip,
} from "../../components/ui";
import { formatGroupLabel } from "../market-explorer/market-explorer-utils.js";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import {
  createFiatPriceFormatter,
  createCryptoAmountFormatter,
} from "../../utils/formatters.js";
import {
  StopLossPanel,
  TakeProfitPanel,
  TradeConfirmModal,
  AdvertiseModal,
} from "../../components/trading";

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

  let lastPriceLabel = "";
  if (priceStatus === "loading") {
    lastPriceLabel = "Loading price...";
  }
  if (priceStatus === "error") {
    lastPriceLabel = priceError;
  }
  if (priceStatus === "ready" && pairPrice != null) {
    lastPriceLabel = `Last price: ${amountFormatter.format(Number(pairPrice))} ${quoteLabel}`;
  }
  const lastPriceText = lastPriceLabel || "Last price: --";

  return (
    <PageLayout>
      <section className="space-y-1">
        <PageHeader title="New Trade" subtitle="Manual order trade" />

        {/* Top bar */}
        <div className="flex flex-wrap w-full justify-between border border-border gap-2 bg-surface-2 rounded py-1 px-2">
          {/* Account select */}
          <div className="flex flex-col gap-0 items-start shrink-0">
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
          <div className="flex flex-1 items-center justify-end gap-2">
            <label className="flex text-xs whitespace-nowrap items-center text-muted">
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
          {/*//TW-CHART*/}
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col border border-border bg-bg rounded p-0.5">
              <TradingViewAdvancedChart symbol={tradingViewSymbol} className="h-[65vh] w-full" />
            </div>
          </div>

          {/*//FORM*/}
          <div className="flex flex-col gap-1 w-100 lg:shrink-0">
            {/*//Filters*/}
            <div className="flex flex-col border border-border bg-surface-2 rounded w-full py-1 px-2">
              <div className="flex justify-between">
                <header className="text-ink text-sm ">
                  Filters{" "}
                  <InfoTooltip message="Filter markets and subgroups to narrow the asset lists." />
                </header>
                <button onClick={() => setShowFilters((prev) => !prev)} type="button">
                  {showFilters ? (
                    <MinusIcon className="h-4 w-4 hover:text-accent-2" />
                  ) : (
                    <PlusIcon className="h-4 w-4 hover:text-accent" />
                  )}
                </button>
              </div>
              {showFilters ? (
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
                  {/* Subgroup select */}
                  <div className="min-w-45">
                    <label className="text-xs text-muted">Subgroup</label>
                    <SelectField
                      value={subgroupValue}
                      options={subgroupOptions}
                      onChange={setSubgroupValue}
                      placeholder="Select subgroup"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-1">
              {/*//setup*/}
              <div className="flex flex-col border border-border bg-surface-2 rounded w-full py-1 px-2">
                <div className="space-y-1">
                  <div className="flex gap-2">
                    {/* Base asset */}
                    <div className="flex-1 min-w-20">
                      <label className="flex items-center gap-1 py-1 text-xs text-muted">
                        Base asset
                        <InfoTooltip message="Asset you are trading (base). Order amount is stored in base units." />
                      </label>
                      <SelectField
                        isSearchable={true}
                        value={baseAsset}
                        options={baseOptions}
                        onChange={handleBaseAssetChange}
                        placeholder="Select base"
                      />
                      <input type="hidden" {...register("baseAsset", { required: true })} />
                    </div>
                    {/* Quote asset */}
                    <div className="flex-1 min-w-20">
                      <label className="flex items-center gap-1 py-1 text-xs text-muted">
                        Quote asset
                        <InfoTooltip message="Currency you pay/receive. Prices are shown in this currency." />
                      </label>
                      <SelectField
                        isSearchable={true}
                        value={quoteAsset}
                        options={quoteOptions}
                        onChange={handleQuoteAssetChange}
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
                    onChange={handleSideChange}
                    register={register}
                    error={errors.side ? "Side is required." : ""}
                  />

                  {/* Quote/base */}
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-muted">
                        {amountMode === "base" ? "Base amount" : "Quote amount"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={amountInput}
                          onChange={handleAmountInputChange}
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
                  {/*TP*/}
                </div>
              </div>
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
