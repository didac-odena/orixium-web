import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

import { AuthProvider, ThemeProvider, initDevMocks } from "./app/index.js";

async function start() {
  // Start MSW before rendering so requests are intercepted in dev.
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
