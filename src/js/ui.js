// ui.js - shared interface helpers: theme, navigation, laptop cards, skeletons and messages.
import { THEMES, getTheme, saveTheme, getFavoriteIds, isFavorite, toggleFavorite } from "./storage.js";

/* ---------- Formatting ---------- */

export const formatPrice = (price) => `$${price.toLocaleString("en-US")}`;

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/* ---------- Theme ---------- */

const THEME_LABELS = {
  [THEMES.SAVER]: "Battery Saver",
  [THEMES.PERFORMANCE]: "Performance"
};

// Applies a theme by setting data-theme on <html>; the CSS variables in input.css do the rest.
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const label = document.getElementById("theme-label");
  const button = document.getElementById("theme-toggle");
  if (label) label.textContent = THEME_LABELS[theme];
  if (button) button.setAttribute("aria-pressed", String(theme === THEMES.PERFORMANCE));
}

// Restores the saved theme on page load and wires the header switch.
// The choice lives in localStorage, so every page reads the same value after navigation or reload.
export function initTheme() {
  applyTheme(getTheme());

  const button = document.getElementById("theme-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const next = getTheme() === THEMES.SAVER ? THEMES.PERFORMANCE : THEMES.SAVER;
    saveTheme(next);
    applyTheme(next);
  });
}

/* ---------- Navigation ---------- */

// Collapsible menu for small screens (the md: classes keep it open on larger screens).
export function initNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isHidden = menu.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!isHidden));
  });
}

// Shows how many laptops are saved, in the header of every page.
export function updateFavoriteCount() {
  const badge = document.getElementById("fav-count");
  if (badge) badge.textContent = String(getFavoriteIds().length);
}

// One call that every page makes first: theme, menu and favorite badge.
export function initPage() {
  initTheme();
  initNav();
  updateFavoriteCount();
}

/* ---------- Messages ---------- */

// Fills a container with a friendly message (empty state, no results, error).
export function showMessage(container, title, text, tone = "info") {
  const colour = tone === "error" ? "border-red-500/60" : "border-app-border";
  container.innerHTML = `
    <div class="col-span-full rounded-2xl border ${colour} bg-app-surface p-8 text-center" role="${tone === "error" ? "alert" : "status"}">
      <p class="text-lg font-semibold">${title}</p>
      <p class="mt-2 text-app-muted">${text}</p>
    </div>`;
}

/* ---------- Laptop card (reused on home, catalogue and favorites) ---------- */

const heartIcon = (filled) => `
  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 21s-7-4.6-9.3-9.1C1.1 8.7 2.9 5 6.4 5c2 0 3.4 1.1 4.1 2.2h3C14.2 6.1 15.6 5 17.6 5c3.5 0 5.3 3.7 3.7 6.9C19 16.4 12 21 12 21z"/>
  </svg>`;

// Keeps one favorite button's look and accessible text in sync with the saved state.
function paintFavoriteButton(button, saved) {
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute("aria-label", saved ? "Remove from favorites" : "Add to favorites");
  button.innerHTML = `${heartIcon(saved)}<span>${saved ? "Saved" : "Save"}</span>`;
}

// Builds one laptop card. onFavoriteChange(laptopId, isNowFavorite) lets a page react (e.g. remove the card).
export function createLaptopCard(laptop, onFavoriteChange = () => {}) {
  const card = document.createElement("article");
  card.className = "laptop-card";
  card.dataset.id = laptop.id;

  card.innerHTML = `
    <a href="details.html?id=${laptop.id}" class="block aspect-[10/7] overflow-hidden bg-app-bg focus:outline-none">
      <img src="${laptop.image}" alt="${laptop.name} laptop" loading="lazy"
           class="h-full w-full object-cover transition duration-300 hover:scale-105" />
    </a>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-app-muted">${laptop.brand}</p>
        <h3 class="text-lg font-bold leading-tight">
          <a href="details.html?id=${laptop.id}" class="hover:text-app-accent focus:outline-none focus-visible:underline">${laptop.name}</a>
        </h3>
      </div>
      <p class="text-2xl font-extrabold text-app-accent">${formatPrice(laptop.price)}</p>
      <ul class="flex flex-wrap gap-2">
        <li class="spec-chip">${capitalize(laptop.category)}</li>
        <li class="spec-chip">${laptop.ramGB} GB RAM</li>
        <li class="spec-chip">${laptop.storageGB} GB SSD</li>
        <li class="spec-chip">${laptop.batteryHours} h battery</li>
        <li class="spec-chip">${laptop.weightKg} kg</li>
      </ul>
      <div class="mt-auto flex gap-2 pt-2">
        <a href="details.html?id=${laptop.id}" class="btn-ghost flex-1">Details</a>
        <button type="button" class="btn-action flex-1" data-role="favorite"></button>
      </div>
    </div>`;

  const favoriteButton = card.querySelector('[data-role="favorite"]');
  paintFavoriteButton(favoriteButton, isFavorite(laptop.id));

  favoriteButton.addEventListener("click", () => {
    const saved = toggleFavorite(laptop.id);
    paintFavoriteButton(favoriteButton, saved);
    updateFavoriteCount();
    onFavoriteChange(laptop.id, saved);
  });

  return card;
}

// Renders a list of laptops into a grid with map() + the shared card builder.
export function renderCards(container, laptops, onFavoriteChange) {
  container.replaceChildren(...laptops.map((laptop) => createLaptopCard(laptop, onFavoriteChange)));
}

/* ---------- Loading skeleton (same shape as a laptop card) ---------- */

export function renderSkeletons(container, count = 6) {
  const skeleton = () => `
    <div class="laptop-card animate-pulse" aria-hidden="true">
      <div class="aspect-[10/7] bg-app-border"></div>
      <div class="flex flex-1 flex-col gap-3 p-4">
        <div class="h-3 w-1/4 rounded bg-app-border"></div>
        <div class="h-5 w-3/4 rounded bg-app-border"></div>
        <div class="h-7 w-1/3 rounded bg-app-border"></div>
        <div class="flex gap-2">
          <div class="h-5 w-16 rounded-full bg-app-border"></div>
          <div class="h-5 w-16 rounded-full bg-app-border"></div>
          <div class="h-5 w-16 rounded-full bg-app-border"></div>
        </div>
        <div class="mt-auto flex gap-2 pt-2">
          <div class="h-9 flex-1 rounded-lg bg-app-border"></div>
          <div class="h-9 flex-1 rounded-lg bg-app-border"></div>
        </div>
      </div>
    </div>`;

  container.innerHTML = Array.from({ length: count }, skeleton).join("");
}
