import { http, HttpResponse, delay } from "msw";
import { AUTH_USERS } from "../fixtures/auth-users.js";

const SESSION_STORAGE_KEY = "orixium.mock.session";

// Persist a lightweight session to simulate server state in dev.
function setSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function respondNotAuthenticated() {
  return HttpResponse.json({ message: "Not authenticated" }, { status: 401 });
}

function getSessionUser() {
  const session = getSession();
  if (!session) return null;
  const user = AUTH_USERS.find((item) => {
    return item.id === session.userId;
  });
  if (!user) {
    clearSession();
    return null;
  }
  return { session, user };
}

// Strip sensitive fields (password) from responses.
function safeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const authHandlers = [
  // POST /api/auth/login
  http.post("/api/auth/login", async ({ request }) => {
    await delay(300);

    const body = await request.json().catch(() => {
      return null;
    });

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(body?.password || "");

    const matchedUser = AUTH_USERS.find((item) => {
      return item.email === email && item.password === password;
    });

    if (!matchedUser) {
      return HttpResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const session = {
      sessionId:
        "sess_" +
        (crypto?.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 10)),
      userId: matchedUser.id,
      createdAt: new Date().toISOString(),
    };

    setSession(session);

    return HttpResponse.json({
      user: safeUser(matchedUser),
      sessionId: session.sessionId,
    });
  }),

  // GET /api/auth/me
  http.get("/api/auth/me", async () => {
    await delay(150);

    const sessionUser = getSessionUser();
    if (!sessionUser) return respondNotAuthenticated();

    return HttpResponse.json({
      user: safeUser(sessionUser.user),
      sessionId: sessionUser.session.sessionId,
    });
  }),

  // POST /api/auth/logout
  http.post("/api/auth/logout", async () => {
    await delay(150);
    clearSession();
    return HttpResponse.json({ ok: true });
  }),
];

