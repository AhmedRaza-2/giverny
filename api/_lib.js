// Shared server code for Giverny's API. Files starting with "_" are not exposed as endpoints on Vercel.
import crypto from "node:crypto";

export const CONF = {
  owner: process.env.GIVERNY_OWNER || "AhmedRaza-2",
  repo: process.env.GIVERNY_REPO || "AhmedRaza-2/giverny",
  requireFollow: process.env.GIVERNY_REQUIRE_FOLLOW !== "false",
  siteUrl: process.env.GIVERNY_SITE_URL || "",
  clientId: process.env.GITHUB_CLIENT_ID || "",
  clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  secret: process.env.SESSION_SECRET || "",
  api: (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/$/, ""),
  web: (process.env.GITHUB_WEB_URL || "https://github.com").replace(/\/$/, "")
};

export const isConfigured = () => !!(CONF.clientId && CONF.clientSecret && CONF.secret.length >= 32);

const SESSION = "gv_session";
const STATE = "gv_state";
const MAX_AGE = 30 * 24 * 3600;

/* ---------- http helpers ---------- */
export function query(req) { return new URL(req.url, "http://x").searchParams; }

export function cookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function origin(req) {
  if (CONF.siteUrl) return CONF.siteUrl.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function cookieLine(req, name, value, maxAge) {
  const secure = origin(req).startsWith("https://") ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function addCookie(res, line) {
  const prev = res.getHeader("Set-Cookie");
  res.setHeader("Set-Cookie", prev ? [].concat(prev, line) : line);
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function redirect(res, url) {
  res.statusCode = 302;
  res.setHeader("Location", url);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

// Only same-site paths, never "//evil.com" or absolute URLs.
export function safeReturn(p) {
  return typeof p === "string" && /^\/(?!\/)[^\s\\]*$/.test(p) ? p : "/";
}

/* ---------- sealed cookies (AES-256-GCM) ---------- */
const key = () => crypto.createHash("sha256").update(CONF.secret).digest();

export function seal(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64url");
}

export function unseal(str) {
  try {
    const buf = Buffer.from(str, "base64url");
    const d = crypto.createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8"));
  } catch { return null; }
}

export function getSession(req) {
  if (!isConfigured()) return null;
  const raw = cookies(req)[SESSION];
  const s = raw && unseal(raw);
  if (!s || !s.login || !s.token || Date.now() - s.iat > MAX_AGE * 1000) return null;
  return s;
}
export const setSession = (req, res, s) => addCookie(res, cookieLine(req, SESSION, seal({ ...s, iat: Date.now() }), MAX_AGE));
export const clearSession = (req, res) => addCookie(res, cookieLine(req, SESSION, "", 0));
export const setState = (req, res, v) => addCookie(res, cookieLine(req, STATE, v, 600));
export const clearState = (req, res) => addCookie(res, cookieLine(req, STATE, "", 0));
export const getState = req => cookies(req)[STATE];

/* ---------- GitHub ---------- */
export class GitHubError extends Error {
  constructor(code, status) { super(code); this.code = code; this.status = status; }
}

export async function gh(token, path, init = {}) {
  const r = await fetch(CONF.api + path, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "giverny",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });
  if (r.status === 401) throw new GitHubError("auth", 401);
  if ((r.status === 403 || r.status === 429) && r.headers.get("x-ratelimit-remaining") === "0") throw new GitHubError("rate", 429);
  return r;
}

// Live check, run on every reveal: does this signed-in user star the repo and follow the owner right now?
export async function checkAccess(session) {
  const { token, login } = session;
  // The owner can't follow or usefully star their own repo. The login comes from GitHub OAuth, so it can't be faked.
  if (login.toLowerCase() === CONF.owner.toLowerCase()) return { starred: true, following: true, unlocked: true, owner: true };
  const [o, n] = CONF.repo.split("/");
  const target = CONF.repo.toLowerCase();

  let starred = false;
  const direct = await gh(token, `/user/starred/${o}/${n}`);
  if (direct.status === 204) starred = true;
  else {
    // Fallback that needs no OAuth scope: the user's public stars, newest first.
    for (let page = 1; page <= 10 && !starred; page++) {
      const r = await gh(token, `/users/${encodeURIComponent(login)}/starred?per_page=100&page=${page}&sort=created&direction=desc`);
      if (!r.ok) throw new GitHubError("github", r.status);
      const list = await r.json();
      starred = list.some(x => String(x.full_name).toLowerCase() === target);
      if (list.length < 100) break;
    }
  }

  let following = true;
  if (CONF.requireFollow) {
    const f = await gh(token, `/users/${encodeURIComponent(login)}/following/${encodeURIComponent(CONF.owner)}`);
    if (f.status !== 204 && f.status !== 404) throw new GitHubError("github", f.status);
    following = f.status === 204;
  }
  return { starred, following, unlocked: starred && following };
}

/* ---------- skills ---------- */
// Loaded on first use, so endpoints that don't need the catalog (sign-in, status) start fast.
let byId = null;
export async function findSkill(id) {
  if (!byId) { const { SKILLS } = await import("./_skills.js"); byId = new Map(SKILLS.map(s => [s.id, s])); }
  return byId.get(id);
}

const repoUrl = s => `https://github.com/${s.repo}${s.path ? "/tree/main/" + s.path : ""}`;
const pluginCli = p => [p.add && `claude plugin marketplace add ${p.add}`, p.install && `claude plugin install ${p.install}`].filter(Boolean).join(" && ");
const pluginSlash = p => [p.add && `/plugin marketplace add ${p.add}`, p.install ? `/plugin install ${p.install}` : "/plugin"].filter(Boolean).join("\n");
const nonInteractive = cmd => /npx (-y )?skills(@latest)? add/.test(cmd) && !/\s-y(\s|$)/.test(cmd) ? cmd + " -a claude-code -y" : cmd;

export function buildPrompt(s, site) {
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
  const lines = [`Install "${s.name}" for Claude Code from ${repoUrl(s)}.`, ``, `1. Run this in my terminal:`, `   ${nonInteractive(s.cmd)}`];
  if (s.plugin && !s.cmd.startsWith("claude plugin")) lines.push(`   If that fails, install it as a Claude Code plugin: ${pluginCli(s.plugin)}`);
  if (s.alt) lines.push(`   Fallback: ${s.alt}`);
  if (s.note) lines.push(`   Note: ${s.note}`);
  lines.push(
    `2. If none of that works, clone the repo and copy the folder that contains SKILL.md into ~/.claude/skills/.`,
    `3. Confirm it installed (a plugin may need a Claude Code restart), then show me how to use it. Example: "${s.ask}"`,
    ``,
    `Found on Giverny: ${site}`
  );
  return lines.join("\n");
}

export function reveal(s, site) {
  return {
    id: s.id,
    prompt: buildPrompt(s, site),
    cmd: s.cmd,
    slash: s.plugin && !s.cmd.startsWith("claude plugin") ? pluginSlash(s.plugin) : null,
    alt: s.alt || null,
    ask: s.ask,
    note: s.note || null,
    kind: s.kind || "skill"
  };
}

export function publicStatus(session, access) {
  return {
    configured: isConfigured(),
    signedIn: !!session,
    login: session ? session.login : null,
    owner: CONF.owner,
    repo: CONF.repo,
    requireFollow: CONF.requireFollow,
    following: access ? access.following : false,
    starred: access ? access.starred : false,
    unlocked: access ? access.unlocked : false
  };
}
