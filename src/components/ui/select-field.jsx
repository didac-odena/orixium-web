import SearchableSelect from "./searchable-select";

export default function SelectField({
  label,
  value,
  options = [],
  onChange,
  placeholder,
  align,
  isSearchable = false,
}) {
  const alignmentClass = align === "right" ? "text-right" : "text-left";

  let fieldControl = null;
  if (isSearchable === true) {
    fieldControl = (
      <SearchableSelect
        value={value}
        options={options}
        onChange={onChange}
        placeholder={placeholder}
        align={align}
      />
    );
  } else {
    fieldControl = (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded border border-border bg-bg px-2 py-1 text-xs text-ink ${alignmentClass}`}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-muted">{label}</label>
      {fieldControl}
    </div>
  );
}
