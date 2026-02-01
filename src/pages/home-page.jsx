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
          <div className="space-y-6 text-justify">
            <div className="space-y-2">
              <p className="text-sm text-ink">
                A portfolio-focused React app built to showcase real frontend engineering:
                navigation with React Router DOM, form validation with React Hook Form, reusable UI
                components, and a clean service layer backed by MSW mocks. This is not a production
                trading system - the goal is readable, maintainable code and a realistic UI
                workflow.
              </p>
              <p className="text-sm text-ink">
                Best starting point: the New Trade flow - it highlights RHF validation, derived
                values, and predictable data flow.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">What is implemented</h2>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li>Manual trade flow (RHF validation, derived values, confirm step).</li>
                <li>
                  Basic risk controls: Take Profit (multi-level) and Stop Loss (single level).
                </li>
                <li>
                  Open trades + trade history views, including search and manual refresh of prices.
                </li>
                <li>
                  Market explorer with live crypto data from CoinGecko (manual refresh) and mocked
                  data for other markets.
                </li>
                <li>TradingView widgets embedded safely as external scripts.</li>
                <li>
                  Auth flow + protected routes, with a minimal session persisted in localStorage.
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
