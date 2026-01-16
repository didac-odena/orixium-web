import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout, PublicLayout } from "./layouts/index.js";
import { PrivateRoute } from "./guards/index.js";
import {
  DashboardPage,
  HomePage,
  LoginPage,
  StrategyPage,
  MarketExplorerPage,
  HistorialPage,
} from "./pages/index.js";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/market-explorer" element={<MarketExplorerPage />} />
          <Route path="/historial" element={<HistorialPage />} />
        </Route>

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
