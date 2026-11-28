// Giverny search engine. Built once per server instance from the catalog, then answers in a few ms.
// Understands intent ("optimize my app" -> performance, Core Web Vitals, profiling...) through the
// intent map in data/taxonomy.json, ranks by match quality, coverage, popularity and editorial picks.
import { TAX } from "./_taxonomy.js";
import { SKILLS } from "./_skills.js";

const SECTIONS = TAX.sections.map(s => s.id);
const CAT_LABEL = {};
TAX.sections.forEach(s => s.cats.forEach(c => { CAT_LABEL[`${s.id}/${c.id}`] = c.label; }));
const STOP = new Set(TAX.stopwords);

const stem = w => w.length > 5 && w.endsWith("ing") ? w.slice(0, -3)
  : w.length > 4 && w.endsWith("ies") ? w.slice(0, -3) + "y"
  : w.length > 4 && w.endsWith("es") && !w.endsWith("ses") ? w.slice(0, -2)
  : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1)
  : w.length > 5 && w.endsWith("ed") ? w.slice(0, -2) : w;
export const tokens = s => String(s || "").toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").split(" ")
  .map(w => w.replace(/^\.+|\.+$/g, "")).filter(Boolean).map(stem);

// Verbs that say little on their own: "edit", "make"... they still count, but less than the object.
const WEAK = new Set(["edit", "make", "add", "create", "build", "improve", "fix", "find", "write", "generate", "optimize", "optimise", "set", "setup", "run", "check", "update", "new", "app", "website", "site", "project", "code", "file", "tool"].map(stem));
const ALL_CATS = TAX.sections.flatMap(sec => sec.cats.map(c => ({ ...c, section: sec.id })));
// What is the person trying to do? Score the query (plus its intent expansions) against category keywords.
function intentOf(words, phrases) {
  const hay = ` ${[...words, ...phrases].join(" ")} `;
  let scored = ALL_CATS.map(c => {
    let sc = 0;
    for (const k of c.kw) { const kk = ` ${k} `; if (hay.includes(kk)) sc += k.includes(" ") ? 2 : 1; }
    return { key: `${c.section}/${c.id}`, section: c.section, sc };
  }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc);
  if (!scored.length) return { cats: new Set(), sections: new Set() };
  scored = scored.filter(x => x.sc >= scored[0].sc * 0.6).slice(0, 3);
  return { cats: new Set(scored.map(x => x.key)), sections: new Set(scored.map(x => x.section)) };
}

const FIELDS = [["name", 6], ["cat", 3], ["by", 2], ["desc", 2], ["about", 1], ["repo", 1]];

/* ---------- build ---------- */
const docs = SKILLS.map((s, i) => {
  const f = {
    name: tokens(s.name + " " + (s.skill || "")), cat: tokens(CAT_LABEL[`${s.section}/${s.cat}`]),
    by: tokens(s.by), desc: tokens(s.desc), about: tokens(s.about), repo: tokens(s.repo.replace("/", " "))
  };
  const sets = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, new Set(v)]));
  const text = ` ${[s.name, s.desc, s.about || "", CAT_LABEL[`${s.section}/${s.cat}`]].join(" ").toLowerCase().replace(/[^a-z0-9+#. ]+/g, " ")} `;
  const prior = 0.22 * Math.log10(1 + (s.stars || 0)) + (s.featured ? 1.4 : 0) + (s.official ? 0.35 : 0);
  return { i, s, sets, text, prior };
});
const df = new Map();
for (const d of docs) for (const t of new Set(Object.values(d.sets).flatMap(x => [...x]))) df.set(t, (df.get(t) || 0) + 1);
const N = docs.length;
// Inverted index: token -> ids of the skills that contain it, so a query only scores plausible matches.
const post = new Map();
docs.forEach((d, i) => { for (const t of new Set(Object.values(d.sets).flatMap(x => [...x]))) { if (!post.has(t)) post.set(t, []); post.get(t).push(i); } });
const REPOS = new Set(SKILLS.map(s => s.repo.toLowerCase())).size;
const TOTALS = Object.fromEntries(SECTIONS.map(id => [id, SKILLS.filter(s => s.section === id).length]));
const idf = t => Math.log(1 + N / (1 + (df.get(t) || 0)));
// Prefix lookup for partial words ("optim" -> optimize, optimization).
const vocab = [...df.keys()].sort();
function prefixed(t) {
  if (t.length < 4) return [];
  const out = [];
  let lo = 0, hi = vocab.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (vocab[m] < t) lo = m + 1; else hi = m; }
  for (let k = lo; k < vocab.length && vocab[k].startsWith(t) && out.length < 12; k++) if (vocab[k] !== t) out.push(vocab[k]);
  return out;
}

// Browse order: editorial picks first, then a round-robin across repos (by popularity) so no single
// big collection floods the list.
function diverse(list) {
  const featured = list.filter(d => d.s.featured).sort((a, b) => b.s.stars - a.s.stars);
  const groups = new Map();
  for (const d of list) if (!d.s.featured) { const k = d.s.repo; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(d); }
  const queues = [...groups.values()].map(g => g.sort((a, b) => b.prior - a.prior)).sort((a, b) => b[0].s.stars - a[0].s.stars);
  const out = [...featured];
  for (let round = 0; queues.some(q => q.length); round++) for (const q of queues) if (q.length) out.push(q.shift());
  return out;
}
const browseCache = new Map();

