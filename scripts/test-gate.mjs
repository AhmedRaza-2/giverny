#!/usr/bin/env node
// End-to-end test of the strict unlock: real API handlers + a fake GitHub + a real browser.
// Usage: node scripts/test-gate.mjs   (needs Playwright with Chromium)
import http from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = fileURLToPath(new URL("..", import.meta.url));
const GH_PORT = 4010, SITE_PORT = 3011, SITE = `http://localhost:${SITE_PORT}`;
const OWNER = "AhmedRaza-2", REPO = "AhmedRaza-2/giverny";

/* ---------- fake GitHub ---------- */
const users = {};           // login -> { following, starred, revoked, listOnly }
let nextLogin = "fan";
const user = l => (users[l] ||= { following: false, starred: false, revoked: false, listOnly: false });
const fake = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  const send = (status, body) => { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(body === undefined ? "" : JSON.stringify(body)); };
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const who = token.startsWith("tok-") ? token.slice(4) : null;
  if (u.pathname === "/login/oauth/authorize") {
    res.statusCode = 302;
    res.setHeader("Location", `${u.searchParams.get("redirect_uri")}?code=code-${nextLogin}&state=${u.searchParams.get("state")}`);
    return res.end();
  }
  if (u.pathname === "/login/oauth/access_token") {
    let b = ""; req.on("data", c => b += c); req.on("end", () => {
      const code = JSON.parse(b).code || "";
      send(200, code.startsWith("code-") ? { access_token: "tok-" + code.slice(5) } : { error: "bad_verification_code" });
    });
    return;
  }
  if (who && user(who).revoked) return send(401, { message: "Bad credentials" });
  if (u.pathname === "/user") return who ? send(200, { login: who }) : send(401, {});
  if (u.pathname === `/user/starred/${REPO}`) return send(who && user(who).starred && !user(who).listOnly ? 204 : 404);
  let m;
  if ((m = u.pathname.match(/^\/users\/([^/]+)\/starred$/))) {
    const s = user(m[1]); const page = +u.searchParams.get("page");
    const filler = Array.from({ length: 100 }, (_, i) => ({ full_name: "x/r" + i }));
    if (s.listOnly) return send(200, page === 1 ? filler : (s.starred ? [{ full_name: REPO }] : []));
    return send(200, s.starred ? [{ full_name: REPO }] : []);
  }
  if ((m = u.pathname.match(/^\/users\/([^/]+)\/following\/([^/]+)$/))) return send(user(m[1]).following && m[2] === OWNER ? 204 : 404);
  send(404, { message: "Not Found" });
});

/* ---------- run ---------- */
await new Promise(r => fake.listen(GH_PORT, r));
const site = spawn(process.execPath, ["scripts/dev.mjs", String(SITE_PORT)], {
  cwd: root, stdio: ["ignore", "pipe", "inherit"],
  env: { ...process.env, GITHUB_CLIENT_ID: "test-id", GITHUB_CLIENT_SECRET: "test-secret", SESSION_SECRET: "x".repeat(48),
    GITHUB_API_URL: `http://localhost:${GH_PORT}`, GITHUB_WEB_URL: `http://localhost:${GH_PORT}` }
});
await new Promise(r => site.stdout.once("data", r));

