export function DataTable(props) {
  const {
    columns,
    rows,
    rowKey = "id",
    onSort,
    sortState,
    renderSortIcon,
    stickyHeader = true,
    className,
    tableClassName,
    headerRowClassName,
    rowClassName,
  } = props;

  function getRowKey(row) {
    // Support string key or custom key selector.
    return typeof rowKey === "function" ? rowKey(row) : row?.[rowKey];
  }

  return (
    <div className={className || "overflow-x-visible"}>
      <table className={tableClassName || "w-full border-collapse text-sm"}>
        <thead>
          <tr
            className={
              headerRowClassName ||
              "border-b border-border text-left text-xs uppercase tracking-wide text-muted"
            }
          >
            {columns.map(function (column) {
              const isSortable =
                typeof onSort === "function" && column.sortable !== false;
              const headerClassName = column.headerClassName || column.className;
              const thClassName = headerClassName || "px-4 py-2";
              // Sticky header keeps column labels visible while scrolling.
              const stickyClasses = stickyHeader
                ? " sticky top-0 z-10 bg-bg"
                : "";

              return (
                <th
                  key={column.key}
                  className={`${thClassName}${stickyClasses}`}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={function () {
                        onSort(column.key);
                      }}
                      // Clickable headers toggle sorting via parent hook.
                      className="inline-flex items-center gap-1 text-left text-xs uppercase tracking-wide text-muted hover:text-ink"
                    >
                      <span>{column.label}</span>
                      {renderSortIcon
                        ? renderSortIcon(column.key, sortState)
                        : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map(function (row) {
            return (
              <tr
                key={getRowKey(row)}
                className={rowClassName || "border-b border-border"}
              >
                {columns.map(function (column) {
                  const cellClassName =
                    column.cellClassName || column.className || "px-4 py-2";
                  const content = column.renderCell
                    ? column.renderCell(row)
                    : row?.[column.key];
                  return (
                    <td key={column.key} className={cellClassName}>
                      {content == null ? "--" : content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
