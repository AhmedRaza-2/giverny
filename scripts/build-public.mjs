#!/usr/bin/env node
// Builds everything search engines and AI answer engines read. Run after the catalog changes.
//  - api/_taxonomy.js       taxonomy as a JS module for the server
//  - sitemap.xml            every page: home, directory, sections, categories, every skill
//  - robots.txt             allows search and AI crawlers, points at the sitemap
//  - llms.txt / llms-full.txt   plain-text guides for ChatGPT, Claude, Perplexity and other LLMs
//  - index.html             pre-rendered skills, counts, footer links and JSON-LD, so the home page has
//                           real content without JavaScript
//  - <key>.txt              IndexNow key file (Bing, Yandex, and the engines that share IndexNow)
import { writeFile, rm, readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const tax = await readFile(new URL("data/taxonomy.json", root), "utf8");
await writeFile(new URL("api/_taxonomy.js", root), `// Generated from data/taxonomy.json by scripts/build-public.mjs. Edit the JSON, not this file.\nexport const TAX = ${tax.trim()};\n`);
for (const old of ["data/skills.js", "data/skills.json"]) await rm(new URL(old, root), { force: true });

const { SKILLS, UPDATED } = await import("../api/_skills.js");
const { search } = await import("../api/_search.js");
const seo = await import("../api/_seo.js");
const { SITE, SECTIONS, SEC_TITLE, SEC_INTRO, url, esc, fmt, jsonld, ORG, WEBSITE, faqLd, footLinks, COLOR } = seo;
const { INDEXNOW_KEY } = await import("./indexnow.mjs");

const total = SKILLS.length;
const repos = new Set(SKILLS.map(s => s.repo.toLowerCase())).size;
const counts = {};
for (const s of SKILLS) { counts[s.section] = (counts[s.section] || 0) + 1; counts[`${s.section}/${s.cat}`] = (counts[`${s.section}/${s.cat}`] || 0) + 1; }

/* ---------- sitemap ---------- */
const urls = [
  { loc: url.home(), pri: "1.0", freq: "daily", mod: UPDATED },
  { loc: url.hub(), pri: "0.9", freq: "weekly", mod: UPDATED },
  ...SECTIONS.map(s => ({ loc: url.section(s.id), pri: "0.8", freq: "weekly", mod: UPDATED })),
  ...SECTIONS.flatMap(s => s.cats.filter(c => counts[`${s.id}/${c.id}`]).map(c => ({ loc: url.cat(s.id, c.id), pri: "0.7", freq: "weekly", mod: UPDATED }))),
  ...SKILLS.map(s => ({ loc: url.skill(s.id), pri: s.featured ? "0.8" : "0.5", freq: "weekly", mod: s.updated || s.added || UPDATED }))
];
await writeFile(new URL("sitemap.xml", root), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${esc(u.loc)}</loc><lastmod>${u.mod}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`).join("\n")}
</urlset>
`);

/* ---------- robots ---------- */
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot", "Meta-ExternalAgent", "DuckAssistBot", "YouBot", "cohere-ai", "Amazonbot"];
await writeFile(new URL("robots.txt", root), `# Giverny welcomes search engines and AI answer engines.
User-agent: *
Allow: /
Disallow: /api/

${AI_BOTS.map(b => `User-agent: ${b}\nAllow: /\nDisallow: /api/`).join("\n\n")}

Sitemap: ${SITE}/sitemap.xml
`);

/* ---------- llms.txt ---------- */
const top = (sec, n) => search({ section: sec, limit: n }).results;
const line = s => `- [${s.name}](${url.skill(s.id)}): ${s.desc} (by ${s.by})`;
const llms = `# Giverny: Claude Skills Directory

> Giverny is a searchable directory of ${fmt(total)} free, open-source Claude skills (Agent Skills / SKILL.md) for Claude Code, collected from ${fmt(repos)} public GitHub repos and refreshed weekly. Each skill page explains what the skill does and how to install it; on the site, people copy one prompt and Claude Code installs the skill.

## What are Claude skills?

Claude skills are folders of instructions, scripts and resources that Claude loads when a task needs them. Each has a SKILL.md file with a name and description. Claude reads the description and loads the full skill when a request matches. They work in Claude Code, the Claude apps and the Claude API, and in other agents that read SKILL.md.

## How to install a Claude skill

- One command in a terminal: \`npx skills add owner/repo --skill skill-name\`
- As a Claude Code plugin: \`/plugin marketplace add owner/repo\` then \`/plugin install plugin@marketplace\`
- By hand: copy the skill folder into \`~/.claude/skills/\`
- On Giverny: sign in with GitHub, copy the skill's prompt, paste it into Claude Code.

## Browse by section

${SECTIONS.map(s => `- [${SEC_TITLE[s.id]}](${url.section(s.id)}): ${fmt(counts[s.id])} skills. ${SEC_INTRO[s.id]}`).join("\n")}
- [Full directory](${url.hub()})
- [Search](${SITE}/?q=)

${SECTIONS.map(s => `## Best ${SEC_TITLE[s.id]}\n\n${top(s.id, 12).map(line).join("\n")}`).join("\n\n")}

## Optional

- [Complete category list with top skills](${SITE}/llms-full.txt)
- [Sitemap of every skill page](${SITE}/sitemap.xml)
- [Source code](https://github.com/${seo.REPO})
`;
await writeFile(new URL("llms.txt", root), llms);

const full = `# Giverny: Claude Skills Directory (full)

> ${fmt(total)} Claude skills from ${fmt(repos)} GitHub repos, grouped by section and category. Updated ${UPDATED}. Each link opens a page with what the skill does and how to install it.

${SECTIONS.map(s => `## ${SEC_TITLE[s.id]} (${fmt(counts[s.id])})\n\n${SEC_INTRO[s.id]}\n\n${s.cats.filter(c => counts[`${s.id}/${c.id}`]).map(c =>
  `### ${c.label} (${fmt(counts[`${s.id}/${c.id}`])}): ${url.cat(s.id, c.id)}\n\n${search({ section: s.id, cat: c.id, limit: 25 }).results.map(line).join("\n")}`).join("\n\n")}`).join("\n\n")}
`;
await writeFile(new URL("llms-full.txt", root), full);

/* ---------- index.html pre-render ---------- */
let html = await readFile(new URL("index.html", root), "utf8");
const put = (key, content) => { html = html.replace(new RegExp(`<!--PRE:${key}-->[\\s\\S]*?<!--/PRE:${key}-->`), `<!--PRE:${key}-->${content}<!--/PRE:${key}-->`); };
const picks = search({ limit: 24 }).results;
const fmtStars = n => n >= 1000 ? (n >= 100000 ? Math.round(n / 1000) : (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")) + "k" : String(n);
put("list", picks.map(s => `<li class="row" style="--c: var(--c-${s.section})"><div class="row-head"><div class="r-name"><a class="r-title" href="/skills/${esc(s.id)}"><span class="t">${esc(s.name)}</span></a><div class="r-by"><span>${esc(s.by)}</span>${s.official ? '<span class="badge off">Official</span>' : ""}${s.featured ? '<span class="badge pick">Pick</span>' : ""}</div></div><p class="r-desc">${esc(s.desc)}</p><span class="r-stars">★ ${fmtStars(s.stars)}</span><div class="r-act"><a class="btn" href="/skills/${esc(s.id)}">Details</a></div></div></li>`).join(""));
put("kicker", `${fmt(total)} Claude skills from ${fmt(repos)} repos, updated weekly`);
put("updated", new Date(UPDATED + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }));
put("footlinks", footLinks());
const faq = [...html.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)].map(m => [m[1], m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()]);
put("jsonld", jsonld({ "@context": "https://schema.org", "@graph": [ORG, WEBSITE, faqLd(faq),
  { "@type": "ItemList", name: "Popular Claude skills", itemListElement: picks.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: url.skill(s.id), name: s.name })) },
  { "@type": "CollectionPage", "@id": `${SITE}/#home`, url: `${SITE}/`, name: "Claude Skills Directory", isPartOf: { "@id": `${SITE}/#website` }, about: { "@type": "Thing", name: "Claude skills" }, dateModified: UPDATED }] }));
html = html.replace(/(<title>Claude Skills Directory: )[\d,]+\+?( Claude Code Skills)/, `$1${fmt(Math.floor(total / 1000) * 1000)}+$2`);
await writeFile(new URL("index.html", root), html);

/* ---------- IndexNow key ---------- */
await writeFile(new URL(`${INDEXNOW_KEY}.txt`, root), INDEXNOW_KEY);

console.log(`Built: sitemap (${fmt(urls.length)} URLs), robots.txt, llms.txt (${(llms.length / 1024).toFixed(0)} KB), llms-full.txt (${(full.length / 1024).toFixed(0)} KB), index.html pre-render (${picks.length} skills, ${faq.length} FAQs). Catalog: ${fmt(total)} skills.`);
