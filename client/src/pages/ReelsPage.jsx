import { Film, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { mediaBase, request } from "../api/client";
import { useAuth } from "../store/auth";

export function ReelsPage() {
  const [reels, setReels] = useState([]);
  const { user } = useAuth();

  async function loadReels() {
    const response = await request("/reels");
    setReels(response.reels);
  }

  useEffect(() => {
    loadReels();
  }, []);

  async function likeReel(id) {
    if (!user) return alert("Спочатку увійдіть");
    await request(`/reels/${id}/like`, { method: "POST" });
    loadReels();
  }

  return (
    <main>
      <h1>
        <Film /> Reels
      </h1>
      <section className="reels">
        {reels.map((reel) => (
          <article className="reel glass" key={reel._id}>
            <video src={mediaBase + reel.video.url} controls loop />
            <div>
              <b>{reel.title}</b>
              <p>{reel.description}</p>
              <small>@{reel.author?.name}</small>
              <button onClick={() => likeReel(reel._id)}>
                <Heart size={18} /> {reel.likes?.length || 0}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
