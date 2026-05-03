/* DIRECTION — SWISS GRID
   Structural, monospace, icon-rail sidebar, hard borders. */

function Swiss({ view = "home" }) {
  return (
    <div className="sw">
      <div className="sw-shell">
        <aside className="sw-rail">
          <div className="sw-mark">W/</div>
          {["#","{}","**","[/]","::","<>","Aa","/.*/","≠"].map((c,i)=>(
            <button key={i} className={"sw-ic " + (i===0?"act":"")}>{c}</button>
          ))}
          <div style={{flex:1}}></div>
          <button className="sw-ic">⚙</button>
        </aside>
        <aside className="sw-list">
          <div className="sw-l-top">
            <div className="sw-l-title">Hash text</div>
            <div className="sw-l-sub">CRYPTO / 04 TOOLS</div>
          </div>
          <div className="sw-l-search">⌕  search</div>
          <div className="sw-li act"><span className="n">01</span><span className="t">Hash text</span><span className="ch">→</span></div>
          <div className="sw-li"><span className="n">02</span><span className="t">Encrypt / decrypt</span><span className="ch">→</span></div>
          <div className="sw-li"><span className="n">03</span><span className="t">Bcrypt</span><span className="ch">→</span></div>
          <div className="sw-li"><span className="n">04</span><span className="t">JWT parser</span><span className="ch">→</span></div>
          <div className="sw-l-foot">
            MADE BY PRATHYOSH<br/>
            <span style={{opacity:.6}}>Local-only · v26.5 · 2026</span>
          </div>
        </aside>
        <main className="sw-main">
          <div className="sw-top">
            <div className="sw-crumb">
              <span>WB</span><span>/</span><span>CRY</span><span>/</span>
              <span style={{color:"#000"}}>{view==="tool"?"HASH-TEXT":"INDEX"}</span>
            </div>
            <div className="sw-meta">
              <span>26.5.2026</span><span>·</span><span>{view==="tool"?"01 / 26":"INDEX"}</span>
            </div>
          </div>
          {view === "home" ? <SwissHome/> : <SwissTool/>}
        </main>
      </div>
    </div>
  );
}

function SwissHome() {
  return (
    <div className="sw-body">
      <div className="sw-h-block">
        <div className="sw-h-num">№ 26</div>
        <h1 className="sw-h1">Workbench</h1>
        <p className="sw-h-sub">Twenty-six single-purpose tools.<br/>All client-side. Keyboard first.</p>
      </div>
      <div className="sw-grid">
        {[
          ["01","Hash text","Crypto","MD5 / SHA-1 / SHA-256 / SHA-512"],
          ["02","Encrypt","Crypto","AES symmetric"],
          ["03","Bcrypt","Crypto","Generate · verify"],
          ["04","JWT parser","Crypto","Inspect tokens"],
          ["05","Base64","Convert","Encode · decode"],
          ["06","JSON ↔ YAML","Convert","Both directions"],
          ["07","Color","Convert","HEX RGB HSL OKLCH"],
          ["08","Case","Convert","camel · snake · kebab"],
          ["09","Regex","Dev","Live test, capture groups"],
        ].map(([n,name,cat,d])=>(
          <a key={n} className="sw-cell">
            <div className="sw-cell-top"><span>{n}</span><span>{cat}</span></div>
            <div className="sw-cell-name">{name}</div>
            <div className="sw-cell-desc">{d}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function SwissTool() {
  return (
    <div className="sw-body">
      <div className="sw-h-block">
        <div className="sw-h-num">№ 01 · CRYPTO</div>
        <h1 className="sw-h1">Hash text</h1>
        <p className="sw-h-sub">Compute MD5, SHA-1, SHA-256, SHA-512.<br/>Locally, always.</p>
      </div>
      <div className="sw-panel">
        <div className="sw-pl">— INPUT</div>
        <textarea className="sw-ta" defaultValue="The quick brown fox jumps over the lazy dog"></textarea>
        <div style={{display:"flex",gap:0,borderTop:"1px solid #000"}}>
          <button className="sw-btn primary">COMPUTE →</button>
          <button className="sw-btn">CLEAR</button>
          <div style={{flex:1}}></div>
          <button className="sw-btn">UTF-8 ▾</button>
        </div>
      </div>
      <div className="sw-panel" style={{marginTop:24}}>
        <div className="sw-pl">— OUTPUT</div>
        {[
          ["MD5","9e107d9d372bb6826bd81d3542a419d6"],
          ["SHA-1","2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"],
          ["SHA-256","d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"],
          ["SHA-512","07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb6…"],
        ].map(([a,v])=>(
          <div className="sw-hash" key={a}>
            <span className="alg">{a}</span>
            <span className="v">{v}</span>
            <span className="cp">⧉</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Swiss });
