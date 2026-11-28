(() => {
  "use strict";

  const CFG = window.GIVERNY_CONFIG;
  const OWNER = CFG.owner;
  const REPO = CFG.repo;
  const OFFICIAL_DIR = "anthropics/claude-plugins-official";
  const IDEAS = ["Optimize my app", "Edit a video", "Write landing page copy", "Add login to my app", "Improve my SEO", "Make my site beautiful", "Find security bugs", "Make a pitch deck"];

  const $ = (s, el = document) => el.querySelector(s);
  const track = (name, props) => { try { window.giverny && window.giverny.track(name, props); } catch {} };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const params = new URLSearchParams(location.search);

  // Section and category names come from data/taxonomy.json (shared with the indexer and the search engine).
  let SECTIONS = [];
  const secLabel = {}, catLabel = {};
  const byId = new Map(); // every skill shown so far, for copy and details

  /* ---------------- access (decided by the server only) ---------------- */
  // Nothing in this file can unlock a skill. Prompts and commands only come from /api/reveal,
  // which checks the GitHub sign-in, star and follow on every request.
  const auth = { loaded: false, configured: true, signedIn: false, login: null, following: false, starred: false, unlocked: false, requireFollow: true, error: null };
  const isLocked = () => !auth.unlocked;
  const shown = new Map(); // commands already revealed, for display in open rows only

  async function api(path) {
    let r;
    try { r = await fetch(path, { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" } }); }
    catch { const e = new Error("network"); e.status = 0; throw e; }
    let body = null;
    try { body = await r.json(); } catch {}
    if (!r.ok) {
      const e = new Error((body && body.error) || (r.status === 404 ? "no_api" : "error"));
      e.status = r.status; e.body = body; throw e;
    }
    return body;
  }

  function applyAuth(b) {
    const was = auth.unlocked;
    if (b && typeof b.signedIn === "boolean") {
      for (const k of ["configured", "signedIn", "login", "following", "starred", "unlocked", "requireFollow"]) if (k in b) auth[k] = b[k];
    }
    auth.loaded = true;
    if (!auth.unlocked) shown.clear();
    if (!was && auth.unlocked) track("unlocked", {});
    updateChrome();
    if (was !== auth.unlocked) render();
  }

  async function refreshStatus() {
    try { auth.error = null; applyAuth(await api("/api/status")); }
    catch (e) { auth.error = e.message; applyAuth(e.body); }
    return auth;
  }

  /* ---------------- formatting ---------------- */
  const fmtStars = n => n >= 1000 ? (n >= 100000 ? Math.round(n / 1000) : (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")) + "k" : String(n);
  const repoUrl = s => `https://github.com/${s.repo}${s.path ? "/tree/main/" + s.path : ""}`;

  /* ---------------- rendering ---------------- */
  const listEl = $("#list");
  const filtersEl = $("#filters");
  const tabsEl = $("#tabs");
  const qEl = $("#q");
  const PAGE = 40;
  const view = { tab: params.get("tab") || "all", cat: params.get("cat") || "all", results: [], total: 0, all: 0, repos: 0, facets: { sections: {}, cats: {} }, loading: false, error: null };
  let openId = null;

  const icon = {
    copy: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="2"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>',
    lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
    star: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .9l2.2 4.5 4.9.7-3.6 3.5.9 4.9L8 12.2l-4.4 2.3.9-4.9L.9 6.1l4.9-.7z"/></svg>'
  };
  const fmtNum = n => Number(n || 0).toLocaleString();
  const recent = d => d && (Date.now() - new Date(d + "T00:00:00").getTime()) < 14 * 864e5;

  function renderTabs() {
    const f = view.facets.sections || {};
    const all = Object.values(f).reduce((a, b) => a + b, 0);
    const tabs = [{ id: "all", label: "All", n: all }, ...SECTIONS.map(s => ({ id: s.id, label: s.label, n: f[s.id] || 0 }))];
    tabsEl.innerHTML = tabs.map(t => `<button class="tab" role="tab" type="button" data-tab="${t.id}" aria-selected="${t.id === view.tab}">${esc(t.label)}<span class="n">${fmtNum(t.n)}</span></button>`).join("");
  }

  function renderFilters() {
    if (view.tab === "all") { filtersEl.innerHTML = ""; filtersEl.hidden = true; return; }
    const sec = SECTIONS.find(s => s.id === view.tab);
    const counts = view.facets.cats || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const chips = [{ id: "all", label: "Everything", n: total }, ...sec.cats.map(c => ({ id: c.id, label: c.label, n: counts[c.id] || 0 })).filter(c => c.n > 0 || c.id === view.cat)];
    filtersEl.hidden = false;
    filtersEl.innerHTML = chips.map(c =>
      `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === view.cat}" aria-selected="${c.id === view.cat}">${esc(c.label)} <span class="n">${fmtNum(c.n)}</span></button>`).join("");
  }

  function cmdBlock(text, label, kind, state) {
    const locked = state === "locked";
    const cls = locked ? "blur" : state === "loading" ? "loading" : "";
    return `<div class="cmd"><code class="${cls}" ${locked ? 'aria-hidden="true"' : ""}>${esc(text)}</code>` +
      (state === "loading" ? "" : `<button type="button" data-copy="${kind}" aria-label="${locked ? "Unlock to copy" : "Copy " + esc(label)}">${locked ? "Unlock" : "Copy"}</button>`) + `</div>`;
  }

  function detailHtml(s) {
    const blocks = [];
    const title = s.kind === "file" ? "Download command" : "Install command";
    const r = shown.get(s.id);
    if (isLocked()) {
      blocks.push(`<div><h4>${title}</h4>${cmdBlock("npx skills add ••••••••/••••••••••", "command", "cmd", "locked")}</div>`);
      blocks.push(`<p class="d-ask">Sign in with GitHub, follow and star to see and copy the install commands.</p>`);
    } else if (r && r.error) {
      blocks.push(`<p class="d-ask">Couldn’t check your GitHub access just now. Close this row and open it again to retry.</p>`);
    } else if (!r) {
      blocks.push(`<div><h4>${title}</h4>${cmdBlock("Checking your GitHub access…", "command", "cmd", "loading")}</div>`);
    } else {
      blocks.push(`<div><h4>${title}</h4>${cmdBlock(r.cmd, "command", "cmd")}</div>`);
      if (r.slash) blocks.push(`<div><h4>Or inside Claude Code</h4>${cmdBlock(r.slash, "plugin commands", "slash")}</div>`);
      if (r.alt) blocks.push(`<div><h4>Alternative</h4>${cmdBlock(r.alt, "alternative command", "alt")}</div>`);
      if (r.note) blocks.push(`<p class="d-ask">${esc(r.note)}</p>`);
      blocks.push(`<p class="d-ask">Then try: <q>${esc(r.ask)}</q></p>`);
    }
    const where = [secLabel[s.section], catLabel[`${s.section}/${s.cat}`]].filter(Boolean).join(", ");
    blocks.push(`<p class="d-links"><a href="${repoUrl(s)}" target="_blank" rel="noopener">View on GitHub</a><span>${esc(where)}</span></p>`);
    return `<div class="row-detail" id="d-${s.id}">${blocks.join("")}</div>`;
  }

  function rowHtml(s) {
    const locked = isLocked();
    const open = openId === s.id;
    const stars = s.repo === OFFICIAL_DIR
      ? `<span class="r-stars dir" title="Listed in Anthropic's official plugin directory">Official directory</span>`
      : `<span class="r-stars" title="${fmtNum(s.stars)} GitHub stars on ${esc(s.repo)}">${icon.star}${fmtStars(s.stars)}</span>`;
    const primary = locked
      ? `<button type="button" class="btn locked" data-act="prompt">${icon.lock}<span>Unlock<span class="label-long"> to copy</span></span></button>`
      : `<button type="button" class="btn" data-act="prompt">${icon.copy}<span>Copy<span class="label-long"> prompt</span></span></button>`;
    const badges = [
      s.official ? '<span class="badge" title="Made by the company behind the tool">Official</span>' : "",
      s.featured ? '<span class="badge pick" title="Hand-picked, with a checked install command">Pick</span>' : "",
      recent(s.added) ? '<span class="badge new" title="Added in the last two weeks">New</span>' : recent(s.updated) ? '<span class="badge upd" title="Changed by its author in the last two weeks">Updated</span>' : ""
    ].join("");
    return `<li class="row" data-id="${esc(s.id)}" style="--c: var(--c-${s.section})">
      <div class="row-head">
        <div class="r-name">
          <button type="button" class="r-title" aria-expanded="${open}" aria-controls="d-${esc(s.id)}"><span class="dot" aria-hidden="true"></span><span class="t">${esc(s.name)}</span></button>
          <div class="r-by"><span>${esc(s.by)}</span>${s.best ? '<span class="badge best">Best match</span>' : ""}${badges}</div>
        </div>
        <p class="r-desc">${esc(s.desc)}</p>
        ${stars}
        <div class="r-act">${primary}</div>
      </div>${open ? detailHtml(s) : ""}
    </li>`;
  }

  function render() {
    listEl.innerHTML = view.results.map(rowHtml).join("");
    const q = qEl.value.trim();
    const where = view.tab === "all" ? "" : ` in ${secLabel[view.tab]}${view.cat !== "all" ? ", " + catLabel[`${view.tab}/${view.cat}`] : ""}`;
    $("#result-line").textContent = view.error ? "" : q
      ? `${fmtNum(view.total)} skills match “${q}”${where}. Best matches first.`
      : `${fmtNum(view.total)} skills${where}. Picks first.`;
    $("#empty").hidden = view.loading || view.error || view.results.length > 0;
    $("#empty-q").textContent = q;
    $("#more").hidden = view.results.length >= view.total || !view.results.length;
    if (openId && !isLocked() && !shown.has(openId) && byId.has(openId)) loadDetail(openId);
    if (!openId) for (const [k, v] of shown) if (v.error) shown.delete(k);
  }

  let reqSeq = 0;
  async function load(append) {
    const seq = ++reqSeq;
    const q = qEl.value.trim();
    const qs = new URLSearchParams({ q, section: view.tab, cat: view.cat, offset: append ? view.results.length : 0, limit: PAGE });
    view.loading = true; listEl.classList.add("loading");
    try {
      const r = await fetch(`/api/search?${qs}`, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(r.status === 404 ? "no_api" : "error");
      const data = await r.json();
      if (seq !== reqSeq) return;
      data.results.forEach(s => byId.set(s.id, s));
      view.results = append ? view.results.concat(data.results) : data.results;
      Object.assign(view, { total: data.total, all: data.all, repos: data.repos || view.repos, facets: data.facets, error: null });
      if (!append) openId = null;
    } catch (e) {
      if (seq !== reqSeq) return;
      view.error = e.message;
      view.results = [];
      $("#result-line").textContent = e.message === "no_api" ? "The skill index runs on the live site, giverny-two.vercel.app." : "Couldn’t load skills. Check your connection and try again.";
    } finally {
      if (seq === reqSeq) { view.loading = false; listEl.classList.remove("loading"); renderTabs(); renderFilters(); render(); renderMeta(); syncUrl(); if (auth.loaded) updateChrome(); }
    }
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (qEl.value.trim()) p.set("q", qEl.value.trim());
    if (view.tab !== "all") p.set("tab", view.tab);
    if (view.cat !== "all") p.set("cat", view.cat);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "") + location.hash);
  }

  let loadingId = null;
  async function loadDetail(id) {
    if (loadingId === id) return;
    loadingId = id;
    try {
      const r = await api(`/api/reveal?id=${encodeURIComponent(id)}`);
      shown.set(id, r);
      applyAuth(r);
    } catch (e) {
      if (e.message !== "signin" && e.message !== "locked") shown.set(id, { error: true });
      denied(e, byId.get(id), true);
    } finally {
      loadingId = null;
      if (openId === id) render();
    }
  }

  function renderMeta() {
    if (!view.all) return;
    $("#meta").textContent = `${fmtNum(view.all)} skills from ${fmtNum(view.repos)} sources, refreshed every week.`;
    $("#lede").textContent = `${fmtNum(view.all)} public skills for Claude Code, in one search. Say what you want to do, copy the prompt, and Claude installs the skill.`;
  }

  /* ---------------- copy (always asks the server first) ---------------- */
  const toastEl = $("#toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 3000);
  }
  async function writeText(text) {
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

  const manual = $("#manual");
  function showManual(text) {
    $("#manual-text").value = text;
    manual.showModal();
    $("#manual-text").select();
  }
  $("#manual-copy").addEventListener("click", async () => {
    if (await writeText($("#manual-text").value)) { toast("Copied. Paste it into Claude Code."); manual.close(); }
    else $("#manual-text").select();
  });

  function denied(e, skill, quiet) {
    const code = e && e.message;
    if (code === "signin" || code === "locked") {
      applyAuth(e.body);
      if (!quiet || openId) openGate(skill);
      return;
    }
    if (quiet) return;
    toast(code === "not_configured" ? "GitHub sign-in isn’t set up on this site yet."
      : code === "no_api" ? "Copying works on the live site, giverny-two.vercel.app."
      : code === "rate" ? "GitHub is rate-limiting checks right now. Try again in a minute."
      : "Couldn’t check your GitHub access. Try again in a moment.");
  }

  const copyLabels = { prompt: "Prompt copied. Paste it into Claude Code.", cmd: "Command copied.", slash: "Plugin commands copied. Paste them into Claude Code.", alt: "Command copied." };

  async function copyFromServer(s, kind, btn) {
    btn.setAttribute("aria-busy", "true");
    const req = api(`/api/reveal?id=${encodeURIComponent(s.id)}`).then(r => {
      const text = r[kind];
      if (!text) throw Object.assign(new Error("error"), { status: 500 });
      return r;
    });
    req.catch(() => {}); // handled below
    // Write to the clipboard inside the click, with the text arriving from the server (needed by Safari).
    let copied = false;
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      try {
        const item = new ClipboardItem({ "text/plain": req.then(r => new Blob([r[kind]], { type: "text/plain" })) });
        await navigator.clipboard.write([item]);
        copied = true;
      } catch { /* fall back below */ }
    }
    let r;
    try { r = await req; }
    catch (e) { btn.removeAttribute("aria-busy"); denied(e, s); return; }
    btn.removeAttribute("aria-busy");
    applyAuth(r);
    shown.set(s.id, r);
    if (!copied) copied = await writeText(r[kind]);
    if (!copied) { showManual(r[kind]); return; }
    flash(btn, "Copied");
    toast(copyLabels[kind]);
    track(kind === "prompt" ? "copy_prompt" : "copy_command", { skill: s.id, category: s.cat, kind, searched: !!qEl.value.trim() });
  }

  listEl.addEventListener("click", e => {
    const row = e.target.closest(".row");
    if (!row) return;
    const s = byId.get(row.dataset.id);
    if (!s) return;
    const title = e.target.closest(".r-title");
    if (title) {
      openId = openId === s.id ? null : s.id;
      if (openId) track("skill_open", { skill: s.id, category: s.cat });
      render();
      const t = listEl.querySelector(`.row[data-id="${s.id}"] .r-title`);
      if (t) t.focus({ preventScroll: true });
      return;
    }
    const act = e.target.closest("[data-act], [data-copy]");
    if (!act || act.getAttribute("aria-busy")) return;
    if (isLocked()) { track("locked_click", { skill: s.id }); openGate(s); return; }
    copyFromServer(s, act.dataset.act === "prompt" ? "prompt" : act.dataset.copy, act);
  });

  filtersEl.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    view.cat = chip.dataset.cat;
    track("filter", { section: view.tab, category: view.cat });
    load(false);
  });
  tabsEl.addEventListener("click", e => {
    const tab = e.target.closest(".tab");
    if (!tab || tab.dataset.tab === view.tab) return;
    view.tab = tab.dataset.tab; view.cat = "all";
    track("tab", { section: view.tab });
    load(false);
  });
  tabsEl.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tabs = [...tabsEl.querySelectorAll(".tab")];
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next.click(); setTimeout(() => { const t = tabsEl.querySelector(`[data-tab="${next.dataset.tab}"]`); if (t) t.focus(); }, 250);
  });
  $("#more-btn").addEventListener("click", () => load(true));
  $("#ideas").innerHTML = IDEAS.map(t => `<button type="button" class="idea">${esc(t)}</button>`).join("");
  $("#ideas").addEventListener("click", e => {
    const b = e.target.closest(".idea");
    if (!b) return;
    qEl.value = b.textContent;
    track("idea_click", { idea: b.textContent });
    load(false);
    document.getElementById("directory").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });
  filtersEl.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const chips = [...filtersEl.querySelectorAll(".chip")];
    const i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    const next = chips[(i + (e.key === "ArrowRight" ? 1 : chips.length - 1)) % chips.length];
    next.click(); setTimeout(() => { const c = filtersEl.querySelector(`[data-cat="${next.dataset.cat}"]`); if (c) c.focus(); }, 250);
  });

  let qT, qTrackT;
  qEl.addEventListener("input", () => {
    clearTimeout(qT); qT = setTimeout(() => load(false), 220);
    clearTimeout(qTrackT);
    qTrackT = setTimeout(() => {
      const q = qEl.value.trim().toLowerCase();
      if (q.length >= 2) track("search", { query: q.slice(0, 60), results: view.total, tab: view.tab });
    }, 1200);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && !$("#gate").open && !manual.open) {
      e.preventDefault(); qEl.focus();
    }
  });
  if (params.get("q")) qEl.value = params.get("q");

  /* ---------------- GitHub links ---------------- */
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href^='https://github.com'], a[href^='/api/auth/login']");
    if (!a) return;
    const row = a.closest(".row");
    if (a.id === "signin-btn") return track("signin_click", {});
    track("github_click", { target: a.id || (row ? "skill_repo" : "link"), skill: row ? row.dataset.id : undefined });
  });
  const ownerUrl = `https://github.com/${OWNER}`;
  const repoHome = `https://github.com/${REPO}`;
  const submitUrl = `${repoHome}/issues/new?title=${encodeURIComponent("Add skill: ")}&body=${encodeURIComponent("Repo URL:\nInstall command:\nWhat it makes Claude do (one sentence):\n")}`;
  $("#star-btn").href = repoHome;
  $("#submit-link").href = submitUrl;
  $("#empty-submit").href = submitUrl;
  $("#soon-submit").href = submitUrl;
  $("#soon-star").href = repoHome;
  $("#foot-repo").href = repoHome;
  const footOwner = $("#foot-owner");
  footOwner.href = ownerUrl; footOwner.textContent = `Made by @${OWNER}`;
  $("#follow-btn").href = ownerUrl; $("#follow-btn").textContent = `Follow @${OWNER}`;
  $("#starrepo-btn").href = repoHome; $("#starrepo-btn").textContent = `Star ${REPO.split("/")[1]}`;
  $("#signin-btn").href = `/api/auth/login?return=${encodeURIComponent(location.pathname)}`;

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
  const msgEl = $("#gate-msg");
  const verifyBtn = $("#verify-btn");
  let lastAuto = 0;

  function setStatus(id, state, text) {
    const el = $(id);
    el.dataset.state = state; el.textContent = text;
    el.closest("li").classList.toggle("ok", state === "ok");
  }
  function setMsg(text, kind) { msgEl.textContent = text; msgEl.className = "gate-msg" + (kind ? " " + kind : ""); }

  function paintGate() {
    const si = $("#signin-btn");
    if (auth.signedIn) {
      setStatus("#st-signin", "ok", `@${auth.login}`);
      si.textContent = "Signed in with GitHub"; si.setAttribute("aria-disabled", "true"); si.style.pointerEvents = "none";
      setStatus("#st-follow", auth.following ? "ok" : "no", auth.following ? "Following" : "Not yet");
      setStatus("#st-star", auth.starred ? "ok" : "no", auth.starred ? "Starred" : "Not yet");
    } else {
      setStatus("#st-signin", "idle", "Not signed in");
      si.textContent = "Sign in with GitHub"; si.removeAttribute("aria-disabled"); si.style.pointerEvents = "";
      setStatus("#st-follow", "idle", "After sign-in");
      setStatus("#st-star", "idle", "After sign-in");
    }
    $("#follow-btn").closest("li").hidden = !auth.requireFollow;
  }

  function gateMessage() {
    if (!auth.configured) return setMsg("GitHub sign-in isn’t set up on this site yet.", "err");
    if (auth.error === "no_api") return setMsg("Unlocking works on the live site, giverny-two.vercel.app.", "err");
    if (auth.error && auth.error !== "signin") return setMsg("Couldn’t reach GitHub to check. Try again in a moment.", "err");
    if (!auth.signedIn) return setMsg("Start by signing in with GitHub. You’ll come straight back here.");
    if (auth.unlocked) return setMsg(`Unlocked. Thanks, @${auth.login}.`, "ok");
    if (!auth.starred && !auth.following && auth.requireFollow) return setMsg("Now follow and star, then come back to this tab. We check again automatically.");
    if (!auth.starred) return setMsg("Now star the repo and come back to this tab.");
    return setMsg(`Starred. Now follow @${OWNER} and come back to this tab.`);
  }

  function openGate(skill) {
    const total = fmtNum(view.all || 0);
    $("#gate-lede").textContent = `${skill ? `To copy “${skill.name}” and all ${total} skills,` : `To copy all ${total} skills,`} sign in with GitHub, ${auth.requireFollow ? `follow @${OWNER} and ` : ""}star the repo. It’s free. We check this every time you copy.`;
    track("gate_open", { skill: skill ? skill.id : undefined, signed_in: auth.signedIn });
    paintGate(); gateMessage();
    if (!gate.open) { if (typeof gate.showModal === "function") gate.showModal(); else gate.setAttribute("open", ""); }
    (auth.signedIn ? (auth.following || !auth.requireFollow ? $("#starrepo-btn") : $("#follow-btn")) : $("#signin-btn")).focus();
  }
  document.querySelectorAll("[data-open-gate]").forEach(b => b.addEventListener("click", () => openGate()));

  async function checkNow(auto) {
    verifyBtn.disabled = true; verifyBtn.textContent = "Checking GitHub…";
    await refreshStatus();
    verifyBtn.disabled = false; verifyBtn.textContent = "Check again";
    paintGate(); gateMessage();
    track("unlock_check", { following: auth.following, starred: auth.starred, auto: !!auto });
    if (auth.unlocked) setTimeout(() => { if (gate.open) gate.close(); toast("Every skill is unlocked."); }, 900);
  }
  verifyBtn.addEventListener("click", () => checkNow(false));
  // Coming back from the GitHub tab re-checks without a click.
  window.addEventListener("focus", () => {
    if (!gate.open || !auth.signedIn || auth.unlocked) return;
    if (Date.now() - lastAuto < 4000) return;
    lastAuto = Date.now();
    setTimeout(() => checkNow(true), 600);
  });

  function updateChrome() {
    const bar = $("#launch");
    const me = $("#me");
    me.hidden = !auth.signedIn;
    $("#me-login").textContent = auth.signedIn ? `@${auth.login}` : "";
    if (auth.unlocked || !auth.loaded) { bar.hidden = true; }
    else {
      $("#launch-text").textContent = auth.signedIn
        ? `Signed in as @${auth.login}. ${auth.requireFollow ? "Follow and star" : "Star the repo"} on GitHub to finish unlocking.`
        : `Sign in with GitHub, ${auth.requireFollow ? "follow and star" : "star the repo"} to copy any ${view.all ? `of the ${fmtNum(view.all)} skills` : "skill"}.`;
      bar.querySelector("[data-open-gate]").textContent = auth.signedIn ? "Finish unlocking" : "Unlock";
      bar.hidden = false;
    }
    if (gate.open) { paintGate(); gateMessage(); }
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
    const C = { water: css("--water"), wis: css("--wisteria"), pad: css("--pad"), bridge: css("--bridge"), lily: css("--lily"), deep: css("--lily-deep"), line: css("--line") };
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
  (async () => {
    try {
      const tax = await (await fetch("/data/taxonomy.json")).json();
      SECTIONS = tax.sections;
      SECTIONS.forEach(sec => { secLabel[sec.id] = sec.label; sec.cats.forEach(c => { catLabel[`${sec.id}/${c.id}`] = c.label; }); });
    } catch { /* labels fall back to ids */ }
    if (view.tab !== "all" && !SECTIONS.some(s => s.id === view.tab)) view.tab = "all";
    load(false);
  })();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => paintPond(true)); else paintPond(true);

  const signin = params.get("signin");
  if (signin) {
    params.delete("signin");
    history.replaceState(null, "", location.pathname + (params.toString() ? "?" + params : "") + location.hash);
  }
  refreshStatus().then(() => {
    if (signin === "ok") {
      track("signed_in", { unlocked: auth.unlocked });
      if (auth.unlocked) toast(`Signed in as @${auth.login}. Every skill is unlocked.`);
      else openGate();
    } else if (signin === "cancelled") toast("Sign-in was cancelled.");
    else if (signin === "failed" || signin === "expired") toast("Sign-in didn’t finish. Try again.");
  });
})();
