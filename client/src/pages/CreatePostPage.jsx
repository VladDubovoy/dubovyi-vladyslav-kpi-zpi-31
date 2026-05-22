import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { request } from "../api/client";
import { VIEWS } from "../constants/views";

export function CreatePostPage({ onViewChange }) {
  const [type, setType] = useState("post");
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    caption: "",
    visibility: "public",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        payload.append(key, value),
      );

      if (type === "post") {
        [...files].forEach((file) => payload.append("media", file));
        await request("/posts", { method: "POST", body: payload });
        onViewChange(VIEWS.FEED);
      }

      if (type === "story") {
        payload.append("media", files[0]);
        await request("/stories", { method: "POST", body: payload });
        onViewChange(VIEWS.STORIES);
      }

      if (type === "reel") {
        payload.append("video", files[0]);
        await request("/reels", { method: "POST", body: payload });
        onViewChange(VIEWS.REELS);
      }
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <section className="editor glass">
      <h1>
        <UploadCloud /> Створення контенту
      </h1>

      <div className="tabs">
        <button
          className={type === "post" ? "active" : ""}
          onClick={() => setType("post")}
        >
          Пост
        </button>
        <button
          className={type === "story" ? "active" : ""}
          onClick={() => setType("story")}
        >
          Story
        </button>
        <button
          className={type === "reel" ? "active" : ""}
          onClick={() => setType("reel")}
        >
          Reel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {type !== "story" && (
          <input
            required
            placeholder="Назва"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        )}

        <textarea
          placeholder={type === "story" ? "Підпис до story" : "Опис"}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              description: event.target.value,
              caption: event.target.value,
            }))
          }
        />

        {type !== "story" && (
          <input
            placeholder="Теги через кому"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tags: event.target.value }))
            }
          />
        )}

        <input
          required
          type="file"
          multiple={type === "post"}
          accept={
            type === "reel"
              ? "video/*"
              : type === "story"
                ? "image/*,video/*"
                : "image/*,video/*,audio/*,.pdf"
          }
          onChange={(event) => setFiles(event.target.files)}
        />

        {error && <b className="error">{error}</b>}
        <button className="primary">Опублікувати</button>
      </form>
    </section>
  );
}
