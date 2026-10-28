/* Voltra site — OS-aware downloads, header state, subtle 3D tilt, scroll reveals.
   No external deps, no inline code (strict CSP). */
(function () {
  "use strict";
  var OWNER = "mqasimhere", REPO = "voltra-downloads", VERSION = "1.0.0";
  var BASE = "https://github.com/" + OWNER + "/" + REPO + "/releases/latest/download";
  var PRIMARY = {
    windows:   { file: "voltra-windows-setup.exe",      label: "Download for Windows" },
    "mac-arm": { file: "voltra-mac-apple-silicon.dmg",  label: "Download for macOS" },
    "mac-intel":{ file: "voltra-mac-intel.dmg",         label: "Download for macOS" },
    linux:     { file: "voltra-linux.AppImage",         label: "Download for Linux" }
  };
  var url = function (f) { return BASE + "/" + f; };
  function byId(id) { return document.getElementById(id); }

  // static links
  if (byId("sums-link")) byId("sums-link").setAttribute("href", url("SHA256SUMS.txt"));
  if (byId("gh-link")) byId("gh-link").setAttribute("href", "https://github.com/" + OWNER + "/" + REPO + "/releases");
  if (byId("ver")) byId("ver").textContent = VERSION;
  if (byId("year")) byId("year").textContent = String(new Date().getFullYear());

  // OS detection
  function baseGuess() {
    var p = (navigator.platform || "") + " " + (navigator.userAgent || "");
    if (/Win/i.test(p)) return "windows";
    if (/Mac|iPhone|iPad|iPod/i.test(p)) return "mac-arm";
    if (/Linux|X11|Ubuntu|Debian|Android/i.test(p)) return "linux";
    return null;
  }
  var rows = Array.prototype.slice.call(document.querySelectorAll(".dl-row[data-os]"));
  function apply(os) {
    if (!os) return;
    rows.forEach(function (a) { a.classList.toggle("is-you", a.getAttribute("data-os") === os); });
    var btn = byId("hero-download"), label = byId("hero-download-label"), p = PRIMARY[os];
    if (btn && p) { btn.setAttribute("href", url(p.file)); btn.setAttribute("rel", "noopener"); if (label) label.textContent = p.label; }
  }
  var guess = baseGuess();
  apply(guess);
  if (guess && guess.indexOf("mac") === 0 && navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues(["architecture"]).then(function (ua) {
      if (ua && ua.architecture && /x86|x64|amd/i.test(ua.architecture)) apply("mac-intel");
    }).catch(function () {});
  }

  // header background on scroll
  var head = byId("head");
  function onScroll() { if (head) head.classList.toggle("scrolled", window.scrollY > 12); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // subtle 3D tilt of the hero screenshot following the pointer
  var tilt = byId("tilt");
  if (tilt && !reduce && window.matchMedia("(pointer:fine)").matches) {
    var hero = tilt.closest(".shot3d");
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = "rotateY(" + (-11 + dx * 10).toFixed(2) + "deg) rotateX(" + (5 - dy * 8).toFixed(2) + "deg)";
    });
    hero.addEventListener("pointerleave", function () { tilt.style.transform = ""; });
  }
})();
