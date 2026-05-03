/* ============================================================
   Shared layout — sidebar + topbar HTML injection
   Pages call:  Layout.render({ activeId, crumbs, title, sub, body })
   ============================================================ */
window.Layout = {
  render({ activeId, crumbs = [], title, sub, bodyHTML = "" }) {
    const base = location.pathname.includes("/tools/") ? "../" : "";
    // Read persisted collapsed state
    const storedCollapsed = localStorage.getItem("it.sidebarCollapsed") === "true";
    if (storedCollapsed) document.documentElement.setAttribute("data-app-collapsed", "true");

    document.body.innerHTML = `
      <div class="app" ${storedCollapsed ? 'data-collapsed="true"' : ''}>
        <aside class="sidebar">
          <div class="sidebar-head">
            <a class="brand" href="${base}index.html" title="IT Tools — Home">
              <span class="brand-mark">IT</span>
              <span class="brand-text">IT&nbsp;Tools</span>
            </a>
            <button class="sidebar-collapse" id="sidebar-collapse-btn" title="Collapse sidebar (⌘\\)" aria-label="Toggle sidebar">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="12" height="10" rx="1.5"/>
                <line x1="6" y1="3" x2="6" y2="13"/>
                <polyline class="chev" points="9.5,6 11.5,8 9.5,10"/>
              </svg>
            </button>
          </div>
          <button class="search-btn" data-action="search" title="Search tools (⌘K)">
            <span class="search-icon">⌕</span>
            <span class="search-label">Search tools…</span>
            <span class="kbd">⌘K</span>
          </button>
          <nav id="sidebar-nav" class="sidebar-nav-scroll"></nav>
          <div class="sidebar-foot">
            <div class="sidebar-foot-info">
              <span class="dot"></span>
              <span class="t">v26.5 · 26 tools · local</span>
            </div>
            <div class="sidebar-credit">
              Made with <span class="heart">♥</span> by <strong>Prathyosh</strong>
              <div class="disclaimer">All processing runs in your browser — nothing leaves your device.</div>
            </div>
          </div>
        </aside>
        <main class="main">
          <div class="topbar">
            <button class="icon-btn sidebar-toggle" id="sidebar-toggle-btn" title="Toggle sidebar" aria-label="Toggle sidebar">
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2.5" y="3.5" width="15" height="13" rx="2"/>
                <line x1="8" y1="3.5" x2="8" y2="16.5"/>
              </svg>
            </button>
            <div class="crumbs" id="crumbs"></div>
            <div class="topbar-actions">
              <button class="icon-btn" data-action="search" title="Search (⌘K)">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="9" r="5.5"/><line x1="13" y1="13" x2="17" y2="17"/></svg>
              </button>
              <button class="icon-btn" id="tweaks-open-btn" title="Customize (Tweaks)" aria-label="Open Tweaks panel">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.6 4.6l1.8 1.8M13.6 13.6l1.8 1.8M4.6 15.4l1.8-1.8M13.6 6.4l1.8-1.8"/></svg>
              </button>
              <button class="icon-btn" id="theme-cycle" title="Cycle theme" aria-label="Cycle theme">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M10 3a7 7 0 0 0 0 14"/></svg>
              </button>
            </div>
          </div>
          <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
          ${title ? `<h1 class="page-title">${title}</h1>` : ""}
          ${sub ? `<p class="page-sub">${sub}</p>` : ""}
          ${bodyHTML}
        </main>
      </div>
    `;

    renderCrumbs(crumbs);
    renderSidebar(activeId);
    initCmdPalette();

    // Sidebar collapse toggle
    const collapseBtn = document.getElementById("sidebar-collapse-btn");
    const appEl = document.querySelector(".app");
    function setCollapsed(v) {
      if (v) appEl.setAttribute("data-collapsed", "true");
      else appEl.removeAttribute("data-collapsed");
      localStorage.setItem("it.sidebarCollapsed", String(!!v));
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { sidebarCollapsed: !!v } }, "*");
    }
    collapseBtn?.addEventListener("click", () => {
      setCollapsed(appEl.getAttribute("data-collapsed") !== "true");
    });

    // Mobile drawer
    const menuBtn = document.getElementById("sidebar-toggle-btn");
    const backdrop = document.getElementById("sidebar-backdrop");
    function openDrawer() { appEl.setAttribute("data-drawer", "open"); }
    function closeDrawer() { appEl.removeAttribute("data-drawer"); }
    menuBtn?.addEventListener("click", () => {
      // On mobile (<=760px) → toggle drawer. On desktop → toggle collapsed.
      if (window.matchMedia("(max-width: 760px)").matches) {
        if (appEl.getAttribute("data-drawer") === "open") closeDrawer();
        else openDrawer();
      } else {
        setCollapsed(appEl.getAttribute("data-collapsed") !== "true");
      }
    });
    backdrop?.addEventListener("click", closeDrawer);
    appEl.querySelector(".sidebar")?.addEventListener("click", e => {
      if (e.target.closest("a.nav-item, .brand")) closeDrawer();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

    // Open Tweaks from topbar
    document.getElementById("tweaks-open-btn")?.addEventListener("click", () => {
      window.postMessage({ type: "__activate_edit_mode" }, "*");
    });
    // ⌘\ shortcut
    document.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setCollapsed(appEl.getAttribute("data-collapsed") !== "true");
      }
    });

    // theme cycle button
    const themes = ["mono", "clean", "editorial", "grid", "aurora"];
    document.getElementById("theme-cycle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "aurora";
      const next = themes[(themes.indexOf(cur) + 1) % themes.length];
      applyTheme(next);
      // re-broadcast to tweaks panel
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { theme: next } }, "*");
    });
  }
};
