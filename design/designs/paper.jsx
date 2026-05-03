/* DIRECTION — PAPER
   Editorial warmth, Newsreader serif, generous whitespace. */

function Paper({ view = "home" }) {
  return (
    <div className="pap">
      <div className="pap-shell">
        <aside className="pap-side">
          <div className="pap-brand">
            <span style={{fontFamily:'"Newsreader",serif',fontStyle:'italic',fontWeight:500}}>Workbench</span>
            <span className="pap-ver">No. 26</span>
          </div>
          <div className="pap-rule"></div>
          <div className="pap-search">⌕  Search the index…</div>

          <div className="pap-nav-h">— Pinned —</div>
          <a className={"pap-nav " + (view==="home"?"":"act")}><i>i</i> Hash text</a>
          <a className="pap-nav"><i>ii</i> JWT parser</a>
          <a className="pap-nav"><i>iii</i> Color converter</a>

          <div className="pap-nav-h">— Cryptography —</div>
          <a className="pap-nav"><i>iv</i> Encrypt</a>
          <a className="pap-nav"><i>v</i> Bcrypt</a>

          <div className="pap-nav-h">— Conversion —</div>
          <a className="pap-nav"><i>vi</i> Base64</a>
          <a className="pap-nav"><i>vii</i> JSON ↔ YAML</a>
          <a className="pap-nav"><i>viii</i> Case</a>

          <div className="pap-foot">
            <div className="pap-rule" style={{marginBottom:10}}></div>
            <em>Made with ♥ by Prathyosh</em>
            <div className="d">All processing runs in your browser. No data is sent to any server.</div>
          </div>
        </aside>
        <main className="pap-main">
          <header className="pap-mast">
            <span>Workbench · A Quiet Toolbox</span>
            <span>Vol. XXVI</span>
            <span>Local Edition</span>
          </header>
          {view === "home" ? <PaperHome/> : <PaperTool/>}
        </main>
      </div>
    </div>
  );
}

function PaperHome() {
  return (
    <article className="pap-art">
      <div className="pap-eyebrow">A Compendium of Small Utilities</div>
      <h1 className="pap-h1">Twenty-six tools, <em>quietly</em> useful.</h1>
      <p className="pap-lede">A working toolbox for developers who would rather not reach for a website to compute a hash, decode a token, or convert a colour. Everything below runs locally in your browser; nothing is sent away.</p>

      <div className="pap-divider"><span>I.  Pinned</span></div>
      <div className="pap-list">
        {[
          ["Hash text","MD5, SHA-1, SHA-256, SHA-512 in your browser."],
          ["JWT parser","Decode and inspect a JSON Web Token."],
          ["Color converter","HEX, RGB, HSL, OKLCH all at once."],
        ].map(([n,d],i)=>(
          <a key={i} className="pap-row">
            <span className="num">{String(i+1).padStart(2,"0")}</span>
            <span className="name">{n}</span>
            <span className="desc">{d}</span>
            <span className="arr">→</span>
          </a>
        ))}
      </div>

      <div className="pap-divider"><span>II.  Cryptography</span></div>
      <div className="pap-list">
        {[
          ["Hash text","MD5, SHA-1, SHA-256, SHA-512."],
          ["Encrypt / decrypt","AES-style symmetric, with passphrase."],
          ["Bcrypt","Generate and verify bcrypt hashes."],
          ["JWT parser","Inspect token claims and signatures."],
        ].map(([n,d],i)=>(
          <a key={i} className="pap-row">
            <span className="num">{String(i+4).padStart(2,"0")}</span>
            <span className="name">{n}</span>
            <span className="desc">{d}</span>
            <span className="arr">→</span>
          </a>
        ))}
      </div>

      <div className="pap-divider"><span>III.  Conversion</span></div>
      <div className="pap-list">
        {[
          ["Base64","Encode and decode."],
          ["JSON ↔ YAML","Convert between formats."],
          ["Color converter","HEX, RGB, HSL, OKLCH."],
          ["Case converter","camel, snake, kebab, Pascal, CONST."],
        ].map(([n,d],i)=>(
          <a key={i} className="pap-row">
            <span className="num">{String(i+8).padStart(2,"0")}</span>
            <span className="name">{n}</span>
            <span className="desc">{d}</span>
            <span className="arr">→</span>
          </a>
        ))}
      </div>
    </article>
  );
}

function PaperTool() {
  return (
    <article className="pap-art">
      <div className="pap-eyebrow">I.  Cryptography</div>
      <h1 className="pap-h1">Hash <em>text</em></h1>
      <p className="pap-lede">Type or paste any string. Workbench will compute four classic digests for you, right here, with no network in between.</p>

      <section className="pap-panel">
        <div className="pap-pl"><em>Input</em></div>
        <textarea className="pap-ta" defaultValue="The quick brown fox jumps over the lazy dog"></textarea>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          <button className="pap-btn primary">Compute</button>
          <button className="pap-btn">Clear</button>
        </div>
      </section>

      <section className="pap-panel">
        <div className="pap-pl"><em>Result</em></div>
        {[
          ["MD5","9e107d9d372bb6826bd81d3542a419d6"],
          ["SHA-1","2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"],
          ["SHA-256","d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"],
          ["SHA-512","07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb6…"],
        ].map(([a,v])=>(
          <div className="pap-hash" key={a}>
            <span className="alg"><em>{a}</em></span>
            <span className="v">{v}</span>
          </div>
        ))}
      </section>
    </article>
  );
}

Object.assign(window, { Paper });
