import SearchableSelect from "./searchable-select";

export default function SelectField({
    label,
    value,
    options,
    onChange,
    placeholder,
    align,
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs text-muted">{label}</label>
            <SearchableSelect
                value={value}
                options={options}
                onChange={onChange}
                placeholder={placeholder}
                align={align}
            />
        </div>
    );
}
