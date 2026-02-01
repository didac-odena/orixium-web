import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./guards";
import {
  DashboardPage,
  HomePage,
  LoginPage,
  StrategyPage,
  MarketExplorerPage,
  HistorialPage,
  SupportPage,
  SettingsPage,
  CurrentTradesPage,
  NewTradePage,
  PortfolioPage,
} from "./pages";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/strategy" element={<StrategyPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/current-trades" element={<CurrentTradesPage />} />
        <Route path="/new-trade" element={<NewTradePage />} />
        <Route path="/market-explorer" element={<MarketExplorerPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}

export default App;
