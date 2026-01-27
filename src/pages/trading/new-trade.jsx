import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    DEFAULT_QUOTE_CURRENCY,
    SUPPORTED_QUOTE_CURRENCIES,
    getCryptoMarketSnapshots,
    refreshCryptoMarketSnapshots,
} from "../../services";
import { PageLayout } from "../../components/layout";
import { PageHeader, SearchableSelect, ToggleField } from "../../components/ui";

const MARKET_SEGMENTS = [
    { value: "crypto", label: "Crypto" },
    { value: "equity", label: "Equity" },
    { value: "rates", label: "Rates" },
    { value: "forex", label: "Forex" },
    { value: "commodities", label: "Commodities" },
];

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
    const [baseAmount, setBaseAmount] = useState("");
    const [quoteAmount, setQuoteAmount] = useState("");
    const [lastEditedAmount, setLastEditedAmount] = useState("");
    const quoteOptions = QUOTE_OPTIONS;

    const handleMarketTypeChange = (nextMarket) => {
        setMarketType(nextMarket);
        setBaseAsset("");
        setQuoteAsset(DEFAULT_QUOTE_CURRENCY);
        setBaseOptions([]);
        setBaseAmount("");
        setQuoteAmount("");
        setLastEditedAmount("");
        setPairPrice(null);
        setPriceStatus("idle");
        setPriceError("");
    };
    const handleBaseAssetChange = (nextValue) => {
        setBaseAsset(nextValue);
    };
    const handleQuoteAssetChange = (nextValue) => {
        setQuoteAsset(nextValue);
    };
    const handleBaseAmountChange = (event) => {
        const nextValue = event.target.value;
        setBaseAmount(nextValue);
        setLastEditedAmount("base");

        const price = Number(pairPrice);
        const baseNumber = parseAmountValue(nextValue);
        if (!Number.isFinite(price) || baseNumber == null) {
            setQuoteAmount("");
            return;
        }

        const nextQuote = baseNumber * price;
        setQuoteAmount(formatAmount(nextQuote));
    };
    const handleQuoteAmountChange = (event) => {
        const nextValue = event.target.value;
        setQuoteAmount(nextValue);
        setLastEditedAmount("quote");

        const price = Number(pairPrice);
        const quoteNumber = parseAmountValue(nextValue);
        if (!Number.isFinite(price) || quoteNumber == null || price === 0) {
            setBaseAmount("");
            return;
        }

        const nextBase = quoteNumber / price;
        setBaseAmount(formatAmount(nextBase));
    };
    const handleSideChange = (nextSide) => {
        setValue("side", nextSide, { shouldValidate: true });
    };
    const handleOrderTypeChange = (nextType) => {
        setValue("orderType", nextType, { shouldValidate: true });
    };
    const handleSubmitForm = (values) => {
        console.log("NEW_TRADE_FORM_SUBMIT", values);
    };

    useEffect(() => {
        const loadCryptoPrice = async () => {
            if (marketType !== "crypto") {
                setPairPrice(null);
                setPriceError("Price feed is only wired for crypto right now.");
                setPriceStatus("idle");
                return;
            }

            const quoteLower = String(
                quoteAsset || DEFAULT_QUOTE_CURRENCY,
            ).toLowerCase();
            if (quoteLower === "usdt") {
                setPairPrice(null);
                setPriceError("USDT pricing is not wired yet.");
                setPriceStatus("idle");
                return;
            }

            setPriceStatus("loading");
            setPriceError("");

            try {
                let items = getCryptoMarketSnapshots(quoteLower);
                if (!items.length) {
                    items = await refreshCryptoMarketSnapshots(quoteLower);
                }

                const match = items.find((item) => {
                    return (
                        item.symbol?.toUpperCase() ===
                        String(baseAsset || "").toUpperCase()
                    );
                });

                setPairPrice(match?.current_price ?? null);
                setPriceStatus("ready");
            } catch (err) {
                setPairPrice(null);
                setPriceStatus("error");
                setPriceError("Failed to load price for this pair.");
            }
        };

        loadCryptoPrice();
    }, [marketType, baseAsset, quoteAsset]);

    useEffect(() => {
        const loadBaseOptions = async () => {
            if (marketType !== "crypto") {
                setBaseOptions([]);
                return;
            }
            const quoteLower = String(
                quoteAsset || DEFAULT_QUOTE_CURRENCY,
            ).toLowerCase();

            let items = getCryptoMarketSnapshots(quoteLower);
            if (!items.length) {
                items = await refreshCryptoMarketSnapshots(quoteLower);
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
        if (!Number.isFinite(Number(pairPrice))) return;

        if (lastEditedAmount === "base") {
            const baseNumber = parseAmountValue(baseAmount);
            if (baseNumber == null) return;
            setQuoteAmount(formatAmount(baseNumber * Number(pairPrice)));
        }

        if (lastEditedAmount === "quote") {
            const quoteNumber = parseAmountValue(quoteAmount);
            if (quoteNumber == null || Number(pairPrice) === 0) return;
            setBaseAmount(formatAmount(quoteNumber / Number(pairPrice)));
        }
    }, [pairPrice, lastEditedAmount, baseAmount, quoteAmount]);

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
        },
        mode: "onChange",
    });

    const side = watch("side");
    const orderType = watch("orderType");

    return (
        <PageLayout>
            <section className="space-y-1">
                <PageHeader title="New Trade" subtitle="Manual order trade" />

                {/*//Filters*/}
                <div className="flex flex-wrap gap-2">
                    {MARKET_SEGMENTS.map((segment) => {
                        const isActive = marketType === segment.value;
                        const buttonClass = isActive
                            ? "cursor-pointer rounded-full border border-ink bg-surface  px-2 py-1 text-xs uppercase tracking-wider text-ink"
                            : "cursor-pointer rounded-full border border-border px-2 py-1 text-xs uppercase tracking-wider text-muted hover:border-accent hover:text-accent transition";

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

                {/*//Form*/}
                <div className="flex flex-col border border-border bg-surface-3 rounded w-full max-w-[30%] py-1 px-2">
                    <form
                        onSubmit={handleSubmit(handleSubmitForm)}
                        className="space-y-1"
                    >
                        <div className="grid grid-cols-2 gap-2 items-end">
                            <div className="grid grid-cols-3 gap-2 items-end">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs">Base amount</label>
                                    <input
                                        value={baseAmount}
                                        onChange={handleBaseAmountChange}
                                        placeholder="0.00"
                                        inputMode="decimal"
                                        className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-right text-ink"
                                    />
                                </div>

                                <div className="col-span-1 space-y-1">
                                    <label className="text-xs">Base asset</label>
                                    <SearchableSelect
                                        value={baseAsset}
                                        options={baseOptions}
                                        onChange={handleBaseAssetChange}
                                        placeholder="Select"
                                        align="right"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 items-end">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs">
                                        Quote amount
                                    </label>
                                    <input
                                        value={quoteAmount}
                                        onChange={handleQuoteAmountChange}
                                        placeholder="0.00"
                                        inputMode="decimal"
                                        className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-right text-ink"
                                    />
                                </div>

                                <div className="col-span-1 space-y-1">
                                    <label className="text-xs">
                                        Quote asset
                                    </label>
                                    <SearchableSelect
                                        value={quoteAsset}
                                        options={quoteOptions}
                                        onChange={handleQuoteAssetChange}
                                        placeholder="Select"
                                        align="right"
                                    />
                                    <div className="text-xs text-muted text-right">
                                        {priceStatus === "loading"
                                            ? "Loading price..."
                                            : null}
                                        {priceStatus === "error"
                                            ? priceError
                                            : null}
                                        {priceStatus === "ready" &&
                                        pairPrice != null
                                            ? `Last price: ${pairPrice}`
                                            : null}
                                    </div>
                                </div>
                            </div>
                        </div>

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
                            error={
                                errors.orderType ? "Order type is required." : ""
                            }
                        />

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
