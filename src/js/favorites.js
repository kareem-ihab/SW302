// favorites.js - favorites.html: saved laptops, remove one, clear all, total and average price.
import { fetchLaptops } from "./api.js";
import { clearFavorites, getFavoriteIds } from "./storage.js";
import { getAveragePrice, getTotalPrice } from "./stats.js";
import { formatPrice, initPage, renderCards, renderSkeletons, showMessage, updateFavoriteCount } from "./ui.js";

initPage();

const grid = document.getElementById("favorites-grid");
const summary = document.getElementById("favorites-summary");
const clearButton = document.getElementById("clear-favorites");
const compareLink = document.getElementById("go-compare");

let allLaptops = [];

// Turns the saved ids back into full laptop objects (filter keeps only saved ones).
const getSavedLaptops = () => {
  const ids = getFavoriteIds();
  return allLaptops.filter((laptop) => ids.includes(laptop.id));
};

function render() {
  const saved = getSavedLaptops();
  updateFavoriteCount();

  document.getElementById("fav-total-count").textContent = String(saved.length);
  document.getElementById("fav-total-price").textContent = formatPrice(getTotalPrice(saved));
  document.getElementById("fav-average-price").textContent = formatPrice(getAveragePrice(saved));

  clearButton.disabled = saved.length === 0;
  compareLink.classList.toggle("hidden", saved.length < 2);

  if (saved.length === 0) {
    showMessage(grid, "No favorites yet", 'Save laptops with the heart button and they will show up here. <a class="underline" href="laptops.html">Browse the catalogue</a>.');
    return;
  }
  // Removing a favorite re-renders the page, so the card, totals and header badge all update.
  renderCards(grid, saved, render);
}

async function init() {
  renderSkeletons(grid, 3);

  try {
    allLaptops = await fetchLaptops();
    summary.classList.remove("hidden");
    render();
  } catch (error) {
    showMessage(grid, "Something went wrong", error.message, "error");
  }
}

clearButton.addEventListener("click", () => {
  if (getFavoriteIds().length === 0) return;
  if (window.confirm("Remove all saved laptops?")) {
    clearFavorites();
    render();
  }
});

init();
