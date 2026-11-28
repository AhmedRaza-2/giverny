// Server-rendered, crawlable pages: /claude-skills, /claude-skills/:section, /claude-skills/:section/:cat, /skills/:id.
// Real HTML with titles, descriptions, structured data and internal links, so search engines and AI answer
// engines (which often don't run JavaScript) can read and cite every skill. Cached at the edge.
import { SKILLS } from "./_skills.js";
import { search } from "./_search.js";
import { query } from "./_lib.js";
import {
  SITE, SECTIONS, SEC_SLUG, SLUG_SEC, SEC_TITLE, SEC_INTRO, COLOR, url, slug, catSlug, section, catOf,
  esc, fmt, layout, crumbs, faqLd
} from "./_seo.js";

const byId = new Map(SKILLS.map(s => [s.id, s]));
const repoUrl = s => `https://github.com/${s.repo}${s.path ? "/tree/main/" + s.path : ""}`;
const starTxt = s => s.repo === "anthropics/claude-plugins-official" ? "Official plugin directory" : `★ ${fmt(s.stars)}`;
const card = s => `<li><a class="card" href="/skills/${esc(s.id)}" style="--c:${COLOR[s.section]}"><b>${esc(s.name)}</b><small>${esc(s.by)} · ${esc(starTxt(s))}</small><span>${esc(s.desc)}</span></a></li>`;
const itemList = (items, name) => ({ "@type": "ItemList", name, numberOfItems: items.length, itemListElement: items.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: url.skill(s.id), name: s.name })) });
const counts = {};
for (const s of SKILLS) { counts[s.section] = (counts[s.section] || 0) + 1; counts[`${s.section}/${s.cat}`] = (counts[`${s.section}/${s.cat}`] || 0) + 1; }
const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
const listNames = arr => arr.length > 1 ? arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1] : arr[0] || "";

function send(res, status, html, cache = true) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cache ? "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" : "no-store");
  res.end(html);
}

function notFound(res) {
  return send(res, 404, layout({
    title: "Skill not found | Giverny", description: "This Claude skill isn't in the directory.", canonical: `${SITE}/claude-skills`, noindex: true,
    body: `<div class="page-head"><h1>That skill isn’t here</h1><p>It may have been renamed or removed by its author.</p><div class="page-actions"><a class="btn" href="/claude-skills">Browse all Claude skills</a><a class="btn ghost" href="/">Search</a></div></div>`
  }), false);
}

function hub(res) {
  const total = SKILLS.length;
  const picks = search({ limit: 24 }).results;
  const secs = SECTIONS.map(s => `<li><a href="${url.section(s.id)}" style="--c:${COLOR[s.id]}"><span>${esc(SEC_TITLE[s.id])}</span><small>${fmt(counts[s.id])}</small></a></li>`).join("");
  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Claude skills</span></nav>
<div class="page-head"><h1>Claude Skills Directory</h1>
<p>Browse ${fmt(total)} free Claude skills (Agent Skills) for Claude Code, organised by what they help you do. Every skill comes from a public GitHub repo and installs with one prompt.</p>
<div class="page-actions"><a class="btn" href="/">Search all skills</a></div></div>
<ul class="sec-grid">${secs}</ul>
<div class="prose"><h2>What are Claude skills?</h2>
<p>Claude skills are folders of instructions, scripts and resources that Claude loads when a task needs them. Each one has a <code>SKILL.md</code> file with a name and a description. Claude reads the description, and when your request matches, it loads the full instructions, so a skill can teach Claude specialist work like distinctive UI design, video editing, security audits or SEO.</p>
<h2>Editor’s picks</h2></div>
<ul class="cards">${picks.map(card).join("")}</ul>
${SECTIONS.map(s => `<div class="prose"><h2><a href="${url.section(s.id)}">${esc(SEC_TITLE[s.id])}</a></h2><p>${esc(SEC_INTRO[s.id])}</p></div>
<ul class="sec-grid">${s.cats.filter(c => counts[`${s.id}/${c.id}`]).map(c => `<li><a href="${url.cat(s.id, c.id)}" style="--c:${COLOR[s.id]}"><span>${esc(c.label)}</span><small>${fmt(counts[`${s.id}/${c.id}`])}</small></a></li>`).join("")}</ul>`).join("")}`;
  send(res, 200, layout({
    title: `Claude Skills Directory: ${fmt(total)} Claude Code Skills by Category | Giverny`,
    description: `Browse ${fmt(total)} free Claude skills for design, video, coding, marketing and productivity. Find the best Claude Code skill for any job and install it with one prompt.`,
    canonical: url.hub(), body,
    ld: [{ "@type": "CollectionPage", name: "Claude Skills Directory", url: url.hub(), isPartOf: { "@id": `${SITE}/#website` } }, itemList(picks, "Editor’s picks"), crumbs([{ name: "Home", url: url.home() }, { name: "Claude skills", url: url.hub() }])]
  }));
}

