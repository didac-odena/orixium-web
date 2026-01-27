import { useState } from "react";
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

    const [marketType, setMarketType] = useState("crypto");

    const handleMarketTypeChange = (nextMarket) => {
        setMarketType(nextMarket);
    };

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

    const handleSideChange = (nextSide) => {
        setValue("side", nextSide, { shouldValidate: true });
    };

    const handleOrderTypeChange = (nextType) => {
        setValue("orderType", nextType, { shouldValidate: true });
    };

    const handleSubmitForm = (values) => {
        console.log("NEW_TRADE_FORM_SUBMIT", values);
    };

    return (
        <PageLayout>
            <section className="space-y-1">
                <PageHeader title="New Trade" subtitle="Manual order trade" />

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

                <div className="flex flex-col border border-border bg-surface-3 rounded w-full max-w-[27%] py-1 px-2">
                    <form
                        onSubmit={handleSubmit(handleSubmitForm)}
                        className="space-y-2"
                    >
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
                            errors={errors.side ? "Side is required." : ""}
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
                            errors={
                                errors.side ? "Order type is required." : ""
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
