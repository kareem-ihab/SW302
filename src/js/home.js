// home.js - home page: live statistics and a few featured laptops.
import { fetchLaptops } from "./api.js";
import { getFavoriteIds } from "./storage.js";
import { getBestBattery, getLowestPrice } from "./stats.js";
import { initPage, renderCards, renderSkeletons, showMessage, formatPrice, updateFavoriteCount } from "./ui.js";
import { sortLaptops } from "./filters.js";

initPage();

const featuredGrid = document.getElementById("featured-grid");
const setStat = (id, value) => {
  document.getElementById(id).textContent = value;
};

// Favorites can change while this page is open (from a featured card), so the stat is refreshed too.
const refreshFavoriteStat = () => setStat("stat-favorites", String(getFavoriteIds().length));

async function init() {
  renderSkeletons(featuredGrid, 3);
  refreshFavoriteStat();

  try {
    const laptops = await fetchLaptops();

    setStat("stat-count", String(laptops.length));
    setStat("stat-lowest", formatPrice(getLowestPrice(laptops)));
    setStat("stat-battery", `${getBestBattery(laptops)} h`);

    // Featured = the three longest-lasting batteries (sorted copy, original order untouched).
    const featured = sortLaptops(laptops, "battery-desc").slice(0, 3);
    renderCards(featuredGrid, featured, () => {
      refreshFavoriteStat();
      updateFavoriteCount();
    });
  } catch (error) {
    showMessage(featuredGrid, "Something went wrong", error.message, "error");
  }
}

init();