function sectionPage(res, sec) {
  const s = section(sec);
  const top = search({ section: sec, limit: 48 }).results;
  const best = top.slice(0, 3).map(x => x.name);
  const qas = [
    [`What are the best Claude skills for ${lower(s.label)}?`, `Popular picks are ${listNames(best)}. Giverny lists ${fmt(counts[sec])} ${lower(s.label)} skills for Claude Code, ranked by editor picks and GitHub popularity.`],
    [`How do I install a Claude ${lower(s.label)} skill?`, "Open the skill on Giverny, sign in with GitHub, copy its install prompt and paste it into Claude Code. Claude runs the install command and confirms the skill loaded."]
  ];
  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/claude-skills">Claude skills</a><span>/</span><span>${esc(s.label)}</span></nav>
<div class="page-head" style="--c:${COLOR[sec]}"><h1>${esc(SEC_TITLE[sec])}</h1><p>${esc(SEC_INTRO[sec])}</p>
<div class="meta-row"><span>${fmt(counts[sec])} skills</span><span>Updated weekly</span></div>
<div class="page-actions"><a class="btn" href="/?tab=${sec}">Search ${esc(lower(s.label))} skills</a></div></div>
<ul class="sec-grid">${s.cats.filter(c => counts[`${sec}/${c.id}`]).map(c => `<li><a href="${url.cat(sec, c.id)}" style="--c:${COLOR[sec]}"><span>${esc(c.label)}</span><small>${fmt(counts[`${sec}/${c.id}`])}</small></a></li>`).join("")}</ul>
<div class="prose"><h2>Top Claude skills for ${esc(lower(s.label))}</h2></div>
<ul class="cards">${top.map(card).join("")}</ul>
<div class="prose">${qas.map(([q, a]) => `<h2>${esc(q)}</h2><p>${esc(a)}</p>`).join("")}</div>`;
  send(res, 200, layout({
    title: `Best ${SEC_TITLE[sec]} (${fmt(counts[sec])}) | Giverny`,
    description: `${fmt(counts[sec])} free ${SEC_TITLE[sec].replace(/^Claude (Code )?Skills/, "Claude skills")}. Top picks: ${listNames(best)}. Install any of them in Claude Code with one prompt.`,
    canonical: url.section(sec), body,
    ld: [{ "@type": "CollectionPage", name: SEC_TITLE[sec], url: url.section(sec), about: SEC_INTRO[sec] }, itemList(top, SEC_TITLE[sec]),
      crumbs([{ name: "Home", url: url.home() }, { name: "Claude skills", url: url.hub() }, { name: s.label, url: url.section(sec) }]), faqLd(qas)]
  }));
}

function catPage(res, sec, cat) {
  const s = section(sec), c = catOf(sec, cat);
  const top = search({ section: sec, cat, limit: 100 }).results;
  const best = top.slice(0, 3).map(x => x.name);
  const label = c.id === "general" ? `general ${lower(s.label)}` : lower(c.label);
  const qas = [[`What is the best Claude skill for ${label}?`, `Top picks are ${listNames(best)}. There are ${fmt(counts[`${sec}/${cat}`])} Claude skills for ${label} on Giverny, ranked by editor picks and GitHub popularity.`]];
  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/claude-skills">Claude skills</a><span>/</span><a href="${url.section(sec)}">${esc(s.label)}</a><span>/</span><span>${esc(c.label)}</span></nav>
<div class="page-head" style="--c:${COLOR[sec]}"><h1>Best Claude Skills for ${esc(c.id === "general" ? s.label : c.label)}</h1>
<p>${fmt(counts[`${sec}/${cat}`])} Claude Code skills for ${esc(label)}, ranked by editor picks and popularity. Open any skill to see what it does and get its one-prompt install.</p>
<div class="page-actions"><a class="btn" href="/?tab=${sec}&amp;cat=${cat}">Search these skills</a><a class="btn ghost" href="${url.section(sec)}">All ${esc(lower(s.label))} skills</a></div></div>
<ul class="cards">${top.map(card).join("")}</ul>
<div class="prose">${qas.map(([q, a]) => `<h2>${esc(q)}</h2><p>${esc(a)}</p>`).join("")}<h2>More ${esc(lower(s.label))} categories</h2></div>
<ul class="sec-grid">${s.cats.filter(x => x.id !== cat && counts[`${sec}/${x.id}`]).map(x => `<li><a href="${url.cat(sec, x.id)}" style="--c:${COLOR[sec]}"><span>${esc(x.label)}</span><small>${fmt(counts[`${sec}/${x.id}`])}</small></a></li>`).join("")}</ul>`;
  send(res, 200, layout({
    title: `Best Claude Skills for ${c.id === "general" ? s.label : c.label} (${fmt(counts[`${sec}/${cat}`])}) | Giverny`,
    description: `The best Claude Code skills for ${label}: ${listNames(best)} and ${fmt(Math.max(0, counts[`${sec}/${cat}`] - 3))} more. Free, open source, one-prompt install.`,
    canonical: url.cat(sec, cat), body,
    ld: [{ "@type": "CollectionPage", name: `Claude skills for ${c.label}`, url: url.cat(sec, cat) }, itemList(top.slice(0, 50), `Claude skills for ${c.label}`),
      crumbs([{ name: "Home", url: url.home() }, { name: "Claude skills", url: url.hub() }, { name: s.label, url: url.section(sec) }, { name: c.label, url: url.cat(sec, cat) }]), faqLd(qas)]
  }));
}

