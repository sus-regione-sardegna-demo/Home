/* Trace: DEMO-SIRA-RESTYLE — static portal mock (SIRA-inspired layout) */

(function () {
  "use strict";

  var COOKIE_CONSENT_KEY = "susDemoCookieConsent";
  /** Enter compact header after this scroll offset (px). */
  var SCROLL_COMPACT_ENTER_PX = 40;
  /**
   * Leave compact only when near top (px). Hysteresis avoids oscillation when
   * collapsing the util row changes layout and scroll position hovers the threshold.
   */
  var SCROLL_COMPACT_EXIT_PX = 6;

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
   * Sticky site header: entire <header> uses position:sticky under .demo-banner.
   * Adds .site-header--scrolled after scroll to collapse util row, notice, and tighten nav.
   * Uses scroll hysteresis so layout changes from collapsing the util bar do not flip the
   * compact state rapidly (perceived as a choppy transition).
   */
  function initStickySiteHeader() {
    var header = document.querySelector(".site-header");
    var demoBanner = document.querySelector(".demo-banner");
    var notice = document.querySelector(".site-header__notice");
    var util = document.querySelector(".site-header__util");
    if (!header) {
      return;
    }

    function setTopOffset() {
      var h = demoBanner ? demoBanner.offsetHeight : 0;
      document.documentElement.style.setProperty("--sticky-top-offset", h + "px");
    }

    function setCompactAria(compact) {
      if (notice) {
        if (compact) {
          notice.setAttribute("aria-hidden", "true");
        } else {
          notice.removeAttribute("aria-hidden");
        }
      }
      if (util) {
        if (compact) {
          util.setAttribute("aria-hidden", "true");
        } else {
          util.removeAttribute("aria-hidden");
        }
      }
    }

    function updateFromScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var wasCompact = header.classList.contains("site-header--scrolled");
      var compact =
        wasCompact ? y > SCROLL_COMPACT_EXIT_PX : y > SCROLL_COMPACT_ENTER_PX;
      header.classList.toggle("site-header--scrolled", compact);
      setCompactAria(compact);
    }

    var ticking = false;
    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          updateFromScroll();
        });
      }
    }

    setTopOffset();
    updateFromScroll();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () {
      setTopOffset();
      requestUpdate();
    });
  }

  /**
   * After a completed transaction, hide the desktop primary bar (HOME, …) so
   * only the ribbon / util header remains. Trigger via:
   * - <body data-transaction-complete="true">
   * - URL ?txComplete=1 or ?tx=complete
   * - window.siraDemo.setPrimaryNavHidden(true) from app code
   * Trace: DEMO-SIRA-RESTYLE — post-transaction header (replace with activity id if provided).
   */
  function initPostTransactionPrimaryNav() {
    var nav = document.getElementById("site-primary-nav");
    if (!nav) {
      return;
    }

    // Toggle aria-expanded on click for desktop triggers to match mobile behavior
    var triggers = nav.querySelectorAll(".site-nav__link--trigger");
    triggers.forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var expanded = btn.getAttribute("aria-expanded") === "true";
        // Close other desktop menus
        triggers.forEach(function (other) {
          if (other !== btn) other.setAttribute("aria-expanded", "false");
        });
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      });
    });

    document.addEventListener("click", function () {
      triggers.forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
      });
    });

    function applyHidden(hidden) {
      nav.hidden = !!hidden;
      if (hidden) {
        document.body.dataset.transactionComplete = "true";
      } else {
        delete document.body.dataset.transactionComplete;
      }
    }

    var params = new URLSearchParams(window.location.search);
    var fromUrl =
      params.get("txComplete") === "1" || params.get("tx") === "complete";
    var fromBody = document.body.dataset.transactionComplete === "true";
    if (fromUrl || fromBody) {
      applyHidden(true);
    }

    window.siraDemo = window.siraDemo || {};
    window.siraDemo.setPrimaryNavHidden = function (hidden) {
      applyHidden(!!hidden);
    };
  }

  /**
   * Mobile drawer (foto 8): toggle from #site-menu-toggle, close on backdrop / Esc.
   */
  function initSiteDrawer() {
    var drawer = document.getElementById("site-drawer");
    var toggle = document.getElementById("site-menu-toggle");
    if (!drawer || !toggle) {
      return;
    }

    var panel = drawer.querySelector(".site-drawer__panel");
    var dismissEls = drawer.querySelectorAll("[data-drawer-dismiss]");
    var subToggles = drawer.querySelectorAll(".site-drawer__link--toggle");

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      var header = document.querySelector(".site-header");
      if (header) {
        header.classList.toggle("is-menu-open", open);
      }
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("is-drawer-open", open);
      if (open) {
        drawer.removeAttribute("inert");
        window.setTimeout(function () {
          var closeBtn = drawer.querySelector(".site-drawer__close");
          if (closeBtn) {
            closeBtn.focus();
          }
        }, 50);
      } else {
        drawer.setAttribute("inert", "");
        toggle.focus();
      }
    }

    function closeDrawer() {
      setOpen(false);
    }

    toggle.addEventListener("click", function () {
      setOpen(!drawer.classList.contains("is-open"));
    });

    dismissEls.forEach(function (el) {
      el.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    if (panel) {
      panel.addEventListener("click", function (ev) {
        ev.stopPropagation();
      });
    }

    subToggles.forEach(function (btn) {
      var id = btn.getAttribute("aria-controls");
      var sub = id ? document.getElementById(id) : null;
      if (!sub) {
        return;
      }
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        sub.hidden = expanded;
      });
    });

    var desktopMq = window.matchMedia("(min-width: 901px)");
    function closeIfDesktop(ev) {
      if (ev.matches && drawer.classList.contains("is-open")) {
        setOpen(false);
      }
    }
    if (desktopMq.addEventListener) {
      desktopMq.addEventListener("change", closeIfDesktop);
    } else if (desktopMq.addListener) {
      desktopMq.addListener(closeIfDesktop);
    }
  }

  initCookieBanner();
  initStickySiteHeader();
  initPostTransactionPrimaryNav();
  initSiteDrawer();

  if (document.body.dataset.page === "home") {
    initTabSections();
  }
})();
