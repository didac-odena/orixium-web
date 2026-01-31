export default function TradeSuccessModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex-row w-full max-w-60 rounded border border-border bg-surface-2 px-4 py-3 text-ink">
        <p className="flex items-center-safe text-sm">{message || "Trade created successfully."}</p>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded border border-border bg-bg px-3 py-1 text-xs uppercase tracking-wide text-muted hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
