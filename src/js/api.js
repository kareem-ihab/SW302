// api.js - loads laptop data from data/laptops.json.

const DATA_URL = "data/laptops.json";

let cache = null; // so one page does not download the file twice

// Returns the array of laptops. Throws a readable Error if the request fails.
export async function fetchLaptops() {
  if (cache) return cache;

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Server answered ${response.status}`);
    }
    cache = await response.json();
    return cache;
  } catch (error) {
    console.error("Could not load laptops:", error);
    throw new Error(
      "We could not load the laptop data. Check your connection and make sure the site runs from a local server."
    );
  }
}

// Finds one laptop by id; returns undefined when the id does not exist.
export async function fetchLaptopById(id) {
  const laptops = await fetchLaptops();
  return laptops.find((laptop) => laptop.id === id);
}
