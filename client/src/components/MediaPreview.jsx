import { FileText, Download } from "lucide-react";
import { resolveMediaUrl } from "../api/client";

export function MediaPreview({ item }) {
  if (!item) return null;

  const src = resolveMediaUrl(item.url);

  if (item.type === "image") {
    return <img className="media-image" src={src} alt={item.originalName || "media"} />;
  }

  if (item.type === "video") {
    return (
      <video className="media-video" controls preload="metadata" src={src} />
    );
  }

  if (item.type === "audio") {
    return (
      <div className="media-audio">
        <audio controls preload="metadata" src={src} />
        {item.originalName && (
          <span className="media-audio-name">{item.originalName}</span>
        )}
      </div>
    );
  }

  const sizeKb = item.size ? Math.round(item.size / 1024) : null;
  const name = item.originalName || "Файл";
  const ext = name.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <a
      className="media-file"
      href={src}
      target="_blank"
      rel="noreferrer"
      download={name}
    >
      <span className="media-file-icon">
        <FileText size={28} />
      </span>
      <span className="media-file-meta">
        <b>{name}</b>
        <small>
          {ext}
          {sizeKb ? ` · ${sizeKb} KB` : ""}
        </small>
      </span>
      <span className="media-file-action">
        <Download size={18} />
      </span>
    </a>
  );
}
