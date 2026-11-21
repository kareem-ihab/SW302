// storage.js - the only file that touches localStorage (favorites, compare picks, theme).

const FAVORITES_KEY = "laptopFinder.favorites";
const COMPARE_KEY = "laptopFinder.compare";
const THEME_KEY = "laptopFinder.theme";

export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

// Read a JSON array from localStorage; fall back to [] if it is missing or corrupted.
const readList = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeList = (key, list) => {
  localStorage.setItem(key, JSON.stringify(list));
};

/* ---------- Favorites (array of laptop ids) ---------- */

export const getFavoriteIds = () => readList(FAVORITES_KEY);

export const isFavorite = (id) => getFavoriteIds().includes(id);

// Adds the id if it is missing, removes it if present. Returns true when it is now a favorite.
export function toggleFavorite(id) {
  const ids = getFavoriteIds();
  const isSaved = ids.includes(id);
  const updated = isSaved ? ids.filter((savedId) => savedId !== id) : [...ids, id];
  writeList(FAVORITES_KEY, updated);

  // A laptop that is no longer a favorite cannot stay in the comparison.
  if (isSaved) removeFromCompare(id);
  return !isSaved;
}

export function addFavorite(id) {
  const ids = getFavoriteIds();
  if (!ids.includes(id)) writeList(FAVORITES_KEY, [...ids, id]);
}

export function clearFavorites() {
  writeList(FAVORITES_KEY, []);
  writeList(COMPARE_KEY, []);
}

/* ---------- Comparison selection (subset of favorites, max 4) ---------- */

export const getCompareIds = () => {
  // Keep only ids that are still favorites, so the two lists never disagree.
  const favorites = getFavoriteIds();
  return readList(COMPARE_KEY).filter((id) => favorites.includes(id));
};

// Returns { ok, reason } so the page can show a message when the fifth laptop is blocked.
export function addToCompare(id) {
  const ids = getCompareIds();
  if (ids.includes(id)) return { ok: true };
  if (ids.length >= MAX_COMPARE) {
    return { ok: false, reason: `You can compare at most ${MAX_COMPARE} laptops. Remove one first.` };
  }
  writeList(COMPARE_KEY, [...ids, id]);
  return { ok: true };
}

export function removeFromCompare(id) {
  writeList(COMPARE_KEY, readList(COMPARE_KEY).filter((savedId) => savedId !== id));
}

/* ---------- Theme ---------- */

export const THEMES = { SAVER: "saver", PERFORMANCE: "performance" };

export const getTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === THEMES.PERFORMANCE ? THEMES.PERFORMANCE : THEMES.SAVER;
};

export const saveTheme = (theme) => localStorage.setItem(THEME_KEY, theme);
