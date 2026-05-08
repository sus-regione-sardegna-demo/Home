/* Trace: DEMO-SUS-RESTYLE — static portal mock */

(function () {
  "use strict";

  var COOKIE_CONSENT_KEY = "susDemoCookieConsent";

  /**
   * Cookie banner: hide after accept, persist preference.
   */
  function initCookieBanner() {
    var banner = document.getElementById("cookie-banner");
    if (!banner) {
      return;
    }
    try {
      if (localStorage.getItem(COOKIE_CONSENT_KEY) === "1") {
        banner.hidden = true;
        return;
      }
    } catch (err) {
      /* ignore */
    }
    var btn = document.getElementById("cookie-accept");
    if (btn) {
      btn.addEventListener("click", function () {
        try {
          localStorage.setItem(COOKIE_CONSENT_KEY, "1");
        } catch (e) {
          /* ignore */
        }
        banner.hidden = true;
      });
    }
  }

  /**
   * Tab panels inside each .tab-section (scoped panels per section).
   */
  function initTabSections() {
    document.querySelectorAll(".tab-section").forEach(function (root) {
      var tablist = root.querySelector(".profile-tabs");
      if (!tablist) {
        return;
      }
      var tabs = tablist.querySelectorAll("[data-tab-id]");
      var panels = root.querySelectorAll("[data-tab-panel]");
      if (!tabs.length || !panels.length) {
        return;
      }
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var id = tab.getAttribute("data-tab-id");
          tabs.forEach(function (t) {
            var on = t === tab;
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
          });
          panels.forEach(function (p) {
            p.hidden = p.getAttribute("data-tab-panel") !== id;
          });
        });
      });
    });
  }

  initCookieBanner();

  if (document.body.dataset.page === "home") {
    initTabSections();
  }
})();
