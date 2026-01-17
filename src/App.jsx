import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./guards/index.js";
import {
  DashboardPage,
  HomePage,
  LoginPage,
  StrategyPage,
  MarketExplorerPage,
  HistorialPage,
  MembershipPage,
  SupportPage,
  SettingsPage,
  TradingPage,
} from "./pages/index.js";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/strategy" element={<StrategyPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/trading"
          element={
            <PrivateRoute>
              <TradingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/market-explorer"
          element={
            <PrivateRoute>
              <MarketExplorerPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/historial"
          element={
            <PrivateRoute>
              <HistorialPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
