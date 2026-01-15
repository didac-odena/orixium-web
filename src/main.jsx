import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

import { initDevMocks } from "./app/init-dev-mocks.js";
import { AuthProvider } from "./app/auth/auth-context.jsx";
import { ThemeProvider } from "./app/theme/theme-provider.jsx";

async function start() {
  await initDevMocks();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

start();
