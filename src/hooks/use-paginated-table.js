import { useState } from "react";

export function usePaginatedTable(options) {
  const {
    rows,
    pageSize,
    filterFn,
    compareFn,
    getNextSortState,
    shouldResetPage,
  } = options;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortMode, setSortMode] = useState("page");
  const [sortDir, setSortDir] = useState("asc");

  function handleQueryChange(nextQuery) {
    setQuery(nextQuery);
    setPage(1);
  }

  const term = query.trim().toLowerCase();
  const filteredRows =
    !filterFn || !term
      ? rows
      : rows.filter((item) => {
          return filterFn(item, term);
        });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  // Global sort reorders the full filtered list.
  const sortedRows =
    !sortKey || sortMode !== "global" || !compareFn
      ? filteredRows
      : filteredRows.slice().sort((a, b) => {
          return compareFn(a, b, sortKey, sortDir);
        });

  const start = (currentPage - 1) * pageSize;
  const pageItems = sortedRows.slice(start, start + pageSize);
  // Page sort only reorders the current slice.
  const paginatedRows =
    !sortKey || sortMode !== "page" || !compareFn
      ? pageItems
      : pageItems.slice().sort((a, b) => {
          return compareFn(a, b, sortKey, sortDir);
        });

  function handleSort(nextKey) {
    const currentState = { key: sortKey, mode: sortMode, dir: sortDir };
    // Delegate to feature-provided sort cycle when available.
    const nextState = getNextSortState
      ? getNextSortState(currentState, nextKey)
      : {
          key: nextKey,
          mode: "page",
          dir:
            currentState.key === nextKey && currentState.dir === "asc"
              ? "desc"
              : "asc",
        };

    setSortKey(nextState.key);
    setSortMode(nextState.mode);
    setSortDir(nextState.dir);
    if (shouldResetPage && shouldResetPage(nextState)) {
      setPage(1);
    }
  }

  return {
    query,
    setQuery: handleQueryChange,
    page,
    setPage,
    totalPages,
    currentPage,
    filteredRows,
    paginatedRows,
    sortKey,
    sortMode,
    sortDir,
    handleSort,
  };
}

