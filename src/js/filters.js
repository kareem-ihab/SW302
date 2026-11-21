// filters.js - search, filter and sort logic for the catalogue. Pure functions, no DOM.

// filter() chain: every active control narrows the list further, so they all work together.
export function filterLaptops(laptops, { query, category, maxPrice, minRam }) {
  const text = query.trim().toLowerCase();

  return laptops.filter((laptop) => {
    const matchesText =
      text === "" ||
      laptop.name.toLowerCase().includes(text) ||
      laptop.brand.toLowerCase().includes(text);
    const matchesCategory = category === "all" || laptop.category === category;
    const matchesPrice = laptop.price <= maxPrice;
    const matchesRam = laptop.ramGB >= minRam;
    return matchesText && matchesCategory && matchesPrice && matchesRam;
  });
}

// Sort options map to [field, direction]. "default" keeps the original order.
const SORTS = {
  "price-asc": ["price", 1],
  "price-desc": ["price", -1],
  "battery-desc": ["batteryHours", -1],
  "battery-asc": ["batteryHours", 1],
  "weight-asc": ["weightKg", 1],
  "weight-desc": ["weightKg", -1]
};

// sort() mutates, so we sort a copy ([...laptops]) and leave the original array untouched.
export function sortLaptops(laptops, sortKey) {
  const copy = [...laptops];
  const sort = SORTS[sortKey];
  if (!sort) return copy;

  const [field, direction] = sort;
  return copy.sort((a, b) => (a[field] - b[field]) * direction);
}
