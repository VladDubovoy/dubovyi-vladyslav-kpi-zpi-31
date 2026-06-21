import { Film, Heart, MessageCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { request, resolveMediaUrl } from "../api/client";
import { Loader } from "../components/Loader";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

export function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { user } = useAuth();
  const toast = useToast();

  async function deleteReel(reelId) {
    if (!window.confirm("Видалити цей reel?")) return;
    try {
      await request(`/reels/${reelId}`, { method: "DELETE" });
      setReels((prev) => prev.filter((r) => r._id !== reelId));
      toast.success("Reel видалено");
    } catch (error) {
      toast.error(error.message || "Не вдалося видалити reel");
    }
  }

  async function loadReels(pageToLoad = 1) {
    setLoading(true);
    try {
      const response = await request(`/reels?page=${pageToLoad}`);
      setReels(response.reels || []);
      setPages(response.pages || 1);
      setPage(response.page || pageToLoad);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReels(1);
  }, []);

  function handlePageChange(nextPage) {
    loadReels(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleLikeLocally(id) {
    const userId = String(user._id);
    setReels((prev) =>
      prev.map((reel) => {
        if (reel._id !== id) return reel;
        const isLiked = reel.likes?.some(
          (likeId) => String(likeId) === userId,
        );
        return {
          ...reel,
          likes: isLiked
            ? reel.likes.filter((likeId) => String(likeId) !== userId)
            : [...(reel.likes || []), user._id],
        };
      }),
    );
  }

  async function likeReel(id) {
    if (!user) return alert("Спочатку увійдіть");

    // Оптимістично перемикаємо стан лайка локально — UI миттєво реагує.
    toggleLikeLocally(id);

    try {
      await request(`/reels/${id}/like`, { method: "POST" });
    } catch (error) {
      // Rollback — повертаємо стан, бо сервер відмовив.
      toggleLikeLocally(id);
      console.error("Failed to like reel:", error);
    }
  }

  if (loading) {
    return (
      <main>
        <h1 className="reels-header">
          <Film /> Reels
        </h1>
        <Loader label="Завантаження Reels..." />
      </main>
    );
  }

  return (
    <main>
      <h1 className="reels-header">
        <Film /> Reels
      </h1>
      <section className="reels">
        {reels.map((reel) => (
          <article className="reel glass" key={reel._id}>
            <div className="reel-video">
              <video
                src={resolveMediaUrl(reel.video.url)}
                controls
                loop
                preload="metadata"
              />
            </div>
            <div className="reel-body">
              <header className="reel-author">
                <div className="reel-avatar">
                  {reel.author?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="reel-author-meta">
                  <b>{reel.author?.name}</b>
                  <span>@{(reel.author?.name || "").toLowerCase().replace(/\s+/g, ".")}</span>
                </div>
              </header>

              <h3 className="reel-title">{reel.title}</h3>
              <p className="reel-description">{reel.description}</p>

              {reel.tags?.length > 0 && (
                <div className="reel-tags">
                  {reel.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className="reel-actions">
                {(() => {
                  const isLiked =
                    !!user &&
                    reel.likes?.some(
                      (id) => String(id) === String(user._id),
                    );
                  const canDelete =
                    !!user &&
                    (String(reel.author?._id) === String(user._id) ||
                      user.role === "admin");
                  return (
                    <>
                      <button
                        className={`reel-like${isLiked ? " liked" : ""}`}
                        onClick={() => likeReel(reel._id)}
                        aria-pressed={isLiked}
                        aria-label={
                          isLiked ? "Прибрати лайк" : "Поставити лайк"
                        }
                      >
                        <Heart
                          size={18}
                          fill={isLiked ? "currentColor" : "none"}
                        />{" "}
                        {reel.likes?.length || 0}
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          className="reel-delete"
                          onClick={() => deleteReel(reel._id)}
                          aria-label="Видалити reel"
                          title="Видалити"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </article>
        ))}
      </section>

      {!reels.length && <p className="empty">Поки немає reels.</p>}

      <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
    </main>
  );
}
