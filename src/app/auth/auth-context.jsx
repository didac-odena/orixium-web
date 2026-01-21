import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../../services/index.js";

const AuthContext = createContext(null);

export function AuthProvider(props) {
  const children = props.children;

  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function () {
    // Bootstrap auth state from storage via the service layer.
    const existingUser = authService.getUser();
    setUser(existingUser);
    setIsInitializing(false);
  }, []);

  async function login(credentials) {
    setError(null);
    try {
      // Service handles API call + persistence of the session user.
      const currentUser = await authService.login(credentials);
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
      await authService.logout();
      setUser(null);
      return true;
    } catch (e) {
      console.error("[AuthContext] logout failed", e);
      setError(e);
      throw e;
    }
  }

  const isAuthenticated = Boolean(user);

  // Memoize context value to avoid unnecessary re-renders.
  const value = useMemo(
    function () {
      return {
        user: user,
        isAuthenticated: isAuthenticated,
        isInitializing: isInitializing,
        error: error,
        login: login,
        logout: logout,
      };
    },
    [user, isAuthenticated, isInitializing, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
