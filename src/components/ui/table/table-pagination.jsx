export function TablePagination(props) {
  const { currentPage, totalPages, totalCount, pageSize, onPageChange, className } =
    props;

  if (!totalCount) return null;

  // 1-based range display for the current page.
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className={className || "flex justify-center"}>
      <div className="flex items-center gap-3 text-xs text-muted">
        <button
          type="button"
          onClick={function () {
            onPageChange(Math.max(1, currentPage - 1));
          }}
          disabled={currentPage === 1}
          className="rounded-md border border-border px-2 py-1 text-xs text-ink hover:text-accent disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          {start}-{end} of {totalCount}
        </span>
        <button
          type="button"
          onClick={function () {
            onPageChange(Math.min(totalPages, currentPage + 1));
          }}
          disabled={currentPage === totalPages}
          className="rounded-md border border-border px-2 py-1 text-xs text-ink hover:text-accent disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
