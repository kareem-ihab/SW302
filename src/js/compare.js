// compare.js - the rows of the comparison table and the "best value" calculation.
import { capitalize, formatPrice } from "./ui.js";

// Each row: label, how to read the value, how to display it, and which direction is "best".
// best: "min" = lowest wins, "max" = highest wins, null = nothing to highlight.
export const COMPARE_ROWS = [
  { label: "Price", field: "price", format: formatPrice, best: "min" },
  { label: "Brand", field: "brand", format: (v) => v, best: null },
  { label: "Category", field: "category", format: capitalize, best: null },
  { label: "Processor", field: "cpu", format: (v) => v, best: null },
  { label: "RAM", field: "ramGB", format: (v) => `${v} GB`, best: "max" },
  { label: "Storage", field: "storageGB", format: (v) => `${v} GB`, best: "max" },
  { label: "Battery life", field: "batteryHours", format: (v) => `${v} h`, best: "max" },
  { label: "Weight", field: "weightKg", format: (v) => `${v} kg`, best: "min" },
  { label: "Screen", field: "screenInches", format: (v) => `${v}"`, best: null }
];

// Picks the winning value of a row from the numbers of the compared laptops.
// reduce() keeps the lowest or highest value seen so far; ties all count as best.
export function getBestValue(laptops, field, best) {
  if (!best || laptops.length === 0) return null;

  return laptops.reduce(
    (winner, laptop) =>
      best === "min" ? Math.min(winner, laptop[field]) : Math.max(winner, laptop[field]),
    best === "min" ? Infinity : -Infinity
  );
}

// Builds the table: one header cell per laptop, then one row per COMPARE_ROWS entry.
export function buildCompareTable(laptops) {
  const head = laptops
    .map(
      (laptop) => `
        <th scope="col" class="min-w-44 p-4 align-bottom">
          <a href="details.html?id=${laptop.id}" class="block">
            <img src="${laptop.image}" alt="${laptop.name} laptop" class="mx-auto mb-3 h-24 w-36 rounded-lg object-cover" />
            <span class="block text-xs uppercase tracking-wide text-app-muted">${laptop.brand}</span>
            <span class="block font-bold hover:text-app-accent">${laptop.name}</span>
          </a>
        </th>`
    )
    .join("");

  const body = COMPARE_ROWS.map((row) => {
    const bestValue = getBestValue(laptops, row.field, row.best);

    const cells = laptops
      .map((laptop) => {
        const isBest = row.best && laptop[row.field] === bestValue;
        // Best cells get a tinted background AND a "Best" tag so colour is not the only signal.
        const classes = isBest ? "bg-app-accent/20 font-bold text-app-accent" : "";
        const tag = isBest ? '<span class="ml-2 rounded bg-app-accent px-1.5 py-0.5 text-xs text-app-accent-text">Best</span>' : "";
        return `<td class="p-4 text-center ${classes}">${row.format(laptop[row.field])}${tag}</td>`;
      })
      .join("");

    return `<tr class="border-t border-app-border"><th scope="row" class="whitespace-nowrap p-4 text-left font-semibold text-app-muted">${row.label}</th>${cells}</tr>`;
  }).join("");

  return `
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr><td class="p-4"></td>${head}</tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}
