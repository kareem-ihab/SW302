// details.js - details.html?id=7 : one laptop with its full specification table.
import { fetchLaptopById } from "./api.js";
import { addFavorite, addToCompare, getCompareIds, isFavorite, removeFromCompare, toggleFavorite } from "./storage.js";
import { capitalize, formatPrice, initPage, showMessage, updateFavoriteCount } from "./ui.js";

initPage();

const container = document.getElementById("details");

// Every field of the laptop becomes one table row (map builds the rows).
const buildSpecRows = (laptop) =>
  [
    ["Brand", laptop.brand],
    ["Category", capitalize(laptop.category)],
    ["Processor", laptop.cpu],
    ["RAM", `${laptop.ramGB} GB`],
    ["Storage", `${laptop.storageGB} GB`],
    ["Battery life", `${laptop.batteryHours} hours`],
    ["Weight", `${laptop.weightKg} kg`],
    ["Screen size", `${laptop.screenInches} inches`],
    ["Price", formatPrice(laptop.price)]
  ]
    .map(
      ([label, value]) => `
        <tr class="border-t border-app-border first:border-t-0">
          <th scope="row" class="w-2/5 p-3 text-left font-semibold text-app-muted">${label}</th>
          <td class="p-3">${value}</td>
        </tr>`
    )
    .join("");

function render(laptop) {
  document.title = `${laptop.name} - Student Laptop Finder`;

  container.innerHTML = `
    <div class="grid gap-8 lg:grid-cols-2">
      <img src="${laptop.image}" alt="${laptop.name} laptop" class="w-full rounded-2xl border border-app-border object-cover" />
      <div class="flex flex-col gap-5">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-app-muted">${laptop.brand} &middot; ${capitalize(laptop.category)}</p>
          <h1 class="text-3xl font-extrabold sm:text-4xl">${laptop.name}</h1>
        </div>
        <p class="text-3xl font-extrabold text-app-accent">${formatPrice(laptop.price)}</p>
        <p class="text-app-muted">${laptop.description}</p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <button type="button" id="favorite-button" class="btn-action sm:flex-1"></button>
          <button type="button" id="compare-button" class="btn-ghost sm:flex-1"></button>
        </div>
        <p id="action-message" class="min-h-6 text-sm text-app-muted" role="status"></p>
      </div>
    </div>

    <section class="mt-10">
      <h2 class="mb-3 text-2xl font-bold">Full specifications</h2>
      <div class="overflow-x-auto rounded-2xl border border-app-border bg-app-surface">
        <table class="w-full text-sm sm:text-base"><tbody>${buildSpecRows(laptop)}</tbody></table>
      </div>
    </section>`;

  const favoriteButton = document.getElementById("favorite-button");
  const compareButton = document.getElementById("compare-button");
  const message = document.getElementById("action-message");

  const paintButtons = () => {
    favoriteButton.textContent = isFavorite(laptop.id) ? "Remove from favorites" : "Add to favorites";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite(laptop.id)));
    compareButton.textContent = getCompareIds().includes(laptop.id) ? "Remove from comparison" : "Add to comparison";
  };
  paintButtons();

  favoriteButton.addEventListener("click", () => {
    const saved = toggleFavorite(laptop.id);
    message.textContent = saved ? "Saved to your favorites." : "Removed from your favorites.";
    updateFavoriteCount();
    paintButtons();
  });

  compareButton.addEventListener("click", () => {
    // Only favorites can be compared, so adding to the comparison also saves the laptop.
    if (getCompareIds().includes(laptop.id)) {
      removeFromCompare(laptop.id);
      message.textContent = "Removed from the comparison.";
    } else {
      addFavorite(laptop.id);
      const result = addToCompare(laptop.id);
      message.textContent = result.ok
        ? 'Added to the comparison (and saved to favorites). Open the Compare page to see it.'
        : result.reason;
    }
    updateFavoriteCount();
    paintButtons();
  });
}

async function init() {
  // URLSearchParams reads ?id=7 from the address bar.
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!params.has("id") || Number.isNaN(id)) {
    showMessage(container, "No laptop selected", 'Pick a laptop from the <a class="underline" href="laptops.html">catalogue</a> to see its details.');
    return;
  }

  try {
    const laptop = await fetchLaptopById(id);
    if (!laptop) {
      showMessage(container, "Laptop not found", `There is no laptop with id ${params.get("id")}. Try the <a class="underline" href="laptops.html">catalogue</a>.`);
      return;
    }
    render(laptop);
  } catch (error) {
    showMessage(container, "Something went wrong", error.message, "error");
  }
}

init();
