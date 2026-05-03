/* Tweaks panel for Workbench — full design playground
   Themes:  mono | editorial | grid | aurora
*/

const FONT_OPTIONS = [
  {value: "'Geist', system-ui, sans-serif", label: "Geist"},
  {value: "Inter, system-ui, sans-serif", label: "Inter"},
  {value: "'Space Grotesk', sans-serif", label: "Space Grotesk"},
  {value: "'Fraunces', serif", label: "Fraunces (serif)"},
  {value: "'Newsreader', serif", label: "Newsreader (serif)"},
  {value: "'Archivo Black', sans-serif", label: "Archivo Black"},
  {value: "'JetBrains Mono', monospace", label: "JetBrains Mono"},
  {value: "'IBM Plex Mono', monospace", label: "IBM Plex Mono"},
  {value: "'Geist Mono', monospace", label: "Geist Mono"},
  {value: "Georgia, serif", label: "Georgia"},
  {value: "system-ui, sans-serif", label: "System default"},
];

const MONO_OPTIONS = [
  {value: "'Geist Mono', monospace", label: "Geist Mono"},
  {value: "'JetBrains Mono', monospace", label: "JetBrains Mono"},
  {value: "'IBM Plex Mono', monospace", label: "IBM Plex Mono"},
  {value: "'SF Mono', Menlo, monospace", label: "SF Mono"},
  {value: "'Courier New', monospace", label: "Courier"},
];

const ACCENT_PRESETS = [
  {label: "Indigo",  value: "#6366f1"},
  {label: "Violet",  value: "#8b5cf6"},
  {label: "Cyan",    value: "#06b6d4"},
  {label: "Pink",    value: "#ec4899"},
  {label: "Green",   value: "#22c55e"},
  {label: "Matrix",  value: "#00ff41"},
  {label: "Orange",  value: "#f97316"},
  {label: "Red",     value: "#ef4444"},
  {label: "Mauve",   value: "#3b2f56"},
  {label: "Amber",   value: "#f59e0b"},
];

/* Curated presets — one click applies a coherent system */
const PRESETS = [
  {
    id: "linear",
    name: "Linear",
    note: "Mono dark, indigo accent",
    swatches: ["#0a0a0a", "#181818", "#6366f1"],
    values: {
      theme: "mono", accent: "#6366f1",
      bodyFont: "'Geist', system-ui, sans-serif",
      headFont: "'Geist', system-ui, sans-serif",
      monoFont: "'Geist Mono', monospace",
      radius: 8, shadow: 1, fontSize: 14, density: "default",
      lineHeight: 1.55, letterSpacing: 0,
      cardStyle: "subtle", buttonStyle: "rounded",
    }
  },
  {
    id: "vercel",
    name: "Vercel",
    note: "Black, Geist, sharper edges",
    swatches: ["#000", "#0a0a0a", "#fff"],
    values: {
      theme: "mono", accent: "#ffffff",
      bodyFont: "'Geist', system-ui, sans-serif",
      headFont: "'Geist', system-ui, sans-serif",
      monoFont: "'Geist Mono', monospace",
      radius: 6, shadow: 0.4, fontSize: 14, density: "compact",
      lineHeight: 1.5, letterSpacing: 0,
      cardStyle: "subtle", buttonStyle: "rounded",
    }
  },
  {
    id: "paper",
    name: "Paper",
    note: "Editorial serif, warm",
    swatches: ["#faf8f4", "#1a1814", "#b45309"],
    values: {
      theme: "editorial", accent: "#b45309",
      bodyFont: "'Geist', system-ui, sans-serif",
      headFont: "'Fraunces', serif",
      monoFont: "'IBM Plex Mono', monospace",
      radius: 14, shadow: 0.6, fontSize: 16, density: "default",
      lineHeight: 1.6, letterSpacing: 0,
      cardStyle: "raised", buttonStyle: "rounded",
    }
  },
  {
    id: "swiss",
    name: "Swiss",
    note: "Grid mono, sharp rules",
    swatches: ["#fafafa", "#0a0a0a", "#dc2626"],
    values: {
      theme: "grid", accent: "#dc2626",
      bodyFont: "'IBM Plex Mono', monospace",
      headFont: "'IBM Plex Mono', monospace",
      monoFont: "'IBM Plex Mono', monospace",
      radius: 0, shadow: 0, fontSize: 13, density: "compact",
      lineHeight: 1.55, letterSpacing: 0.01,
      cardStyle: "outline", buttonStyle: "square",
    }
  },
  {
    id: "aurora",
    name: "Aurora",
    note: "Glass + gradients",
    swatches: ["#07080f", "#8b5cf6", "#06b6d4"],
    values: {
      theme: "aurora", accent: "#8b5cf6",
      bodyFont: "'Geist', system-ui, sans-serif",
      headFont: "'Geist', system-ui, sans-serif",
      monoFont: "'Geist Mono', monospace",
      radius: 16, shadow: 1.2, fontSize: 15, density: "default",
      lineHeight: 1.55, letterSpacing: 0,
      cardStyle: "glass", buttonStyle: "rounded",
    }
  },
  {
    id: "clean",
    name: "Clean",
    note: "it-tools.tech style — light, friendly",
    swatches: ["#f1f5f9", "#ffffff", "#18a058"],
    values: {
      theme: "clean", accent: "#18a058",
      bodyFont: "'Geist', system-ui, sans-serif",
      headFont: "'Geist', system-ui, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: 12, shadow: 0.4, fontSize: 14, density: "default",
      lineHeight: 1.55, letterSpacing: 0,
      cardStyle: "outline", buttonStyle: "rounded",
    }
  },
  {
    id: "matrix",
    name: "Matrix",
    note: "Green-on-black hacker",
    swatches: ["#000", "#00ff41", "#003311"],
    values: {
      theme: "mono", accent: "#00ff41",
      bodyFont: "'JetBrains Mono', monospace",
      headFont: "'JetBrains Mono', monospace",
      monoFont: "'JetBrains Mono', monospace",
      radius: 0, shadow: 0, fontSize: 14, density: "compact",
      lineHeight: 1.5, letterSpacing: 0.01,
      cardStyle: "outline", buttonStyle: "square",
    }
  },
];

