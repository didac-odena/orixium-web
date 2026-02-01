import { PageLayout } from "../components/layout";
import { PageHeader } from "../components/ui";

export default function HomePage() {
  return (
    <PageLayout>
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
      <PageHeader
        title="Orixium Web"
        subtitle="Ironhack Final Project • Portfolio"
        className="relative z-10 space-y-1"
      />
      <p className="mt-3 text-sm text-muted relative z-10">
        This is a portfolio-focused React project. It demonstrates real UI and
        front-end engineering skills: form handling, routing, reusable
        components, data flows, and clean structure. The trading flows here are
        manual and mock-based, designed to showcase implementation quality
        rather than a production trading system.
      </p>

      <h2 className="mt-6 text-sm font-semibold text-ink relative z-10">
        What is implemented
      </h2>
      <ul className="mt-2 space-y-1 text-sm text-muted relative z-10">
        <li>Manual trade flow with validation and confirm step.</li>
        <li>Open trades and trade history views with search and filters.</li>
        <li>Market explorer with quotes, sorting, and grouping.</li>
        <li>Light/dark theme system and reusable layout components.</li>
        <li>TradingView widgets embedded as external scripts.</li>
      </ul>

      <h2 className="mt-6 text-sm font-semibold text-ink relative z-10">
        Tech stack used
      </h2>
      <ul className="mt-2 space-y-1 text-sm text-muted relative z-10">
        <li>React 19 for UI and component architecture.</li>
        <li>React Router for public/private routing and guards.</li>
        <li>React Hook Form for trade forms and validation.</li>
        <li>Tailwind CSS for layout and consistent styling.</li>
        <li>Axios for service calls and mock data fetching.</li>
        <li>MSW for API mocking in development.</li>
        <li>Heroicons for UI iconography.</li>
        <li>TradingView widgets for market visuals.</li>
        <li>Vite + ESLint for tooling and build workflow.</li>
      </ul>

      <h2 className="mt-6 text-sm font-semibold text-ink relative z-10">
        Architecture and data flow
      </h2>
      <ul className="mt-2 space-y-1 text-sm text-muted relative z-10">
        <li>Clear separation: pages, components, services, contexts, utils.</li>
        <li>UI → services → state → UI flow, without hidden side-effects.</li>
        <li>Auth and Theme handled via React Context.</li>
        <li>Trades stored in localStorage to mimic backend persistence.</li>
        <li>Market data served from fixtures through services.</li>
      </ul>

      <h2 className="mt-6 text-sm font-semibold text-ink relative z-10">
        Quality and maintainability
      </h2>
      <ul className="mt-2 space-y-1 text-sm text-muted relative z-10">
        <li>Reusable UI blocks to avoid duplicated markup.</li>
        <li>Readable naming and predictable folder structure.</li>
        <li>Simple logic over premature optimization.</li>
        <li>Manual refresh instead of hidden polling (clear data flow).</li>
      </ul>

      <h2 className="mt-6 text-sm font-semibold text-ink relative z-10">
        Validation
      </h2>
      <ul className="mt-2 space-y-1 text-sm text-muted relative z-10">
        <li>Linting and build scripts available (no automated tests yet).</li>
      </ul>
    </PageLayout>
  );
}
