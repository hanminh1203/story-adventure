export const FLIGHT_DURATION_SECONDS = 2;
export const DETAIL_FLIGHT_DURATION_SECONDS = 1;
export const MAX_FLIGHT_HEIGHT_METERS = 3000000;
export const TARGET_SCREEN_POSITION_FROM_BOTTOM = 0.3;
export const DEFAULT_COLLECTIBLE_IMAGE = "assets/collectible-coin.svg";
export const DEFAULT_AVATAR_IMAGE = "assets/avatar-princess.svg";
export const DEBUG_COORDS = new URLSearchParams(location.search).has("debug");

export const CHARACTERS_DATA_URL =
  import.meta.env.VITE_CHARACTERS_DATA_URL;

export const CHARACTERS_CACHE_KEY = "charactersCache";

export const COLLECTIBLES_PER_SLIDE = 3;
export const COLLECTIBLE_X_EDGE_PAD = 6;
export const COLLECTIBLE_Y_MIN = 18;
export const COLLECTIBLE_Y_MAX = 78;

export const EMBED_MIN_WIDTH = 280;
export const EMBED_MIN_HEIGHT = 400;

export const CAROUSEL_MEDIA_QUERY = "(max-width: 899px)";
