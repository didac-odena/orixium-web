import { Outlet } from "react-router-dom";
import { Header, Footer } from "../public/index.js";

function AppLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default AppLayout;

