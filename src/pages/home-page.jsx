import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  FunnelIcon,
  LifebuoyIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { PageLayout } from "../components/layout";
import { PageHeader } from "../components/ui";

const DATA_FLOW_STEPS = [
  {
    key: "dashboard-start",
    title: "Dashboard",
    icon: ChartBarIcon,
    description:
      "Aggregates open and closed datasets plus widgets for a quick snapshot before acting.",
  },
  {
    key: "market-explorer",
    title: "Market Explorer",
    icon: FunnelIcon,
    description: "Browse and filter datasets, inspect rows, and decide what to work with next.",
  },
  {
    key: "new-trade",
    title: "New Trade",
    icon: ClipboardDocumentCheckIcon,
    description: "Validate inputs in RHF, derive values, and persist a normalized payload.",
  },
  {
    key: "current-trades",
    title: "Current Trades",
    icon: ListBulletIcon,
    description:
      "Active list reads open status, refreshes snapshot values, and closes items when needed.",
  },
  {
    key: "historial",
    title: "Historial",
    icon: ArchiveBoxIcon,
    description: "Closed items log with stored metrics and reasons, sorted by latest close.",
  },
  {
    key: "dashboard-loop",
    title: "Dashboard (loop)",
    icon: ArrowPathIcon,
    description: "Summaries reflect the latest open/closed state after updates and closes.",
  },
];

function renderFlowStep(step, index) {
  const isLast = index === DATA_FLOW_STEPS.length - 1;
  const StepIcon = step.icon;
  return (
    <div key={step.key} className="flex items-stretch gap-4">
      <div className="flex flex-col items-center self-stretch">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg text-ink">
          <StepIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        {isLast ? null : <div className="mt-2 w-px flex-1 bg-border" />}
      </div>
      <div className="flex-1 rounded border border-border bg-bg p-3">
        <div className="text-xs uppercase tracking-wide text-muted">Step {index + 1}</div>
        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
          <span>{step.title}</span>
        </div>
        <p className="mt-1 text-xs text-muted">{step.description}</p>
      </div>
    </div>
  );
}

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
                A React app built to showcase real frontend engineering: navigation with React
                Router DOM, form validation with React Hook Form, reusable UI components, and a
                clean service layer backed by MSW mocks. This is not a production trading system -
                the goal is readable, maintainable code and a realistic UI workflow.
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
                  Clear <span className="font-semibold text-ink">separation of layers</span>:
                  pages, components, services, and contexts, plus
                  <span className="font-semibold text-ink"> adapters</span> to keep
                  <span className="font-semibold text-ink"> data shapes</span> predictable.
                </li>
                <li>
                  <span className="font-semibold text-ink">Data flow</span>: created in
                  <span className="font-semibold text-ink"> RHF</span>,
                  <span className="font-semibold text-ink"> normalized</span>,
                  <span className="font-semibold text-ink"> persisted</span>, and reused across
                  <span className="font-semibold text-ink"> active/archived</span> views as status
                  changes.
                </li>
                <li>
                  <span className="font-semibold text-ink">State handling</span>: basic
                  <span className="font-semibold text-ink"> loading</span>,
                  <span className="font-semibold text-ink"> error</span>, and
                  <span className="font-semibold text-ink"> empty</span> states keep UI behavior
                  predictable.
                </li>
                <li>
                  <span className="font-semibold text-ink">Validation + derived logic</span>:
                  <span className="font-semibold text-ink"> RHF rules</span>,
                  <span className="font-semibold text-ink"> calculated inputs</span>, cross-field
                  checks, and a <span className="font-semibold text-ink">confirmation</span> step
                  before persistence.
                </li>
                <li>
                  <span className="font-semibold text-ink">Local persistence</span>: session,
                  theme, cached <span className="font-semibold text-ink">snapshots</span>, and
                  manual entries stored in
                  <span className="font-semibold text-ink"> localStorage</span> for continuity.
                </li>
                <li>
                  <span className="font-semibold text-ink">Data and mocks</span>:
                  <span className="font-semibold text-ink"> MSW</span> handlers +
                  <span className="font-semibold text-ink"> fixtures</span> simulate a backend so
                  the UI behaves like a real app without a server.
                </li>
                <li>
                  <span className="font-semibold text-ink">UI reuse</span>:
                  <span className="font-semibold text-ink"> PageLayout</span>, table
                  <span className="font-semibold text-ink"> primitives</span>,
                  <span className="font-semibold text-ink"> toolbar/pagination</span>, toggle,
                  and dropdowns used consistently across views.
                </li>
                <li>
                  <span className="font-semibold text-ink">Search/filter/order UX</span>:
                  <span className="font-semibold text-ink"> normalized identifiers</span>, local
                  search, and <span className="font-semibold text-ink">predictable ordering</span>
                  in lists and tables.
                </li>
                <li>
                  <span className="font-semibold text-ink">Performance-aware data</span>:
                  <span className="font-semibold text-ink"> snapshot caching</span> and
                  <span className="font-semibold text-ink"> manual refresh</span> (no polling by
                  default) to keep the flow simple.
                </li>
                <li>
                  <span className="font-semibold text-ink">Visual consistency</span>: intentional
                  palette and <span className="font-semibold text-ink">hover/focus states</span>{" "}
                  built with <span className="font-semibold text-ink">Tailwind</span> +
                  <span className="font-semibold text-ink"> Heroicons</span>, plus shared
                  <span className="font-semibold text-ink"> formatters</span> and
                  <span className="font-semibold text-ink"> theming</span> (system preference +
                  toggle).
                </li>
                <li>
                  <span className="font-semibold text-ink">External integrations</span>: embedded
                  <span className="font-semibold text-ink">widgets</span> isolated from core state
                  and synced to theme.
                </li>
                <li>
                  <span className="font-semibold text-ink">Quality focus</span>: reusable
                  <span className="font-semibold text-ink"> UI blocks</span>,
                  <span className="font-semibold text-ink"> readable naming</span>, and
                  predictable structure to avoid duplication.
                </li>
                <li>
                  <span className="font-semibold text-ink">Simplicity over cleverness</span>:
                  <span className="font-semibold text-ink"> straightforward logic</span> and manual
                  refresh to keep data flow explicit.
                </li>
                <li>
                  <span className="font-semibold text-ink">Tooling</span>:
                  <span className="font-semibold text-ink"> lint/build scripts</span> available
                  (no automated tests yet).
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center p-5">
              <div className=" rounded text-center  border border-border bg-bg p-4">
                <h2 className="text- rounded font-semibold text-ink">Tech stack used</h2>
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
            </div>

          </div>

          <aside>
            <div>
              <h2 className="text-xl font-semibold">Data flow</h2>
              <p className="mt-1 text-sm text-ink">
                A realistic flow of how a user would move through the app and how data evolves
                between views.
              </p>
              <div className="mt-3 space-y-4">{DATA_FLOW_STEPS.map(renderFlowStep)}</div>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}
