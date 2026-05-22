import { ShieldCheck, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { request } from "../api/client";

export function AdminPage() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);

  async function loadDashboard() {
    request("/admin/stats").then(setStats);
    request("/admin/reports").then(setReports);
    request("/admin/users").then((response) => setUsers(response.users));
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function toggleBlockUser(id, isBlocked) {
    await request(`/admin/users/${id}/block`, {
      method: "PATCH",
      body: JSON.stringify({ isBlocked }),
    });

    loadDashboard();
  }

  async function hidePost(id) {
    await request(`/admin/posts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "hidden" }),
    });

    loadDashboard();
  }

  return (
    <section className="admin">
      <h1>
        <ShieldCheck /> Admin dashboard
      </h1>

      <div className="stat-grid">
        {stats &&
          Object.entries(stats).map(([key, value]) => (
            <div className="stat glass" key={key}>
              <b>{value}</b>
              <span>{key}</span>
            </div>
          ))}
      </div>

      <h2>Скарги на контент</h2>
      {reports.map((post) => (
        <div className="report glass" key={post._id}>
          <b>{post.title}</b>
          <span>{post.reports.length} скарг</span>
          <button onClick={() => hidePost(post._id)}>
            <Trash2 size={16} /> Приховати
          </button>
        </div>
      ))}

      <h2>
        <Users /> Користувачі
      </h2>
      {users.map((item) => (
        <div className="report glass" key={item._id}>
          <b>{item.name}</b>
          <span>
            {item.email} • {item.role}
          </span>
          <button onClick={() => toggleBlockUser(item._id, !item.isBlocked)}>
            {item.isBlocked ? "Розблокувати" : "Заблокувати"}
          </button>
        </div>
      ))}
    </section>
  );
}
