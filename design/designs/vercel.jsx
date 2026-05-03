/* DIRECTION — VERCEL DARK
   Deep black, Geist, gradient-clipped headlines, dotted bg. */

function Vercel({ view = "home" }) {
  return (
    <div className="vc">
      <div className="vc-shell">
        <aside className="vc-side">
          <div className="vc-brand">
            <svg className="vc-tri" viewBox="0 0 24 24"><path d="M12 2 L22 22 L2 22 Z" fill="#fff"/></svg>
            <span>workbench</span>
          </div>
          <div className="vc-search">
            <span style={{opacity:0.5}}>⌕</span><span>Search…</span>
            <span className="k">⌘K</span>
          </div>

          <div className="vc-nav-h">PINNED</div>
          <a className={"vc-nav "+(view==="home"?"":"act")}>Hash text</a>
          <a className="vc-nav">JWT parser</a>
          <a className="vc-nav">Color converter</a>

          <div className="vc-nav-h">CRYPTO</div>
          <a className="vc-nav">Encrypt</a>
          <a className="vc-nav">Bcrypt</a>

          <div className="vc-nav-h">CONVERTER</div>
          <a className="vc-nav">Base64</a>
          <a className="vc-nav">JSON ↔ YAML</a>
          <a className="vc-nav">Case</a>

          <div className="vc-foot">
            Made with <span style={{color:"#a855f7"}}>♥</span> by Prathyosh
            <div className="d">All processing runs locally — no data leaves your browser.</div>
          </div>
        </aside>
        <main className="vc-main">
          <div className="vc-top">
            <div className="vc-crumb">
              <span>workbench</span>
              {view==="tool" && <><span className="s">/</span><span>crypto</span><span className="s">/</span><span style={{color:"#fff"}}>hash-text</span></>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="vc-btn ghost">Feedback</button>
              <button className="vc-btn">Deploy ↗</button>
            </div>
          </div>
          {view==="home" ? <VercelHome/> : <VercelTool/>}
        </main>
      </div>
    </div>
  );
}

function VercelHome() {
  return (
    <div className="vc-body">
      <div className="vc-pill">▲  v26.5 · all 26 tools</div>
      <h1 className="vc-h1">A toolbox for the work <span className="grad">in&nbsp;between.</span></h1>
      <p className="vc-sub">26 single-purpose developer utilities. Lightning fast. Local-only. Built for the keyboard.</p>
      <div style={{display:"flex",gap:10}}>
        <button className="vc-btn primary">Open Hash text  →</button>
        <button className="vc-btn">Browse all</button>
      </div>

      <div className="vc-sect">
        <span className="vc-sect-l">Pinned</span><span className="vc-sect-r">3 tools</span>
      </div>
      <div className="vc-grid">
        {[
          ["Hash text","MD5, SHA-1, SHA-256, SHA-512.","Crypto"],
          ["JWT parser","Decode and inspect tokens.","Crypto"],
          ["Color converter","HEX, RGB, HSL, OKLCH.","Convert"],
        ].map(([n,d,c],i)=>(
          <a key={i} className="vc-card">
            <div className="vc-card-cat">{c}</div>
            <div className="vc-card-name">{n}</div>
            <div className="vc-card-desc">{d}</div>
            <div className="vc-card-arrow">→</div>
          </a>
        ))}
      </div>

      <div className="vc-sect"><span className="vc-sect-l">Crypto</span><span className="vc-sect-r">4 tools</span></div>
      <div className="vc-grid">
        {[
          ["Hash text","MD5, SHA-1, SHA-256, SHA-512."],
          ["Encrypt","AES symmetric encryption."],
          ["Bcrypt","Generate and verify hashes."],
          ["JWT parser","Decode and inspect tokens."],
        ].map(([n,d],i)=>(
          <a key={i} className="vc-card">
            <div className="vc-card-cat">Crypto</div>
            <div className="vc-card-name">{n}</div>
            <div className="vc-card-desc">{d}</div>
            <div className="vc-card-arrow">→</div>
          </a>
        ))}
      </div>

      <div className="vc-sect"><span className="vc-sect-l">Converter</span><span className="vc-sect-r">4 tools</span></div>
      <div className="vc-grid">
        {[
          ["Base64","Encode and decode strings."],
          ["JSON ↔ YAML","Convert between formats."],
          ["Color","HEX, RGB, HSL, OKLCH."],
          ["Case","camel, snake, kebab, Pascal."],
        ].map(([n,d],i)=>(
          <a key={i} className="vc-card">
            <div className="vc-card-cat">Convert</div>
            <div className="vc-card-name">{n}</div>
            <div className="vc-card-desc">{d}</div>
            <div className="vc-card-arrow">→</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function VercelTool() {
  return (
    <div className="vc-body">
      <div className="vc-pill">▲ Crypto · Hash text</div>
      <h1 className="vc-h1" style={{fontSize:48}}>Hash <span className="grad">any text,</span> instantly.</h1>
      <p className="vc-sub">MD5, SHA-1, SHA-256, SHA-512 — computed locally as you type.</p>

      <section className="vc-panel">
        <div className="vc-pl">INPUT</div>
        <textarea className="vc-ta" defaultValue="The quick brown fox jumps over the lazy dog"></textarea>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button className="vc-btn primary">Compute</button>
          <button className="vc-btn">Clear</button>
        </div>
      </section>
      <section className="vc-panel">
        <div className="vc-pl">OUTPUT</div>
        {[
          ["MD5","9e107d9d372bb6826bd81d3542a419d6"],
          ["SHA-1","2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"],
          ["SHA-256","d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"],
          ["SHA-512","07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb6…"],
        ].map(([a,v])=>(
          <div className="vc-hash" key={a}>
            <span className="alg">{a}</span>
            <span className="v">{v}</span>
            <span className="cp">⧉</span>
          </div>
        ))}
      </section>
    </div>
  );
}

Object.assign(window, { Vercel });
