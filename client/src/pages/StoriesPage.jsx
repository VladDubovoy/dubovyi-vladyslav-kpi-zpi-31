import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { request } from "../api/client";
import { MediaPreview } from "../components/MediaPreview";

export function StoriesPage() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    request("/stories").then((response) => setStories(response.stories));
  }, []);

  return (
    <main>
      <h1>Stories 24h</h1>
      <section className="story-row">
        {stories.map((story) => (
          <div className="story glass" key={story._id}>
            <div className="story-media">
              <MediaPreview item={story.media} />
            </div>
            <b>{story.author?.name}</b>
            <p>{story.caption}</p>
            <small>
              <Eye size={14} /> {story.viewers?.length || 0}
            </small>
          </div>
        ))}
      </section>
    </main>
  );
}
