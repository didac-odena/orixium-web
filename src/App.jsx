import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./guards";
import {
  DashboardPage,
  HomePage,
  LoginPage,
  MarketExplorerPage,
  HistorialPage,
  SupportPage,
  CurrentTradesPage,
  NewTradePage,
} from "./pages";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/support" element={<SupportPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/current-trades" element={<CurrentTradesPage />} />
        <Route path="/new-trade" element={<NewTradePage />} />
        <Route path="/market-explorer" element={<MarketExplorerPage />} />
        <Route path="/historial" element={<HistorialPage />} />
      </Route>

      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}

export default App;
