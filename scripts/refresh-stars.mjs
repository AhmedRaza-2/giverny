#!/usr/bin/env node
// Refreshes the "stars" numbers in data/skills.js from the GitHub API.
// Usage: GITHUB_TOKEN=... node scripts/refresh-stars.mjs
import { readFile, writeFile } from "node:fs/promises";

const FILE = new URL("../data/skills.js", import.meta.url);
const src = await readFile(FILE, "utf8");
const repos = [...new Set([...src.matchAll(/"repo":\s*"([^"]+)"/g)].map(m => m[1]))];
const headers = { Accept: "application/vnd.github+json", "User-Agent": "giverny-refresh" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const stars = {};
for (const repo of repos) {
  const r = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!r.ok) { console.warn(`skip ${repo}: HTTP ${r.status}`); continue; }
  stars[repo] = (await r.json()).stargazers_count;
}

// Each entry lists "repo" before "stars", so update the next "stars" after every "repo".
let out = "", last = 0, changed = 0;
const re = /"repo":\s*"([^"]+)"[\s\S]*?"stars":\s*(\d+)/g;
for (const m of src.matchAll(re)) {
  const [whole, repo, old] = m;
  const n = stars[repo];
  if (n == null || String(n) === old) continue;
  const at = m.index + whole.lastIndexOf(old);
  out += src.slice(last, at) + n;
  last = at + old.length;
  changed++;
}
out += src.slice(last);
const today = new Date().toISOString().slice(0, 10);
out = out.replace(/window\.GIVERNY_UPDATED = "[^"]*"/, `window.GIVERNY_UPDATED = "${today}"`);
await writeFile(FILE, out);
console.log(`Checked ${Object.keys(stars).length}/${repos.length} repos, updated ${changed} star counts.`);
