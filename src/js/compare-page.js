// compare-page.js - compare.html: choose 2-4 favorites and see them side by side.
import { fetchLaptops } from "./api.js";
import { MAX_COMPARE, MIN_COMPARE, addToCompare, getCompareIds, getFavoriteIds, removeFromCompare } from "./storage.js";
import { buildCompareTable } from "./compare.js";
import { formatPrice, initPage, showMessage } from "./ui.js";

initPage();

const picker = document.getElementById("picker");
const pickerMessage = document.getElementById("picker-message");
const tableWrapper = document.getElementById("compare-table");

let favorites = [];

function renderPicker() {
  const selected = getCompareIds();

  picker.innerHTML = favorites
    .map((laptop) => {
      const checked = selected.includes(laptop.id);
      return `
        <label class="laptop-card cursor-pointer flex-row items-center gap-3 p-3">
          <input type="checkbox" value="${laptop.id}" ${checked ? "checked" : ""} class="h-5 w-5 rounded border-app-border text-app-accent focus:ring-app-accent" />
          <img src="${laptop.image}" alt="" class="h-12 w-16 rounded object-cover" />
          <span class="flex-1">
            <span class="block font-semibold leading-tight">${laptop.name}</span>
            <span class="block text-sm text-app-muted">${laptop.brand} &middot; ${formatPrice(laptop.price)}</span>
          </span>
        </label>`;
    })
    .join("");
}

function renderTable() {
  const selectedLaptops = favorites.filter((laptop) => getCompareIds().includes(laptop.id));

  if (selectedLaptops.length < MIN_COMPARE) {
    showMessage(
      tableWrapper,
      "Pick at least two laptops",
      `Select ${MIN_COMPARE} to ${MAX_COMPARE} of your favorites above to compare them side by side.`
    );
    return;
  }
  tableWrapper.innerHTML = buildCompareTable(selectedLaptops);
}

// Checkbox changes: add or remove from the comparison; a fifth pick is blocked with a message.
picker.addEventListener("change", (event) => {
  const checkbox = event.target;
  const id = Number(checkbox.value);
  pickerMessage.textContent = "";

  if (checkbox.checked) {
    const result = addToCompare(id);
    if (!result.ok) {
      checkbox.checked = false;
      pickerMessage.textContent = result.reason;
      return;
    }
  } else {
    removeFromCompare(id);
  }
  renderTable();
});

async function init() {
  try {
    const all = await fetchLaptops();
    const ids = getFavoriteIds();
    favorites = all.filter((laptop) => ids.includes(laptop.id));

    if (favorites.length < MIN_COMPARE) {
      document.getElementById("picker-section").classList.add("hidden");
      showMessage(
        tableWrapper,
        "Save at least two laptops first",
        'The comparison uses your favorites. <a class="underline" href="laptops.html">Browse the catalogue</a> and save a few.'
      );
      return;
    }

    renderPicker();
    renderTable();
  } catch (error) {
    showMessage(tableWrapper, "Something went wrong", error.message, "error");
  }
}

init();
