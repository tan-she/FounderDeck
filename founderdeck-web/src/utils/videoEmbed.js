// founderdeck-web/src/utils/videoEmbed.js

/**
 * Detects video platform and converts share URL → embed URL.
 * Returns { type: 'youtube'|'loom'|'unknown', embedUrl, originalUrl }
 */
export function resolveVideoEmbed(url) {
  if (!url) return null;

  // ── YouTube ──────────────────────────────────────────────────────
  // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID
  const ytShort   = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  const ytWatch   = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  const ytShorts  = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  const ytEmbed   = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);

  const ytId = (ytShort || ytWatch || ytShorts || ytEmbed)?.[1];
  if (ytId) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`,
      originalUrl: url,
    };
  }

  // ── Loom ─────────────────────────────────────────────────────────
  const loom = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loom) {
    return {
      type: "loom",
      embedUrl: `https://www.loom.com/embed/${loom[1]}`,
      originalUrl: url,
    };
  }

  // ── Vimeo ────────────────────────────────────────────────────────
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
      originalUrl: url,
    };
  }

  // ── Direct video file (mp4, webm) ────────────────────────────────
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: "file", embedUrl: url, originalUrl: url };
  }

  return { type: "unknown", embedUrl: null, originalUrl: url };
}
