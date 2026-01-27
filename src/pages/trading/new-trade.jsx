import { useState, useEffect } from "react";
import {
    DEFAULT_QUOTE_CURRENCY,
    SUPPORTED_QUOTE_CURRENCIES,
    getCryptoMarketSnapshots,
    refreshCryptoMarketSnapshots,
} from "../../services";
import { useForm } from "react-hook-form";
import { PageLayout } from "../../components/layout";
import { PageHeader, ToggleField } from "../../components/ui";

export default function NewTradePage() {
    const MARKET_SEGMENTS = [
        { value: "crypto", label: "Crypto" },
        { value: "equity", label: "Equity" },
        { value: "rates", label: "Rates" },
        { value: "forex", label: "Forex" },
        { value: "commodities", label: "Commodities" },
    ];

    //Options builder
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

    const [pairPrice, setPairPrice] = useState(null);
    const [priceStatus, setPriceStatus] = useState("idle");
    const [priceError, setPriceError] = useState("");
    const [marketType, setMarketType] = useState("crypto");
    const [baseAsset, setBaseAsset] = useState("BTC");
    const [quoteAsset, setQuoteAsset] = useState("USD");
    const [baseOptions, setBaseOptions] = useState([]);
    const [quoteOptions, setQuoteOptions] = useState(buildQuoteOptions());

    const handleMarketTypeChange = (nextMarket) => {
        setMarketType(nextMarket);
        setBaseAsset("");
        setQuoteAsset(DEFAULT_QUOTE_CURRENCY);
        setBaseOptions([]);
        setPairPrice(null);
        setPriceStatus("idle");
        setPriceError("");
    };
    const handleBaseAssetChange = (event) => {
        setBaseAsset(event.target.value);
    };
    const handleQuoteAssetChange = (event) => {
        setQuoteAsset(event.target.value);
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
                <div className="flex flex-col border border-border bg-surface-3 rounded w-full max-w-[27%] py-1 px-2">
                    <form
                        onSubmit={handleSubmit(handleSubmitForm)}
                        className="space-y-1"
                    >
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs">Base asset</label>
                                <select
                                    value={baseAsset}
                                    onChange={handleBaseAssetChange}
                                    className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink"
                                >
                                    {baseOptions.map((option) => {
                                        return (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="flex-1">
                                <label className="text-xs">Quote asset</label>
                                <select
                                    value={quoteAsset}
                                    onChange={handleQuoteAssetChange}
                                    className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink"
                                >
                                    {quoteOptions.map((option) => {
                                        return (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        );
                                    })}
                                </select>
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
