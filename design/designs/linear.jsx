/* DIRECTION — LINEAR
   Mono-dark, surgical density, gradient brand mark, fine grid. */

function Linear({ view = "home" }) {
  return (
    <div className="lin">
      <div className="lin-shell">
        <aside className="lin-side">
          <div className="lin-brand">
            <span className="lin-mark"></span>
            <span>Workbench</span>
            <span className="lin-ver">26.5</span>
          </div>
          <div className="lin-search">
            <span style={{opacity:0.5}}>⌕</span><span>Search…</span>
            <span className="lin-k">⌘K</span>
          </div>
          <div className="lin-nav-h">Pinned</div>
          <a className={"lin-nav " + (view==="home"?"":"act")}><span className="d">●</span>Hash text</a>
          <a className="lin-nav"><span className="d">●</span>JWT parser</a>
          <a className="lin-nav"><span className="d">●</span>Color converter</a>
          <div className="lin-nav-h">Crypto · 4</div>
          <a className="lin-nav">Hash text</a>
          <a className="lin-nav">Encrypt</a>
          <a className="lin-nav">Bcrypt</a>
          <a className="lin-nav">JWT parser</a>
          <div className="lin-nav-h">Converter · 4</div>
          <a className="lin-nav">Base64</a>
          <a className="lin-nav">JSON ↔ YAML</a>
          <a className="lin-nav">Color</a>
          <a className="lin-nav">Case</a>
          <div className="lin-foot">
            Made with <span style={{color:"#a78bfa"}}>♥</span> by Prathyosh
            <div className="d">All processing runs locally — no data leaves your browser.</div>
          </div>
        </aside>
        <main className="lin-main">
          <div className="lin-top">
            <div className="lin-crumb">
              <span>Workbench</span>
              {view === "tool" && <><span className="s">/</span><span>Crypto</span><span className="s">/</span><span style={{color:"#fff"}}>Hash text</span></>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="lin-btn">⌘K</button>
              <button className="lin-btn">⚙</button>
            </div>
          </div>
          {view === "home" ? <LinearHome/> : <LinearTool/>}
        </main>
      </div>
    </div>
  );
}

function LinearHome() {
  return (
    <div className="lin-body">
      <h1 className="lin-h1">All-in-one developer toolbox</h1>
      <p className="lin-sub">26 tools for the work in between the work. Local-only. Keyboard-first.</p>

      <div className="lin-stats">
        <div className="lin-stat"><span className="l">Tools</span><span className="v">26</span></div>
        <div className="lin-stat"><span className="l">Pinned</span><span className="v">3</span></div>
        <div className="lin-stat"><span className="l">Used today</span><span className="v">12</span></div>
        <div className="lin-stat"><span className="l">Local</span><span className="v">100%</span></div>
      </div>

      <div className="lin-sect">Pinned · 3</div>
      <div className="lin-grid">
        {[
          ["Hash text","MD5, SHA-1, SHA-256, SHA-512","Crypto"],
          ["JWT parser","Decode and inspect tokens","Crypto"],
          ["Color converter","HEX, RGB, HSL, OKLCH","Converter"],
        ].map(([n,d,c],i)=>(
          <a key={i} className="lin-card">
            <span className="lin-cat">{c}</span>
            <span className="lin-name">{n}</span>
            <span className="lin-desc">{d}</span>
          </a>
        ))}
      </div>

      <div className="lin-sect">Crypto · 4</div>
      <div className="lin-grid">
        {[
          ["Hash text","MD5, SHA-1, SHA-256, SHA-512"],
          ["Encrypt / decrypt","AES-style symmetric encryption"],
          ["JWT parser","Decode and inspect tokens"],
          ["Bcrypt","Generate and verify hashes"],
        ].map(([n,d],i)=>(
          <a key={i} className="lin-card">
            <span className="lin-cat">Crypto</span>
            <span className="lin-name">{n}</span>
            <span className="lin-desc">{d}</span>
          </a>
        ))}
      </div>

      <div className="lin-sect">Converter · 4</div>
      <div className="lin-grid">
        {[
          ["Base64","Encode and decode"],
          ["JSON ↔ YAML","Both directions"],
          ["Color","HEX RGB HSL OKLCH"],
          ["Case","camel, snake, kebab, Pascal"],
        ].map(([n,d],i)=>(
          <a key={i} className="lin-card">
            <span className="lin-cat">Converter</span>
            <span className="lin-name">{n}</span>
            <span className="lin-desc">{d}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function LinearTool() {
  return (
    <div className="lin-body">
      <h1 className="lin-h1">Hash text</h1>
      <p className="lin-sub">MD5, SHA-1, SHA-256, SHA-512 computed locally.</p>
      <div className="lin-panel">
        <div className="lin-pl">Input</div>
        <textarea className="lin-ta" defaultValue="The quick brown fox jumps over the lazy dog"></textarea>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button className="lin-btn primary">Compute</button>
          <button className="lin-btn">Clear</button>
        </div>
      </div>
      <div className="lin-panel" style={{marginTop:12}}>
        <div className="lin-pl">Output</div>
        {[
          ["MD5","9e107d9d372bb6826bd81d3542a419d6"],
          ["SHA-1","2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"],
          ["SHA-256","d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"],
          ["SHA-512","07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb6…"],
        ].map(([a,v])=>(
          <div className="lin-row" key={a}>
            <span className="alg">{a}</span>
            <span className="v">{v}</span>
            <span style={{color:"#666"}}>⧉</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Linear });
