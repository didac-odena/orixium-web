import { PageLayout } from "../components/layout";
import { PageHeader } from "../components/ui";

export default function HomePage() {
  return (
    <PageLayout>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(1000px_circle_at_80%_20%,rgb(from_var(--color-accent)_r_g_b_/_0.50),transparent_60%)] dark:bg-[radial-gradient(1000px_circle_at_80%_20%,rgb(168_85_247_/_0.14),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(900px_circle_at_20%_75%,rgb(from_var(--color-accent)_r_g_b_/_0.05),transparent_65%)] dark:bg-[radial-gradient(900px_circle_at_20%_75%,rgb(139_92_246_/_0.05),transparent_65%)]"
      />
      <img
        src="/src/assets/brand/orixium-logo-mark-colored.svg"
        alt=""
        className="pointer-events-none fixed right-0 top-0 block h-full translate-y-1/4 translate-x-1/4 w-2/3 object-contain opacity-20 z-0 dark:hidden"
        aria-hidden="true"
      />
      <img
        src="/src/assets/brand/orixium-logo-mark-colored-dark.svg"
        alt=""
        className="pointer-events-none fixed right-0 top-0 hidden translate-y-1/4 translate-x-1/4 h-full w-2/3 object-contain opacity-20 z-0 dark:block"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Orixium Web"
          subtitle="React Trading UI (Ironhack Bootcamp Frontend Project)"
        />
        <div className="mt-5 grid gap-20 lg:grid-cols-[44rem_22rem] lg:items-start">
          <div className="space-y-4 text-justify">
              <div className="flex gap-2 pt-1 text-sm text-muted sm:flex-row sm:items-center ">
                <span>
                  Built by <span className="text-ink">Dídac Ódena</span>
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted transition-colors hover:text-accent"
                    aria-label="GitHub profile"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      aria-hidden="true"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.477 2 2 6.58 2 12.253c0 4.53 2.865 8.375 6.839 9.73.5.095.682-.22.682-.49 0-.243-.009-.888-.014-1.742-2.782.62-3.369-1.375-3.369-1.375-.454-1.186-1.11-1.503-1.11-1.503-.908-.64.069-.627.069-.627 1.004.072 1.532 1.06 1.532 1.06.892 1.565 2.341 1.114 2.91.852.091-.664.35-1.115.636-1.372-2.221-.26-4.555-1.143-4.555-5.085 0-1.123.39-2.04 1.029-2.758-.103-.259-.446-1.306.098-2.724 0 0 .84-.276 2.75 1.053A9.3 9.3 0 0 1 12 7.07c.85.004 1.705.119 2.504.35 1.909-1.33 2.748-1.054 2.748-1.054.545 1.418.202 2.465.1 2.724.64.718 1.028 1.635 1.028 2.758 0 3.952-2.338 4.822-4.566 5.077.36.318.68.946.68 1.907 0 1.376-.012 2.484-.012 2.822 0 .273.18.59.688.49C19.137 20.624 22 16.78 22 12.253 22 6.58 17.523 2 12 2Z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted transition-colors hover:text-accent"
                    aria-label="LinkedIn profile"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      aria-hidden="true"
                      fill="currentColor"
                    >
                      <path d="M20.45 20.45h-3.554v-5.569c0-1.328-.027-3.036-1.85-3.036-1.85 0-2.134 1.444-2.134 2.937v5.668H9.36V9h3.414v1.56h.047c.476-.9 1.637-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.455v6.285ZM5.34 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126ZM7.12 20.45H3.56V9H7.12v11.45ZM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003Z" />
                    </svg>
                  </a>
                </div>
              </div>
            <div className="space-y-2">
              <p className="text-sm text-ink">
                A portfolio-focused React app built to showcase real frontend engineering:
                navigation with React Router DOM, form validation with React Hook Form, reusable UI
                components, and a clean service layer backed by MSW mocks. This is not a production
                trading system - the goal is readable, maintainable code and a realistic UI
                workflow.
              </p>
              <p className="text-sm text-ink">
                Best starting point: log in and explore the New Trade flow - it highlights RHF
                validation, derived values, and predictable data flow.
              </p>
              <p className="text-sm text-muted">
                Demo credentials: <span className="text-ink">demo-admin@orixium.test</span> /{" "}
                <span className="text-ink">12345678</span>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">What is implemented</h2>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li>
                  Layout system: Shared PageLayout with consistent spacing and surfaces, built on
                  Tailwind + CSS variable design tokens for a themeable UI (light/dark).
                </li>
                <li>
                  Header & footer: Responsive header navigation (dropdowns, auth-aware actions,
                  theme toggle, notifications) and a clean footer with social links—both reusable
                  layout components.
                </li>
                <li>
                  Auth service: adapter-based login/logout with MSW-backed{" "}
                  <span className="font-mono text-xs">/api/auth</span> endpoints, normalized session
                  data persisted in localStorage, and protected routes via React Router DOM.
                </li>
                <li>
                  Market data sources (API + mocks): crypto prices from a public REST API consumed
                  with Axios, plus local fixtures for the other markets to keep the same snapshots
                  pipeline without a backend.
                </li>
                <li>
                  Filtering + local search: group/subgroup filters and keyword search across
                  symbol/name/group with consistent page reset and stable results.
                </li>
                <li>
                  Table system: reusable DataTable + TableToolbar + TablePagination, with
                  market-specific column sets and per-page/global sorting logic.
                </li>
                <li>
                  Global search + refresh UX: global asset search in the toolbar that can jump
                  markets, manual refresh button, and an entry refresh with cooldown (~60s).
                </li>
                <li>
                  Utils/formatters: shared helpers for price/percent/date/compact formatting,
                  applied consistently across tables and cards.
                </li>
                <li>
                  New Trade workflow: end-to-end form flow built with React Hook Form + reusable
                  field components, keeping inputs, validation, and derived values in sync.
                </li>
                <li>
                  Data-driven selects: options built from cached asset snapshots + subgroup
                  filters, with refresh fallbacks and predictable defaults even without a backend.
                </li>
                <li>
                  Global search shortcut: cross-market asset search aggregates local datasets and
                  updates the form state in one step.
                </li>
                <li>
                  Price + amount logic: local price lookup, base/quote conversion, and consistent
                  formatting via shared formatters; limit price auto-fill when applicable.
                </li>
                <li>
                  Risk controls: modular Take Profit / Stop Loss panels with % or value inputs,
                  side-aware validation, and multi-level partial exits; integrated cleanly into the
                  main form.
                </li>
                <li>
                  Confirmation + persistence: summary modal before submit, then normalized payload
                  stored in localStorage so it appears in Open Trades / History without server
                  support.
                </li>
                <li>
                  External context widget: embedded chart widget with theme sync and dynamic symbol
                  mapping to provide context without leaving the form.
                </li>
                <li>
                  Continuation of the RHF payload: items created in the New Trade form are
                  normalized and persisted locally, then surfaced here while their status stays
                  open to track lifecycle in a separate view.
                </li>
                <li>
                  Safe close flow: close action is gated to locally created entries (manual IDs),
                  confirmed in a modal, and persisted so the lifecycle state stays consistent
                  after reloading.
                </li>
                <li>
                  Scoped search: search options are built from the currently open dataset only,
                  with normalized identifier matching to keep results relevant to this view.
                </li>
                <li>
                  Manual refresh + recalculation: a one-click refresh pulls snapshot prices, maps
                  them to existing items, and recalculates the displayed P&amp;L without polling.
                </li>
                <li>
                  Derived metrics: performance values are computed client-side with direction-aware
                  logic and formatted through shared money/percent/date helpers for consistency.
                </li>
                <li>
                  Table layout logic: column definitions keep headers/cells aligned and the same
                  dataset powers both the mobile cards and the desktop table.
                </li>
                <li>
                  History view: the same RHF-generated objects are persisted and surfaced here
                  once their status flips to closed, providing a read-only lifecycle log.
                </li>
                <li>
                  Merged data source: history is loaded through a service that combines mock API
                  results with locally closed entries, so the list stays consistent after reloads.
                </li>
                <li>
                  Scoped search + ordering: search options are built from the history dataset only,
                  with normalized identifier matching and newest-close ordering.
                </li>
                <li>
                  Stored metrics: entry/exit values, performance (P&amp;L + %) and close reason
                  come from the persisted payload and are formatted via shared helpers.
                </li>
                <li>
                  Responsive display: mobile expandable cards and the desktop table share the same
                  dataset and status handling, with consistent positive/negative indicators.
                </li>
                <li>
                  Dashboard aggregation: pulls open + closed datasets in parallel (Promise.all)
                  with explicit loading/error states before rendering any summaries.
                </li>
                <li>
                  Summary logic: computes a top-5 list by derived performance (P&amp;L) and a
                  latest-5 list by close date using client-side sort + slice.
                </li>
                <li>
                  Consistent formatting: shared money/percent/date helpers plus a single label
                  builder keep figures uniform across cards.
                </li>
                <li>
                  Lifecycle-aware timestamps: open items use openedAt/createdAt and closed items
                  use closedAt/updatedAt/createdAt for resilient date display.
                </li>
                <li>
                  Visual context widgets: embeds two isolated third-party blocks (ticker tape +
                  timeline) as non-blocking context.
                </li>
                <li>
                  Readable render flow: small render helpers keep the view flat and maintainable
                  while reusing the same state/formatters.
                </li>
                <li>
                  Theme system: centralized ThemeProvider reads system preference, persists user
                  choice in localStorage, and applies the dark class at the document root for
                  global styling.
                </li>
                <li>
                  Header theme toggle: a small UI control wired to context state switches themes
                  consistently across the app.
                </li>
                <li>
                  Notifications menu: header dropdown driven by local state with mock data samples,
                  supporting item removal to simulate real-world inbox behavior.
                </li>
                <li>
                  Dev-only notification feed: mock notifications are generated on an interval
                  while active to exercise UI state updates and empty states.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Architecture and data flow</h2>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li>Clear separation: pages, components, services, contexts, utils.</li>
                <li>
                  Predictable flow: UI → handlers → services/adapters → state → UI (no “magic”
                  redirects).
                </li>
                <li>
                  Dev-only mock backend: MSW starts before rendering so UI behaves like a real app.
                </li>
                <li>
                  Adapters isolate API shapes: CoinGecko (live crypto) and /api (mocked endpoints).
                </li>
                <li>
                  Local persistence for learning: auth session, theme, cached snapshots, and manual
                  trades.
                </li>
                <li>
                  Reusable utilities: Intl formatters (fiat/crypto/date) + symbol search with
                  base/quote parsing and aliases.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Quality and maintainability</h2>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li>Reusable UI blocks to avoid duplicated markup.</li>
                <li>Readable naming and predictable folder structure.</li>
                <li>Simple logic over premature optimization.</li>
                <li>Manual refresh instead of hidden polling (clear data flow).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Validation</h2>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li>Linting and build scripts available (no automated tests yet).</li>
              </ul>
            </div>
          </div>

          <aside className="lg:top-24">
            <div className="rounded border border-border bg-surface-2 p-3">
              <h2 className="text-sm font-semibold text-ink">Tech stack used</h2>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li>React 19 for UI and component architecture.</li>
                <li>React Router DOM for public/private routing and guards.</li>
                <li>React Hook Form for forms, validation, and submission flow.</li>
                <li>Tailwind CSS + CSS variables for design tokens (themeable UI).</li>
                <li>Axios for HTTP clients (CoinGecko + local /api).</li>
                <li>MSW (Mock Service Worker) for dev API mocking via handlers + fixtures.</li>
                <li>Heroicons for UI iconography.</li>
                <li>TradingView widgets for market visuals.</li>
                <li>Vite + ESLint for tooling and build workflow.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}
