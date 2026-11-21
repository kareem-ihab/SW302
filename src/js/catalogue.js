// catalogue.js - laptops.html: live search, filters, sorting, result count.
import { fetchLaptops } from "./api.js";
import { filterLaptops, sortLaptops } from "./filters.js";
import { capitalize, initPage, renderCards, renderSkeletons, showMessage, formatPrice } from "./ui.js";

initPage();

const grid = document.getElementById("laptop-grid");
const resultCount = document.getElementById("result-count");
const controls = {
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  price: document.getElementById("max-price"),
  priceLabel: document.getElementById("max-price-label"),
  ram: document.getElementById("min-ram"),
  sort: document.getElementById("sort"),
  reset: document.getElementById("reset-filters")
};

let allLaptops = [];

// Reads the current control values into one object that filterLaptops understands.
const readFilters = () => ({
  query: controls.search.value,
  category: controls.category.value,
  maxPrice: Number(controls.price.value),
  minRam: Number(controls.ram.value)
});

// Filters, sorts, then draws. Runs on every input so everything updates while typing.
function update() {
  controls.priceLabel.textContent = formatPrice(Number(controls.price.value));

  const filtered = filterLaptops(allLaptops, readFilters());
  const visible = sortLaptops(filtered, controls.sort.value);

  resultCount.textContent = `${visible.length} of ${allLaptops.length} laptops`;

  if (visible.length === 0) {
    showMessage(grid, "No laptops match your filters", "Try a different search, raise the maximum price or reset the filters.");
    return;
  }
  renderCards(grid, visible);
}

function resetFilters() {
  controls.search.value = "";
  controls.category.value = "all";
  controls.price.value = controls.price.max;
  controls.ram.value = "0";
  controls.sort.value = "default";
  update();
}

async function init() {
  renderSkeletons(grid, 8);
  resultCount.textContent = "Loading laptops...";

  try {
    allLaptops = await fetchLaptops();

    // The price slider's upper limit comes from the data (most expensive laptop, rounded up to 100).
    const mostExpensive = allLaptops.reduce((max, laptop) => Math.max(max, laptop.price), 0);
    const ceiling = Math.ceil(mostExpensive / 100) * 100;
    controls.price.max = String(ceiling);
    controls.price.value = String(ceiling);

    // Options of the category select also come from the data.
    const categories = [...new Set(allLaptops.map((laptop) => laptop.category))];
    controls.category.innerHTML =
      '<option value="all">All categories</option>' +
      categories.map((category) => `<option value="${category}">${capitalize(category)}</option>`).join("");

    update();
  } catch (error) {
    resultCount.textContent = "Could not load laptops";
    showMessage(grid, "Something went wrong", error.message, "error");
  }
}

// "input" fires on every keystroke, slider move and select change. We avoid "change" on purpose:
// it also fires when the search box loses focus, which re-rendered the cards and swallowed the click.
[controls.search, controls.category, controls.price, controls.ram, controls.sort].forEach((control) =>
  control.addEventListener("input", () => allLaptops.length && update())
);
// Pressing Enter in the search box must not submit (reload) the form.
document.getElementById("filters").addEventListener("submit", (event) => event.preventDefault());
controls.reset.addEventListener("click", () => allLaptops.length && resetFilters());

init();
