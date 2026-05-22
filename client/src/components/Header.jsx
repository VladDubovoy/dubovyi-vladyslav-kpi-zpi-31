import { LogOut, MessageSquare, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "../store/auth";
import { VIEWS } from "../constants/views";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  [VIEWS.FEED, "Стрічка"],
  [VIEWS.STORIES, "Stories"],
  [VIEWS.REELS, "Reels"],
];

export function Header({ view, onViewChange }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="brand" onClick={() => onViewChange(VIEWS.FEED)}>
        <div className="logo">M</div>
        <span>MediaShare Blue Pro</span>
      </div>

      <nav>
        {navItems.map(([id, label]) => (
          <button
            key={id}
            className={view === id ? "active" : ""}
            onClick={() => onViewChange(id)}
          >
            {label}
          </button>
        ))}

        {user && (
          <button
            className={view === VIEWS.CHAT ? "active" : ""}
            onClick={() => onViewChange(VIEWS.CHAT)}
          >
            <MessageSquare size={17} /> Чат
          </button>
        )}

        {user && (
          <button
            className={view === VIEWS.CREATE ? "active" : ""}
            onClick={() => onViewChange(VIEWS.CREATE)}
          >
            <Plus size={17} /> Створити
          </button>
        )}

        {user?.role === "admin" && (
          <button
            className={view === VIEWS.ADMIN ? "active" : ""}
            onClick={() => onViewChange(VIEWS.ADMIN)}
          >
            <ShieldCheck size={17} /> Адмін
          </button>
        )}

        <ThemeToggle />

        {!user ? (
          <button onClick={() => onViewChange(VIEWS.AUTH)} className="primary">
            Увійти
          </button>
        ) : (
          <button onClick={logout}>
            <LogOut size={17} /> Вийти
          </button>
        )}
      </nav>
    </header>
  );
}
