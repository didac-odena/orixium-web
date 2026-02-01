import { PageLayout } from "../components/layout";

export default function HomePage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden rounded-lg border border-border bg-surface-2 p-8 sm:p-12">
        <img
          src="/src/assets/brand/orixium-logo-mark-colored.svg"
          alt=""
          className="pointer-events-none absolute right-6 top-1/2 hidden h-64 w-auto -translate-y-1/2 opacity-10 dark:hidden"
          aria-hidden="true"
        />
        <img
          src="/src/assets/brand/orixium-logo-mark-colored-dark.svg"
          alt=""
          className="pointer-events-none absolute right-6 top-1/2 hidden h-64 w-auto -translate-y-1/2 opacity-10 dark:block"
          aria-hidden="true"
        />

        <div className="relative max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted">Home</p>
          <h1 className="text-3xl font-semibold text-ink">Orixium Web</h1>
          <p className="text-sm text-muted">
            This page will introduce the project and the technical decisions
            behind it.
          </p>
          <p className="text-sm text-muted">
            We will refine this content next.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}


