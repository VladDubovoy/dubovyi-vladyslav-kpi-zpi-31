import { PlayCircle, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../api/client";
import { Loader } from "../components/Loader";
import { Pagination } from "../components/Pagination";
import { PostCard } from "../components/PostCard";

const DEBOUNCE_MS = 400;

export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const debounceRef = useRef(null);

  const loadPosts = useCallback(
    async (pageToLoad = 1, q = query, t = tag) => {
      setLoading(true);
      try {
        const response = await request(
          `/posts?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(t)}&page=${pageToLoad}`,
        );
        setPosts(response.posts || []);
        setPages(response.pages || 1);
        setPage(response.page || pageToLoad);
      } finally {
        setLoading(false);
      }
    },
    [query, tag],
  );

  // Дебаунс: коли користувач перестав друкувати на DEBOUNCE_MS — підтягнути нові результати.
  // Перший рендер також спрацює — отримаємо повний список через 400мс із завантажувачем.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadPosts(1, query, tag);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, tag, loadPosts]);

  function handlePageChange(nextPage) {
    loadPosts(nextPage, query, tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSearchClick() {
    // Кнопка «Знайти» — миттєвий пошук, без чекати дебаунс.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    loadPosts(1, query, tag);
  }

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
          id="feed-search"
          name="q"
          type="search"
          placeholder="Пошук"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <input
          id="feed-tag"
          className={"feed-tag"}
          name="tag"
          type="search"
          placeholder="Тег"
          autoComplete="off"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
        />
        <button onClick={handleSearchClick}>Знайти</button>
      </div>

      {loading ? (
        <Loader label="Завантаження публікацій..." />
      ) : (
        <>
          <section className="grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </section>

          {!posts.length && <p className="empty">Поки немає публікацій.</p>}

          <Pagination
            page={page}
            pages={pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
}
