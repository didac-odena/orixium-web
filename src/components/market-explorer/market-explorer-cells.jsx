import { getAccentClass } from "../../pages/market-explorer/market-explorer-utils.js";

export const PercentCell = ({ value, formatter }) => {
  const accentClass = getAccentClass(value);
  const text =
    value != null ? `${formatter.format(value)}%` : "--";
  return <span className={accentClass}>{text}</span>;
};

export const ChangeValueCell = ({
  value,
  accentValue,
  formatValue,
  currency,
}) => {
  const accentClass = getAccentClass(accentValue);
  const text = formatValue(value, currency);
  return <span className={accentClass}>{text}</span>;
};

export const DateCell = ({ value, formatter }) => {
  if (!value) return "--";
  return formatter.format(new Date(value));
};
