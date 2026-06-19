import { Flag, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { request } from "../api/client";
import { useAuth } from "../store/auth";
import { MediaPreview } from "./MediaPreview";

function getHandle(name) {
  if (!name) return "user";
  return name.toLowerCase().replace(/\s+/g, ".");
}

export function PostCard({ post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(
    !!user &&
      !!post.likes?.some((id) => String(id) === String(user._id)),
  );
  const [comments, setComments] = useState(post.comments || []);
  const [comment, setComment] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function likePost() {
    if (!user) return alert("Спочатку увійдіть");

    // Оптимістичне оновлення UI — серце фарбується миттєво, до відповіді сервера.
    const wasLiked = liked;
    const newLiked = !wasLiked;
    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));

    try {
      const response = await request(`/posts/${post._id}/like`, {
        method: "POST",
      });
      // Синхронізуємо з реальним станом сервера (на випадок розсинхрону).
      setLikes(response.likes);
      setLiked(!!response.liked);
    } catch (error) {
      // Rollback при помилці.
      setLiked(wasLiked);
      setLikes((prev) => prev - (newLiked ? 1 : -1));
      console.error("Failed to like post:", error);
    }
  }

  async function addComment() {
    if (!comment.trim()) return;

    const createdComment = await request(`/posts/${post._id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text: comment }),
    });

    setComments((prev) => [...prev, createdComment]);
    setComment("");
  }

  async function reportPost() {
    if (!user) return alert("Спочатку увійдіть");

    await request(`/posts/${post._id}/report`, {
      method: "POST",
      body: JSON.stringify({ reason: "Порушення правил" }),
    });

    alert("Скаргу відправлено");
  }

  const isAdmin = post.author?.role === "admin";

  return (
    <article className="post glass">
      <header className="post-header">
        <div className="post-author">
          <div className="post-avatar">
            {post.author?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="post-author-meta">
            <b>
              <span className="post-author-name">{post.author?.name}</span>
              {isAdmin && (
                <span className="post-badge" aria-label="Адміністратор">
                  <ShieldCheck size={12} /> admin
                </span>
              )}
            </b>
            <small>@{getHandle(post.author?.name)}</small>
          </div>
        </div>
        {post.visibility === "private" && (
          <span className="post-visibility">приватний</span>
        )}
      </header>

      {post.media?.length > 0 && (
        <div className="media">
          {post.media.map((item, idx) => (
            <MediaPreview key={idx} item={item} />
          ))}
        </div>
      )}

      <div className="post-body">
        <h3 className="post-title">{post.title}</h3>
        {post.description && (
          <p className="post-description">{post.description}</p>
        )}

        {post.tags?.length > 0 && (
          <div className="tags">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="actions">
          <button
            className={`post-like${liked ? " liked" : ""}`}
            onClick={likePost}
            aria-pressed={liked}
            aria-label={liked ? "Прибрати лайк" : "Поставити лайк"}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} /> {likes}
          </button>
          <button
            className="post-comments-toggle"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={
              expanded ? "Сховати коментарі" : "Показати коментарі"
            }
          >
            <MessageCircle size={18} /> {comments.length}
          </button>
          <button
            className="post-report"
            onClick={reportPost}
            aria-label="Поскаржитися"
          >
            <Flag size={16} />
            <span className="post-report-label">Скарга</span>
          </button>

          {comments.length > 0 ? (
            <ul
              className={`post-comments${expanded ? " is-open" : ""}`}
              aria-hidden={!expanded}
            >
              {comments.map((item) => (
                <li key={item._id}>
                  <span className="post-comment-avatar">
                    {item.author?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                  <span className="post-comment-body">
                    <b>{item.author?.name || "User"}</b>
                    <span>{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className={`post-comments-empty${expanded ? " is-open" : ""}`}
              aria-hidden={!expanded}
            >
              Поки немає коментарів
            </p>
          )}
        </div>

        {user && (
          <div className="comment">
            <input
              id={`post-${post._id}-comment`}
              name="comment"
              type="text"
              autoComplete="off"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Написати коментар..."
              onKeyDown={(event) => {
                if (event.key === "Enter") addComment();
              }}
            />
            <button
              onClick={addComment}
              disabled={!comment.trim()}
              className="primary"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
