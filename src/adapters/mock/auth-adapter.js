import { httpClient } from "./http-client.js";

export async function postLogin(credentials) {
  const res = await httpClient.post("/auth/login", {
    email: String(credentials?.email || ""),
    password: String(credentials?.password || ""),
  });
  return res.data; // { user, sessionId }
}

export async function postLogout() {
  const res = await httpClient.post("/auth/logout");
  return res.data; // { ok: true }
}

export async function getMe() {
  const res = await httpClient.get("/auth/me");
  return res.data; // { user, sessionId }
}
