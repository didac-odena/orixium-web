import { httpClient } from "./http-client.js";

export async function postLogin(credentials) {
  const response = await httpClient.post("/auth/login", {
    email: String(credentials?.email || ""),
    password: String(credentials?.password || ""),
  });
  return response.data; // { user, sessionId }
}

export async function postLogout() {
  const response = await httpClient.post("/auth/logout");
  return response.data; // { ok: true }
}
