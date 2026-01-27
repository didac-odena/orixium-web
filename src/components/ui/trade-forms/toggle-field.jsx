    export default function ToggleField({
    label,
    name,
    value,
    options,
    onChange,
    register,
    error,
    }) {
    const toggleButtonClass = (isActive) => {
        return `flex-1 text-center px-2 py-2 rounded cursor-pointer border border-border bg-bg uppercase tracking-wide transition-colors hover:border-accent hover:text-accent text-xs ${
            isActive ? "text-ink border border-ink" : "text-muted opacity-50"
        }`;
    };

    const renderOption = (option) => {
        const isActive = value === option.value;
        const handleClick = () => {
        onChange(option.value);
        };

        return (
        <button
            key={option.value}
            type="button"
            onClick={handleClick}
            className={toggleButtonClass(isActive)}
        >
            {option.label}
        </button>
        );
    };

    return (
        <div className="space-y-2">
        <label className="text-xs">{label}</label>
        <div className="flex gap-2">{options.map(renderOption)}</div>
        <input type="hidden" {...register(name, { required: true })} />
        {error ? <p className="text-danger text-xs">{error}</p> : null}
        </div>
    );
    }
