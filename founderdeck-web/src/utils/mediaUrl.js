const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Resolves any stored file path into a full publicly accessible URL.
 * Handles: Google avatar URLs, Laravel storage paths, already-full URLs, null
 */
export function mediaUrl(path) {
  if (!path) return null;

  // Already a full URL (Google avatar, external link, blob preview)
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }

  // Strip accidental leading slash to avoid double slashes
  const clean = path.replace(/^\//, "");

  // Laravel stores files as "avatars/filename.jpg", "videos/x.mp4", etc.
  // They're served from /storage/ after `php artisan storage:link`
  return `${API_BASE}/storage/${clean}`;
}

/**
 * Returns initials for avatar fallback
 */
export function getInitials(name = "") {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
