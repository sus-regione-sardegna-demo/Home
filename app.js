/* Trace: DEMO-SUS-RESTYLE — Sibar mock login POC demo */

(function () {
  "use strict";

  var STORAGE_KEY = "sibarDemoUsername";
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

  /**
   * Login page: fake submit with validation and redirect.
   */
  function initLoginPage() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get("logout") === "1") {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem("sibarDemoRemember");
        window.history.replaceState({}, "", "index.html");
      }
    } catch (err) {
      /* ignore */
    }

    var form = document.getElementById("login-form");
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    var remember = document.getElementById("remember");
    var submitBtn = document.getElementById("submit-btn");
    var errorEl = document.getElementById("login-error");

    if (!form || !username || !password || !submitBtn) {
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorEl.classList.remove("is-visible");

      var u = username.value.trim();
      var p = password.value;

      if (!u || !p) {
        errorEl.textContent =
          "Inserisci identificativo e chiave di accesso.";
        errorEl.classList.add("is-visible");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Caricamento…";

      window.setTimeout(function () {
        try {
          sessionStorage.setItem(STORAGE_KEY, u);
          if (remember && remember.checked) {
            sessionStorage.setItem("sibarDemoRemember", "1");
          } else {
            sessionStorage.removeItem("sibarDemoRemember");
          }
        } catch (err) {
          /* ignore storage errors in private mode */
        }
        window.location.href = "dashboard.html";
      }, 900);
    });
  }

  /**
   * Dashboard: show welcome or bounce to login if no session flag.
   */
  function initDashboardPage() {
    var welcome = document.getElementById("welcome-name");
    if (!welcome) {
      return;
    }

    var name = "";
    try {
      name = sessionStorage.getItem(STORAGE_KEY) || "";
    } catch (err) {
      name = "";
    }

    if (!name) {
      window.location.replace("index.html");
      return;
    }

    welcome.textContent = name;
  }

  initCookieBanner();

  if (document.body.dataset.page === "login") {
    initTabSections();
    initLoginPage();
  } else if (document.body.dataset.page === "dashboard") {
    initDashboardPage();
  }
})();
