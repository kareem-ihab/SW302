// theme-early.js - classic (non-module) script loaded in <head>.
// It sets the saved theme before the page paints, so a reload never flashes the wrong colours.
// The key matches THEME_KEY in storage.js; ui.js applies the same theme again once the modules load.
(function () {
  try {
    var saved = localStorage.getItem("laptopFinder.theme");
    document.documentElement.dataset.theme = saved === "performance" ? "performance" : "saver";
  } catch (error) {
    document.documentElement.dataset.theme = "saver";
  }
})();
