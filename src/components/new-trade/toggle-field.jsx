export default function ToggleField({
    name,
    value,
    options,
    onChange,
    register,
    error,
}) {
    const toggleButtonClass = (isActive) => {
        return `flex-1 cursor-pointer rounded border text-center px-2 py-1 text-xs uppercase tracking-wide transition-colors hover:border-accent hover:text-accent ${
            isActive ? "border-ink bg-surface text-ink" : "border-border bg-bg text-muted"
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
            <div className="flex gap-2">{options.map(renderOption)}</div>
            <input type="hidden" {...register(name, { required: true })} />
            {error ? <p className="text-danger text-xs">{error}</p> : null}
        </div>
    );
}
