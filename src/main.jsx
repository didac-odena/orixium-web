import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./app/auth/auth-context.jsx";

async function initApp() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser.js");
    await worker.start({
      onUnhandledRequest(request, print) {
        const url = new URL(request.url);

        if (url.pathname.startsWith("/api/")) {
          print.warning();
        }
      },
    });
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

initApp();
