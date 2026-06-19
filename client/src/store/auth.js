import { create } from "zustand";
import { request } from "../api/client";
import { useToast } from "./toast";

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
  // 1. Свіжий вибір на цьому пристрої (localStorage.theme) має пріоритет —
  //    він оновлюється при кожному кліку на toggle. localStorage.user.theme —
  //    лише snapshot з моменту логіну, тому використовуємо його як fallback.
  const stored = readStoredTheme();
  if (stored) return stored;

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

    // Тримаємо localStorage.user.theme у синхроні зі свіжим вибором,
    // щоб resolveInitialTheme отримував той самий snapshot після перезавантаження.
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.theme !== next) {
          parsed.theme = next;
          localStorage.setItem("user", JSON.stringify(parsed));
          set({ user: parsed });
        }
      }
    } catch {}

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
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
      await syncThemeAfterAuth(get, set, data.user);
      useToast.getState().success(`З поверненням, ${data.user.name}!`);
    } catch (error) {
      useToast.getState().error(error.message || "Не вдалося увійти");
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
      await syncThemeAfterAuth(get, set, data.user);
      useToast.getState().success(`Акаунт створено. Вітаємо, ${data.user.name}!`);
    } catch (error) {
      useToast.getState().error(error.message || "Не вдалося зареєструватися");
      throw error;
    }
  },

  logout: () => {
    const previousName = get().user?.name;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
    useToast
      .getState()
      .info(
        previousName
          ? `До зустрічі, ${previousName}!`
          : "Ви вийшли з акаунту",
      );
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
