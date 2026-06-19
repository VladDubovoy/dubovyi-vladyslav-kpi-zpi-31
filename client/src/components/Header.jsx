import { LogOut, MessageSquare, Plus, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { PATHS } from "../constants/views";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  [PATHS.FEED, "Стрічка"],
  [PATHS.STORIES, "Stories"],
  [PATHS.REELS, "Reels"],
];

function isActivePath(currentPath, targetPath) {
  if (targetPath === PATHS.FEED) return currentPath === PATHS.FEED;
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function go(path) {
    navigate(path);
  }

  function handleLogout() {
    logout();
    navigate(PATHS.FEED);
  }

  return (
    <header className="topbar">
      <div className="brand" onClick={() => go(PATHS.FEED)}>
        <div className="logo">M</div>
        <span>MediaShare Blue Pro</span>
      </div>

      <nav>
        {navItems.map(([path, label]) => (
          <button
            key={path}
            type="button"
            className={isActivePath(pathname, path) ? "active" : ""}
            onClick={() => go(path)}
          >
            {label}
          </button>
        ))}

        {user && (
          <button
            type="button"
            className={isActivePath(pathname, PATHS.CHAT) ? "active" : ""}
            onClick={() => go(PATHS.CHAT)}
          >
            <MessageSquare size={17} /> Чат
          </button>
        )}

        {user && (
          <button
            type="button"
            className={isActivePath(pathname, PATHS.CREATE) ? "active" : ""}
            onClick={() => go(PATHS.CREATE)}
          >
            <Plus size={17} /> Створити
          </button>
        )}

        {user?.role === "admin" && (
          <button
            type="button"
            className={isActivePath(pathname, PATHS.ADMIN) ? "active" : ""}
            onClick={() => go(PATHS.ADMIN)}
          >
            <ShieldCheck size={17} /> Адмін
          </button>
        )}

        <ThemeToggle />

        {!user ? (
          <button
            type="button"
            onClick={() => go(PATHS.AUTH)}
            className="primary"
          >
            Увійти
          </button>
        ) : (
          <button type="button" onClick={handleLogout}>
            <LogOut size={17} /> Вийти
          </button>
        )}
      </nav>
    </header>
  );
}
