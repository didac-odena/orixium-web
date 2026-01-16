// src/layouts/public/public-layout.jsx
import { Outlet } from "react-router-dom";
import { Header, Footer } from "../../components/layout/index.js";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Header />
      <main className="mx-auto px-6 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
