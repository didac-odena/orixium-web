import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./app/auth/auth-context.jsx";
import { initDevMocks } from "./app/init-dev-mocks.js";

async function initApp() {
  await initDevMocks();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

initApp();
