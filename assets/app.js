(() => {
  "use strict";

  const CFG = window.GIVERNY_CONFIG;
  const SKILLS = window.GIVERNY_SKILLS || [];
  const OWNER = CFG.owner;
  const REPO = CFG.repo;
  const ACCESS_KEY = "giverny.access.v1";
  const OFFICIAL_DIR = "anthropics/claude-plugins-official";

  const CATS = [
    { id: "taste", label: "Taste & direction" },
    { id: "systems", label: "Design systems" },
    { id: "motion", label: "Motion & feel" },
    { id: "review", label: "Review & accessibility" },
    { id: "platforms", label: "Frameworks & platforms" },
    { id: "visual", label: "Slides, diagrams & media" },
    { id: "tools", label: "Design tool bridges" }
  ];
  const catLabel = Object.fromEntries(CATS.map(c => [c.id, c.label]));

  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };

  /* ---------------- access state ---------------- */
  const params = new URLSearchParams(location.search);
  const today = new Date();
  const freeUntil = new Date(CFG.freeUntil + "T00:00:00");
  const gateOn = params.get("gate") === "preview" || today >= freeUntil;
  let access = store.get(ACCESS_KEY);
  const unlocked = () => !!(access && access.user);
  // Curated order = file order. The first N stay free while the gate is on.
  SKILLS.forEach((s, i) => { s.rank = i; });
  const isLocked = s => gateOn && !unlocked() && s.rank >= CFG.freePreview;

  /* ---------------- formatting ---------------- */
  const fmtStars = n => n >= 1000 ? (n >= 100000 ? Math.round(n / 1000) : (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")) + "k" : String(n);
  const repoUrl = s => `https://github.com/${s.repo}${s.path ? "/tree/main/" + s.path : ""}`;
  const pluginCli = p => (p.add ? `claude plugin marketplace add ${p.add} && ` : "") + `claude plugin install ${p.install}`;
  const pluginSlash = p => (p.add ? `/plugin marketplace add ${p.add}\n` : "") + `/plugin install ${p.install}`;
  const nonInteractive = cmd => /npx (-y )?skills(@latest)? add/.test(cmd) && !/\s-y(\s|$)/.test(cmd) ? cmd + " -a claude-code -y" : cmd;

  function buildPrompt(s) {
    const site = CFG.siteUrl || (location.protocol.startsWith("http") ? location.origin + location.pathname : "");
    if (s.kind === "file") {
      return [
        `Add a DESIGN.md design system to my project from ${repoUrl(s)}.`,
        ``,
        `1. List the folders in https://github.com/${s.repo}/tree/main/design-md and ask me which product's style I want. If I don't say, use linear.app.`,
        `2. Download that folder's DESIGN.md into my project root, for example:`,
        `   ${s.cmd}`,
        `3. Read it, summarise the palette, type and spacing rules in a few lines, then follow it for all UI work in this project. Example: "${s.ask}"`,
        ``,
        `Found on Giverny: ${site}`
      ].join("\n");
    }
    const lines = [
      `Install "${s.name}" for Claude Code from ${repoUrl(s)}.`,
      ``,
      `1. Run this in my terminal:`,
      `   ${nonInteractive(s.cmd)}`
    ];
    if (s.plugin && !s.cmd.startsWith("claude plugin")) lines.push(`   If that fails, install it as a Claude Code plugin: ${pluginCli(s.plugin)}`);
    if (s.alt) lines.push(`   Fallback: ${s.alt}`);
    lines.push(
      `2. If none of that works, clone the repo and copy the folder that contains SKILL.md into ~/.claude/skills/.`,
      `3. Confirm it installed (a plugin may need a Claude Code restart), then show me how to use it. Example: "${s.ask}"`,
      ``,
      `Found on Giverny: ${site}`
    );
    return lines.join("\n");
  }

  /* ---------------- rendering ---------------- */
  const listEl = $("#list");
  const filtersEl = $("#filters");
  const qEl = $("#q");
  let activeCat = "all";
  let openId = null;

  const icon = {
    copy: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="2"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>',
    lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
    star: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .9l2.2 4.5 4.9.7-3.6 3.5.9 4.9L8 12.2l-4.4 2.3.9-4.9L.9 6.1l4.9-.7z"/></svg>'
  };

  function renderFilters() {
    const counts = {};
    SKILLS.forEach(s => { counts[s.cat] = (counts[s.cat] || 0) + 1; });
    const chips = [{ id: "all", label: "All skills", n: SKILLS.length }, ...CATS.map(c => ({ ...c, n: counts[c.id] || 0 }))];
    filtersEl.innerHTML = chips.map(c =>
      `<button class="chip" role="tab" type="button" data-cat="${c.id}" aria-selected="${c.id === activeCat}" style="--c: var(--c-${c.id})">` +
      (c.id === "all" ? "" : `<span class="dot" aria-hidden="true"></span>`) +
      `${esc(c.label)} <span class="n">${c.n}</span></button>`
    ).join("");
  }

  function score(s, terms) {
    let total = 0;
    const fields = [[s.name, 4], [s.by, 2.5], [catLabel[s.cat], 1.5], [s.desc, 1], [s.repo, 1]];
    for (const t of terms) {
      let best = 0;
      for (const [f, w] of fields) if (f && f.toLowerCase().includes(t)) best = Math.max(best, w);
      if (!best) return 0;
      total += best;
    }
    return total;
  }

  function cmdBlock(text, label, locked, kind) {
    return `<div class="cmd"><code class="${locked ? "blur" : ""}" ${locked ? 'aria-hidden="true"' : ""}>${esc(text)}</code>` +
      `<button type="button" data-copy="${kind}" aria-label="${locked ? "Unlock to copy" : "Copy " + esc(label)}">${locked ? "Unlock" : "Copy"}</button></div>`;
  }

  function rowHtml(s) {
    const locked = isLocked(s);
    const open = openId === s.id;
    const stars = s.repo === OFFICIAL_DIR
      ? `<span class="r-stars dir" title="Listed in Anthropic's official plugin directory">Official directory</span>`
      : `<span class="r-stars" title="${s.stars.toLocaleString()} GitHub stars on ${esc(s.repo)}">${icon.star}${fmtStars(s.stars)}</span>`;
    const primary = locked
      ? `<button type="button" class="btn locked" data-act="prompt">${icon.lock}<span>Unlock<span class="label-long"> to copy</span></span></button>`
      : `<button type="button" class="btn" data-act="prompt">${icon.copy}<span>Copy<span class="label-long"> prompt</span></span></button>`;
    let detail = "";
    if (open) {
      const blocks = [`<div><h4>${s.kind === "file" ? "Download command" : "Install command"}</h4>${cmdBlock(s.cmd, "command", locked, "cmd")}</div>`];
      if (s.plugin && !s.cmd.startsWith("claude plugin")) blocks.push(`<div><h4>Or inside Claude Code</h4>${cmdBlock(pluginSlash(s.plugin), "plugin commands", locked, "slash")}</div>`);
      if (s.alt) blocks.push(`<div><h4>Alternative</h4>${cmdBlock(s.alt, "alternative command", locked, "alt")}</div>`);
      blocks.push(`<p class="d-ask">Then try: <q>${esc(s.ask)}</q></p>`);
      blocks.push(`<p class="d-links"><a href="${repoUrl(s)}" target="_blank" rel="noopener">View on GitHub</a></p>`);
      detail = `<div class="row-detail" id="d-${s.id}">${blocks.join("")}</div>`;
    }
    return `<li class="row" data-id="${s.id}" style="--c: var(--c-${s.cat})">
      <div class="row-head">
        <div class="r-name">
          <button type="button" class="r-title" aria-expanded="${open}" aria-controls="d-${s.id}"><span class="dot" aria-hidden="true"></span><span class="t">${esc(s.name)}</span></button>
          <div class="r-by"><span>${esc(s.by)}</span>${s.official ? '<span class="badge" title="Maintained by the company behind the tool">Official</span>' : ""}</div>
        </div>
        <p class="r-desc">${esc(s.desc)}</p>
        ${stars}
        <div class="r-act">${primary}</div>
      </div>${detail}
    </li>`;
  }

  function render() {
    const q = qEl.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    let items = SKILLS.filter(s => activeCat === "all" || s.cat === activeCat);
    if (terms.length) {
      items = items.map(s => [s, score(s, terms)]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1] || a[0].rank - b[0].rank).map(([s]) => s);
    }
    listEl.innerHTML = items.map(rowHtml).join("");
    $("#empty").hidden = items.length > 0;
    $("#empty-q").textContent = qEl.value.trim();
  }

  function renderMeta() {
    const sources = new Set(SKILLS.map(s => s.by)).size;
    const official = SKILLS.filter(s => s.official).length;
    $("#meta").textContent = `${SKILLS.length} skills from ${sources} makers, ${official} of them official. Every install command checked against its repo.`;
    const d = new Date(window.GIVERNY_UPDATED + "T00:00:00");
    $("#updated").textContent = d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  /* ---------------- copy ---------------- */
  const toastEl = $("#toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch {}
      ta.remove(); return ok;
    }
  }
  function flash(btn, label) {
    const prev = btn.innerHTML;
    btn.classList.add("done");
    btn.innerHTML = btn.classList.contains("btn") ? `${icon.check}<span>${label}</span>` : label;
    setTimeout(() => { btn.classList.remove("done"); btn.innerHTML = prev; }, 1800);
  }

  listEl.addEventListener("click", async e => {
    const row = e.target.closest(".row");
    if (!row) return;
    const s = SKILLS.find(x => x.id === row.dataset.id);
    const title = e.target.closest(".r-title");
    if (title) {
      openId = openId === s.id ? null : s.id;
      render();
      const t = listEl.querySelector(`.row[data-id="${s.id}"] .r-title`);
      if (t) t.focus({ preventScroll: true });
      return;
    }
    const act = e.target.closest("[data-act], [data-copy]");
    if (!act) return;
    if (isLocked(s)) { openGate(s); return; }
    let text, msg;
    if (act.dataset.act === "prompt") { text = buildPrompt(s); msg = "Prompt copied. Paste it into Claude Code."; }
    else if (act.dataset.copy === "cmd") { text = s.cmd; msg = "Command copied."; }
    else if (act.dataset.copy === "slash") { text = pluginSlash(s.plugin); msg = "Plugin commands copied. Paste them into Claude Code."; }
    else if (act.dataset.copy === "alt") { text = s.alt; msg = "Command copied."; }
    if (await copy(text)) { flash(act, "Copied"); toast(msg); }
    else toast("Copy was blocked by the browser. Select the text and copy it manually.");
  });

  filtersEl.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    activeCat = chip.dataset.cat;
    renderFilters(); render();
  });
  filtersEl.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const chips = [...filtersEl.querySelectorAll(".chip")];
    const i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    const next = chips[(i + (e.key === "ArrowRight" ? 1 : chips.length - 1)) % chips.length];
    next.focus(); next.click(); filtersEl.querySelector(`[data-cat="${next.dataset.cat}"]`).focus();
  });

  let qT;
  qEl.addEventListener("input", () => { clearTimeout(qT); qT = setTimeout(render, 80); });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && !$("#gate").open) {
      e.preventDefault(); qEl.focus();
    }
  });
  if (params.get("q")) qEl.value = params.get("q");

  /* ---------------- GitHub links ---------------- */
  const ownerUrl = `https://github.com/${OWNER}`;
  const repoHome = `https://github.com/${REPO}`;
  const submitUrl = `${repoHome}/issues/new?title=${encodeURIComponent("Add skill: ")}&body=${encodeURIComponent("Repo URL:\nInstall command:\nWhat it makes Claude do (one sentence):\n")}`;
  $("#star-btn").href = repoHome;
  $("#submit-link").href = submitUrl;
  $("#empty-submit").href = submitUrl;
  $("#foot-repo").href = repoHome;
  const footOwner = $("#foot-owner");
  footOwner.href = ownerUrl; footOwner.textContent = `Made by @${OWNER}`;
  $("#follow-btn").href = ownerUrl; $("#follow-btn").textContent = `Follow @${OWNER}`;
  $("#starrepo-btn").href = repoHome; $("#starrepo-btn").textContent = `Star ${REPO.split("/")[1]}`;

  (async function starCount() {
    const KEY = "giverny.stars";
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(KEY)); } catch {}
    let n = cached && Date.now() - cached.t < 600000 ? cached.n : null;
    if (n == null) {
      try {
        const r = await fetch(`https://api.github.com/repos/${REPO}`);
        if (!r.ok) return;
        n = (await r.json()).stargazers_count;
        try { sessionStorage.setItem(KEY, JSON.stringify({ n, t: Date.now() })); } catch {}
      } catch { return; }
    }
    const el = $("#star-count");
    el.textContent = fmtStars(n); el.hidden = false;
  })();

  /* ---------------- gate ---------------- */
  const gate = $("#gate");
  const userEl = $("#gh-user");
  const msgEl = $("#gate-msg");
  const stFollow = $("#st-follow");
  const stStar = $("#st-star");
  const verifyBtn = $("#verify-btn");
  let checking = false;
  let lastAuto = 0;

  function setStatus(el, state, text) {
    el.dataset.state = state; el.textContent = text;
    el.closest("li").classList.toggle("ok", state === "ok");
  }
  function setMsg(text, kind) { msgEl.textContent = text; msgEl.className = "gate-msg" + (kind ? " " + kind : ""); }

  function openGate(skill) {
    const total = SKILLS.length;
    $("#gate-lede").textContent = gateOn
      ? `${skill ? `“${skill.name}” is one of ${total - CFG.freePreview} skills that unlock` : `All ${total} skills unlock`} when you follow the maker and star the repo on GitHub. It’s free, and it stays unlocked in this browser.`
      : `Giverny is free while we launch. Follow the maker and star the repo on GitHub now, and every skill stays unlocked after ${freeUntil.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}.`;
    const saved = store.get("giverny.user");
    if (saved && !userEl.value) userEl.value = saved;
    setMsg("");
    if (typeof gate.showModal === "function") gate.showModal(); else gate.setAttribute("open", "");
    (userEl.value ? $("#follow-btn") : userEl).focus();
  }
  document.querySelectorAll("[data-open-gate]").forEach(b => b.addEventListener("click", () => openGate()));

  async function gh(path) {
    const sep = path.includes("?") ? "&" : "?";
    const r = await fetch(`https://api.github.com${path}${sep}_=${Date.now()}`, { cache: "no-store", headers: { Accept: "application/vnd.github+json" } });
    if ((r.status === 403 || r.status === 429) && r.headers.get("x-ratelimit-remaining") === "0") throw new Error("rate");
    return r;
  }
  async function checkUser(user) {
    // Starred list is newest-first, so a fresh star is on page 1.
    let starred = false;
    for (let page = 1; page <= 3 && !starred; page++) {
      const r = await gh(`/users/${encodeURIComponent(user)}/starred?per_page=100&page=${page}`);
      if (r.status === 404) throw new Error("nouser");
      if (!r.ok) throw new Error("net");
      const list = await r.json();
      starred = list.some(x => x.full_name && x.full_name.toLowerCase() === REPO.toLowerCase());
      if (list.length < 100) break;
    }
    const f = await gh(`/users/${encodeURIComponent(user)}/following/${OWNER}`);
    if (f.status !== 204 && f.status !== 404) throw new Error("net");
    return { following: f.status === 204, starred };
  }

  async function verify(auto) {
    const user = userEl.value.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//i, "").replace(/\/.*$/, "");
    if (!user) { if (!auto) { setMsg("Enter your GitHub username first.", "err"); userEl.focus(); } return; }
    if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(user)) { setMsg("That doesn’t look like a GitHub username. Use letters, numbers and dashes.", "err"); return; }
    if (checking) return;
    checking = true;
    verifyBtn.disabled = true; verifyBtn.textContent = "Checking GitHub…";
    store.set("giverny.user", user);
    try {
      const res = await checkUser(user);
      setStatus(stFollow, res.following ? "ok" : "no", res.following ? "Following" : "Not yet");
      setStatus(stStar, res.starred ? "ok" : "no", res.starred ? "Starred" : "Not yet");
      if (res.following && res.starred) grant(user);
      else setMsg(!res.following && !res.starred ? "Follow and star, then come back to this tab. We check again automatically."
        : !res.following ? `Starred. Now follow @${OWNER} and come back.` : "Following. Now star the repo and come back.");
    } catch (err) {
      setMsg(err.message === "nouser" ? `There’s no GitHub user called “${user}”. Check the spelling.`
        : err.message === "rate" ? "GitHub limits checks from your network to 60 an hour. Try again in a few minutes."
        : "Couldn’t reach GitHub. Check your connection and try again.", "err");
    } finally {
      checking = false; verifyBtn.disabled = false; verifyBtn.textContent = "Check and unlock";
    }
  }

  function grant(user) {
    access = { user, at: Date.now() };
    store.set(ACCESS_KEY, access);
    setMsg(`Unlocked. Thanks, @${user}.`, "ok");
    updateLaunchBar();
    render();
    setTimeout(() => { if (gate.open) gate.close(); toast("Every skill is unlocked."); }, 900);
  }

  verifyBtn.addEventListener("click", () => verify(false));
  userEl.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); verify(false); } });
  // When someone returns from the GitHub tab, check again without being asked.
  window.addEventListener("focus", () => {
    if (!gate.open || !userEl.value.trim() || unlocked()) return;
    if (Date.now() - lastAuto < 5000) return;
    lastAuto = Date.now();
    setTimeout(() => verify(true), 700);
  });

  async function recheck() {
    if (!unlocked()) return;
    if (Date.now() - access.at < CFG.recheckDays * 864e5) return;
    try {
      const res = await checkUser(access.user);
      if (res.following && res.starred) { access.at = Date.now(); store.set(ACCESS_KEY, access); }
      else if (gateOn) {
        store.del(ACCESS_KEY); access = null; updateLaunchBar(); render();
        toast("Access paused: the follow or star was removed. Follow and star again to unlock.");
      }
    } catch { /* network or rate limit: keep access */ }
  }

  function updateLaunchBar() {
    const bar = $("#launch");
    if (unlocked()) { bar.hidden = true; return; }
    const date = freeUntil.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    $("#launch-text").textContent = gateOn
      ? `${CFG.freePreview} skills are free to copy. Follow and star on GitHub to unlock all ${SKILLS.length}.`
      : `Everything is free while we launch, until ${date}.`;
    bar.querySelector("[data-open-gate]").textContent = gateOn ? "Unlock all" : "Keep access for good";
    bar.hidden = false;
  }

  /* ---------------- the pond ---------------- */
  const canvas = $("#pond");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let raf;
  function rng(seed) {
    return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function paintPond(animate) {
    cancelAnimationFrame(raf);
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, H = rect.height, S = Math.max(W, H * 1.25) / 520;
    const r = rng(1840);
    const C = { water: css("--water"), wis: css("--wisteria"), pad: css("--pad"), bridge: css("--bridge"), lily: css("--lily"), deep: css("--lily-deep"), line: css("--line"), paper: css("--paper") };
    const dabs = [];
    // Reflections of sky and willow: short horizontal strokes, fading at the edges.
    const waterCols = [C.water, C.water, C.wis, C.line, C.pad];
    const n = Math.round(620 * (W * H) / (520 * 520));
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = r() * H;
      const dx = (x / W - .5) * 2, dy = (y / H - .5) * 2;
      const edge = 1 - Math.min(1, Math.hypot(dx * .9, dy * .98) + (r() - .5) * .3);
      if (edge <= 0.02) continue;
      dabs.push({ x, y, a: (r() - .5) * .22, len: (12 + r() * 30) * S, w: (3 + r() * 5) * S, c: waterCols[(r() * waterCols.length) | 0], o: (.25 + r() * .45) * Math.min(1, edge * 1.6) });
    }
    // Lily pads, then flowers on some of them.
    const pads = [[.28, .3, .17], [.66, .22, .12], [.56, .58, .2], [.22, .72, .13], [.84, .66, .1], [.4, .88, .09]];
    pads.forEach(([px, py, pr], k) => {
      const cx = px * W, cy = py * H, rx = pr * W, ry = rx * .38;
      for (let i = 0; i < 70; i++) {
        const t = r() * Math.PI * 2, d = Math.sqrt(r());
        dabs.push({ x: cx + Math.cos(t) * rx * d, y: cy + Math.sin(t) * ry * d, a: (r() - .5) * .5, len: (9 + r() * 18) * S, w: (3.5 + r() * 4.5) * S, c: r() < .62 ? C.pad : C.bridge, o: .55 + r() * .35, layer: 1 });
      }
      if (k % 2 === 0 || k === 3) {
        const fx = cx + (r() - .5) * rx * .5, fy = cy - ry * .25;
        for (let i = 0; i < 16; i++) {
          const t = -Math.PI / 2 + (r() - .5) * 2.2;
          dabs.push({ x: fx + (r() - .5) * 6 * S, y: fy + (r() - .5) * 3 * S, a: t, len: (6 + r() * 10) * S, w: (3 + r() * 3) * S, c: r() < .55 ? C.lily : C.deep, o: .75 + r() * .25, layer: 2 });
        }
      }
    });
    // Water first, then pads, then flowers; shuffled within each layer so it paints in like a hand would.
    const order = dabs.map((d, i) => [d.layer || 0, r(), i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => dabs[x[2]]);
    ctx.lineCap = "round";
    const draw = d => {
      ctx.globalAlpha = d.o; ctx.strokeStyle = d.c; ctx.lineWidth = d.w;
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + Math.cos(d.a) * d.len, d.y + Math.sin(d.a) * d.len); ctx.stroke();
    };
    ctx.clearRect(0, 0, W, H);
    if (!animate || reduceMotion.matches) { order.forEach(draw); ctx.globalAlpha = 1; return; }
    const start = performance.now(), dur = 1400;
    let drawn = 0;
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      const target = Math.floor(order.length * (1 - Math.pow(1 - p, 2.2)));
      for (; drawn < target; drawn++) draw(order[drawn]);
      if (p < 1) raf = requestAnimationFrame(step); else { for (; drawn < order.length; drawn++) draw(order[drawn]); ctx.globalAlpha = 1; }
    };
    raf = requestAnimationFrame(step);
  }
  let rT;
  window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => paintPond(false), 150); });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => paintPond(false));

  /* ---------------- boot ---------------- */
  renderFilters();
  renderMeta();
  render();
  updateLaunchBar();
  recheck();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => paintPond(true)); else paintPond(true);
})();
