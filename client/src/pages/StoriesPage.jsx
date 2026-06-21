import { Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { request } from "../api/client";
import { Loader } from "../components/Loader";
import { MediaPreview } from "../components/MediaPreview";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

export function StoriesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [stories, setStories] = useState([]);
  const [expandedViewers, setExpandedViewers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  async function deleteStory(storyId) {
    if (!window.confirm("Видалити цю історію?")) return;
    try {
      await request(`/stories/${storyId}`, { method: "DELETE" });
      setStories((prev) => prev.filter((s) => s._id !== storyId));
      toast.success("Історію видалено");
    } catch (error) {
      toast.error(error.message || "Не вдалося видалити історію");
    }
  }

  function loadStories(pageToLoad = 1) {
    setLoading(true);
    request(`/stories?page=${pageToLoad}`)
      .then((response) => {
        setStories(response.stories || []);
        setPages(response.pages || 1);
        setPage(response.page || pageToLoad);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStories(1);
  }, []);

  function handlePageChange(nextPage) {
    loadStories(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleViewers(storyId) {
    setExpandedViewers((current) => (current === storyId ? null : storyId));
  }

  if (loading) {
    return (
      <main>
        <h1>Stories 24h</h1>
        <Loader label="Завантаження історій..." />
      </main>
    );
  }

  return (
    <main>
      <h1>Stories 24h</h1>
      {stories.length === 0 && (
        <p className="empty">Поки немає активних історій.</p>
      )}
      <section className="story-row">
        {stories.map((story) => {
          const isExpanded = expandedViewers === story._id;
          const viewersCount = story.viewers?.length || 0;
          const canDelete =
            !!user &&
            (String(story.author?._id) === String(user._id) ||
              user.role === "admin");
          return (
            <div className="story glass" key={story._id}>
              <div className="story-media">
                <MediaPreview item={story.media} />
              </div>
              <b>{story.author?.name}</b>
              <p>{story.caption}</p>

              <div className="story-row-actions">
                <button
                  type="button"
                  className="story-views-toggle"
                  onClick={() => toggleViewers(story._id)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? "Сховати список глядачів"
                      : "Показати список глядачів"
                  }
                >
                  <Eye size={14} /> {viewersCount}
                </button>
                {canDelete && (
                  <button
                    type="button"
                    className="story-delete"
                    onClick={() => deleteStory(story._id)}
                    aria-label="Видалити історію"
                    title="Видалити"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {viewersCount > 0 && (
                <ul
                  className={`story-viewers${isExpanded ? " is-open" : ""}`}
                  aria-hidden={!isExpanded}
                >
                  {story.viewers.map((viewer) => (
                    <li key={viewer._id}>
                      <span className="story-viewer-avatar">
                        {viewer.name?.[0]?.toUpperCase() || "?"}
                      </span>
                      <span className="story-viewer-name">{viewer.name}</span>
                    </li>
                  ))}
                </ul>
              )}

              {viewersCount === 0 && (
                <p
                  className={`story-viewers-empty${isExpanded ? " is-open" : ""}`}
                  aria-hidden={!isExpanded}
                >
                  Ніхто ще не переглянув
                </p>
              )}
            </div>
          );
        })}
      </section>

      <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
    </main>
  );
}
