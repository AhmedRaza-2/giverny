#!/usr/bin/env node
/*
 * Giverny indexer: reads every SKILL.md in the repos listed in data/sources.json and writes
 * api/_index.js (server only, has install commands). Run build-public.mjs afterwards.
 *
 *   node scripts/index-skills.mjs [--cache DIR] [--baseline] [--only owner/repo]
 *
 * - Only SKILL.md files and plugin manifests are downloaded (sparse, shallow clone).
 * - Each skill keeps the git blob SHA of its SKILL.md: a new SHA means the author updated it.
 * - --baseline marks everything as already known (no "New" badges), for the first run.
 * Needs git and the GitHub CLI (gh) on PATH. In GitHub Actions set GH_TOKEN.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, rm, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const run = promisify(execFile);
const ROOT = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const CACHE = opt("--cache") || join(tmpdir(), "giverny-index");
const BASELINE = args.includes("--baseline");
const ONLY = opt("--only");
const TODAY = new Date().toISOString().slice(0, 10);

const { sources, minStars = 0 } = JSON.parse(await readFile(join(ROOT, "data/sources.json"), "utf8"));
const TAX = JSON.parse(await readFile(join(ROOT, "data/taxonomy.json"), "utf8"));
let previous = [];
try { previous = (await import(join(ROOT, "api/_index.js"))).INDEX || []; } catch {}
const prevById = new Map(previous.map(e => [e.id, e]));

const OFFICIAL = new Set(["anthropics", "vercel-labs", "google-labs-code", "google", "figma", "expo", "greensock", "remotion-dev", "heygen-com", "elevenlabs", "fal-ai-community", "minimax-ai", "supabase", "stripe", "cloudflare", "hashicorp", "neondatabase", "clickhouse", "duckdb", "mongodb", "redis", "qdrant", "firebase", "auth0", "apollographql", "getsentry", "microsoft", "nvidia", "angular", "wordpress", "jetbrains", "browserbase", "firecrawl", "brave", "coderabbitai", "lambdatest", "datadog-labs", "sanity-io", "resend", "typefully", "huggingface", "openai", "mobbin", "better-auth", "googleworkspace", "posit-dev"]);
const NICE = { anthropics: "Anthropic", "vercel-labs": "Vercel", "google-labs-code": "Google Labs", google: "Google", "heygen-com": "HeyGen", "remotion-dev": "Remotion", "fal-ai-community": "fal.ai", "MiniMax-AI": "MiniMax", obra: "Jesse Vincent", mattpocock: "Matt Pocock", garrytan: "Garry Tan", trailofbits: "Trail of Bits", coreyhaines31: "Corey Haines", emilkowalski: "Emil Kowalski", pbakaus: "Paul Bakaus", wshobson: "Seth Hobson", getsentry: "Sentry", "datadog-labs": "Datadog", "sanity-io": "Sanity", neondatabase: "Neon", "better-auth": "Better Auth", greensock: "GreenSock", twostraws: "Paul Hudson", AvdLee: "Antoine van der Lee", addyosmani: "Addy Osmani", deanpeters: "Dean Peters", phuryn: "Paweł Huryn", googleworkspace: "Google Workspace", "K-Dense-AI": "K-Dense", "posit-dev": "Posit", zarazhangrui: "Zara Zhang", nicobailon: "Nico Bailon", "Owl-Listener": "Marie Claire Dean" };

/* ---------- helpers ---------- */
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ACR = new Set(["ui", "ux", "seo", "api", "apis", "mcp", "css", "pdf", "ios", "ai", "llm", "cro", "sql", "gsap", "svg", "html", "sdk", "cli", "aws", "gcp", "k8s", "prd", "okr", "geo", "rag", "tdd", "qa", "e2e", "gif", "tts", "jwt", "sso", "dx", "gtm", "saas", "b2b", "crm", "pr", "ci", "cd", "url", "json", "yaml", "md", "xlsx", "docx", "pptx", "rn", "js", "ts", "db", "ga4", "a11y", "wcag", "hig", "llms", "n8n", "3d", "2d"]);
const SPECIAL = { ios: "iOS", macos: "macOS", ipados: "iPadOS", watchos: "watchOS", tvos: "tvOS", visionos: "visionOS", github: "GitHub", javascript: "JavaScript", typescript: "TypeScript", nextjs: "Next.js", graphql: "GraphQL", openai: "OpenAI", youtube: "YouTube", linkedin: "LinkedIn", tiktok: "TikTok", postgres: "Postgres", mongodb: "MongoDB", wordpress: "WordPress", seo: "SEO" };
const title = s => s.replace(/^.*::/, "").replace(/[_-]+/g, " ").trim().split(/\s+/).map(w => SPECIAL[w.toLowerCase()] || (ACR.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ");

function frontmatter(md) {
  const m = md.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {}; const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let [, k, v] = kv;
    if (/^[>|][-+]?\s*$/.test(v)) {
      const buf = [];
      while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1].trim() === "")) buf.push(lines[++i].trim());
      v = buf.join(v.startsWith("|") ? "\n" : " ").trim();
    } else if (/^["']/.test(v) && !(v.length > 1 && v.endsWith(v[0]))) {
      const q = v[0]; const buf = [v.slice(1)];
      while (i + 1 < lines.length) { const l = lines[++i]; if (l.trimEnd().endsWith(q)) { buf.push(l.trimEnd().slice(0, -1)); break; } buf.push(l.trim()); }
      v = buf.join(" ");
    } else if (/^["'].*["']$/.test(v)) v = v.slice(1, -1);
    out[k] = v.replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
  }
  return out;
}

function shortDesc(d) {
  if (!d) return "";
  let s = d.replace(/\s+/g, " ").trim();
  const cut = s.search(/\s(Use (this|when|it|for|whenever)|Triggers?|TRIGGER|Invoke|Activate|Use proactively|Load (this|when|whenever)|Call this|Applies when|Should be used)\b/);
  if (cut > 30) s = s.slice(0, cut).trim();
  if (s.length > 180) { s = s.slice(0, 180); s = s.slice(0, Math.max(s.lastIndexOf(". ") + 1, s.lastIndexOf(" "))).replace(/[,;:\s-]+$/, "") + "…"; }
  return s;
}

const ALL_CATS = TAX.sections.flatMap(sec => sec.cats.map(c => ({ ...c, section: sec.id })));
function classify(name, text, section, fallback) {
  const hay = ` ${(name + " " + text).toLowerCase().replace(/[^a-z0-9.+#/ -]/g, " ")} `;
  const nm = ` ${name.toLowerCase().replace(/[-_]/g, " ")} `;
  const pool = section === "auto" ? ALL_CATS : ALL_CATS.filter(c => c.section === section);
  let best = null, bestScore = 0;
  for (const c of pool) {
    let sc = 0;
    for (const k of c.kw) {
      const kk = ` ${k} `.replace(/\s+/g, " ");
      const w = k.trim().includes(" ") ? 2 : 1;      // phrases are stronger evidence than single words
      if (hay.includes(kk) || (k.length > 5 && hay.includes(" " + k))) sc += w;
      if (nm.includes(" " + k.trim())) sc += 2;
    }
    if (section === "auto" && c.section === fallback && sc > 0) sc += 0.5;
    if (sc > bestScore) { bestScore = sc; best = c; }
  }
  if (!best || bestScore < (section === "auto" ? 1.5 : 1)) { const s = section === "auto" ? fallback : section; return { section: s, cat: "general" }; }
  return { section: best.section, cat: best.id };
}

async function stars(repos) {
  const out = {};
  for (let i = 0; i < repos.length; i += 6) {
    const q = repos.slice(i, i + 6).map(r => "repo:" + r).join(" ");
    try {
      const { stdout } = await run("gh", ["api", "-X", "GET", "search/repositories", "-f", `q=${q}`, "--jq", ".items[] | [.full_name, .stargazers_count, .pushed_at] | @tsv"], { maxBuffer: 1 << 24 });
      for (const line of stdout.trim().split("\n").filter(Boolean)) { const [n, s, p] = line.split("\t"); out[n.toLowerCase()] = { stars: +s, pushed: p.slice(0, 10) }; }
    } catch (e) { console.warn("stars lookup failed:", e.message.split("\n")[0]); }
  }
  return out;
}

async function fetchRepo(repo) {
  const dir = join(CACHE, repo.replace("/", "__"));
  await rm(dir, { recursive: true, force: true });
  const url = `https://github.com/${repo}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await run("git", ["clone", "-q", "--depth", "1", "--filter=blob:none", "--no-checkout", url, dir], { timeout: 180000 });
      await run("git", ["-C", dir, "sparse-checkout", "set", "--no-cone", "**/SKILL.md", "SKILL.md", "/.claude-plugin/marketplace.json"]);
      await run("git", ["-C", dir, "checkout", "-q"], { timeout: 300000 });
      return dir;
    } catch (e) {
      await rm(dir, { recursive: true, force: true });
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

const SKIP_DIR = /(^|\/)(node_modules|tests?|__tests__|fixtures|examples?|templates?|evals?|benchmarks?|archive|deprecated)(\/|$)/i;
const pathRank = p => (p.split("/").some(s => s.startsWith(".") && s !== ".claude") ? 100 : 0) + (p.startsWith(".claude/") ? 5 : 0) + p.split("/").length;

async function indexRepo(src, meta) {
  const dir = await fetchRepo(src.repo);
  const { stdout } = await run("git", ["-C", dir, "ls-tree", "-r", "HEAD"], { maxBuffer: 1 << 26 });
  const files = stdout.split("\n").map(l => l.match(/^\d+ blob ([0-9a-f]+)\t(.+)$/)).filter(Boolean)
    .map(m => ({ sha: m[1], path: m[2] })).filter(f => /(^|\/)SKILL\.md$/.test(f.path) && !SKIP_DIR.test(f.path));
  // Plugin routes from the repo's marketplace manifest.
  let mkt = null;
  try {
    const m = JSON.parse(await readFile(join(dir, ".claude-plugin/marketplace.json"), "utf8"));
    mkt = { name: m.name, plugins: (m.plugins || []).map(p => ({ name: p.name, src: typeof p.source === "string" ? p.source.replace(/^\.\//, "").replace(/\/$/, "") : null })) };
  } catch {}
  const byName = new Map();
  for (const f of files) {
    let md; try { md = await readFile(join(dir, f.path), "utf8"); } catch { continue; }
    const fm = frontmatter(md);
    const skillDir = f.path.includes("/") ? f.path.slice(0, f.path.lastIndexOf("/")) : "";
    const raw = (fm.name || skillDir.split("/").pop() || src.repo.split("/")[1]).trim();
    if (!raw || /^(template|example|skill-template|my-skill)$/i.test(raw)) continue;
    const key = slug(raw);
    const prev = byName.get(key);
    if (prev && pathRank(prev.path) <= pathRank(f.path)) continue;
    byName.set(key, { ...f, dir: skillDir, raw, fm });
  }
  const owner = src.repo.split("/")[0];
  const entries = [];
  for (const s of byName.values()) {
    const desc = s.fm.description || "";
    const { section, cat } = classify(s.raw, desc, src.section, src.fallback);
    const id = `${slug(src.repo.replace("/", "-"))}--${slug(s.raw)}`.slice(0, 90);
    let plugin;
    if (mkt && mkt.name) {
      const p = mkt.plugins.find(p => p.src !== null && (p.src === "" || s.dir === p.src || s.dir.startsWith(p.src + "/")));
      if (p) plugin = { add: src.repo, install: `${p.name}@${mkt.name}` };
    }
    const single = byName.size === 1;
    const old = prevById.get(id);
    entries.push({
      id, name: title(s.raw), skill: s.raw, by: NICE[owner] || owner, repo: src.repo, path: s.dir || undefined,
      section, cat, official: OFFICIAL.has(owner.toLowerCase()) || undefined,
      desc: shortDesc(desc) || `${title(s.raw)} skill from ${src.repo}.`, about: desc.slice(0, 600) || undefined,
      cmd: single ? `npx skills add ${src.repo}` : `npx skills add ${src.repo} --skill ${s.raw}`,
      plugin, ask: `Use the ${s.raw} skill on my current project.`,
      sha: s.sha, stars: meta?.stars ?? 0, pushed: meta?.pushed,
      added: old ? old.added : (BASELINE ? "" : TODAY),
      updated: old ? (old.sha !== s.sha ? TODAY : old.updated) : ""
    });
  }
  return entries;
}

/* ---------- run ---------- */
await mkdir(CACHE, { recursive: true });
const list = sources.filter(s => !ONLY || s.repo.toLowerCase() === ONLY.toLowerCase());
console.log(`Indexing ${list.length} repos into ${CACHE}`);
const meta = await stars(list.map(s => s.repo));
const results = [], failed = [];
let next = 0;
async function worker() {
  while (next < list.length) {
    const src = list[next++];
    const m = meta[src.repo.toLowerCase()];
    if (m && m.stars < minStars && !OFFICIAL.has(src.repo.split("/")[0].toLowerCase())) { console.log(`  skip ${src.repo} (${m.stars} stars < ${minStars})`); continue; }
    try {
      const e = await indexRepo(src, m);
      results.push(...e);
      console.log(`  ${String(e.length).padStart(4)}  ${src.repo}`);
    } catch (err) { failed.push(src.repo); console.log(`  FAIL ${src.repo}: ${err.message.split("\n")[0]}`); }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

// When only some repos were indexed, keep everything else from the previous index.
let INDEX = results;
if (ONLY || failed.length) {
  const done = new Set(list.filter(s => !failed.includes(s.repo)).map(s => s.repo));
  INDEX = [...previous.filter(e => !done.has(e.repo)), ...results];
}
// Unique ids, stable order: section, then stars, then name.
const seen = new Map();
for (const e of INDEX) { let id = e.id, n = 2; while (seen.has(id)) id = `${e.id}-${n++}`; e.id = id; seen.set(id, e); }
const order = TAX.sections.map(s => s.id);
INDEX.sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section) || b.stars - a.stars || a.name.localeCompare(b.name));

const ids = new Set(INDEX.map(e => e.id));
const changes = {
  date: TODAY,
  added: INDEX.filter(e => e.added === TODAY).map(e => e.id),
  updated: INDEX.filter(e => e.updated === TODAY && e.added !== TODAY).map(e => e.id),
  removed: previous.filter(e => !ids.has(e.id)).map(e => e.id),
  failed
};
const clean = e => Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined));
await writeFile(join(ROOT, "api/_index.js"),
  `// Generated by scripts/index-skills.mjs on ${TODAY}. Server only. Do not edit by hand.\nexport const INDEXED_AT = ${JSON.stringify(TODAY)};\nexport const INDEX = ${JSON.stringify(INDEX.map(clean))};\n`);
await writeFile(join(ROOT, "data/changes.json"), JSON.stringify(changes, null, 1) + "\n");
const bySec = {}; INDEX.forEach(e => { bySec[e.section] = (bySec[e.section] || 0) + 1; });
console.log(`\n${INDEX.length} skills`, bySec, `| new ${changes.added.length}, updated ${changes.updated.length}, removed ${changes.removed.length}, failed ${failed.length}`);
