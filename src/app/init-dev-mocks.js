// src/app/init-dev-mocks.js
export async function initDevMocks() {
  if (!import.meta.env.DEV) return;

  const { worker } = await import("../mocks/browser.js");

  await worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        print.warning();
      }
    },
  });
}
