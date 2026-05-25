import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { request } from "../api/client";
import { useAuth } from "../store/auth";
import { MediaPreview } from "./MediaPreview";

export function PostCard({ post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [comment, setComment] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function likePost() {
    if (!user) return alert("Спочатку увійдіть");
    const response = await request(`/posts/${post._id}/like`, {
      method: "POST",
    });
    setLikes(response.likes);
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

  return (
    <article className="post glass">
      <div className="media">
        <MediaPreview item={post.media?.[0]} />
      </div>

      <div className="post-body">
        <div className="author">
          <div className="avatar">{post.author?.name?.[0]}</div>
          <span>{post.author?.name}</span>
        </div>

        <h3>{post.title}</h3>
        <p>{post.description}</p>

        <div className="tags">
          {post.tags?.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        <div className="actions">
          <button onClick={likePost}>
            <Heart size={18} /> {likes}
          </button>
          <button
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <MessageCircle size={18} /> {comments.length}
          </button>
          <button onClick={reportPost}>Скарга</button>
        </div>

        {(expanded ? comments : comments.slice(-3)).map((item) => (
          <small className="mini" key={item._id}>
            <b>{item.author?.name || "User"}:</b> {item.text}
          </small>
        ))}

        {user && (
          <div className="comment">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Коментар..."
            />
            <button onClick={addComment}>OK</button>
          </div>
        )}
      </div>
    </article>
  );
}
