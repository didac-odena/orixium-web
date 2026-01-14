import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div style={{ border: "1px solid #000" }}>
      <header style={{ borderBottom: "1px solid #000" }}>App Header</header>

      <main style={{ borderBottom: "1px solid #000" }}>
        <Outlet />
      </main>

      <footer>App Footer</footer>
    </div>
  );
}
