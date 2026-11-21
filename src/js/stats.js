// stats.js - calculated values (all built with reduce) shown on the home and favorites pages.

export const getTotalPrice = (laptops) =>
  laptops.reduce((total, laptop) => total + laptop.price, 0);

export const getAveragePrice = (laptops) =>
  laptops.length === 0 ? 0 : Math.round(getTotalPrice(laptops) / laptops.length);

// Lowest price in a list; returns 0 for an empty list.
export const getLowestPrice = (laptops) =>
  laptops.length === 0
    ? 0
    : laptops.reduce((lowest, laptop) => Math.min(lowest, laptop.price), Infinity);

export const getBestBattery = (laptops) =>
  laptops.reduce((best, laptop) => Math.max(best, laptop.batteryHours), 0);
