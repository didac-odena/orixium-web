import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../app/auth/auth-context.jsx";

function Header() {
  const auth = useAuth();

  async function handleLogout() {
    await auth.logout();
  }

  return (
    <header>
      <div>
        <Link to="/">Orixium</Link>
      </div>

      <nav>
        <NavLink to="/">Home</NavLink>{" "}
        <NavLink to="/pricing">Pricing</NavLink>{" "}
        <NavLink to="/contact">Contact</NavLink>{" "}
        {auth.isAuthenticated ? (
          <>
            {" "}
            <NavLink to="/app/dashboard">Dashboard</NavLink>{" "}
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            {" "}
            <NavLink to="/login">Login</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
export { Header };
