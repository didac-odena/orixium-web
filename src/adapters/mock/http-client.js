import axios from "axios";

export const httpClient = axios.create({
  // All mock API routes are served under /api.
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});
