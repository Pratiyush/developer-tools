/* ============================================================
   IT Tools — shared app logic
   ============================================================ */

// ---------- Lucide-style stroke icons (24×24, currentColor, stroke-width 1.75) ----------
const I = (() => {
  const w = (p) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  return {
    hash:       w(`<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>`),
    lock:       w(`<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`),
    ticket:     w(`<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 17v2M13 11v2"/>`),
    keyRound:   w(`<path d="M2 18a4 4 0 0 1 4-4h.5"/><circle cx="16.5" cy="7.5" r="5.5"/><path d="m12.5 11.5-5.5 5.5v3.5h3.5l5.5-5.5"/>`),
    arrowsLR:   w(`<path d="m17 3 4 4-4 4"/><path d="M21 7H9"/><path d="m7 21-4-4 4-4"/><path d="M3 17h12"/>`),
    fileSwap:   w(`<path d="M14 2v6h6"/><path d="M4 13.5V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/><path d="m9 17 3 3-3 3"/><path d="M5 20h7"/>`),
    palette:    w(`<circle cx="13.5" cy="6.5" r=".75"/><circle cx="17.5" cy="10.5" r=".75"/><circle cx="8.5" cy="7.5" r=".75"/><circle cx="6.5" cy="12.5" r=".75"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`),
    caseSensitive: w(`<path d="m3 15 4-8 4 8"/><path d="M4 13h6"/><circle cx="18" cy="12" r="3"/><path d="M21 9v6"/>`),
    globe:      w(`<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/>`),
    code:       w(`<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`),
    monitor:    w(`<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>`),
    qr:         w(`<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>`),
    type:       w(`<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>`),
    regex:      w(`<path d="M17 3v10"/><path d="m12.67 5.5 8.66 5"/><path d="m12.67 10.5 8.66-5"/><path d="M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z"/>`),
    braces:     w(`<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>`),
    diff:       w(`<path d="M12 3v14"/><path d="M5 10l7-7 7 7"/><path d="M5 21h14"/>`),
    sigma:      w(`<path d="M18 7V4H6l6 8-6 8h12v-3"/>`),
    binary:     w(`<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/>`),
    terminal:   w(`<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>`),
    timer:      w(`<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>`),
    pilcrow:    w(`<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>`),
    fileText:   w(`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>`),
    fingerprint: w(`<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>`),
    clock:      w(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`),
    keyAsterisk: w(`<path d="M12 6v12"/><path d="m6.34 8.5 11.32 7"/><path d="m6.34 15.5 11.32-7"/>`),
  };
})();

// ---------- Tool catalog ----------
window.TOOLS = [
  // Crypto
  { id: "hash", name: "Hash text", cat: "Crypto", desc: "MD5, SHA-1, SHA-256, SHA-512 in your browser.", svg: I.hash, preview: "a3f2b9c1…", previewType: "mono", path: "tools/hash.html" },
  { id: "encrypt", name: "Encrypt / decrypt", cat: "Crypto", desc: "AES-style encryption with passphrase.", svg: I.lock, preview: "AES-256", previewType: "chip", path: "tools/encrypt.html" },
  { id: "jwt", name: "JWT parser", cat: "Crypto", desc: "Decode and inspect a JSON Web Token.", svg: I.ticket, preview: "eyJhbGc…", previewType: "mono", path: "tools/jwt.html" },
  { id: "bcrypt", name: "Bcrypt hash", cat: "Crypto", desc: "Generate and verify bcrypt hashes.", svg: I.keyRound, preview: "$2b$10$…", previewType: "mono", path: "tools/bcrypt.html" },

  // Converter
  { id: "base64", name: "Base64 string", cat: "Converter", desc: "Encode and decode base64 text.", svg: I.arrowsLR, preview: "text → base64", previewType: "chip", path: "tools/base64.html" },
  { id: "json-yaml", name: "JSON ↔ YAML", cat: "Converter", desc: "Convert JSON to YAML and back.", svg: I.fileSwap, preview: "JSON ↔ YAML", previewType: "chip", path: "tools/json-yaml.html" },
  { id: "color", name: "Color converter", cat: "Converter", desc: "HEX, RGB, HSL, OKLCH all at once.", svg: I.palette, preview: "#6366f1", previewType: "swatch", path: "tools/color.html" },
  { id: "case", name: "Case converter", cat: "Converter", desc: "camelCase, snake_case, kebab-case, …", svg: I.caseSensitive, preview: "camelCase", previewType: "mono", path: "tools/case.html" },

  // Web
  { id: "url-encode", name: "URL encode/decode", cat: "Web", desc: "Encode special chars for URLs.", svg: I.globe, preview: "%20 → space", previewType: "chip", path: "tools/url-encode.html" },
  { id: "html-escape", name: "HTML escape", cat: "Web", desc: "Escape and unescape HTML entities.", svg: I.code, preview: "&lt; &gt; &amp;", previewType: "mono", path: "tools/html-escape.html" },
  { id: "user-agent", name: "User-agent parser", cat: "Web", desc: "Detect browser, OS, and device.", svg: I.monitor, preview: "Mozilla/5.0…", previewType: "mono", path: "tools/user-agent.html" },

  // Images & QR
  { id: "qr", name: "QR code generator", cat: "Images & QR", desc: "Create a QR code from any text.", svg: I.qr, preview: "text → QR", previewType: "chip", path: "tools/qr.html" },
  { id: "ascii", name: "ASCII art", cat: "Images & QR", desc: "Turn text into ASCII art banners.", svg: I.type, preview: "█▀█ ▄▀█", previewType: "mono", path: "tools/ascii.html" },

  // Development
  { id: "regex", name: "Regex tester", cat: "Development", desc: "Live-match patterns against test strings.", svg: I.regex, preview: "/^[a-z]+$/", previewType: "mono", path: "tools/regex.html" },
  { id: "format-json", name: "JSON formatter", cat: "Development", desc: "Pretty-print and validate JSON.", svg: I.braces, preview: "{ \"k\": \"v\" }", previewType: "mono", path: "tools/format-json.html" },
  { id: "diff", name: "Text diff", cat: "Development", desc: "Compare two blocks of text line-by-line.", svg: I.diff, preview: "+/− lines", previewType: "chip", path: "tools/diff.html" },

  // Math
  { id: "math-eval", name: "Math evaluator", cat: "Math", desc: "Evaluate math expressions safely.", svg: I.sigma, preview: "2+2 = 4", previewType: "mono", path: "tools/math-eval.html" },
  { id: "base-conv", name: "Base converter", cat: "Math", desc: "Decimal ↔ binary ↔ hex ↔ octal.", svg: I.binary, preview: "42 = 0x2A", previewType: "mono", path: "tools/base-conv.html" },

  // Measurement
  { id: "chmod", name: "chmod calculator", cat: "Measurement", desc: "Build Unix permissions from checkboxes.", svg: I.terminal, preview: "rwxr-xr-x", previewType: "mono", path: "tools/chmod.html" },
  { id: "benchmark", name: "Benchmark", cat: "Measurement", desc: "Run quick code-style timings.", svg: I.timer, preview: "ms / ops", previewType: "chip", path: "tools/benchmark.html" },

  // Text
  { id: "lorem", name: "Lorem ipsum", cat: "Text", desc: "Classic placeholder text generator.", svg: I.pilcrow, preview: "Lorem ipsum…", previewType: "mono", path: "tools/lorem.html" },
  { id: "wordcount", name: "Word counter", cat: "Text", desc: "Count words, chars, sentences, reading time.", svg: I.fileText, preview: "1,247 words", previewType: "chip", path: "tools/wordcount.html" },

  // Data
  { id: "uuid", name: "UUID generator", cat: "Data", desc: "Generate v4 UUIDs in bulk.", svg: I.fingerprint, preview: "f47ac10b-58cc…", previewType: "mono", path: "tools/uuid.html" },
  { id: "ulid", name: "ULID generator", cat: "Data", desc: "Sortable unique IDs (Crockford base32).", svg: I.clock, preview: "01HMG7…ZK4", previewType: "mono", path: "tools/ulid.html" },
  { id: "password", name: "Password generator", cat: "Data", desc: "Strong, random passwords with options.", svg: I.keyAsterisk, preview: "•••••••• 32ch", previewType: "chip", path: "tools/password.html" },
];

window.CATEGORIES = ["Crypto", "Converter", "Web", "Images & QR", "Development", "Math", "Measurement", "Text", "Data"];

// ---------- LocalStorage helpers ----------
const LS = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

window.AppState = {
  favorites: () => LS.get("it.favs", ["uuid", "hash", "jwt", "regex"]),
  setFavorites: (v) => LS.set("it.favs", v),
  toggleFav(id) {
    const f = this.favorites();
    const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.unshift(id);
    this.setFavorites(f);
    return f.includes(id);
  },
  recents: () => LS.get("it.recents", []),
  pushRecent(entry) {
    const r = this.recents().filter(x => x.key !== entry.key).slice(0, 9);
    r.unshift({ ...entry, t: Date.now() });
    LS.set("it.recents", r);
  }
};

// ---------- Theme management ----------
window.applyTheme = function(name) {
  document.documentElement.setAttribute("data-theme", name);
  LS.set("it.theme", name);
};
window.applyDensity = function(d) {
  document.documentElement.setAttribute("data-density", d);
  LS.set("it.density", d);
};
window.applyFont = function(f) {
  document.documentElement.style.setProperty("--font-body-override", f);
  LS.set("it.font", f);
};

// Initial theme load (run inline before page paints — see HTML head)
window.initTheme = function() {
  const t = LS.get("it.theme", "aurora");
  const d = LS.get("it.density", "default");
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.setAttribute("data-density", d);
};

// ---------- Toast ----------
let _toastEl, _toastTimer;
window.toast = function(msg) {
  if (!_toastEl) {
    _toastEl = document.createElement("div");
    _toastEl.className = "toast";
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = msg;
  _toastEl.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => _toastEl.classList.remove("show"), 1800);
};

window.copyText = async function(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    toast((label || "Copied") + " ✓");
  } catch {
    toast("Copy failed");
  }
};

// ---------- Sidebar / nav rendering ----------
window.renderSidebar = function(activeId) {
  const root = document.getElementById("sidebar-nav");
  if (!root) return;
  const favs = AppState.favorites();
  const isHome = activeId === "home";
  const base = location.pathname.includes("/tools/") ? "../" : "";

  let html = "";
  // Favorites
  if (favs.length) {
    html += `<div class="nav-section"><div class="nav-section-title">Favorites</div>`;
    for (const id of favs) {
      const t = TOOLS.find(x => x.id === id);
      if (!t) continue;
      html += navItem(t, base, activeId, true);
    }
    html += `</div>`;
  }
  for (const cat of CATEGORIES) {
    const list = TOOLS.filter(t => t.cat === cat);
    if (!list.length) continue;
    html += `<div class="nav-section"><div class="nav-section-title">${cat}</div>`;
    for (const t of list) html += navItem(t, base, activeId, favs.includes(t.id));
    html += `</div>`;
  }
  root.innerHTML = html;

  // toggle stars
  root.querySelectorAll(".nav-item .star").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault(); e.stopPropagation();
      const id = btn.dataset.id;
      AppState.toggleFav(id);
      renderSidebar(activeId);
    });
  });
};
function navItem(t, base, activeId, starred) {
  return `<a class="nav-item ${activeId === t.id ? 'active' : ''} ${starred ? 'starred' : ''}" href="${base}${t.path}" data-tip="${t.name}">
    <span class="icon icon-svg">${t.svg || ''}</span>
    <span class="label">${t.name}</span>
    <button class="star" data-id="${t.id}" title="${starred ? 'Unfavorite' : 'Favorite'}">${starred ? '★' : '☆'}</button>
  </a>`;
}
window.toolIcon = (t) => t && t.svg ? t.svg : '';
window.toolPreview = (t) => {
  if (!t || !t.preview) return '';
  if (t.previewType === 'swatch') return `<span class="card-preview swatch"><span class="sw" style="background:${t.preview}"></span><code>${t.preview}</code></span>`;
  if (t.previewType === 'mono')   return `<span class="card-preview mono"><code>${t.preview}</code></span>`;
  return `<span class="card-preview chip">${t.preview}</span>`;
};

// ---------- Command palette (⌘K) ----------
window.initCmdPalette = function() {
  const overlay = document.createElement("div");
  overlay.className = "cmd-overlay";
  overlay.innerHTML = `
    <div class="cmd-modal">
      <input class="cmd-input" type="text" placeholder="Search tools…" autocomplete="off" />
      <div class="cmd-list"></div>
    </div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector(".cmd-input");
  const list = overlay.querySelector(".cmd-list");
  let active = 0;
  const base = location.pathname.includes("/tools/") ? "../" : "";

  function render(q) {
    const ql = q.trim().toLowerCase();
    const results = (ql ? TOOLS.filter(t =>
      t.name.toLowerCase().includes(ql) ||
      t.cat.toLowerCase().includes(ql) ||
      t.desc.toLowerCase().includes(ql)
    ) : TOOLS).slice(0, 12);
    if (active >= results.length) active = 0;
    list.innerHTML = results.map((t, i) => `
      <a class="cmd-item ${i === active ? 'active' : ''}" href="${base}${t.path}" data-i="${i}">
        <span class="cmd-icon">${t.svg || ''}</span>
        <span>${t.name}</span>
        <span class="cmd-cat">${t.cat}</span>
      </a>`).join("") || `<div style="padding:24px;text-align:center;color:var(--fg-faint);">No tools match.</div>`;
    list._results = results;
  }

  function open() {
    overlay.classList.add("show");
    input.value = "";
    input.focus();
    active = 0;
    render("");
  }
  function close() { overlay.classList.remove("show"); }

  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.classList.contains("show") ? close() : open();
    }
    if (overlay.classList.contains("show")) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const n = (list._results || []).length;
        if (!n) return;
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
        render(input.value);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const r = list._results || [];
        if (r[active]) location.href = base + r[active].path;
      }
    }
  });
  input.addEventListener("input", () => { active = 0; render(input.value); });
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  list.addEventListener("mouseover", e => {
    const item = e.target.closest(".cmd-item");
    if (!item) return;
    active = +item.dataset.i; render(input.value);
  });

  // search button in sidebar
  document.querySelectorAll("[data-action=search]").forEach(b => b.addEventListener("click", open));
};

