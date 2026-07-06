import { CHARACTERS_DATA_URL, CHARACTERS_CACHE_KEY } from "../constants";
import { splitCell, sanitizeMediaUrl } from "./media";

export function normalizeCharacters(data) {
  return (data.characters || []).map((character) => ({
    ...character,
    avatarUrl: sanitizeMediaUrl(character.avatarUrl),
    collectibleImage: sanitizeMediaUrl(character.collectibleImage),
    locations: (character.locations || []).map((location) => {
      const images = Array.isArray(location.images)
        ? location.images
        : splitCell(location.images);
      return {
        ...location,
        lat: Number(location.lat),
        lon: Number(location.lon),
        height: Number(location.height),
        images: images.map(sanitizeMediaUrl).filter(Boolean),
      };
    }),
  }));
}

export async function loadCharacters() {
  if (!CHARACTERS_DATA_URL) {
    throw new Error(
      "Missing VITE_CHARACTERS_DATA_URL. Create a root .env with VITE_CHARACTERS_DATA_URL=... (or set the GitHub Actions secret CHARACTERS_DATA_URL)."
    );
  }
  const response = await fetch(CHARACTERS_DATA_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to load characters (${response.status})`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  const characters = normalizeCharacters(data);
  try {
    localStorage.setItem(CHARACTERS_CACHE_KEY, JSON.stringify(characters));
  } catch {
    // localStorage may be unavailable in some embed contexts
  }
  return characters;
}

export function loadCharactersFromCache() {
  try {
    const cached = localStorage.getItem(CHARACTERS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore cache parse errors
  }
  return [];
}
