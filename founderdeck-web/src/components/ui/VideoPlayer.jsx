import { resolveVideoEmbed } from "../../utils/videoEmbed";
import { mediaUrl } from "../../utils/mediaUrl";

export default function VideoPlayer({ src }) {
  if (!src) {
    return (
      <div className="rounded-xl bg-gray-100 flex items-center justify-center h-48 text-gray-400 text-sm">
        No elevator pitch video uploaded.
      </div>
    );
  }

  const video = resolveVideoEmbed(src);

  // YouTube / Loom / Vimeo → iframe embed
  if (video?.type !== "file" && video?.embedUrl) {
    return (
      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <iframe
          src={video.embedUrl}
          title="Elevator Pitch"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          style={{ border: "none" }}
        />
      </div>
    );
  }

  // Direct file (mp4 stored in Laravel storage)
  if (video?.type === "file") {
    return (
      <div className="rounded-xl overflow-hidden bg-black">
        <video controls className="w-full" preload="metadata">
          <source src={mediaUrl(video.embedUrl)} type="video/mp4" />
          <source src={mediaUrl(video.embedUrl)} type="video/webm" />
          Your browser doesn't support video playback.
        </video>
      </div>
    );
  }

  // Unrecognised URL
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
      Unrecognised video URL. Supported: YouTube, Loom, Vimeo, or direct .mp4 links.
      <a href={src} target="_blank" rel="noreferrer" className="ml-2 text-orange-500 underline">
        Open link ↗
      </a>
    </div>
  );
}
