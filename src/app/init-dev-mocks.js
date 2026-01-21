export async function initDevMocks() {
  if (!import.meta.env.DEV) return;

  // Lazy-load MSW only in dev to keep prod bundles clean.
  const { worker } = await import("../mocks/browser.js");

  await worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);

      // Only warn for missing API handlers to avoid noisy logs.
      if (url.pathname.startsWith("/api/")) {
        print.warning();
      }
    },
  });
}
