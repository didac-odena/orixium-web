import { useForm } from "react-hook-form";
import { PageLayout } from "../../components/layout";
import { PageHeader, ToggleField } from "../../components/ui";


export default function NewTradePage() {
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
      <section className="space-y-6">
        <PageHeader title="New Trade" subtitle="Manual order trade" />

        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-2">
          <ToggleField
            label="Side"
            name="side"
            value={side}
            options={[
              { value: "BUY", label: "Buy" },
              { value: "SELL", label: "Sell" }
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
              { value: "market", label: "Market" },
              { value: "limit", label: "Limit" }
            ]}
            onChange={handleOrderTypeChange}
            register={register}
            errors={errors.side ? "Order type is required." : ""}
            />

        </form>
      </section>
    </PageLayout>
  );
}
