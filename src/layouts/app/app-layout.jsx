// src/layouts/app/app-layout.jsx
import { Outlet } from "react-router-dom";
import { Header, Footer } from "../../components/layout/index.js";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
