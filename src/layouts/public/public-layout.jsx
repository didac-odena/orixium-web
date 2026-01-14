import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div style={{ border: "1px solid #000" }}>
      <header style={{ borderBottom: "1px solid #000" }}>Public Header</header>

      <main style={{ borderBottom: "1px solid #000" }}>
        <Outlet />
      </main>

      <footer>Public Footer</footer>
    </div>
  );
}
