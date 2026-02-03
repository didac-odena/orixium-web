export async function initDevMocks() {
  const shouldEnableMocks =
    import.meta.env.DEV || String(import.meta.env.VITE_ENABLE_MOCKS || "") === "true";

  if (!shouldEnableMocks) return;

  // Lazy-load MSW only in dev to keep prod bundles clean.
  const { worker } = await import("../mocks/browser.js");

  await worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);

      // Only warn for missing API handlers to avoid noisy logs.
      if (url.pathname.startsWith("/api/")) {
        print.warning();
      }
    },
  });
}
