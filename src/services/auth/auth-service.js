import * as authAdapter from "../../adapters/mock/auth-adapter.js";

const STORAGE_KEY = "orixium.auth.user";

function writeUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("[AuthService] writeUser failed", error);
  }
}

function readUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // Validate the minimal shape expected by the app.
    if (!parsed.id || !parsed.email || !parsed.role || !parsed.sessionId) return null;

    return parsed;
  } catch (error) {
    console.error("[AuthService] readUser failed", error);
    return null;
  }
}

function clearUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[AuthService] clearUser failed", error);
  }
}

export function getUser() {
  // Returns cached user or null if missing/invalid.
  return readUser();
}

export async function login(credentials) {
  try {
    const loginResponse = await authAdapter.postLogin(credentials);

    const user = loginResponse?.user || null;
    const sessionId = String(loginResponse?.sessionId || "");
    if (!user || !sessionId) throw new Error("Login failed");

    // Normalize + persist the session user shape.
    const sessionUser = {
      id: String(user.id),
      email: String(user.email),
      role: String(user.role),
      createdAt: String(user.createdAt),
      sessionId: sessionId,
    };

    writeUser(sessionUser);
    return sessionUser;
  } catch (e) {
    console.error("[AuthService] login failed", e);
    clearUser();
    const message = e?.response?.data?.message || e?.message || "Login failed";
    throw new Error(message);
  }
}

export async function logout() {
  try {
    await authAdapter.postLogout();
    clearUser();
    return true;
  } catch (e) {
    console.error("[AuthService] logout failed", e);
    const message = e?.response?.data?.message || e?.message || "Logout failed";
    throw new Error(message);
  }
}
