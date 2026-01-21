export function TableToolbar(props) {
  const { topLeft, topRight, bottomLeft, bottomCenter, bottomRight } = props;

  return (
    <div className="space-y-4">
      {topLeft || topRight ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">{topLeft}</div>
          <div className="flex flex-wrap items-center gap-3">{topRight}</div>
        </div>
      ) : null}
      {bottomLeft || bottomCenter || bottomRight ? (
        // Three-column grid keeps center controls aligned on desktop.
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end">
          <div className="flex flex-wrap items-center gap-3">{bottomLeft}</div>
          <div className="flex justify-center">{bottomCenter}</div>
          <div className="flex items-center justify-end gap-2">
            {bottomRight}
          </div>
        </div>
      ) : null}
    </div>
  );
}
