#!/usr/bin/env node
// Tells IndexNow engines (Bing, which powers ChatGPT search, plus Yandex, Naver, Seznam) which pages changed,
// so new and updated skills get indexed in hours instead of weeks.
// Usage: node scripts/indexnow.mjs            (pings pages from data/changes.json plus the main pages)
//        node scripts/indexnow.mjs --all      (pings the main pages and every featured skill)
// The key is public by design; build-public.mjs publishes it at /<key>.txt.
export const INDEXNOW_KEY = "ee22b168a363112d6794a18f46a3467b";

if (import.meta.url === `file://${process.argv[1]}`) {
  const seo = await import("../api/_seo.js");
  const { readFile } = await import("node:fs/promises");
  const { SKILLS } = await import("../api/_skills.js");
  const changes = JSON.parse(await readFile(new URL("../data/changes.json", import.meta.url), "utf8").catch(() => "{}"));
  const ids = process.argv.includes("--all") ? SKILLS.filter(s => s.featured).map(s => s.id) : [...(changes.added || []), ...(changes.updated || [])];
  const urlList = [seo.url.home(), seo.url.hub(), ...seo.SECTIONS.map(s => seo.url.section(s.id)), ...ids.slice(0, 9000).map(seo.url.skill)];
  const host = new URL(seo.SITE).host;
  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${seo.SITE}/${INDEXNOW_KEY}.txt`, urlList })
  });
  console.log(`IndexNow: ${urlList.length} URLs -> HTTP ${r.status}`);
}