let failures = 0;
const step = async (name, fn) => {
  try { await fn(); console.log("  ✓", name); }
  catch (e) { failures++; console.log("  ✗", name, "\n     ", e.message.split("\n")[0]); }
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
await ctx.route("https://api.github.com/**", r => r.fulfill({ status: 404, body: "" }));
await ctx.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
const reveal = async id => page.evaluate(async id => { const r = await fetch(`/api/reveal?id=${id}`); return { status: r.status, body: await r.json() }; }, id);
const clip = () => page.evaluate(() => navigator.clipboard.readText());
const QUERY = { "frontend-design": "frontend design", impeccable: "impeccable", gsap: "gsap skills", "taste-skill": "taste skill" };
const showRow = async id => { await page.fill("#q", QUERY[id] || id); await page.waitForSelector(`.row[data-id="${id}"]`, { timeout: 5000 }); };
const clickCopy = async id => { await showRow(id); await page.click(`.row[data-id="${id}"] [data-act="prompt"]`); await page.waitForTimeout(400); };
const gateOpen = () => page.evaluate(() => document.getElementById("gate").open);
const closeGate = () => page.evaluate(() => { const g = document.getElementById("gate"); if (g.open) g.close(); });

console.log("Strict unlock tests");

await step("search results never include install commands", async () => {
  for (const q of ["", "edit a video", "stripe payments", "impeccable"]) {
    const txt = await (await fetch(`${SITE}/api/search?q=${encodeURIComponent(q)}&limit=100`)).text();
    assert.ok(!/"cmd"|"alt"|"plugin"|plugin install|"prompt"/.test(txt), `commands leaked for "${q}"`);
  }
  assert.equal((await fetch(`${SITE}/data/skills.json`)).status, 404);
});
await step("search understands intent", async () => {
  const top = async q => (await (await fetch(`${SITE}/api/search?q=${encodeURIComponent(q)}`)).json()).results.slice(0, 5).map(r => r.section + "/" + r.cat);
  assert.ok((await top("edit a video")).some(c => c.startsWith("media/")), "video");
  assert.ok((await top("add login to my app")).includes("coding/auth"), "login");
  assert.ok((await top("improve my seo")).includes("marketing/seo"), "seo");
});
await step("server-only files are not reachable", async () => {
  for (const p of ["/api/_skills", "/api/_lib", "/api/_index", "/api/_featured", "/api/_skills.js", "/api/_index.js"]) assert.equal((await fetch(SITE + p)).status, 404, p);
});
await step("signed-out: reveal is refused (401)", async () => {
  await page.goto(SITE + "/"); await page.waitForTimeout(500);
  assert.equal((await reveal("frontend-design")).status, 401);
});
await step("signed-out: every copy button is locked, none copies", async () => {
  await page.waitForSelector(".row");
  assert.equal(await page.locator(".btn.locked").count(), await page.locator(".row").count());
  await page.evaluate(() => navigator.clipboard.writeText("EMPTY"));
  await clickCopy("frontend-design");
  assert.equal(await clip(), "EMPTY"); assert.ok(await gateOpen(), "gate did not open");
  await closeGate();
});
await step("a forged session cookie is rejected", async () => {
  await ctx.addCookies([{ name: "gv_session", value: "forged-value", url: SITE }]);
  assert.equal((await reveal("frontend-design")).status, 401);
  await ctx.clearCookies();
});
await step("sign-in with no star or follow: still locked (403)", async () => {
  nextLogin = "fan"; user("fan");
  await page.goto(SITE + "/api/auth/login?return=/"); await page.waitForURL(SITE + "/"); await page.waitForTimeout(600);
  assert.ok(await gateOpen(), "gate should reopen after sign-in");
  assert.match(await page.textContent("#st-signin"), /@fan/);
  assert.equal((await reveal("frontend-design")).status, 403);
  await closeGate();
});
await step("follow only: still locked", async () => {
  user("fan").following = true;
  assert.equal((await reveal("frontend-design")).status, 403);
});
await step("star only: still locked", async () => {
  user("fan").following = false; user("fan").starred = true;
  assert.equal((await reveal("frontend-design")).status, 403);
});
await step("star + follow: unlocks after 'Check again', copy puts the real prompt on the clipboard", async () => {
  user("fan").following = true;
  await page.click("#launch [data-open-gate]"); await page.click("#verify-btn"); await page.waitForTimeout(1500);
  await page.waitForSelector(".row");
  assert.equal(await page.locator(".btn.locked").count(), 0, "buttons still locked");
  await clickCopy("impeccable");
  const text = await clip();
  assert.match(text, /npx impeccable install/); assert.match(text, /Found on Giverny: http:\/\/localhost:3011/);
});
await step("expanding a row shows the real commands", async () => {
  await showRow("gsap"); await page.click('.row[data-id="gsap"] .r-title'); await page.waitForTimeout(500);
  assert.match(await page.textContent('.row[data-id="gsap"] .row-detail'), /greensock\/gsap-skills/);
});
await step("un-starring locks the very next copy (checked live)", async () => {
  user("fan").starred = false;
  await page.evaluate(() => navigator.clipboard.writeText("EMPTY"));
  await clickCopy("taste-skill"); await page.waitForTimeout(300);
  assert.equal(await clip(), "EMPTY", "copied despite missing star");
  assert.ok(await gateOpen(), "gate did not reopen");
  assert.equal(await page.textContent("#st-star"), "Not yet");
  await closeGate();
});
await step("un-following locks too", async () => {
  user("fan").starred = true; user("fan").following = false;
  assert.equal((await reveal("taste-skill")).status, 403);
});
await step("star found deep in a long star list (fallback path)", async () => {
  nextLogin = "listy"; Object.assign(user("listy"), { following: true, starred: true, listOnly: true });
  await page.goto(SITE + "/api/auth/login?return=/"); await page.waitForURL(SITE + "/"); await page.waitForTimeout(600);
  assert.equal((await reveal("figma")).status, 200);
});
await step("revoked GitHub token signs you out", async () => {
  user("listy").revoked = true;
  assert.equal((await reveal("figma")).status, 401);
  assert.ok(!(await ctx.cookies()).some(c => c.name === "gv_session" && c.value), "session cookie not cleared");
});
await step("sign-in rejects a tampered state (CSRF)", async () => {
  const r = await fetch(`${SITE}/api/auth/callback?code=code-fan&state=wrong`, { redirect: "manual" });
  assert.match(r.headers.get("location"), /signin=expired/);
  assert.ok(!(r.headers.get("set-cookie") || "").includes("gv_session=ey") );
});
await step("login refuses open redirects", async () => {
  nextLogin = "fan"; user("fan").following = true; user("fan").starred = true;
  await page.goto(SITE + "/api/auth/login?return=//evil.example"); await page.waitForTimeout(600);
  assert.equal(new URL(page.url()).host, `localhost:${SITE_PORT}`);
});
await step("owner account unlocks without star or follow; others still need both", async () => {
  nextLogin = OWNER; user(OWNER);
  await page.goto(SITE + "/api/auth/login?return=/"); await page.waitForURL(SITE + "/"); await page.waitForTimeout(600);
  assert.equal((await reveal("figma")).status, 200);
  nextLogin = "stranger"; user("stranger");
  await page.goto(SITE + "/api/auth/login?return=/"); await page.waitForURL(SITE + "/"); await page.waitForTimeout(600);
  assert.equal((await reveal("figma")).status, 403);
});
await step("unknown skill id returns 404", async () => {
  assert.equal((await reveal("not-a-skill")).status, 404);
});
await step("SEO: skill, category, section and directory pages render real HTML with valid JSON-LD", async () => {
  for (const [path, h1] of [["/skills/frontend-design", "Frontend Design"], ["/claude-skills/coding/security", "Best Claude Skills for Security"], ["/claude-skills/video", "Claude Skills for Video"], ["/claude-skills", "Claude Skills Directory"]]) {
    const r = await fetch(SITE + path); const html = await r.text();
    assert.equal(r.status, 200, path);
    assert.match(html, new RegExp(`<h1>${h1}`), `${path} h1`);
    assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+">/, `${path} canonical`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
    assert.ok(!/npx skills add [a-z]/i.test(html.replace(/owner\/repo/g, "")), `${path} leaks an install command`);
  }
  assert.equal((await fetch(SITE + "/skills/not-a-real-skill")).status, 404);
});
await step("SEO: home page has skills, FAQ and structured data without JavaScript", async () => {
  const html = await (await fetch(SITE + "/")).text();
  assert.ok((html.match(/class="row"/g) || []).length >= 20, "pre-rendered rows");
  assert.match(html, /"@type":"FAQPage"/); assert.match(html, /"@type":"SearchAction"/);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
});
await step("SEO: sitemap, robots and llms.txt are published", async () => {
  const sm = await (await fetch(SITE + "/sitemap.xml")).text();
  assert.ok((sm.match(/<url>/g) || []).length > 10000, "sitemap size");
  assert.match(await (await fetch(SITE + "/robots.txt")).text(), /GPTBot[\s\S]*Sitemap:/);
  assert.match(await (await fetch(SITE + "/llms.txt")).text(), /^# Giverny/);
});
await step("deep link /?skill=id opens that skill", async () => {
  await page.goto(SITE + "/?skill=impeccable"); await page.waitForSelector('.row[data-id="impeccable"] .row-detail', { timeout: 8000 });
});
await step("no page errors", async () => { assert.deepEqual(errors, []); });

await browser.close(); site.kill(); fake.close();
console.log(failures ? `\n${failures} failed` : "\nAll passed");
process.exit(failures ? 1 : 0);
