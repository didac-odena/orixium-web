export default function AdvertiseModal({
  isOpen,
  title = "",
  message,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) {
  if (!isOpen) return null;

  const showConfirm = typeof onConfirm === "function";
  const resolvedMessage = message || "Action completed successfully.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex-row w-full max-w-60 rounded border border-border bg-surface-2 px-4 py-4 text-ink">
        {title ? <h3 className="flex justify-center text-sm text-ink ">{title}</h3> : null}
        <p className="flex text-sm justify-center mt-2">{resolvedMessage}</p>
        <div className=" py-2 mt-2 gap-2 flex justify-center">
          {showConfirm ? (
            <button
              type="button"
              onClick={onClose}
              className="flex w-full rounded border border-border justify-center bg-bg px-3 py-1 text-xs uppercase tracking-wide text-muted hover:border-accent-2 hover:text-accent-2"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={showConfirm ? onConfirm : onClose}
            className="flex w-full rounded border border-border bg-bg px-3 py-1 text-xs justify-center uppercase tracking-wide text-muted hover:border-accent hover:text-accent"
          >
            {showConfirm ? confirmLabel : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
