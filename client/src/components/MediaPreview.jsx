import { resolveMediaUrl } from "../api/client";

export function MediaPreview({ item }) {
  if (!item) return null;

  const src = resolveMediaUrl(item.url);

  if (item.type === "image") return <img src={src} alt="media" />;
  if (item.type === "video") return <video controls src={src} />;
  if (item.type === "audio") return <audio controls src={src} />;

  return (
    <a href={src} target="_blank" rel="noreferrer">
      Відкрити файл
    </a>
  );
}
