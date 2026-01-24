import { useEffect, useMemo, useState } from "react";

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

  useEffect(
    () => {
      // Reset pagination when the filter query changes.
      setPage(1);
    },
    [query],
  );

  const filteredRows = useMemo(
    () => {
      if (!filterFn) return rows;
      const term = query.trim().toLowerCase();
      if (!term) return rows;
      return rows.filter((item) => {
        return filterFn(item, term);
      });
    },
    [rows, query, filterFn],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const sortedRows = useMemo(
    () => {
      // Global sort reorders the full filtered list.
      if (!sortKey || sortMode !== "global" || !compareFn) return filteredRows;
      const list = filteredRows.slice();
      list.sort((a, b) => {
        return compareFn(a, b, sortKey, sortDir);
      });
      return list;
    },
    [filteredRows, sortKey, sortMode, sortDir, compareFn],
  );

  const paginatedRows = useMemo(
    () => {
      const start = (currentPage - 1) * pageSize;
      const pageItems = sortedRows.slice(start, start + pageSize);
      // Page sort only reorders the current slice.
      if (!sortKey || sortMode !== "page" || !compareFn) return pageItems;
      return pageItems.slice().sort((a, b) => {
        return compareFn(a, b, sortKey, sortDir);
      });
    },
    [sortedRows, currentPage, pageSize, sortKey, sortMode, sortDir, compareFn],
  );

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
    setQuery,
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

