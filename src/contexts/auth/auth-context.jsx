import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/index.js";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Bootstrap auth state from storage via the service layer.
    return AuthService.getUser();
  });
  const navigate = useNavigate();

  async function login(credentials) {
    try {
      // Service handles API call + persistence of the session user.
      const currentUser = await AuthService.login(credentials);
      setUser(currentUser);
      return currentUser;
    } catch (e) {
      console.error("[AuthContext] login failed", e);
      setUser(null);
      throw e;
    }
  }

  async function logout() {
    try {
      // Clear session on both server and local storage.
      navigate("/", { replace: true });
      await AuthService.logout();
      setUser(null);
      return true;
    } catch (e) {
      console.error("[AuthContext] logout failed", e);
      throw e;
    }
  }

  const isAuthenticated = Boolean(user);

  const authContextValue = {
    user: user,
    isAuthenticated: isAuthenticated,
    login: login,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

