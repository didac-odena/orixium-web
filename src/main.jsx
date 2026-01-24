import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

import { initDevMocks } from "./app/index.js";
import { AuthProvider, ThemeProvider } from "./contexts/index.js";
import { BrowserRouter } from "react-router-dom";

async function start() {
  // Start MSW before rendering so requests are intercepted in dev.
  await initDevMocks();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}

start();
