import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Bootstrap auth state from storage via the service layer.
    const existingUser = AuthService.getUser();
    setUser(existingUser);
    setIsInitializing(false);
  }, []);

  async function login(credentials) {
    setError(null);
    try {
      // Service handles API call + persistence of the session user.
      const currentUser = await AuthService.login(credentials);
      setUser(currentUser);
      return currentUser;
    } catch (e) {
      console.error("[AuthContext] login failed", e);
      setUser(null);
      setError(e);
      throw e;
    }
  }

  async function logout() {
    setError(null);
    try {
      // Clear session on both server and local storage.
      navigate("/", { replace: true });
      await AuthService.logout();
      setUser(null);
      return true;
    } catch (e) {
      console.error("[AuthContext] logout failed", e);
      setError(e);
      throw e;
    }
  }

  const isAuthenticated = Boolean(user);

  const value = {
    user: user,
    isAuthenticated: isAuthenticated,
    isInitializing: isInitializing,
    error: error,
    login: login,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

