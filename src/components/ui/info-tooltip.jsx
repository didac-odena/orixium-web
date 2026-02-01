import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function InfoTooltip({ message }) {
  if (!message) return null;

  return (
    <span className="relative inline-flex items-center group">
      <InformationCircleIcon className="h-4 w-4 text-muted" aria-hidden="true" />
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-40 -translate-x-1/2 rounded border border-border bg-bg px-2 py-1 text-[11px] text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {message}
      </span>
    </span>
  );
}
