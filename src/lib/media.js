export function splitCell(value) {
  return String(value || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isSafeMediaUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("assets/") || trimmed.startsWith("./assets/")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed, window.location.href);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function sanitizeMediaUrl(url) {
  return isSafeMediaUrl(url) ? url.trim() : "";
}

export function extractYouTubeId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw, window.location.href);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return url.pathname.slice(1, 12);
    }
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const match = url.pathname.match(/\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/);
      if (match) return match[1];
    }
  } catch {
    /* not a parseable URL */
  }
  const fallback = raw.match(/[A-Za-z0-9_-]{11}/);
  return fallback ? fallback[0] : "";
}

export function getYouTubeEmbedUrl(character) {
  const id = extractYouTubeId(character?.youtubeUrl);
  return id ? `https://www.youtube.com/embed/${id}` : "";
}
