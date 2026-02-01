export default function HeaderDropdown({
    label,
    children,
    align = "left",
    wrapperClassName = "",
    buttonClassName = "",
    menuClassName = "",
}) {
    const alignClass = align === "right" ? "right-0" : "left-0";

    return (
        <div className={`relative group ${wrapperClassName}`}>
            <button
                type="button"
                className={buttonClassName}
                aria-haspopup="menu"
            >
                {label}
            </button>
            <div
                className={`absolute ${alignClass} top-full z-50 mt-0 hidden rounded-md border border-border bg-bg py-1 text-sm shadow-sm group-hover:block group-focus-within:block ${menuClassName}`}
            >
                {children}
            </div>
        </div>
    );
}
