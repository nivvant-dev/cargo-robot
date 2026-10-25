/* ==========================================================================
   Theme bootstrap — loaded synchronously in <head> on every page.
   Kept external (not inline) so the site can enforce a strict
   Content-Security-Policy with script-src 'self'.

   1. Swaps no-js → js before the page paints.
   2. Mirrors the reduced-motion preference onto the root element.
   3. Fills the current year in any #year span.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("reduced-motion");
    }
  } catch (error) {
    /* matchMedia is not essential; the UI works without it. */
  }

  document.addEventListener("DOMContentLoaded", function () {
    var year = String(new Date().getFullYear());
    var nodes = document.querySelectorAll("#year");
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].textContent = year;
    }
  });
})();
