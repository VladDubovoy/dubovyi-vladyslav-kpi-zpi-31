import { create } from "zustand";
import { request } from "../api/client";

function readStoredTheme() {
  try {
    const value = localStorage.getItem("theme");
    if (value === "light" || value === "dark") return value;
  } catch {}
  return null;
}

function systemTheme() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function resolveInitialTheme() {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  if (storedUser?.theme === "light" || storedUser?.theme === "dark") {
    return storedUser.theme;
  }
  const stored = readStoredTheme();
  if (stored) return stored;
  return systemTheme();
}

function applyTheme(theme) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

const initialTheme = resolveInitialTheme();
applyTheme(initialTheme);

export const useAuth = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  theme: initialTheme,

  setTheme: async (next) => {
    if (next !== "light" && next !== "dark") return;
    set({ theme: next });
    applyTheme(next);
    if (get().token) {
      try {
        await request("/users/me/theme", {
          method: "PATCH",
          body: JSON.stringify({ theme: next }),
        });
      } catch (error) {
        console.error("Failed to persist theme:", error);
      }
    }
  },

  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    await syncThemeAfterAuth(get, set, data.user);
  },

  register: async (name, email, password) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    await syncThemeAfterAuth(get, set, data.user);
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

async function syncThemeAfterAuth(get, set, user) {
  const localChoice = readStoredTheme();
  const dbTheme = user?.theme === "dark" ? "dark" : "light";
  if (localChoice && localChoice !== dbTheme) {
    await get().setTheme(localChoice);
  } else if (dbTheme !== get().theme) {
    set({ theme: dbTheme });
    applyTheme(dbTheme);
  }
}