/* ---------- query ---------- */
function concepts(q) {
  const raw = String(q || "").toLowerCase().slice(0, 200);
  const words = raw.replace(/[^a-z0-9+#. ]+/g, " ").split(/\s+/).filter(Boolean);
  const out = [];
  for (const w of words) {
    if (STOP.has(w)) continue;
    const t = stem(w);
    const exp = new Set();
    for (const key of [w, t]) for (const e of (TAX.intents[key] || [])) exp.add(e);
    out.push({ word: w, term: t, phrases: [...exp] });
  }
  // Two-word phrases ("landing page", "edit video") matched against the text as a bonus.
  const pairs = [];
  for (let k = 0; k + 1 < words.length; k++) if (!STOP.has(words[k]) && !STOP.has(words[k + 1])) pairs.push(` ${words[k]} ${words[k + 1]}`);
  const intent = intentOf(words.filter(w => !STOP.has(w)), out.flatMap(c => c.phrases));
  // A query that is only weak words ("make app") keeps them at full strength.
  const strong = out.filter(c => !WEAK.has(c.term)).length;
  out.forEach(c => { c.weight = strong && WEAK.has(c.term) ? 0.45 : 1; });
  return { list: out, pairs, intent };
}

function scoreDoc(d, C) {
  let total = 0, matched = 0;
  for (const c of C.list) {
    let best = 0;
    for (const [f, w] of FIELDS) {
      const set = d.sets[f];
      if (set.has(c.term)) best = Math.max(best, w * idf(c.term));
      else if (c.pre.some(p => set.has(p))) best = Math.max(best, 0.75 * w * idf(c.term));
    }
    for (const ph of c.phrases) {
      const pts = ph.split(" ").map(stem);
      if (pts.length === 1) {
        for (const [f, w] of FIELDS) if (d.sets[f].has(pts[0])) best = Math.max(best, 0.55 * w * idf(pts[0]));
      } else if (d.text.includes(` ${ph} `) || d.text.includes(` ${ph}`)) best = Math.max(best, 0.6 * 4 * idf(pts[pts.length - 1]));
    }
    if (best > 0) matched += c.weight;
    total += best * c.weight;
  }
  if (!matched) return 0;
  for (const p of C.pairs) if (d.text.includes(p)) total += 3;
  const coverage = matched / C.list.reduce((a, c) => a + c.weight, 0);
  let sc = total * (0.35 + 0.65 * coverage * coverage);
  if (C.intent.cats.has(`${d.s.section}/${d.s.cat}`)) sc *= 1.45;
  else if (C.intent.sections.has(d.s.section)) sc *= 1.12;
  return sc + d.prior;
}

const pub = s => {
  const o = { id: s.id, name: s.name, by: s.by, repo: s.repo, path: s.path, section: s.section, cat: s.cat,
    official: s.official || undefined, featured: s.featured || undefined, desc: s.desc, stars: s.stars || 0,
    added: s.added || undefined, updated: s.updated || undefined, kind: s.kind || undefined };
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));
};

export function search({ q = "", section = "all", cat = "all", offset = 0, limit = 40, id = "" }) {
  if (id) {
    const d = docs.find(x => x.s.id === id);
    return { q, section: "all", cat: "all", total: d ? 1 : 0, offset: 0, all: N, repos: REPOS, totals: TOTALS, facets: { sections: Object.fromEntries(SECTIONS.map(s => [s, s === d?.s.section ? 1 : 0])), cats: {} }, results: d ? [pub(d.s)] : [] };
  }
  const C = concepts(q);
  C.list.forEach(c => { c.pre = prefixed(c.term); });
  let ranked;
  if (!C.list.length) {
    const key = `${section}|${cat}`;
    if (!browseCache.has(key)) browseCache.set(key, diverse(docs.filter(d => (section === "all" || d.s.section === section) && (cat === "all" || d.s.cat === cat))));
    ranked = browseCache.get(key).map(d => ({ d, score: 0 }));
  } else {
    const cand = new Set();
    for (const c of C.list) {
      for (const t of [c.term, ...c.pre, ...c.phrases.flatMap(p => p.split(" ").map(stem))]) for (const i of (post.get(t) || [])) cand.add(i);
    }
    ranked = [];
    for (const i of cand) { const d = docs[i]; const sc = scoreDoc(d, C); if (sc > 0) ranked.push({ d, score: sc }); }
    ranked.sort((a, b) => b.score - a.score);
    const top = ranked.length ? ranked[0].score : 0;
    ranked = ranked.filter(r => r.score >= top * 0.18);
  }
  // Facets are counted before the section/category filter so tabs show how many match everywhere.
  const sections = Object.fromEntries(SECTIONS.map(s => [s, 0]));
  const pool = C.list.length ? ranked : docs.map(d => ({ d }));
  for (const r of pool) sections[r.d.s.section]++;
  const inSection = pool.filter(r => section === "all" || r.d.s.section === section);
  const cats = {};
  for (const r of inSection) cats[r.d.s.cat] = (cats[r.d.s.cat] || 0) + 1;
  const filtered = C.list.length ? inSection.filter(r => cat === "all" || r.d.s.cat === cat) : ranked;
  const page = filtered.slice(offset, offset + limit);
  const topScore = filtered.length ? filtered[0].score : 0;
  return {
    q, section, cat, total: filtered.length, offset, all: N, repos: REPOS, totals: TOTALS,
    facets: { sections, cats },
    results: page.map((r, k) => ({ ...pub(r.d.s), best: C.list.length && offset + k < 3 && r.score >= topScore * 0.7 ? true : undefined }))
  };
}
