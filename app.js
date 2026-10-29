/* Voltra site — OS detection + small helpers. No inline script (strict CSP). */
(function () {
  "use strict";
  var REPO = "https://github.com/mqasimhere/voltra-downloads";
  var RELEASE = REPO + "/releases/latest";

  // Year
  var y = document.getElementById("year");
  if (y) { y.textContent = String(new Date().getFullYear()); }

  // External links that shouldn't be hard-coded in markup
  var sums = document.getElementById("sums-link");
  if (sums) { sums.href = RELEASE + "/download/SHA256SUMS.txt"; }
  var gh = document.getElementById("gh-link");
  if (gh) { gh.href = RELEASE; }

  // Detect OS to highlight the most likely download
  function detect() {
    var ua = (navigator.userAgent || "") + " " + (navigator.platform || "");
    var p = ua.toLowerCase();
    var isMac = /mac|iphone|ipad|ipod/.test(p);
    if (/windows|win32|win64/.test(p)) { return "windows"; }
    if (isMac) {
      // Apple Silicon vs Intel — best-effort
      var arm = false;
      try {
        var c = document.createElement("canvas");
        var gl = c.getContext("webgl") || c.getContext("experimental-webgl");
        if (gl) {
          var dbg = gl.getExtension("WEBGL_debug_renderer_info");
          var r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
          if (/apple/i.test(r) && !/intel/i.test(r)) { arm = true; }
        }
      } catch (e) {}
      return arm ? "mac-arm" : "mac-intel";
    }
    if (/android|linux|x11|cros/.test(p)) { return "linux"; }
    return null;
  }

  var os = detect();
  var labels = {
    "windows": "Download for Windows",
    "mac-arm": "Download for macOS",
    "mac-intel": "Download for macOS",
    "linux": "Download for Linux"
  };

  // Mark the matching row(s) and lift a primary one to the top of its OS
  var rows = document.querySelectorAll("#dl-list .dl-row");
  var primary = null;
  for (var i = 0; i < rows.length; i++) {
    var ro = rows[i];
    if (os && ro.getAttribute("data-os") === os) {
      ro.classList.add("is-you");
      if (!primary) { primary = ro; }
    }
  }
  // (The "your system" badge is rendered by CSS via .dl-row.is-you .dl-os::after)

  // Point the hero button straight at the detected build; else to the list
  var hero = document.getElementById("hero-download");
  var heroLabel = document.getElementById("hero-download-label");
  if (hero && primary) {
    hero.setAttribute("href", primary.getAttribute("href"));
    hero.setAttribute("rel", "noopener");
    if (heroLabel && os && labels[os]) { heroLabel.textContent = labels[os]; }
  }
})();
