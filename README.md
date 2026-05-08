# Sibar — mock login (demo)

This folder is a **static, front-end only** mock of an intranet-style sign-in screen for POCs and demos (for example alongside Agentforce or help-desk walkthroughs). It is **not** connected to any real directory or API: credentials are not sent anywhere, and the “session” is just `sessionStorage` in the browser for the same tab/window.

Open `index.html` in a browser to try the flow locally. For **GitHub Pages**, the simplest path is a small repository whose **root** is the contents of `DEMO/` (so `index.html` sits at the site root) and Pages is enabled on that branch. If you keep this demo inside a larger repo, the included workflow under `.github/workflows/` can publish this folder to the `gh-pages` branch; point Pages at that branch in the repository settings.

Replace any `ACTIVITY-CODE` placeholder in project files with your internal ticket or activity id when you adopt the change set.
