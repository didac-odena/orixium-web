import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function SearchableSelect({
    value,
    options,
    onChange,
    placeholder = "Select",
    align = "left",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selected = options.find((option) => {
        return option.value === value;
    });

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleQueryChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSelectValue = (nextValue) => {
        onChange(nextValue);
        setIsOpen(false);
        setQuery("");
    };

    const filteredOptions = options.filter((option) => {
        const label = String(option.label || "").toLowerCase();
        const valueText = String(option.value || "").toLowerCase();
        const search = query.toLowerCase();
        return label.includes(search) || valueText.includes(search);
    });

    const renderOption = (option) => {
        const handleClick = () => {
            handleSelectValue(option.value);
        };

        return (
            <button
                key={option.value}
                type="button"
                onClick={handleClick}
                className="w-full px-2 py-1 text-left text-xs text-ink hover:bg-surface"
            >
                {option.label}
            </button>
        );
    };

    const buttonAlignClass =
        align === "right"
            ? "justify-end text-right"
            : "justify-start text-left";

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={handleToggle}
                className={`flex w-full items-center gap-1 rounded border border-border bg-bg px-1 py-1 text-xs text-ink ${buttonAlignClass}`}
            >
                <span className="flex-1">
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon className="h-3 w-3 text-muted" />
            </button>

            {isOpen ? (
                <div className="absolute z-20 mt-1 w-full rounded border border-border bg-bg shadow">
                    <div className="p-2">
                        <input
                            value={query}
                            onChange={handleQueryChange}
                            placeholder="Search..."
                            className="w-full rounded border border-border bg-bg px-0 py-1 text-xs text-ink"
                        />
                    </div>
                    <div className="max-h-60 overflow-auto">
                        {filteredOptions.length ? (
                            filteredOptions.map(renderOption)
                        ) : (
                            <div className="px-3 py-2 text-xs text-muted">
                                No results
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
