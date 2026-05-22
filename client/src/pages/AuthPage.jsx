import { useState } from "react";
import { useAuth } from "../store/auth";
import { VIEWS } from "../constants/views";

export function AuthPage({ onViewChange }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const auth = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await auth.login(form.email, form.password);
      } else {
        await auth.register(form.name, form.email, form.password);
      }

      onViewChange(VIEWS.FEED);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <section className="auth-card glass">
      <h1>{mode === "login" ? "Вхід у платформу" : "Повна реєстрація"}</h1>
      <p>
        JWT-авторизація, захищені маршрути, ролі користувача та адміністратора.
      </p>

      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <input
            required
            autoComplete="name"
            placeholder="Ім’я"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        )}

        <input
          required
          type="email"
          autoComplete="email"
          placeholder="Email"
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
        />

        <input
          required
          minLength="6"
          placeholder="Пароль"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
        />

        {error && <b className="error">{error}</b>}

        <button className="primary full">
          {mode === "login" ? "Увійти" : "Створити акаунт"}
        </button>
      </form>

      <button
        className="link"
        onClick={() =>
          setMode((prev) => (prev === "login" ? "register" : "login"))
        }
      >
        {mode === "login"
          ? "Немає акаунта? Зареєструватися"
          : "Вже є акаунт? Увійти"}
      </button>
    </section>
  );
}
