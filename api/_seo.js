// Shared SEO pieces: canonical URLs, page copy and the HTML shell used by server-rendered pages
// (api/page.js) and by the build script that writes sitemap.xml, llms.txt and the home page's static content.
import { TAX } from "./_taxonomy.js";

export const SITE = (process.env.GIVERNY_SITE_URL || "https://giverny-two.vercel.app").replace(/\/$/, "");
export const OWNER = process.env.GIVERNY_OWNER || "AhmedRaza-2";
export const REPO = process.env.GIVERNY_REPO || "AhmedRaza-2/giverny";

export const SECTIONS = TAX.sections;
export const SEC_SLUG = { design: "design", media: "video", coding: "coding", marketing: "marketing", productivity: "productivity" };
export const SLUG_SEC = Object.fromEntries(Object.entries(SEC_SLUG).map(([k, v]) => [v, k]));
export const slug = s => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const catSlug = c => slug(c.label);
export const section = id => SECTIONS.find(s => s.id === id);
export const catOf = (sec, id) => section(sec)?.cats.find(c => c.id === id);
export const COLOR = { design: "#FF5C8A", media: "#FFB020", coding: "#3DD6F5", marketing: "#34D399", productivity: "#9B87FF" };

export const url = {
  home: () => `${SITE}/`,
  hub: () => `${SITE}/claude-skills`,
  section: sec => `${SITE}/claude-skills/${SEC_SLUG[sec]}`,
  cat: (sec, cat) => `${SITE}/claude-skills/${SEC_SLUG[sec]}/${catSlug(catOf(sec, cat))}`,
  skill: id => `${SITE}/skills/${id}`
};

// What people search for, per section (used in titles and headings).
export const SEC_TITLE = {
  design: "Claude Skills for Design and UI",
  media: "Claude Skills for Video, Images and Audio",
  coding: "Claude Code Skills for Developers",
  marketing: "Claude Skills for Marketing and SEO",
  productivity: "Claude Skills for Documents and Productivity"
};
export const SEC_INTRO = {
  design: "Claude design skills teach Claude to build interfaces with real taste: a committed aesthetic instead of a template, solid design systems, motion that feels hand-made, accessibility checks, and platform rules for iOS, Android and the web. Use them in Claude Code whenever you build or polish UI.",
  media: "Claude video and media skills let Claude edit footage with FFmpeg, build motion graphics in code with Remotion and HyperFrames, generate images, video and music with models from fal.ai, MiniMax and others, and handle voice and audio with ElevenLabs.",
  coding: "Claude Code skills for developers add proven engineering workflows (planning, test-driven development, debugging, code review) and deep knowledge of specific stacks: security audits, performance, authentication, databases, cloud and mobile. Many come straight from the teams behind the tools, like Stripe, Supabase, Cloudflare, Sentry and Vercel.",
  marketing: "Claude marketing skills cover SEO and AI search (GEO), copywriting, conversion rate optimisation, paid ads, email, social media and growth strategy, so Claude can audit pages, write campaigns and plan launches like a seasoned marketer.",
  productivity: "Claude productivity skills handle Word, Excel, PowerPoint and PDF files, product management, research, writing, notes and business analysis, so Claude turns raw material into finished deliverables."
};

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const fmt = n => Number(n || 0).toLocaleString("en-US");
export const jsonld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

export const ORG = { "@type": "Organization", "@id": `${SITE}/#org`, name: "Giverny", url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png`, sameAs: [`https://github.com/${REPO}`] };
export const WEBSITE = {
  "@type": "WebSite", "@id": `${SITE}/#website`, name: "Giverny", alternateName: "Giverny Claude Skills Directory", url: `${SITE}/`, publisher: { "@id": `${SITE}/#org` },
  potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE}/?q={search_term_string}` }, "query-input": "required name=search_term_string" }
};
export const crumbs = items => ({ "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })) });
export const faqLd = qas => ({ "@type": "FAQPage", mainEntity: qas.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });

const MARK = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="mark" viewBox="0 0 32 32"><circle cx="16" cy="7.5" r="5" fill="#FF5C8A"/><circle cx="24.1" cy="13.4" r="5" fill="#FFB020"/><circle cx="21" cy="23" r="5" fill="#3DD6F5"/><circle cx="11" cy="23" r="5" fill="#34D399"/><circle cx="7.9" cy="13.4" r="5" fill="#9B87FF"/><circle cx="16" cy="16" r="3.2" fill="#fff"/></symbol></svg>`;

export function footLinks() {
  return SECTIONS.map(s => `<div><h3><a href="${url.section(s.id)}">${esc(SEC_TITLE[s.id])}</a></h3><ul>${s.cats.filter(c => c.id !== "general").map(c => `<li><a href="${url.cat(s.id, c.id)}">${esc(c.label)}</a></li>`).join("")}</ul></div>`).join("");
}

export function layout({ title, description, canonical, body, ld = [], image = `${SITE}/og.png`, noindex = false }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Giverny">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0A0F1F">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable summary">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700&family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
${jsonld({ "@context": "https://schema.org", "@graph": [ORG, WEBSITE, ...ld] })}
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<header class="top">
  <a class="brand" href="/"><svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><use href="#mark"/></svg><span>Giverny</span></a>
  <nav class="top-nav" aria-label="Site"><a href="/claude-skills">Browse</a><a href="/#faq">What are skills?</a><a class="star-btn" href="https://github.com/${REPO}" target="_blank" rel="noopener"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .9l2.2 4.5 4.9.7-3.6 3.5.9 4.9L8 12.2l-4.4 2.3.9-4.9L.9 6.1l4.9-.7z"/></svg><span>Star</span></a></nav>
</header>
<main class="page">
${body}
</main>
<footer class="foot"><div class="foot-grid"><div>
<a class="brand" href="/"><svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><use href="#mark"/></svg><span>Giverny</span></a>
<p>The open directory of Claude skills. Search 10,000+ free Claude Code skills and install any of them with one prompt.</p>
<p class="fine">Independent and open source. Not affiliated with Anthropic. Every skill belongs to its author.</p>
<p class="fine"><a href="https://github.com/${REPO}">Source on GitHub</a> · <a href="/llms.txt">llms.txt</a> · <a href="/sitemap.xml">Sitemap</a></p>
</div><nav class="foot-links" aria-label="Skill categories">${footLinks()}</nav></div></footer>
${MARK}
</body>
</html>`;
}