// ---------- Crumbs ----------
window.renderCrumbs = function(extra) {
  const el = document.getElementById("crumbs");
  if (!el) return;
  const base = location.pathname.includes("/tools/") ? "../" : "";
  let html = `<a href="${base}index.html">Home</a>`;
  if (extra) {
    for (const c of extra) {
      html += `<span class="crumb-sep">/</span>` + (c.href ? `<a href="${c.href}">${c.label}</a>` : `<span>${c.label}</span>`);
    }
  }
  el.innerHTML = html;
};

// ---------- Per-tool history ----------
window.History = {
  key: (toolId) => `it.history.${toolId}`,
  list(toolId) { return LS.get(this.key(toolId), []); },
  push(toolId, entry) {
    if (!entry) return;
    const list = this.list(toolId).filter(x => x.label !== entry.label).slice(0, 4);
    list.unshift({ ...entry, t: Date.now() });
    LS.set(this.key(toolId), list);
    this._notify(toolId);
  },
  clear(toolId) { LS.set(this.key(toolId), []); this._notify(toolId); },
  _listeners: {},
  on(toolId, fn) { (this._listeners[toolId] ||= []).push(fn); },
  _notify(toolId) { (this._listeners[toolId] || []).forEach(fn => fn()); },

  // Mount a history strip into a container.
  // labelFn(entry) → string shown; onPick(entry) → restore handler.
  mount(toolId, container, onPick, opts = {}) {
    if (!container) return;
    const strip = document.createElement("div");
    strip.className = "history-strip";
    container.appendChild(strip);

    const render = () => {
      const items = this.list(toolId);
      if (!items.length) { strip.innerHTML = ""; strip.classList.remove("has-items"); return; }
      strip.classList.add("has-items");
      strip.innerHTML = `
        <div class="history-head">
          <span class="history-title">Recent</span>
          <button class="history-clear" type="button">Clear</button>
        </div>
        <div class="history-items">
          ${items.map((e, i) => `
            <button class="history-item" type="button" data-i="${i}" title="${(e.label||'').replace(/"/g,'&quot;')}">
              <span class="history-label">${(e.label||'').slice(0, opts.maxLen || 48)}</span>
              <span class="history-time">${timeAgo(e.t)}</span>
            </button>`).join("")}
        </div>`;
      strip.querySelector(".history-clear").addEventListener("click", () => this.clear(toolId));
      strip.querySelectorAll(".history-item").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = +btn.dataset.i;
          onPick && onPick(items[idx]);
        });
      });
    };
    this.on(toolId, render);
    render();
  }
};

function timeAgo(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s/60) + "m";
  if (s < 86400) return Math.floor(s/3600) + "h";
  return Math.floor(s/86400) + "d";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  if (!document.documentElement.hasAttribute("data-theme")) initTheme();
});