function skillPage(res, s) {
  const sec = section(s.section), c = catOf(s.section, s.cat);
  const related = search({ section: s.section, cat: s.cat, limit: 13 }).results.filter(x => x.id !== s.id).slice(0, 12);
  const about = (s.about && s.about.length > s.desc.length ? s.about : s.desc).replace(/\s+/g, " ");
  const updated = s.updated || s.added || "";
  const manual = s.path ? `clone <a href="https://github.com/${esc(s.repo)}">${esc(s.repo)}</a> and copy the <code>${esc(s.path)}</code> folder into <code>~/.claude/skills/</code>` : `clone <a href="https://github.com/${esc(s.repo)}">${esc(s.repo)}</a> and follow its README`;
  const qas = [
    [`What is the ${s.name} Claude skill?`, `${s.name} is a Claude skill by ${s.by}. ${s.desc}`],
    [`How do I install ${s.name} in Claude Code?`, `On Giverny, sign in with GitHub, copy the ${s.name} install prompt and paste it into Claude Code; Claude runs the install command from ${s.repo} for you. You can also install it by hand from https://github.com/${s.repo}.`],
    [`Is ${s.name} free?`, `Yes. ${s.name} is open source on GitHub (${s.repo}); check the repo’s license for terms.`]
  ];
  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/claude-skills">Claude skills</a><span>/</span><a href="${url.section(s.section)}">${esc(sec.label)}</a><span>/</span><a href="${url.cat(s.section, s.cat)}">${esc(c.label)}</a></nav>
<div class="page-head" style="--c:${COLOR[s.section]}"><h1>${esc(s.name)}</h1><p>${esc(s.desc)}</p>
<div class="meta-row"><span>by ${esc(s.by)}</span><span>${esc(starTxt(s))}</span><a href="${url.cat(s.section, s.cat)}">${esc(c.label)}</a>${s.official ? "<span>Official</span>" : ""}${s.featured ? "<span>Editor’s pick</span>" : ""}${updated ? `<span>Updated ${esc(updated)}</span>` : ""}</div>
<div class="page-actions"><a class="btn" href="/?skill=${encodeURIComponent(s.id)}#directory">Get the install prompt</a><a class="btn ghost" href="${esc(repoUrl(s))}" rel="noopener">View on GitHub</a></div></div>
<div class="prose">
<h2>What ${esc(s.name)} does</h2><p>${esc(about)}</p>
<h2>How to install ${esc(s.name)} in Claude Code</h2>
<p>Giverny gives you a ready prompt with the exact install command from <a href="${esc(repoUrl(s))}">${esc(s.repo)}</a>. Sign in with GitHub, copy the prompt and paste it into Claude Code; Claude installs the skill and confirms it loaded. To install by hand, ${manual}.</p>
<h2>How to use it</h2><p>Once installed, Claude loads ${esc(s.name)} on its own whenever your request matches what the skill does. You can also ask for it by name, for example: “${esc(s.ask || `Use the ${s.skill || s.name} skill on my project.`)}”</p>
<h2>More Claude skills for ${esc(lower(c.label))}</h2></div>
<ul class="cards">${related.map(card).join("")}</ul>`;
  send(res, 200, layout({
    title: `${s.name} Claude Skill by ${s.by}: What It Does & How to Install | Giverny`,
    description: `${s.desc} ${s.name} is a free Claude Code skill by ${s.by}. See what it does and install it with one prompt.`.slice(0, 300),
    canonical: url.skill(s.id), body,
    ld: [{
      "@type": "SoftwareSourceCode", name: s.name, description: about.slice(0, 500), url: url.skill(s.id), codeRepository: `https://github.com/${s.repo}`,
      author: { "@type": "Organization", name: s.by }, isAccessibleForFree: true, keywords: ["Claude skill", "Claude Code", "Agent Skills", c.label, sec.label].join(", "),
      applicationCategory: "DeveloperApplication", runtimePlatform: "Claude Code", ...(updated ? { dateModified: updated } : {})
    }, crumbs([{ name: "Home", url: url.home() }, { name: "Claude skills", url: url.hub() }, { name: sec.label, url: url.section(s.section) }, { name: c.label, url: url.cat(s.section, s.cat) }, { name: s.name, url: url.skill(s.id) }]), faqLd(qas)]
  }));
}

export default function handler(req, res) {
  const q = query(req);
  const type = q.get("type");
  if (type === "hub") return hub(res);
  if (type === "skill") { const s = byId.get(q.get("id") || ""); return s ? skillPage(res, s) : notFound(res); }
  const sec = SLUG_SEC[q.get("section") || ""];
  if (!sec) return notFound(res);
  if (type === "section") return sectionPage(res, sec);
  if (type === "cat") {
    const c = section(sec).cats.find(x => catSlug(x) === q.get("cat"));
    return c ? catPage(res, sec, c.id) : notFound(res);
  }
  notFound(res);
}
