import { PlayCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { request } from "../api/client";
import { PostCard } from "../components/PostCard";

export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  async function loadPosts() {
    const response = await request(
      `/posts?q=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}`,
    );
    setPosts(response.posts);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <main>
      <section className="hero">
        <div>
          <span className="badge">
            Web platform for shared multimedia content exchange
          </span>
          <h1>Спільний обмін мультимедійним контентом</h1>
          <p>
            Реальний upload фото/відео/аудіо/PDF, лайки, коментарі, stories,
            reels, чат, модерація та адмін-панель.
          </p>
        </div>

        <div className="hero-card">
          <PlayCircle size={52} />
          <b>Контент-хаб</b>
          <small>Фото • Відео • Аудіо • PDF • Chat</small>
        </div>
      </section>

      <div className="filters glass">
        <Search />
        <input
          placeholder="Пошук"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <input
          placeholder="Тег"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
        />
        <button onClick={loadPosts}>Знайти</button>
      </div>

      <section className="grid">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </section>

      {!posts.length && <p className="empty">Поки немає публікацій.</p>}
    </main>
  );
}
