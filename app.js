/* Voltra site — OS-aware downloads + theme. No external dependencies, no inline code (strict CSP). */
(function () {
  "use strict";

  // ---- where the installers live (public downloads repo) ----
  var OWNER = "mqasimhere";
  var REPO = "voltra-downloads";
  var VERSION = "1.0.0";
  var BASE = "https://github.com/" + OWNER + "/" + REPO + "/releases/latest/download";

  // primary download per OS group (what the hero button points to)
  var PRIMARY = {
    windows: { file: "voltra-windows-setup.exe", label: "Download for Windows" },
    "mac-arm": { file: "voltra-mac-apple-silicon.dmg", label: "Download for macOS" },
    "mac-intel": { file: "voltra-mac-intel.dmg", label: "Download for macOS" },
    linux: { file: "voltra-linux.AppImage", label: "Download for Linux" }
  };

  function url(file) { return BASE + "/" + file; }

  // ---- wire every download row to its real asset URL ----
  var rows = Array.prototype.slice.call(document.querySelectorAll(".dl-row[data-file]"));
  rows.forEach(function (a) {
    a.setAttribute("href", url(a.getAttribute("data-file")));
    a.setAttribute("rel", "noopener");
  });

  // ---- static links ----
  function setHref(id, href) { var el = document.getElementById(id); if (el) el.setAttribute("href", href); }
  setHref("sums-link", url("SHA256SUMS.txt"));
  setHref("gh-link", "https://github.com/" + OWNER + "/" + REPO + "/releases");
  var verEl = document.getElementById("ver"); if (verEl) verEl.textContent = VERSION;
  var yearEl = document.getElementById("year"); if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---- detect the visitor's OS (best effort) ----
  function baseGuess() {
    var p = (navigator.platform || "") + " " + (navigator.userAgent || "");
    if (/Win/i.test(p)) return "windows";
    if (/Mac|iPhone|iPad|iPod/i.test(p)) return "mac-arm"; // default modern Mac; refined below
    if (/Linux|X11|Ubuntu|Debian/i.test(p)) return "linux";
    return null;
  }

  function apply(os) {
    if (!os) return;
    // highlight the matching row(s)
    rows.forEach(function (a) { a.classList.remove("is-you"); });
    var match = rows.filter(function (a) { return a.getAttribute("data-os") === os; });
    // if we only know "mac" generically, highlight whichever arch we picked
    match.forEach(function (a) { a.classList.add("is-you"); });

    // hero button
    var btn = document.getElementById("hero-download");
    var label = document.getElementById("hero-download-label");
    var note = document.getElementById("hero-os-note");
    var p = PRIMARY[os];
    if (btn && p) {
      btn.setAttribute("href", url(p.file));
      btn.setAttribute("rel", "noopener");
      if (label) label.textContent = p.label;
      if (note) note.textContent = "Free to use. Also available for " + otherNames(os) + ".";
    }
  }

  function otherNames(os) {
    var all = { windows: "Windows", "mac-arm": "macOS", "mac-intel": "macOS", linux: "Linux" };
    var names = [];
    ["windows", "mac-arm", "linux"].forEach(function (k) {
      if (all[k] !== all[os]) names.push(all[k]);
    });
    return names.join(" and ");
  }

  // first pass: synchronous guess so the button is correct immediately
  var guess = baseGuess();
  apply(guess);

  // refine Mac Intel vs Apple Silicon when the browser allows it
  if (guess && guess.indexOf("mac") === 0 && navigator.userAgentData &&
      typeof navigator.userAgentData.getHighEntropyValues === "function") {
    navigator.userAgentData.getHighEntropyValues(["architecture"]).then(function (ua) {
      if (ua && ua.architecture && /x86|x64|amd/i.test(ua.architecture)) apply("mac-intel");
    }).catch(function () { /* keep the default */ });
  }

  // ---- theme toggle (persisted) ----
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  function readStored() { try { return localStorage.getItem("voltra-theme"); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem("voltra-theme", v); } catch (e) { /* ignore */ } }

  var stored = readStored();
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);

  function syncToggle() {
    var dark = root.getAttribute("data-theme") !== "light";
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(!dark));
      toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
  }
  syncToggle();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      store(next);
      syncToggle();
    });
  }
})();