/* Theme migration — handle old saved theme names */
function migrateTheme(t) {
  const map = { neumorph: "editorial", terminal: "mono", brutalist: "grid" };
  return map[t] || t;
}

const TweakRoot = () => {
  const [t, setT] = useTweaks(window.__TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    const theme = migrateTheme(t.theme);
    if (theme !== t.theme) setT("theme", theme);

    applyTheme(theme);
    applyDensity(t.density);
    root.setAttribute("data-collapsed", t.sidebarCollapsed ? "true" : "false");
    root.setAttribute("data-card", t.cardStyle || "subtle");
    root.setAttribute("data-btn", t.buttonStyle || "rounded");

    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-2", shade(t.accent, -12));
    root.style.setProperty("--accent-glow", hexToRgba(t.accent, 0.30));

    root.style.setProperty("--fs-body", t.fontSize + "px");
    root.style.setProperty("--fs-h1", Math.round(t.fontSize * 2.1) + "px");
    root.style.setProperty("--fs-h2", Math.round(t.fontSize * 1.4) + "px");
    if (t.bodyFont)  root.style.setProperty("--font-body", t.bodyFont);
    if (t.headFont)  root.style.setProperty("--font-head", t.headFont);
    if (t.monoFont)  root.style.setProperty("--font-mono", t.monoFont);

    root.style.setProperty("--radius",     t.radius + "px");
    root.style.setProperty("--radius-sm",  Math.max(0, Math.round(t.radius * 0.6)) + "px");
    root.style.setProperty("--shadow-mult", String(t.shadow));

    if (t.lineHeight) document.body.style.setProperty("line-height", String(t.lineHeight));
    if (t.letterSpacing != null) document.body.style.setProperty("letter-spacing", t.letterSpacing + "em");

    // Extended tweaks
    if (t.sidebarWidth)  root.style.setProperty("--sidebar-w", t.sidebarWidth + "px");
    if (t.contentMaxW)   root.style.setProperty("--content-maxw", t.contentMaxW + "px");
    if (t.borderWeight != null) root.style.setProperty("--border-w", t.borderWeight + "px");
    if (t.uiScale)       root.style.setProperty("--ui-scale", String(t.uiScale));
    if (t.cardPadding)   root.style.setProperty("--card-pad", t.cardPadding + "px");
    if (t.gridGap != null) root.style.setProperty("--grid-gap", t.gridGap + "px");
    if (t.cardMinW)      root.style.setProperty("--card-minw", t.cardMinW + "px");
    if (t.headWeight)    root.style.setProperty("--head-weight", String(t.headWeight));
    if (t.bodyWeight)    root.style.setProperty("--body-weight", String(t.bodyWeight));
    if (t.heroScale)     root.style.setProperty("--hero-scale", String(t.heroScale));
    if (t.bgTint != null) root.style.setProperty("--bg-tint", t.bgTint + "%");
    if (t.contrast != null) root.style.setProperty("--contrast", String(t.contrast));
    if (t.animSpeed != null) root.style.setProperty("--anim-speed", t.animSpeed + "ms");

    root.setAttribute("data-mono-icons", t.monoIcons ? "true" : "false");
    root.setAttribute("data-uppercase-h", t.uppercaseHeadings ? "true" : "false");
    root.setAttribute("data-italic-h", t.italicHeadings ? "true" : "false");
    root.setAttribute("data-grain", t.grain ? "true" : "false");
    root.setAttribute("data-gradient-bg", t.gradientBg ? "true" : "false");
    root.setAttribute("data-show-numbers", t.showNumbers ? "true" : "false");
    root.setAttribute("data-divider", t.dividerStyle || "line");
    root.setAttribute("data-focus", t.focusRing || "glow");
    root.setAttribute("data-hover", t.hoverStyle || "lift");
  }, [t]);

  function applyPreset(p) {
    setT(p.values);
  }

  const activePreset = PRESETS.find(p =>
    p.values.theme === t.theme &&
    p.values.accent.toLowerCase() === (t.accent || "").toLowerCase()
  );

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Presets">
        <div className="preset-grid">
          {PRESETS.map(p => (
            <button
              key={p.id}
              className={"preset-chip " + (activePreset?.id === p.id ? "active" : "")}
              onClick={() => applyPreset(p)}
              title={p.note}
            >
              <span>{p.name}</span>
              <small>{p.note}</small>
              <div className="swatches">
                {p.swatches.map((c, i) => <span key={i} style={{background: c}} />)}
              </div>
            </button>
          ))}
        </div>
      </TweakSection>

      <TweakSection title="Theme">
        <TweakRadio label="Direction"
          value={migrateTheme(t.theme)}
          options={[
            {value: "mono",      label: "Mono"},
            {value: "clean",     label: "Clean"},
            {value: "editorial", label: "Editorial"},
            {value: "grid",      label: "Grid"},
            {value: "aurora",    label: "Aurora"},
          ]}
          onChange={v => setT("theme", v)} />
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:8}}>
          {ACCENT_PRESETS.map(p => (
            <button key={p.value} onClick={() => setT("accent", p.value)}
              title={p.label}
              style={{
                width: 22, height: 22, borderRadius: 6, padding: 0,
                background: p.value, cursor: "pointer",
                border: (t.accent || "").toLowerCase() === p.value.toLowerCase()
                  ? "2px solid white" : "1px solid rgba(255,255,255,0.2)",
              }} />
          ))}
        </div>
        <TweakColor label="Custom accent" value={t.accent} onChange={v => setT("accent", v)} />
      </TweakSection>

      <TweakSection title="Layout">
        <TweakRadio label="Density" value={t.density}
          options={[{value: "default", label: "Comfy"}, {value: "compact", label: "Compact"}]}
          onChange={v => setT("density", v)} />
        <TweakRadio label="Card style" value={t.cardStyle || "subtle"}
          options={[
            {value: "subtle",  label: "Subtle"},
            {value: "outline", label: "Outline"},
            {value: "raised",  label: "Raised"},
            {value: "glass",   label: "Glass"},
          ]}
          onChange={v => setT("cardStyle", v)} />
        <TweakRadio label="Buttons" value={t.buttonStyle || "rounded"}
          options={[
            {value: "rounded", label: "Rounded"},
            {value: "pill",    label: "Pill"},
            {value: "square",  label: "Square"},
          ]}
          onChange={v => setT("buttonStyle", v)} />
        <TweakSlider label="Corner radius" min={0} max={28} step={1} value={t.radius} onChange={v => setT("radius", v)} />
        <TweakSlider label="Shadow strength" min={0} max={2.4} step={0.1} value={t.shadow} onChange={v => setT("shadow", v)} />
        <TweakToggle label="Sidebar collapsed" value={t.sidebarCollapsed} onChange={v => setT("sidebarCollapsed", v)} />
      </TweakSection>

      <TweakSection title="Type">
        <TweakSelect label="Body" value={t.bodyFont} options={FONT_OPTIONS} onChange={v => setT("bodyFont", v)} />
        <TweakSelect label="Heading" value={t.headFont} options={FONT_OPTIONS} onChange={v => setT("headFont", v)} />
        <TweakSelect label="Mono" value={t.monoFont} options={MONO_OPTIONS} onChange={v => setT("monoFont", v)} />
        <TweakSlider label="Font size" min={12} max={20} step={1} value={t.fontSize} onChange={v => setT("fontSize", v)} />
        <TweakSlider label="Line height" min={1.2} max={1.9} step={0.05} value={t.lineHeight ?? 1.55} onChange={v => setT("lineHeight", v)} />
        <TweakSlider label="Letter spacing" min={-0.02} max={0.06} step={0.005} value={t.letterSpacing ?? 0} onChange={v => setT("letterSpacing", v)} />
        <TweakSlider label="Heading weight" min={300} max={800} step={100} value={t.headWeight ?? 600} onChange={v => setT("headWeight", v)} />
        <TweakSlider label="Body weight" min={300} max={600} step={100} value={t.bodyWeight ?? 400} onChange={v => setT("bodyWeight", v)} />
        <TweakSlider label="Hero scale" min={0.7} max={1.6} step={0.05} value={t.heroScale ?? 1} onChange={v => setT("heroScale", v)} />
        <TweakToggle label="Uppercase headings" value={!!t.uppercaseHeadings} onChange={v => setT("uppercaseHeadings", v)} />
        <TweakToggle label="Italic headings" value={!!t.italicHeadings} onChange={v => setT("italicHeadings", v)} />
      </TweakSection>

      <TweakSection title="Spacing & sizing">
        <TweakSlider label="Sidebar width" min={200} max={320} step={4} value={t.sidebarWidth ?? 260} onChange={v => setT("sidebarWidth", v)} />
        <TweakSlider label="Content max-width" min={900} max={1600} step={20} value={t.contentMaxW ?? 1380} onChange={v => setT("contentMaxW", v)} />
        <TweakSlider label="Card padding" min={12} max={32} step={1} value={t.cardPadding ?? 18} onChange={v => setT("cardPadding", v)} />
        <TweakSlider label="Card min width" min={200} max={360} step={10} value={t.cardMinW ?? 260} onChange={v => setT("cardMinW", v)} />
        <TweakSlider label="Grid gap" min={4} max={24} step={1} value={t.gridGap ?? 10} onChange={v => setT("gridGap", v)} />
        <TweakSlider label="Border weight" min={0} max={3} step={1} value={t.borderWeight ?? 1} onChange={v => setT("borderWeight", v)} />
        <TweakSlider label="UI scale" min={0.85} max={1.2} step={0.05} value={t.uiScale ?? 1} onChange={v => setT("uiScale", v)} />
      </TweakSection>

      <TweakSection title="Atmosphere">
        <TweakSlider label="Background tint" min={0} max={100} step={1} value={t.bgTint ?? 0} onChange={v => setT("bgTint", v)} />
        <TweakSlider label="Contrast" min={0.85} max={1.25} step={0.05} value={t.contrast ?? 1} onChange={v => setT("contrast", v)} />
        <TweakSlider label="Animation speed" min={0} max={400} step={20} value={t.animSpeed ?? 150} onChange={v => setT("animSpeed", v)} />
        <TweakRadio label="Divider style" value={t.dividerStyle || "line"}
          options={[{value: "line", label: "Line"}, {value: "dotted", label: "Dotted"}, {value: "none", label: "None"}]}
          onChange={v => setT("dividerStyle", v)} />
        <TweakRadio label="Focus ring" value={t.focusRing || "glow"}
          options={[{value: "glow", label: "Glow"}, {value: "solid", label: "Solid"}, {value: "underline", label: "Line"}]}
          onChange={v => setT("focusRing", v)} />
        <TweakRadio label="Hover" value={t.hoverStyle || "lift"}
          options={[{value: "lift", label: "Lift"}, {value: "glow", label: "Glow"}, {value: "invert", label: "Invert"}, {value: "none", label: "None"}]}
          onChange={v => setT("hoverStyle", v)} />
        <TweakToggle label="Mono icons" value={!!t.monoIcons} onChange={v => setT("monoIcons", v)} />
        <TweakToggle label="Numbered nav" value={!!t.showNumbers} onChange={v => setT("showNumbers", v)} />
        <TweakToggle label="Gradient background" value={!!t.gradientBg} onChange={v => setT("gradientBg", v)} />
        <TweakToggle label="Film grain" value={!!t.grain} onChange={v => setT("grain", v)} />
      </TweakSection>
    </TweaksPanel>
  );
};

/* helpers */
function hexToRgba(hex, a) {
  if (!hex || !hex.startsWith("#")) return `rgba(99,102,241,${a})`;
  const h = hex.replace("#",""); const v = h.length===3 ? h.split("").map(x=>x+x).join("") : h;
  const n = parseInt(v,16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}
function shade(hex, pct) {
  if (!hex || !hex.startsWith("#")) return hex;
  const h = hex.replace("#",""); const v = h.length===3 ? h.split("").map(x=>x+x).join("") : h;
  const n = parseInt(v,16); let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  const f = pct/100;
  r = Math.max(0, Math.min(255, Math.round(r + (pct<0 ? r*f : (255-r)*f))));
  g = Math.max(0, Math.min(255, Math.round(g + (pct<0 ? g*f : (255-g)*f))));
  b = Math.max(0, Math.min(255, Math.round(b + (pct<0 ? b*f : (255-b)*f))));
  return "#" + [r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");
}

const tweakHost = document.createElement("div");
document.body.appendChild(tweakHost);
ReactDOM.createRoot(tweakHost).render(<TweakRoot />);
