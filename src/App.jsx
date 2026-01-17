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
  PortfolioPage,
} from "./pages/index.js";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/strategy" element={<StrategyPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/trading" element={<TradingPage />} />
          <Route path="/market-explorer" element={<MarketExplorerPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
