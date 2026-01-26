import axios from "axios";

const httpClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

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
