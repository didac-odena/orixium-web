import { Outlet } from "react-router-dom";
import { Header, Footer } from "../../components/layout";

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

